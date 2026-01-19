# Glint - Implementation Tasks

> **Source of Truth**: This document tracks all implementation tasks for Glint.  
> **Last Updated**: 2026-01-19  
> **Status Legend**: ⬜ Todo | 🔄 In Progress | ✅ Done | ⏸️ Blocked

---

## Current State Summary

**Completed (MVP):**
- ✅ HomePage with input and CTA
- ✅ ResultsPage with 3-level explanation tabs  
- ✅ FlashcardsPage with review flow
- ✅ LibraryPage for saved concepts
- ✅ UpgradePage for premium
- ✅ Design system (colors, typography, spacing, responsive breakpoints)
- ✅ Zustand state management
- ✅ Lovable Cloud backend connected
- ✅ Email/password authentication
- ✅ Data persistence (saved_concepts, flashcards)
- ✅ Free tier usage limits (3/day, server-side enforced)
- ✅ Loading states & skeletons
- ✅ Mobile optimization with bottom nav
- ✅ Accessibility (ARIA, keyboard nav, motion-reduced)
- ✅ Responsive breakpoint system (xs/sm/md/lg/xl/2xl)
- ✅ Enhanced Explanation Display on ResultsPage (smart parsing + step badges + Key Takeaway box + text-reading typography)

**Next Up (V1 Features):**
- ⬜ Stripe payments integration
- ⬜ Google OAuth social login
- ⬜ PDF export for flashcards
- ⬜ Spaced repetition with reminders
- ⬜ Study streak tracking
- ⬜ Share concepts via link

---

## Phase 6: V1 Features - Revenue & Engagement

### Task 6.1: Stripe Payments Integration ⬜
**Priority**: 🔴 Critical  
**Dependencies**: None  
**Estimated Effort**: 2-3 hours

Enable premium subscriptions with real payments.

**Subtasks**:
- [ ] 6.1.1 Enable Stripe integration via Lovable tool
- [ ] 6.1.2 Create checkout session edge function
- [ ] 6.1.3 Create Stripe webhook handler edge function
- [ ] 6.1.4 Update `profiles.plan_type` on successful payment
- [ ] 6.1.5 Add billing portal link in settings
- [ ] 6.1.6 Handle subscription cancellation

**Database Migration** - Add subscription tracking:
```sql
-- Add Stripe fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive'
  CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled'));

-- Index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer 
ON public.profiles(stripe_customer_id);
```

**Edge Function** - `supabase/functions/create-checkout-session/index.ts`:
```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    // Get or create customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id }
      });
      customerId = customer.id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: Deno.env.get("STRIPE_PRICE_ID")!, quantity: 1 }],
      success_url: `${req.headers.get("origin")}/upgrade?success=true`,
      cancel_url: `${req.headers.get("origin")}/upgrade?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

**Edge Function** - `supabase/functions/stripe-webhook/index.ts`:
```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const signature = req.headers.get("stripe-signature")!;
  const body = await req.text();
  
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase.from("profiles")
        .update({
          plan_type: subscription.status === "active" ? "premium" : "free",
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status,
        })
        .eq("stripe_customer_id", subscription.customer);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase.from("profiles")
        .update({ plan_type: "free", subscription_status: "canceled" })
        .eq("stripe_customer_id", subscription.customer);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
```

**Frontend Update** - `src/pages/UpgradePage.tsx`:
```tsx
const handleUpgrade = async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase.functions.invoke("create-checkout-session");
    if (error) throw error;
    window.location.href = data.url;
  } catch (err) {
    toast.error("Failed to start checkout");
  } finally {
    setLoading(false);
  }
};
```

**Required Secrets**:
- `STRIPE_SECRET_KEY` - From Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` - Created when setting up webhook
- `STRIPE_PRICE_ID` - Price ID for $14.99/mo subscription

---

### Task 6.2: Google OAuth Social Login ✅
**Priority**: 🟡 High  
**Dependencies**: None  
**Estimated Effort**: 30 minutes

Add "Sign in with Google" for faster onboarding.

**Subtasks**:
- [x] 6.2.1 Configure Google OAuth in Lovable Cloud dashboard (built-in support)
- [x] 6.2.2 Add Google sign-in button to Login/Signup pages
- [x] 6.2.3 Handle OAuth callback and profile creation (automatic via Supabase Auth)

**Implementation Notes**:
Lovable Cloud has built-in Google OAuth support. Configure via:
1. Open Backend → Users → Auth Settings → Google Settings
2. Optionally add custom Google Cloud OAuth credentials

**Frontend Update** - `src/contexts/AuthContext.tsx`:
```tsx
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    }
  });
  if (error) throw error;
};
```

**Component** - `src/components/auth/GoogleSignInButton.tsx`:
```tsx
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { FcGoogle } from "react-icons/fc";

export function GoogleSignInButton() {
  const { signInWithGoogle } = useAuth();
  
  return (
    <Button 
      variant="outline" 
      className="w-full gap-2"
      onClick={signInWithGoogle}
    >
      <FcGoogle className="h-5 w-5" />
      Continue with Google
    </Button>
  );
}
```

---

### Task 6.3: Study Streak Tracking ⬜
**Priority**: 🟡 High  
**Dependencies**: None  
**Estimated Effort**: 2 hours

Gamify learning with daily streaks to boost retention.

**Subtasks**:
- [ ] 6.3.1 Add streak columns to profiles table
- [ ] 6.3.2 Create streak tracking hook
- [ ] 6.3.3 Update streak on explanation/flashcard activity
- [ ] 6.3.4 Display streak badge in header
- [ ] 6.3.5 Add streak milestone celebrations (7, 30, 100 days)

**Database Migration**:
```sql
-- Add streak tracking to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- Function to update streak on activity
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_today DATE := CURRENT_DATE;
  v_streak_increased BOOLEAN := FALSE;
BEGIN
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM profiles WHERE id = p_user_id;

  -- If already active today, no change
  IF v_last_activity = v_today THEN
    RETURN json_build_object('streak', v_current_streak, 'increased', FALSE);
  END IF;

  -- Calculate new streak
  IF v_last_activity = v_today - 1 THEN
    -- Consecutive day - increase streak
    v_current_streak := COALESCE(v_current_streak, 0) + 1;
    v_streak_increased := TRUE;
  ELSIF v_last_activity IS NULL OR v_last_activity < v_today - 1 THEN
    -- Streak broken - reset to 1
    v_current_streak := 1;
    v_streak_increased := TRUE;
  END IF;

  -- Update longest streak
  IF v_current_streak > COALESCE(v_longest_streak, 0) THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Save changes
  UPDATE profiles
  SET current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      last_activity_date = v_today,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'streak', v_current_streak,
    'longest', v_longest_streak,
    'increased', v_streak_increased
  );
END;
$$;
```

**Hook** - `src/hooks/useStreak.ts`:
```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useStreak() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: streak } = useQuery({
    queryKey: ["streak", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("current_streak, longest_streak, last_activity_date")
        .eq("id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const recordActivity = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("update_user_streak", {
        p_user_id: user!.id
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["streak"] }),
  });

  return {
    currentStreak: streak?.current_streak ?? 0,
    longestStreak: streak?.longest_streak ?? 0,
    lastActivity: streak?.last_activity_date,
    recordActivity: recordActivity.mutate,
  };
}
```

**Component** - `src/components/StreakBadge.tsx`:
```tsx
import { Flame } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";
import { motion, AnimatePresence } from "framer-motion";

export function StreakBadge() {
  const { currentStreak } = useStreak();
  
  if (!currentStreak) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 text-orange-500"
    >
      <Flame className="h-4 w-4" />
      <span className="text-sm font-medium">{currentStreak}</span>
    </motion.div>
  );
}
```

---

### Task 6.4: PDF Flashcard Export ⬜
**Priority**: 🟡 High  
**Dependencies**: Task 6.1 (Premium gate)  
**Estimated Effort**: 2 hours

Allow premium users to export flashcards as printable PDFs.

**Subtasks**:
- [ ] 6.4.1 Create PDF generation edge function using jsPDF
- [ ] 6.4.2 Design print-friendly flashcard layout
- [ ] 6.4.3 Add download button (premium only)
- [ ] 6.4.4 Track export analytics

**Edge Function** - `supabase/functions/generate-flashcard-pdf/index.ts`:
```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check premium status
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type")
      .eq("id", user.id)
      .single();
    
    if (profile?.plan_type !== "premium") {
      return new Response(JSON.stringify({ error: "Premium required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { conceptId } = await req.json();

    // Fetch concept and flashcards
    const { data: concept } = await supabase
      .from("saved_concepts")
      .select("topic")
      .eq("id", conceptId)
      .single();

    const { data: flashcards } = await supabase
      .from("flashcards")
      .select("front_text, back_text")
      .eq("concept_id", conceptId);

    // Generate PDF
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(`Flashcards: ${concept?.topic}`, 20, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    let y = 40;
    flashcards?.forEach((card, i) => {
      if (y > 250) { doc.addPage(); y = 20; }
      
      doc.setFont("helvetica", "bold");
      doc.text(`Q${i + 1}: ${card.front_text}`, 20, y);
      y += 8;
      
      doc.setFont("helvetica", "normal");
      doc.text(`A: ${card.back_text}`, 20, y, { maxWidth: 170 });
      y += 20;
    });

    const pdfBytes = doc.output("arraybuffer");

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${concept?.topic}-flashcards.pdf"`,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

---

### Task 6.5: Shareable Concept Links ⬜
**Priority**: 🟢 Medium  
**Dependencies**: None  
**Estimated Effort**: 1.5 hours

Let users share their saved explanations via public links.

**Subtasks**:
- [ ] 6.5.1 Add `is_public` and `share_slug` to saved_concepts
- [ ] 6.5.2 Create public RLS policy for shared concepts
- [ ] 6.5.3 Generate unique share slugs
- [ ] 6.5.4 Create SharedConceptPage for public viewing
- [ ] 6.5.5 Add share button with copy-to-clipboard

**Database Migration**:
```sql
-- Add sharing fields to saved_concepts
ALTER TABLE public.saved_concepts
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS share_slug TEXT UNIQUE;

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_saved_concepts_share_slug 
ON public.saved_concepts(share_slug) WHERE share_slug IS NOT NULL;

-- RLS policy for public access to shared concepts
CREATE POLICY "Anyone can view public concepts"
ON public.saved_concepts FOR SELECT
TO anon, authenticated
USING (is_public = TRUE);

-- Function to generate share slug
CREATE OR REPLACE FUNCTION public.generate_share_slug()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT lower(
    substring(md5(random()::text || clock_timestamp()::text) from 1 for 8)
  );
$$;
```

**Component** - `src/components/ShareButton.tsx`:
```tsx
import { Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

interface ShareButtonProps {
  conceptId: string;
  isPublic: boolean;
  shareSlug: string | null;
}

export function ShareButton({ conceptId, isPublic, shareSlug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      let slug = shareSlug;
      
      if (!isPublic || !slug) {
        // Generate slug and make public
        const { data } = await supabase.rpc("generate_share_slug");
        slug = data;
        
        await supabase
          .from("saved_concepts")
          .update({ is_public: true, share_slug: slug })
          .eq("id", conceptId);
      }

      const url = `${window.location.origin}/shared/${slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to generate share link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={loading}
      className="gap-2"
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Copied!" : "Share"}
    </Button>
  );
}
```

**Page** - `src/pages/SharedConceptPage.tsx`:
```tsx
// Route: /shared/:slug
// Fetches concept by share_slug where is_public = true
// Displays read-only view of explanations
// Shows "Get Glint" CTA for non-users
```

---

### Task 6.6: Spaced Repetition System ⬜
**Priority**: 🟢 Medium  
**Dependencies**: Task 3.3  
**Estimated Effort**: 3 hours

Implement SM-2 algorithm for optimal flashcard review scheduling.

**Subtasks**:
- [ ] 6.6.1 Add spaced repetition fields to flashcards table
- [ ] 6.6.2 Implement SM-2 algorithm in review flow
- [ ] 6.6.3 Create "Cards Due Today" dashboard widget
- [ ] 6.6.4 Add in-app review reminders
- [ ] 6.6.5 Show mastery progress bars

**Database Migration**:
```sql
-- Add SM-2 fields to flashcards
ALTER TABLE public.flashcards
ADD COLUMN IF NOT EXISTS ease_factor DECIMAL(3,2) DEFAULT 2.50,
ADD COLUMN IF NOT EXISTS interval_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS repetitions INTEGER DEFAULT 0;

-- Index for due cards query
CREATE INDEX IF NOT EXISTS idx_flashcards_due
ON public.flashcards(user_id, next_review_at)
WHERE review_status != 'mastered';

-- Function to get cards due for review
CREATE OR REPLACE FUNCTION public.get_due_flashcards(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  front_text TEXT,
  back_text TEXT,
  concept_id UUID,
  ease_factor DECIMAL,
  interval_days INTEGER,
  repetitions INTEGER
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, front_text, back_text, concept_id, ease_factor, interval_days, repetitions
  FROM flashcards
  WHERE user_id = p_user_id
    AND review_status != 'mastered'
    AND (next_review_at IS NULL OR next_review_at <= NOW())
  ORDER BY next_review_at NULLS FIRST
  LIMIT 20;
$$;
```

**Utility** - `src/lib/spacedRepetition.ts`:
```typescript
// SM-2 Algorithm Implementation
interface ReviewResult {
  quality: 0 | 1 | 2 | 3 | 4 | 5; // 0=complete blackout, 5=perfect response
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export function calculateNextReview(
  quality: number,
  currentEase: number = 2.5,
  currentInterval: number = 0,
  repetitions: number = 0
): ReviewResult {
  let newEase = currentEase;
  let newInterval = currentInterval;
  let newReps = repetitions;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * currentEase);
    }
    newReps = repetitions + 1;
  } else {
    // Incorrect - reset
    newReps = 0;
    newInterval = 1;
  }

  // Update ease factor
  newEase = currentEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEase = Math.max(1.3, newEase); // Minimum ease

  return {
    quality: quality as ReviewResult["quality"],
    easeFactor: Math.round(newEase * 100) / 100,
    intervalDays: newInterval,
    repetitions: newReps,
  };
}

export function getNextReviewDate(intervalDays: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + intervalDays);
  return date;
}
```

---

## Phase 7: Growth & Engagement Features

### Task 7.1: Daily Study Reminders (Email) ⬜
**Priority**: 🟢 Medium  
**Dependencies**: Task 6.6  
**Estimated Effort**: 2 hours

Send daily email reminders for cards due for review.

**Subtasks**:
- [ ] 7.1.1 Add notification preferences to profiles
- [ ] 7.1.2 Create email reminder edge function with Resend
- [ ] 7.1.3 Schedule daily cron job for reminders
- [ ] 7.1.4 Add notification settings page

**Database Migration**:
```sql
-- Add notification preferences
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_reminders BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS reminder_time TIME DEFAULT '09:00:00';
```

**Edge Function** - `supabase/functions/send-study-reminder/index.ts`:
```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get users with cards due and reminders enabled
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .eq("email_reminders", true);

  for (const user of users ?? []) {
    // Check if they have due cards
    const { data: dueCards } = await supabase.rpc("get_due_flashcards", { p_user_id: user.id });
    
    if (dueCards && dueCards.length > 0) {
      await resend.emails.send({
        from: "Glint <reminders@yourglint.app>",
        to: [user.email],
        subject: `📚 ${dueCards.length} cards ready for review`,
        html: `
          <h2>Hey ${user.display_name}! 👋</h2>
          <p>You have <strong>${dueCards.length} flashcards</strong> ready for review.</p>
          <p>A quick 5-minute session will help lock in what you've learned!</p>
          <a href="https://yourglint.app/review" style="
            display: inline-block;
            padding: 12px 24px;
            background: #4A90E2;
            color: white;
            text-decoration: none;
            border-radius: 8px;
          ">Start Reviewing →</a>
        `,
      });
    }
  }

  return new Response(JSON.stringify({ sent: true }), { status: 200 });
});
```

**Cron Setup** (run via supabase insert tool, not migration):
```sql
SELECT cron.schedule(
  'daily-study-reminders',
  '0 9 * * *', -- 9 AM daily
  $$
  SELECT net.http_post(
    url:='https://unfqcwtlxiumkxxmpcvc.supabase.co/functions/v1/send-study-reminder',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);
```

---

### Task 7.2: Learning Analytics Dashboard ⬜
**Priority**: 🟢 Medium  
**Dependencies**: Task 6.3, Task 6.6  
**Estimated Effort**: 2 hours

Show users their learning progress with charts and stats.

**Subtasks**:
- [ ] 7.2.1 Create stats aggregation queries
- [ ] 7.2.2 Build analytics dashboard page
- [ ] 7.2.3 Add weekly progress chart (Recharts)
- [ ] 7.2.4 Display concept mastery percentages

**Database Function** - Get user stats:
```sql
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_concepts', (SELECT COUNT(*) FROM saved_concepts WHERE user_id = p_user_id),
    'total_flashcards', (SELECT COUNT(*) FROM flashcards WHERE user_id = p_user_id),
    'mastered_flashcards', (SELECT COUNT(*) FROM flashcards WHERE user_id = p_user_id AND review_status = 'mastered'),
    'cards_due_today', (
      SELECT COUNT(*) FROM flashcards 
      WHERE user_id = p_user_id 
      AND review_status != 'mastered'
      AND (next_review_at IS NULL OR next_review_at <= NOW())
    ),
    'current_streak', (SELECT current_streak FROM profiles WHERE id = p_user_id),
    'longest_streak', (SELECT longest_streak FROM profiles WHERE id = p_user_id)
  );
$$;
```

**Component** - `src/pages/StatsPage.tsx`:
```tsx
// Dashboard with:
// - Streak display with flame animation
// - Cards mastered / total progress bar
// - Concepts created over time (line chart)
// - Review activity calendar (heatmap)
```

---

### Task 7.3: Quick Explain Widget ⬜
**Priority**: 🔵 Low  
**Dependencies**: None  
**Estimated Effort**: 1 hour

Add floating "?" button for quick inline explanations without leaving current page.

**Subtasks**:
- [ ] 7.3.1 Create floating action button component
- [ ] 7.3.2 Build slide-up explanation drawer
- [ ] 7.3.3 Support keyboard shortcut (Cmd/Ctrl + K)

---

### Task 7.4: Concept Folders/Tags ⬜
**Priority**: 🔵 Low  
**Dependencies**: None  
**Estimated Effort**: 2 hours

Organize saved concepts with custom folders or tags.

**Subtasks**:
- [ ] 7.4.1 Create folders table
- [ ] 7.4.2 Add folder selector to save flow
- [ ] 7.4.3 Add folder sidebar to library
- [ ] 7.4.4 Support drag-and-drop organization

**Database Migration**:
```sql
-- Folders table
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#4A90E2',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own folders"
ON public.folders FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add folder reference to concepts
ALTER TABLE public.saved_concepts
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL;
```

---

## Phase 8: Future Expansion (V2+)

### Task 8.1: Chrome Extension ⬜
**Priority**: 🔵 Low (V2)

Highlight text on any webpage → Get Glint explanation inline.

### Task 8.2: Quizlet/Anki Export ⬜
**Priority**: 🔵 Low (V2)

Export flashcards to popular study platforms.

### Task 8.3: AI Follow-up Questions ⬜
**Priority**: 🔵 Low (V2)

"What should I study next?" based on weak areas.

### Task 8.4: Collaborative Study ⬜
**Priority**: 🔵 Low (V2)

Share flashcard decks with classmates.

### Task 8.5: Voice Input ⬜
**Priority**: 🔵 Low (V2)

Ask questions verbally for hands-free studying.

---

## Quick Reference

### File Structure (Target)
```
src/
├── components/
│   ├── ui/              # shadcn components
│   ├── auth/            # Auth-related components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── GoogleSignInButton.tsx
│   │   └── ProtectedRoute.tsx
│   ├── Flashcard.tsx
│   ├── LoadingSpinner.tsx
│   ├── Logo.tsx
│   ├── StreakBadge.tsx
│   ├── ShareButton.tsx
│   └── UpgradeModal.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── MotionContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useSavedConcepts.ts
│   ├── useFlashcards.ts
│   ├── useUsageLimit.ts
│   ├── useStreak.ts
│   └── useBreakpoint.ts
├── lib/
│   ├── ai.ts
│   ├── spacedRepetition.ts
│   └── utils.ts
├── pages/
│   ├── HomePage.tsx
│   ├── ResultsPage.tsx
│   ├── FlashcardsPage.tsx
│   ├── LibraryPage.tsx
│   ├── UpgradePage.tsx
│   ├── StatsPage.tsx
│   ├── SharedConceptPage.tsx
│   ├── LoginPage.tsx
│   └── SignupPage.tsx
├── store/
│   └── appStore.ts
└── integrations/
    └── supabase/
        ├── client.ts
        └── types.ts

supabase/
└── functions/
    ├── generate-explanation/
    ├── generate-flashcards/
    ├── create-checkout-session/
    ├── stripe-webhook/
    ├── generate-flashcard-pdf/
    └── send-study-reminder/
```

### Design Tokens Reference
See `src/index.css` and `tailwind.config.ts` for:
- Colors: `--primary`, `--accent`, `--success`, `--background`, `--foreground`
- Typography: Font sizes follow 8pt grid
- Motion: 200-300ms with ease-in-out
- Breakpoints: xs(480), sm(640), md(768), lg(1024), xl(1280), 2xl(1440)

### Key Voice Examples
- ✅ "Paste anything confusing. I'll make it clear."
- ✅ "Still fuzzy? Try the simpler version."
- ✅ "Nice work! You've mastered this concept."
- ✅ "Keep your streak alive! 🔥"
- ❌ No corporate/robotic language

### Priority Order for V1
1. **Stripe Payments** (Revenue)
2. **Google OAuth** (Conversion)
3. **Study Streaks** (Retention)
4. **PDF Export** (Premium value)
5. **Shareable Links** (Virality)
6. **Spaced Repetition** (Learning outcomes)

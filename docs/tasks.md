# Glint - Implementation Tasks

> **Source of Truth**: This document tracks all implementation tasks for Glint.  
> **Last Updated**: 2026-01-10  
> **Status Legend**: ⬜ Todo | 🔄 In Progress | ✅ Done | ⏸️ Blocked

---

## Current State Summary

The MVP UI shell is complete:
- ✅ HomePage with input and CTA
- ✅ ResultsPage with 3-level explanation tabs  
- ✅ FlashcardsPage with review flow
- ✅ LibraryPage for saved concepts
- ✅ UpgradePage for premium
- ✅ Design system (colors, typography, spacing)
- ✅ Zustand state management
- ⬜ Backend not connected (using mock AI)
- ⬜ No authentication
- ⬜ No data persistence

---

## Phase 1: Foundation (Lovable Cloud + Auth)

### Task 1.1: Enable Lovable Cloud ⬜
**Priority**: 🔴 Critical  
**Dependencies**: None

**Subtasks**:
- [ ] 1.1.1 Enable Lovable Cloud via tool
- [ ] 1.1.2 Verify database connection
- [ ] 1.1.3 Create initial tables (see Task 1.3)

---

### Task 1.2: Implement Email/Password Authentication ⬜
**Priority**: 🔴 Critical  
**Dependencies**: Task 1.1

**Subtasks**:
- [ ] 1.2.1 Create `profiles` table for user data
- [ ] 1.2.2 Create auth pages (Login, Signup)
- [ ] 1.2.3 Implement auth context/hook
- [ ] 1.2.4 Add protected route wrapper
- [ ] 1.2.5 Add logout functionality
- [ ] 1.2.6 Handle email confirmation flow

**Database Schema**:
```sql
-- Profiles table for user metadata
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'premium')),
  daily_usage_count INTEGER DEFAULT 0,
  last_usage_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Files to Create**:
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/pages/LoginPage.tsx` - Login form
- `src/pages/SignupPage.tsx` - Signup form
- `src/components/ProtectedRoute.tsx` - Route guard
- `src/hooks/useAuth.ts` - Auth hook

**Code Reference** - Auth Context Pattern:
```tsx
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

### Task 1.3: Create Database Tables ⬜
**Priority**: 🔴 Critical  
**Dependencies**: Task 1.1

**Subtasks**:
- [ ] 1.3.1 Create `saved_concepts` table
- [ ] 1.3.2 Create `flashcards` table
- [ ] 1.3.3 Set up RLS policies
- [ ] 1.3.4 Create indexes for performance

**Database Schema**:
```sql
-- Saved Concepts Table
CREATE TABLE public.saved_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  input_text TEXT,
  explanation_simplest TEXT,
  explanation_standard TEXT,
  explanation_deep TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.saved_concepts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can CRUD own concepts"
ON public.saved_concepts FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_saved_concepts_user_id ON public.saved_concepts(user_id);
CREATE INDEX idx_saved_concepts_created_at ON public.saved_concepts(created_at DESC);

-- Flashcards Table
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id UUID REFERENCES public.saved_concepts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  review_status TEXT DEFAULT 'new' CHECK (review_status IN ('new', 'learning', 'mastered')),
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can CRUD own flashcards"
ON public.flashcards FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_flashcards_concept_id ON public.flashcards(concept_id);
CREATE INDEX idx_flashcards_user_id ON public.flashcards(user_id);
CREATE INDEX idx_flashcards_next_review ON public.flashcards(next_review_at);
```

---

## Phase 2: AI Explanation Engine

### Task 2.1: Create Explanation Edge Function ⬜
**Priority**: 🔴 Critical  
**Dependencies**: Task 1.1

**Subtasks**:
- [ ] 2.1.1 Create edge function for AI explanations
- [ ] 2.1.2 Implement 3-tier prompt structure
- [ ] 2.1.3 Add error handling (429, 402)
- [ ] 2.1.4 Connect frontend to edge function

**Edge Function** - `supabase/functions/generate-explanation/index.ts`:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a clear, friendly tutor helping a stressed college student understand a concept.
Generate 3 explanations of this concept:

1. SIMPLEST (ages 10-12):
- Use everyday analogies
- Max 100 words
- Avoid jargon completely

2. STANDARD (college level):
- Clear, conversational language
- Use natural analogies when helpful
- Include key terminology but explain it
- Max 150 words

3. DEEP DIVE (expert level):
- Include technical details
- Add context and nuance
- Still plain-English and readable
- Max 200 words

Tone: Competent friend who knows this cold and wants to help you get it.
No preamble. Output only the 3 explanations.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "simplest": "explanation text here",
  "standard": "explanation text here", 
  "deep": "explanation text here"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic } = await req.json();
    
    if (!topic || typeof topic !== 'string') {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Explain this concept: ${topic}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse the JSON response
    const explanations = JSON.parse(content);

    return new Response(
      JSON.stringify(explanations),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating explanation:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

**Files to Update**:
- `src/lib/ai.ts` - Replace mock with real API calls
- `src/pages/HomePage.tsx` - Connect to edge function
- `src/pages/ResultsPage.tsx` - Handle loading/error states

---

### Task 2.2: Create Flashcard Generation Edge Function ⬜
**Priority**: 🟡 High  
**Dependencies**: Task 2.1

**Subtasks**:
- [ ] 2.2.1 Create flashcard generation edge function
- [ ] 2.2.2 Implement structured output with tool calling
- [ ] 2.2.3 Connect to flashcards page

**Edge Function** - `supabase/functions/generate-flashcards/index.ts`:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { explanation, topic } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: `Based on the provided explanation, generate 3-5 flashcards that test understanding.
Guidelines:
- Ask "why" and "how" questions, not just "what"
- Keep answers short (1-3 sentences)
- Use simplified explanation tone
- No jargon unless it was defined` 
          },
          { role: "user", content: `Topic: ${topic}\n\nExplanation: ${explanation}` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_flashcards",
            description: "Create flashcards from the explanation",
            parameters: {
              type: "object",
              properties: {
                flashcards: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      front: { type: "string", description: "Concept-checking question" },
                      back: { type: "string", description: "Clear, simple answer" }
                    },
                    required: ["front", "back"]
                  }
                }
              },
              required: ["flashcards"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "create_flashcards" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const flashcards = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(flashcards),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

## Phase 3: Data Persistence

### Task 3.1: Implement Save Concept Flow ⬜
**Priority**: 🟡 High  
**Dependencies**: Task 1.2, Task 1.3

**Subtasks**:
- [ ] 3.1.1 Create `useSavedConcepts` hook
- [ ] 3.1.2 Update ResultsPage save button
- [ ] 3.1.3 Handle optimistic updates

**Files to Create**:
- `src/hooks/useSavedConcepts.ts`

**Code Reference**:
```typescript
// src/hooks/useSavedConcepts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SavedConcept {
  id: string;
  topic: string;
  input_text: string;
  explanation_simplest: string;
  explanation_standard: string;
  explanation_deep: string;
  created_at: string;
}

export function useSavedConcepts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: concepts = [], isLoading } = useQuery({
    queryKey: ['saved-concepts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_concepts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SavedConcept[];
    },
    enabled: !!user,
  });

  const saveConcept = useMutation({
    mutationFn: async (concept: Omit<SavedConcept, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('saved_concepts')
        .insert({ ...concept, user_id: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-concepts'] });
      toast.success('Concept saved!');
    },
    onError: () => {
      toast.error('Failed to save concept');
    },
  });

  const deleteConcept = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('saved_concepts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-concepts'] });
      toast.success('Concept deleted');
    },
  });

  return { concepts, isLoading, saveConcept, deleteConcept };
}
```

---

### Task 3.2: Implement Library Page with Real Data ⬜
**Priority**: 🟡 High  
**Dependencies**: Task 3.1

**Subtasks**:
- [ ] 3.2.1 Connect LibraryPage to `useSavedConcepts`
- [ ] 3.2.2 Add search/filter functionality
- [ ] 3.2.3 Add delete confirmation dialog
- [ ] 3.2.4 Add empty state

---

### Task 3.3: Save Flashcards to Database ⬜
**Priority**: 🟡 High  
**Dependencies**: Task 1.3, Task 2.2

**Subtasks**:
- [ ] 3.3.1 Create `useFlashcards` hook
- [ ] 3.3.2 Save flashcards when generated
- [ ] 3.3.3 Track review status (got it / review again)
- [ ] 3.3.4 Update next_review_at for spaced repetition

---

## Phase 4: Usage Limits & Premium

### Task 4.1: Implement Free Tier Limits ⬜
**Priority**: 🟡 High  
**Dependencies**: Task 1.2

**Subtasks**:
- [ ] 4.1.1 Track daily usage in profiles table
- [ ] 4.1.2 Reset usage count daily (via check on frontend)
- [ ] 4.1.3 Show usage counter in UI
- [ ] 4.1.4 Block generation after 3 uses

**Code Reference** - Usage Check:
```typescript
// src/hooks/useUsageLimit.ts
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const FREE_DAILY_LIMIT = 3;

export function useUsageLimit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('daily_usage_count, last_usage_date, plan_type')
        .eq('id', user!.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const today = new Date().toISOString().split('T')[0];
  const isNewDay = profile?.last_usage_date !== today;
  const usageCount = isNewDay ? 0 : (profile?.daily_usage_count ?? 0);
  const isPremium = profile?.plan_type === 'premium';
  const canGenerate = isPremium || usageCount < FREE_DAILY_LIMIT;
  const remainingUses = FREE_DAILY_LIMIT - usageCount;

  const incrementUsage = useMutation({
    mutationFn: async () => {
      const newCount = isNewDay ? 1 : usageCount + 1;
      const { error } = await supabase
        .from('profiles')
        .update({ 
          daily_usage_count: newCount,
          last_usage_date: today
        })
        .eq('id', user!.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return { 
    usageCount, 
    remainingUses, 
    canGenerate, 
    isPremium, 
    incrementUsage 
  };
}
```

---

### Task 4.2: Upgrade Flow & Premium Gates ⬜
**Priority**: 🟢 Medium  
**Dependencies**: Task 4.1

**Subtasks**:
- [ ] 4.2.1 Show upgrade modal when limit reached
- [ ] 4.2.2 Add upgrade banner after 5+ saved items
- [ ] 4.2.3 Gate PDF export to premium
- [ ] 4.2.4 Prepare for Stripe integration (placeholder)

**Files to Update**:
- `src/pages/UpgradePage.tsx` - Add pricing details
- `src/components/UpgradeModal.tsx` - Create modal component

---

## Phase 5: Polish & Accessibility

### Task 5.1: Loading States & Skeletons ⬜
**Priority**: 🟢 Medium  
**Dependencies**: Phase 2

**Subtasks**:
- [ ] 5.1.1 Add skeleton loaders for explanations
- [ ] 5.1.2 Add progress animation during generation
- [ ] 5.1.3 Add loading states for flashcard generation

---

### Task 5.2: Mobile Optimization ⬜
**Priority**: 🟢 Medium  
**Dependencies**: None

**Subtasks**:
- [ ] 5.2.1 Audit thumb zones on all pages
- [ ] 5.2.2 Ensure 44px+ tap targets
- [ ] 5.2.3 Test swipe gestures on flashcards
- [ ] 5.2.4 Add bottom navigation for mobile

---

### Task 5.3: Accessibility Audit ⬜
**Priority**: 🟢 Medium  
**Dependencies**: None

**Subtasks**:
- [ ] 5.3.1 Add ARIA labels to all interactive elements
- [ ] 5.3.2 Implement keyboard navigation
- [ ] 5.3.3 Add skip-to-content link
- [ ] 5.3.4 Implement motion-reduced mode
- [ ] 5.3.5 Verify WCAG AA+ contrast ratios

---

### Task 5.4: Celebrations & Microinteractions ⬜
**Priority**: 🟢 Medium  
**Dependencies**: None

**Subtasks**:
- [ ] 5.4.1 Add confetti on flashcard completion
- [ ] 5.4.2 Add success toast animations
- [ ] 5.4.3 Polish card flip animation
- [ ] 5.4.4 Add subtle hover/tap feedback

---

## Phase 6: Future Features (Post-MVP)

### Task 6.1: Stripe Payments ⬜
**Priority**: 🔵 Low (V1)  
**Dependencies**: Task 4.2

**Subtasks**:
- [ ] 6.1.1 Enable Stripe integration
- [ ] 6.1.2 Create checkout session edge function
- [ ] 6.1.3 Handle webhook for subscription updates
- [ ] 6.1.4 Update user plan_type on successful payment

---

### Task 6.2: PDF Export ⬜
**Priority**: 🔵 Low (V1)  
**Dependencies**: Task 6.1

**Subtasks**:
- [ ] 6.2.1 Create PDF generation edge function
- [ ] 6.2.2 Format flashcards for print
- [ ] 6.2.3 Add download button (premium only)

---

### Task 6.3: Spaced Repetition Reminders ⬜
**Priority**: 🔵 Low (V1)  
**Dependencies**: Task 3.3

**Subtasks**:
- [ ] 6.3.1 Calculate next review dates using SM-2 algorithm
- [ ] 6.3.2 Show in-app reminders for due cards
- [ ] 6.3.3 Add "Cards due today" badge

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
│   │   └── ProtectedRoute.tsx
│   ├── Flashcard.tsx
│   ├── LoadingSpinner.tsx
│   ├── Logo.tsx
│   └── UpgradeModal.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useSavedConcepts.ts
│   ├── useFlashcards.ts
│   └── useUsageLimit.ts
├── lib/
│   ├── ai.ts
│   └── utils.ts
├── pages/
│   ├── HomePage.tsx
│   ├── ResultsPage.tsx
│   ├── FlashcardsPage.tsx
│   ├── LibraryPage.tsx
│   ├── UpgradePage.tsx
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
    │   └── index.ts
    └── generate-flashcards/
        └── index.ts
```

### Design Tokens Reference
See `src/index.css` and `tailwind.config.ts` for:
- Colors: `--primary`, `--accent`, `--success`, `--background`, `--foreground`
- Typography: Font sizes follow 8pt grid
- Motion: 200-300ms with ease-in-out

### Key Voice Examples
- ✅ "Paste anything confusing. I'll make it clear."
- ✅ "Still fuzzy? Try the simpler version."
- ✅ "Nice work! You've mastered this concept."
- ❌ No corporate/robotic language

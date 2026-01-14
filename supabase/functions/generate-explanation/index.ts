import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FREE_DAILY_LIMIT = 3;

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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization');

    // Check if user is authenticated
    let userId: string | null = null;
    let isPremium = false;
    let currentUsageCount = 0;

    if (authHeader?.startsWith('Bearer ')) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      
      if (!claimsError && claimsData?.claims?.sub) {
        userId = claimsData.claims.sub;

        // Get user's profile to check usage and premium status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('daily_usage_count, last_usage_date, plan_type')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profile) {
          isPremium = profile.plan_type === 'premium';
          
          // Check if it's a new day - reset count if so
          const today = new Date().toISOString().split('T')[0];
          const lastUsageDate = profile.last_usage_date;
          
          if (lastUsageDate !== today) {
            // New day, reset count
            currentUsageCount = 0;
          } else {
            currentUsageCount = profile.daily_usage_count || 0;
          }

          // Enforce limit for non-premium users
          if (!isPremium && currentUsageCount >= FREE_DAILY_LIMIT) {
            return new Response(
              JSON.stringify({ 
                error: "Daily limit reached",
                code: "LIMIT_EXCEEDED",
                message: "You've used all 3 free explanations today. Upgrade to Premium for unlimited access!"
              }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Increment usage count BEFORE generating (to prevent race conditions)
          const newCount = currentUsageCount + 1;
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              daily_usage_count: newCount,
              last_usage_date: today
            })
            .eq('id', userId);

          if (updateError) {
            console.error("Error updating usage count:", updateError);
          }
        }
      }
    }

    // If no authenticated user, allow the request (anonymous users handled client-side)
    // This maintains backward compatibility for non-logged-in users

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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response - handle potential markdown code blocks
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.slice(7);
    }
    if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith("```")) {
      jsonContent = jsonContent.slice(0, -3);
    }
    
    const explanations = JSON.parse(jsonContent.trim());

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

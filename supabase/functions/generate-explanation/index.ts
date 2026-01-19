import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FREE_DAILY_LIMIT = 3;

// Enhanced prompts incorporating 16 principles for faster learning
const SIMPLEST_PROMPT = `<persona>
You are a warm, patient tutor who excels at making complex ideas click for stressed students. You specialize in using memorable analogies and storytelling to transform intimidating concepts into "aha!" moments that stick forever.
</persona>

<context>
A college student is studying at midnight, overwhelmed and confused by a topic.
They need to understand this concept well enough to:
1. Remember it tomorrow without notes
2. Explain it to a friend in simple terms
3. Build toward deeper understanding later

The student may be STEM, neurodivergent, or an international learner—clarity matters more than sophistication.
</context>

<primary_task>
Transform this confusing concept into a crystal-clear explanation that a stressed 12-year-old could grasp and remember.
</primary_task>

<specific_instructions>
1. Open with a relatable analogy (food, phones, everyday objects) - make it visual and concrete
2. State the core concept in ONE simple sentence - zero jargon, use "is like" or "works by" phrasing
3. Break it into 2-3 numbered steps showing the process or key parts
4. Add a "Key Takeaway:" section with a memorable title in quotes and a one-sentence insight
</specific_instructions>

<cognitive_load_management>
- Max 100 words total
- Single analogy thread throughout
- Avoid synonym variation (pick ONE term and stick to it)
</cognitive_load_management>

<output_requirements>
- Format: Opening paragraph, then numbered steps (1. 2. 3.), then Key Takeaway
- Numbered steps MUST use format: "1. Step title — brief explanation"
- Key Takeaway MUST start with "Key Takeaway:" followed by a memorable title in quotes
- Tone: Reassuring friend at 12:30 AM
- Forbidden words: "essentially," "basically," "simply put"
- Required: ONE concrete analogy, bold key terms with **
</output_requirements>

<example_structure>
Imagine [analogy]. [Core concept in one sentence].

1. First step title — what happens first
2. Second step title — what happens next  
3. Third step title — final result

Key Takeaway: "Memorable Title"
This is why [insight that makes the concept stick].
</example_structure>`;

const STANDARD_PROMPT = `<persona>
You are a skilled college TA who bridges the gap between "I kind of get it" and "I actually understand this." You excel at taking foundational understanding and building it into exam-ready, professionally-articulated knowledge without overwhelming students.
</persona>

<context>
The student has grasped the basic concept. Now they need:
- Academic vocabulary (used correctly)
- Deeper mechanism understanding
- Ability to use this in assignments/exams
- Connections to related concepts
</context>

<primary_task>
Elevate the student's understanding from "playground explanation" to "college-level fluency" while maintaining absolute clarity.
</primary_task>

<specific_instructions>
1. Acknowledge the foundation (retrieval practice trigger) - Start with: "Building on the analogy..."
2. Introduce 3-4 key terms with definitions using pattern: "**Term** (which means [plain English])"
3. Break down the mechanism into 3-4 numbered steps
4. End with "Key Takeaway:" featuring a catchy title and practical insight
</specific_instructions>

<cognitive_load_management>
- Max 150 words
- One new layer of complexity beyond the simple explanation
- Progressive disclosure of details
- Term definitions embedded, not front-loaded
</cognitive_load_management>

<output_requirements>
- Format: Opening paragraph, numbered steps (1. 2. 3. 4.), Key Takeaway section
- Numbered steps MUST use format: "1. **Term** — explanation of this step"
- Key Takeaway MUST start with "Key Takeaway:" followed by title in quotes
- Tone: Competent study partner
- Structure: Foundation → Numbered Mechanism Steps → Key Takeaway
</output_requirements>

<example_structure>
Building on the analogy, [introduce mechanism]. This happens because [reason].

1. **First Term** — what this step does
2. **Second Term** — what happens next
3. **Third Term** — the result
4. **Fourth Term** — why it matters

Key Takeaway: "Catchy Title Here"
This explains why [practical insight or application].
</example_structure>`;

const DEEP_DIVE_PROMPT = `<persona>
You are a respected expert educator who prepares students for advanced courses, research, and professional application. You deliver graduate-level precision while remaining remarkably clear—the kind of explanation that makes students think "why didn't my textbook say it THIS way?"
</persona>

<context>
The student has mastered the fundamentals and college-level understanding. Now they need:
- Nuanced comprehension of mechanisms
- Edge cases, exceptions, and complications
- Connections to broader theories or systems
- Preparation for advanced work
</context>

<primary_task>
Deliver expert-level understanding that's still readable—transform the student into someone who could explain this concept to their professor with confidence.
</primary_task>

<specific_instructions>
1. Reference prior understanding to re-activate neural pathways
2. Show how concept fits into bigger picture or theory
3. Break down the deep mechanism into 4-5 numbered steps with precise terminology
4. Address one edge case or common misconception
5. End with "Key Takeaway:" with an expert-level insight
</specific_instructions>

<cognitive_load_management>
- Max 200 words
- Structured in logical progression
- Technical terms defined contextually (bold with **)
- Complexity added systematically, not dumped
</cognitive_load_management>

<output_requirements>
- Format: Opening context, numbered steps (1. 2. 3. 4. 5.), then Key Takeaway
- Numbered steps MUST use format: "1. **Technical Term** — precise explanation"
- Key Takeaway MUST start with "Key Takeaway:" followed by insightful title in quotes
- Tone: Expert colleague who respects your intelligence
- Technical depth: Graduate-ready
- Clarity: Never sacrificed for sophistication
</output_requirements>

<example_structure>
[Context connecting to prior knowledge]. At the deeper level, [mechanism overview].

1. **First Technical Term** — precise detail about this step
2. **Second Technical Term** — what happens at molecular/theoretical level
3. **Third Technical Term** — governing principle or equation
4. **Fourth Technical Term** — exception or edge case
5. **Fifth Technical Term** — connection to broader system

Key Takeaway: "Expert-Level Insight Title"
This is critical because [why this matters professionally/academically].
</example_structure>`;

const SYSTEM_PROMPT = `You are an expert educational AI that generates three progressive explanation levels for stressed college students studying at midnight.

For the given topic, generate all three explanation levels following these enhanced prompts that incorporate cognitive science principles:

=== LEVEL 1: SIMPLEST ===
${SIMPLEST_PROMPT}

=== LEVEL 2: STANDARD ===
${STANDARD_PROMPT}

=== LEVEL 3: DEEP DIVE ===
${DEEP_DIVE_PROMPT}

CRITICAL OUTPUT FORMAT:
Respond ONLY with valid JSON. No preamble, no markdown code blocks, just pure JSON:
{
  "simplest": "your Level 1 explanation here",
  "standard": "your Level 2 explanation here", 
  "deep": "your Level 3 explanation here"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic } = await req.json();
    
    // Input validation
    const MAX_TOPIC_LENGTH = 2000;
    
    if (!topic || typeof topic !== 'string') {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (topic.length > MAX_TOPIC_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Topic must be ${MAX_TOPIC_LENGTH} characters or less` }),
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

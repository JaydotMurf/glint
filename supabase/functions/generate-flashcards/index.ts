import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function callAIWithRetry(apiKey: string, topic: string, explanation: string, retries = 2): Promise<Response> {
  const models = ["google/gemini-2.5-flash", "openai/gpt-5-mini"];
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const model = attempt === 0 ? models[0] : models[1]; // Try primary, then fallback
    
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { 
              role: "system", 
              content: `Based on the provided explanation, generate 3-5 flashcards that test understanding.
Guidelines:
- Ask "why" and "how" questions, not just "what"
- Keep answers short (1-3 sentences)
- Use simplified explanation tone
- No jargon unless it was defined in the explanation` 
            },
            { role: "user", content: `Topic: ${topic}\n\nExplanation: ${explanation || topic}` }
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

      if (response.ok) {
        return response;
      }
      
      // If 502/503/504, retry with next model
      if ([502, 503, 504].includes(response.status) && attempt < retries) {
        console.log(`Model ${model} returned ${response.status}, trying fallback...`);
        continue;
      }
      
      return response; // Return the error response if not retryable
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt === retries) throw error;
    }
  }
  
  throw new Error("All retry attempts failed");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, explanation } = await req.json();

    if (!topic || typeof topic !== 'string') {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await callAIWithRetry(LOVABLE_API_KEY, topic, explanation || topic);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment." }),
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
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No flashcards in AI response");
    }
    
    const flashcards = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(flashcards),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { Concept, Flashcard } from "@/store/appStore";
import { supabase } from "@/integrations/supabase/client";

const generateId = () => Math.random().toString(36).substring(2, 9);

export async function generateExplanation(topic: string): Promise<Concept> {
  const { data, error } = await supabase.functions.invoke('generate-explanation', {
    body: { topic }
  });

  if (error) {
    console.error("Error calling generate-explanation:", error);
    
    // Check for limit exceeded error (403)
    if (error.message?.includes('403') || error.message?.includes('LIMIT_EXCEEDED')) {
      throw new Error("LIMIT_EXCEEDED");
    }
    
    throw new Error(error.message || "Failed to generate explanation");
  }

  if (data.error) {
    // Check for limit exceeded from response body
    if (data.code === "LIMIT_EXCEEDED") {
      throw new Error("LIMIT_EXCEEDED");
    }
    throw new Error(data.error);
  }

  // Map API response to our Concept structure
  const explanations = {
    simplest: data.simplest || "Explanation not available",
    standard: data.standard || "Explanation not available",
    deepDive: data.deep || "Explanation not available",
  };

  // Generate flashcards immediately after explanation
  const flashcards = await generateFlashcards(topic, explanations.standard);

  return {
    id: generateId(),
    topic,
    explanations,
    flashcards,
    savedAt: new Date(),
  };
}

export async function generateFlashcards(
  topic: string,
  explanation: string
): Promise<Flashcard[]> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-flashcards', {
      body: { topic, explanation }
    });

    if (error) {
      console.error("Error calling generate-flashcards:", error);
      // Return fallback flashcards on error
      return getFallbackFlashcards(topic);
    }

    if (data.error) {
      console.error("Flashcard generation error:", data.error);
      return getFallbackFlashcards(topic);
    }

    // Map API response to our Flashcard structure
    const flashcards: Flashcard[] = (data.flashcards || []).map((card: { front: string; back: string }) => ({
      id: generateId(),
      front: card.front,
      back: card.back,
      mastered: false,
    }));

    return flashcards.length > 0 ? flashcards : getFallbackFlashcards(topic);
  } catch (err) {
    console.error("Flashcard generation failed:", err);
    return getFallbackFlashcards(topic);
  }
}

function getFallbackFlashcards(topic: string): Flashcard[] {
  return [
    {
      id: generateId(),
      front: `What is the main purpose of ${topic}?`,
      back: `This concept helps coordinate different elements in a system to achieve a specific outcome efficiently.`,
      mastered: false,
    },
    {
      id: generateId(),
      front: `How would you explain ${topic} to a friend?`,
      back: `It's like organizing things so they work together smoothly - each part has a role that helps the whole system function.`,
      mastered: false,
    },
    {
      id: generateId(),
      front: `Why is understanding ${topic} important?`,
      back: `It helps you see the bigger picture and troubleshoot complex scenarios in this subject area.`,
      mastered: false,
    },
  ];
}

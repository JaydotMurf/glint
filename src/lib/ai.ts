import { Concept, Flashcard } from "@/store/appStore";

// Simulated AI responses for MVP (replace with actual AI integration later)
const generateId = () => Math.random().toString(36).substring(2, 9);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateExplanation(topic: string): Promise<Concept> {
  // Simulate API call delay
  await delay(2000);

  // Mock explanations based on common topics
  const explanations = {
    simplest: `Think of ${topic} like this: Imagine you have a toy box. ${topic} is like the way you organize your toys so you can find them easily. It helps everything work together smoothly, just like how your toys play together!`,
    
    standard: `${topic} is a fundamental concept that describes how components interact within a system. At its core, it involves the coordination of different elements to achieve a specific outcome. Understanding this helps you see the bigger picture of how complex processes work together efficiently.`,
    
    deepDive: `${topic} encompasses several interconnected principles that form the backbone of this subject area. The underlying mechanism involves multiple layers of interaction, where each component plays a specific role in the overall process. Key aspects include the initial trigger phase, the propagation of effects through the system, and the eventual equilibrium state. Understanding these nuances is crucial for advanced applications and troubleshooting complex scenarios.`,
  };

  const flashcards: Flashcard[] = [
    {
      id: generateId(),
      front: `What is the main purpose of ${topic}?`,
      back: `${topic} helps coordinate different elements in a system to achieve a specific outcome efficiently.`,
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
      front: `What are the key phases involved in ${topic}?`,
      back: `The trigger phase, propagation of effects, and reaching equilibrium are the main phases.`,
      mastered: false,
    },
    {
      id: generateId(),
      front: `Why is understanding ${topic} important?`,
      back: `It helps you see the bigger picture and troubleshoot complex scenarios in this subject area.`,
      mastered: false,
    },
  ];

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
  await delay(1500);

  return [
    {
      id: generateId(),
      front: `What is the core concept of ${topic}?`,
      back: "The fundamental principle that governs how elements interact within the system.",
      mastered: false,
    },
    {
      id: generateId(),
      front: `How does ${topic} affect the overall process?`,
      back: "It coordinates different components to work together efficiently toward the desired outcome.",
      mastered: false,
    },
    {
      id: generateId(),
      front: `What's a real-world example of ${topic}?`,
      back: "Think of it like a team working together - each member has a specific role that contributes to success.",
      mastered: false,
    },
  ];
}

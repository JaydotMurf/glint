interface ExamplePromptsProps {
  onSelect: (prompt: string) => void;
}

const examples = [
  "Explain the Krebs cycle",
  "What is quantum entanglement?",
  "How does photosynthesis work?",
  "Explain derivatives in calculus",
];

export function ExamplePrompts({ onSelect }: ExamplePromptsProps) {
  return (
    <div className="text-center">
      <p className="text-caption text-muted-foreground mb-3">
        💡 Try these examples:
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {examples.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="px-3 py-1.5 text-sm text-muted-foreground bg-muted rounded-full
                     hover:text-foreground hover:bg-muted/80 transition-colors duration-200"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

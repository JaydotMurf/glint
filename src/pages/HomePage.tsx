import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { GlintButton } from "@/components/ui/glint-button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAppStore } from "@/store/appStore";
import { generateExplanation } from "@/lib/ai";
import { Search, BookOpen, Sparkles, ArrowRight } from "lucide-react";

const examplePrompts = [
  "Explain the Krebs cycle",
  "What is quantum entanglement?",
  "How does photosynthesis work?",
  "Explain derivatives in calculus",
];

const HomePage = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const { 
    isGenerating, 
    setIsGenerating, 
    setCurrentConcept, 
    dailyExplanations,
    isPremium,
    incrementDailyExplanations,
    savedConcepts 
  } = useAppStore();

  const FREE_LIMIT = 3;
  const canGenerate = isPremium || dailyExplanations < FREE_LIMIT;

  const handleSubmit = async (topic: string) => {
    if (!topic.trim() || isGenerating) return;

    if (!canGenerate) {
      navigate("/upgrade");
      return;
    }

    setIsGenerating(true);
    try {
      const concept = await generateExplanation(topic.trim());
      setCurrentConcept(concept);
      incrementDailyExplanations();
      navigate("/results");
    } catch (error) {
      console.error("Failed to generate explanation:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(inputValue);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          {savedConcepts.length > 0 && (
            <GlintButton
              variant="ghost"
              size="sm"
              onClick={() => navigate("/library")}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Library</span>
            </GlintButton>
          )}
          {!isPremium && (
            <span className="text-caption text-muted-foreground">
              {FREE_LIMIT - dailyExplanations} left today
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
          {/* Hero Text */}
          <div className="text-center mb-10">
            <h1 className="text-display text-foreground mb-4">
              Understand anything.
              <br />
              <span className="text-primary">Instantly.</span>
            </h1>
            <p className="text-body-lg text-muted-foreground max-w-md mx-auto">
              Paste anything confusing. Get crystal-clear explanations in seconds.
            </p>
          </div>

          {/* Input Area */}
          <div className="relative mb-6">
            <div className="absolute left-5 top-6 text-muted-foreground/50">
              <Search className="h-5 w-5" />
            </div>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste a paragraph or type a concept..."
              rows={3}
              disabled={isGenerating}
              className="glint-input pl-14 pr-6 min-h-[120px] resize-none"
            />
          </div>

          {/* CTA Button */}
          <GlintButton
            variant="primary"
            size="xl"
            className="w-full mb-8"
            onClick={() => handleSubmit(inputValue)}
            disabled={!inputValue.trim() || isGenerating}
          >
            {isGenerating ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Make it Clear
              </>
            )}
          </GlintButton>

          {/* Example Prompts */}
          <div className="text-center">
            <p className="text-caption text-muted-foreground mb-3">
              💡 Try these examples:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {examplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInputValue(prompt)}
                  className="px-3 py-1.5 text-sm text-muted-foreground bg-muted rounded-full
                           hover:text-foreground hover:bg-muted/80 transition-colors duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Recent Concepts (if any) */}
      {savedConcepts.length > 0 && (
        <div className="px-6 pb-8 animate-fade-in animation-delay-200">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-subheading text-foreground">Recent</h2>
              <GlintButton
                variant="ghost"
                size="sm"
                onClick={() => navigate("/library")}
              >
                See all
                <ArrowRight className="h-4 w-4" />
              </GlintButton>
            </div>
            <div className="grid gap-3">
              {savedConcepts.slice(0, 3).map((concept) => (
                <button
                  key={concept.id}
                  onClick={() => {
                    setCurrentConcept(concept);
                    navigate("/results");
                  }}
                  className="glint-card text-left flex items-center justify-between group"
                >
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {concept.topic}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {concept.flashcards.length} flashcards
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;

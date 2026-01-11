import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HomeHeader } from "@/components/home/HomeHeader";
import { ExamplePrompts } from "@/components/home/ExamplePrompts";
import { RecentConcepts } from "@/components/home/RecentConcepts";
import { AuthNudge } from "@/components/home/AuthNudge";
import { GlintButton } from "@/components/ui/glint-button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAppStore } from "@/store/appStore";
import { generateExplanation } from "@/lib/ai";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

const HomePage = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const { 
    isGenerating, 
    setIsGenerating, 
    setCurrentConcept, 
    dailyExplanations,
    isPremium,
    incrementDailyExplanations
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
      const message = error instanceof Error ? error.message : "Failed to generate explanation";
      toast.error("Oops!", {
        description: message,
      });
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
      <HomeHeader />

      {/* Main Content - Centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-full max-w-xl mx-auto animate-fade-in">
          {/* Input Area */}
          <div className="relative mb-4">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind?"
              rows={4}
              disabled={isGenerating}
              className="glint-input min-h-[140px] resize-none text-base"
            />
          </div>

          {/* Example Text */}
          <p className="text-center text-sm text-muted-foreground mb-4">
            Example: "I'm feeling overwhelmed with everything on my plate"
          </p>

          {/* CTA Button */}
          <GlintButton
            variant="primary"
            size="xl"
            className="w-full"
            onClick={() => handleSubmit(inputValue)}
            disabled={!inputValue.trim() || isGenerating}
          >
            {isGenerating ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Make it Clear
              </>
            )}
          </GlintButton>

          {/* Auth Nudge - Only for unauthenticated users */}
          <AuthNudge />

          {/* Usage counter for free tier */}
          {!isPremium && (
            <p className="text-center text-xs text-muted-foreground/70 mt-3">
              {FREE_LIMIT - dailyExplanations} free explanations left today
            </p>
          )}
        </div>
      </main>

      {/* Recent Concepts Section */}
      <RecentConcepts />
    </div>
  );
};

export default HomePage;

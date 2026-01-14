import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HomeHeader } from "@/components/home/HomeHeader";
import { RecentConcepts } from "@/components/home/RecentConcepts";
import { AuthNudge } from "@/components/home/AuthNudge";
import { GlintButton } from "@/components/ui/glint-button";
import { GenerationProgress } from "@/components/GenerationProgress";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useAppStore } from "@/store/appStore";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { generateExplanation } from "@/lib/ai";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

const HomePage = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const { 
    isGenerating, 
    setIsGenerating, 
    setCurrentConcept,
    setSavedConceptId,
  } = useAppStore();

  const { 
    canGenerate, 
    remainingUses, 
    isPremium, 
    incrementUsage,
    FREE_DAILY_LIMIT,
  } = useUsageLimit();

  const handleSubmit = async (topic: string) => {
    if (!topic.trim() || isGenerating) return;

    if (!canGenerate) {
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    // Reset saved concept ID for new generations
    setSavedConceptId(null);
    
    try {
      const concept = await generateExplanation(topic.trim());
      setCurrentConcept(concept);
      await incrementUsage.mutateAsync();
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
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <HomeHeader />

      {/* Main Content - Centered */}
      <main 
        id="main-content" 
        className="flex-1 flex flex-col items-center justify-center px-6 pb-24"
        role="main"
        tabIndex={-1}
      >
        {isGenerating ? (
          <div className="w-full max-w-xl mx-auto animate-fade-in">
            <GenerationProgress type="explanation" />
          </div>
        ) : (
          <div className="w-full max-w-xl mx-auto animate-fade-in">
            {/* Input Area */}
            <div className="relative mb-4">
              <label htmlFor="topic-input" className="sr-only">
                Enter a topic or paste text you want explained
              </label>
              <textarea
                id="topic-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What's on your mind?"
                rows={4}
                disabled={isGenerating}
                className="glint-input min-h-[140px] resize-none text-base"
                aria-describedby="input-hint"
              />
            </div>

            {/* Example Text */}
            <p id="input-hint" className="text-center text-sm text-muted-foreground mb-4">
              Example: "I'm feeling overwhelmed with everything on my plate"
            </p>

            {/* CTA Button */}
            <GlintButton
              variant="primary"
              size="xl"
              className="w-full min-h-[56px]"
              onClick={() => handleSubmit(inputValue)}
              disabled={!inputValue.trim() || isGenerating}
              aria-label="Generate explanation"
            >
              <Sparkles className="h-5 w-5 mr-2" aria-hidden="true" />
              Make it Clear
            </GlintButton>

            {/* Auth Nudge - Only for unauthenticated users */}
            <AuthNudge />

            {/* Usage counter for free tier */}
            {!isPremium && (
              <p className="text-center text-xs text-muted-foreground/70 mt-3" aria-live="polite">
                {remainingUses} of {FREE_DAILY_LIMIT} free explanations left today
              </p>
            )}
          </div>
        )}
      </main>

      {/* Recent Concepts Section */}
      <RecentConcepts />

      {/* Upgrade Modal */}
      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal} 
      />
    </div>
  );
};

export default HomePage;

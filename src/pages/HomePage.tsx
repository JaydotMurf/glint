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
import { Sparkles, Zap, BookOpen, Brain } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
    setSavedConceptId(null);
    
    try {
      const concept = await generateExplanation(topic.trim());
      setCurrentConcept(concept);
      await incrementUsage.mutateAsync();
      navigate("/results");
    } catch (error) {
      console.error("Failed to generate explanation:", error);
      const message = error instanceof Error ? error.message : "Failed to generate explanation";
      
      if (message === "LIMIT_EXCEEDED") {
        setShowUpgradeModal(true);
        return;
      }
      
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

  const features = [
    { icon: Zap, label: "Instant clarity", color: "from-yellow-400 to-orange-500" },
    { icon: BookOpen, label: "3 depth levels", color: "from-primary to-purple-500" },
    { icon: Brain, label: "AI flashcards", color: "from-accent to-teal-400" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full 
                     bg-gradient-to-br from-primary/20 to-purple-500/10 blur-3xl 
                     animate-pulse-soft"
        />
        <div 
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full 
                     bg-gradient-to-br from-accent/20 to-teal-400/10 blur-3xl 
                     animate-pulse-soft animation-delay-500"
        />
        <div 
          className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full 
                     bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl 
                     animate-float"
        />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen pb-20 md:pb-0">
        <HomeHeader />

        {/* Main Content */}
        <main 
          id="main-content" 
          className="flex-1 flex flex-col items-center justify-center px-6 py-12"
          role="main"
          tabIndex={-1}
        >
          {isGenerating ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xl mx-auto"
            >
              <GenerationProgress type="explanation" />
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl mx-auto"
            >
              {/* Hero Section */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                             bg-primary/10 border border-primary/20 mb-6"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    AI-Powered Learning
                  </span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-display-sm md:text-display mb-4 text-foreground"
                >
                  Understand anything,
                  <br />
                  <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
                    instantly.
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-body-lg text-muted-foreground max-w-md mx-auto"
                >
                  Paste any confusing concept. Get clear explanations at your level.
                </motion.p>
              </div>

              {/* Input Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <div className="relative group">
                  {/* Glow effect behind input */}
                  <div 
                    className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-accent/20 
                               rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  
                  <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border p-2 shadow-elevated">
                    <label htmlFor="topic-input" className="sr-only">
                      Enter a topic or paste text you want explained
                    </label>
                    <textarea
                      id="topic-input"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="What do you want to understand?"
                      rows={3}
                      disabled={isGenerating}
                      className="w-full px-5 py-4 bg-transparent text-lg 
                                placeholder:text-muted-foreground/50
                                focus:outline-none resize-none"
                      aria-describedby="input-hint"
                    />
                    
                    <div className="flex items-center justify-between px-3 pb-2">
                      <p id="input-hint" className="text-caption text-muted-foreground/60">
                        Press Enter to generate • Shift+Enter for new line
                      </p>
                      
                      <GlintButton
                        variant="primary"
                        size="md"
                        onClick={() => handleSubmit(inputValue)}
                        disabled={!inputValue.trim() || isGenerating}
                        aria-label="Generate explanation"
                        className="shadow-glow-primary"
                      >
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        Make it Clear
                      </GlintButton>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Feature Pills */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-3 mt-8"
              >
                {features.map((feature, index) => (
                  <div 
                    key={feature.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-full 
                               bg-card/60 backdrop-blur-sm border border-border
                               text-sm text-muted-foreground"
                  >
                    <div className={`p-1 rounded-md bg-gradient-to-br ${feature.color}`}>
                      <feature.icon className="h-3 w-3 text-white" />
                    </div>
                    {feature.label}
                  </div>
                ))}
              </motion.div>

              {/* Auth Nudge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <AuthNudge />
              </motion.div>

              {/* Usage counter */}
              {!isPremium && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center text-small text-muted-foreground/60 mt-4" 
                  aria-live="polite"
                >
                  {remainingUses} of {FREE_DAILY_LIMIT} free explanations left today
                </motion.p>
              )}
            </motion.div>
          )}
        </main>

        {/* Recent Concepts */}
        <RecentConcepts />
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal} 
      />
    </div>
  );
};

export default HomePage;

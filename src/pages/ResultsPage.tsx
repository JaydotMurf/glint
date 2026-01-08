import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { GlintButton } from "@/components/ui/glint-button";
import { GlintCard } from "@/components/ui/glint-card";
import { GlintTabs } from "@/components/ui/glint-tabs";
import { useAppStore } from "@/store/appStore";
import { ArrowLeft, Layers, BookOpen, Microscope, Bookmark, Plus, Check } from "lucide-react";
import { toast } from "sonner";

type ExplanationLevel = "simplest" | "standard" | "deepDive";

const levelTabs = [
  { id: "simplest", label: "Simple", icon: "🧩" },
  { id: "standard", label: "Standard", icon: "📚" },
  { id: "deepDive", label: "Deep Dive", icon: "🔬" },
];

const ResultsPage = () => {
  const navigate = useNavigate();
  const { currentConcept, saveConcept, savedConcepts, setCurrentConcept } = useAppStore();
  const [activeLevel, setActiveLevel] = useState<ExplanationLevel>("standard");

  if (!currentConcept) {
    navigate("/");
    return null;
  }

  const isSaved = savedConcepts.some((c) => c.id === currentConcept.id);

  const handleSave = () => {
    saveConcept(currentConcept);
    toast.success("Saved to your library!", {
      description: "You can review this anytime.",
    });
  };

  const handleGenerateFlashcards = () => {
    navigate("/flashcards");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-4">
          <GlintButton
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </GlintButton>
          <Logo size="sm" />
        </div>
        <GlintButton
          variant={isSaved ? "ghost" : "secondary"}
          size="sm"
          onClick={handleSave}
          disabled={isSaved}
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              Save
            </>
          )}
        </GlintButton>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 overflow-auto">
        <div className="max-w-2xl mx-auto animate-fade-in">
          {/* Topic Title */}
          <div className="mb-8">
            <p className="text-caption text-muted-foreground mb-2 uppercase tracking-wide">
              Explaining
            </p>
            <h1 className="text-display text-foreground">{currentConcept.topic}</h1>
          </div>

          {/* Level Tabs */}
          <div className="mb-6">
            <GlintTabs
              tabs={levelTabs}
              activeTab={activeLevel}
              onTabChange={(id) => setActiveLevel(id as ExplanationLevel)}
            />
          </div>

          {/* Explanation Card */}
          <GlintCard variant="elevated" className="mb-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              {activeLevel === "simplest" && (
                <span className="text-2xl">🧩</span>
              )}
              {activeLevel === "standard" && (
                <span className="text-2xl">📚</span>
              )}
              {activeLevel === "deepDive" && (
                <span className="text-2xl">🔬</span>
              )}
              <span className="text-caption font-medium text-muted-foreground uppercase tracking-wide">
                {activeLevel === "simplest" && "Simplest Explanation"}
                {activeLevel === "standard" && "Standard Explanation"}
                {activeLevel === "deepDive" && "Deep Dive"}
              </span>
            </div>
            <p className="text-body-lg text-foreground leading-relaxed">
              {currentConcept.explanations[activeLevel]}
            </p>
          </GlintCard>

          {/* Helper Text */}
          <p className="text-center text-caption text-muted-foreground mb-8">
            Still fuzzy?{" "}
            <button
              onClick={() => setActiveLevel("simplest")}
              className="text-primary hover:underline"
            >
              Try the simpler version
            </button>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <GlintButton
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleGenerateFlashcards}
            >
              <Layers className="h-5 w-5" />
              Generate Flashcards
            </GlintButton>
            <GlintButton
              variant="secondary"
              size="lg"
              onClick={() => {
                setCurrentConcept(null);
                navigate("/");
              }}
            >
              <Plus className="h-5 w-5" />
              New Topic
            </GlintButton>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;

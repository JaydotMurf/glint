import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { GlintButton } from "@/components/ui/glint-button";
import { GlintCard } from "@/components/ui/glint-card";
import { GlintTabs } from "@/components/ui/glint-tabs";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useAppStore } from "@/store/appStore";
import { useSavedConcepts } from "@/hooks/useSavedConcepts";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Bookmark, Plus, Check, Layers, Loader2, Download, Lock } from "lucide-react";
import { toast } from "sonner";

type ExplanationLevel = "simplest" | "standard" | "deepDive";

const levelTabs = [
  { id: "simplest", label: "Simple", icon: "🧩" },
  { id: "standard", label: "Standard", icon: "📚" },
  { id: "deepDive", label: "Deep Dive", icon: "🔬" },
];

const ResultsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentConcept, setCurrentConcept, savedConceptId, setSavedConceptId } = useAppStore();
  const { concepts, saveConcept } = useSavedConcepts();
  const { isPremium } = useUsageLimit();
  const [activeLevel, setActiveLevel] = useState<ExplanationLevel>("standard");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (!currentConcept) {
    navigate("/");
    return null;
  }

  // Check if this concept is already saved (by matching topic and explanations)
  const isSaved = savedConceptId !== null || concepts.some(
    (c) => 
      c.topic === currentConcept.topic && 
      c.explanation_standard === currentConcept.explanations.standard
  );

  const handleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    saveConcept.mutate({
      topic: currentConcept.topic,
      input_text: currentConcept.topic,
      explanation_simplest: currentConcept.explanations.simplest,
      explanation_standard: currentConcept.explanations.standard,
      explanation_deep: currentConcept.explanations.deepDive,
    }, {
      onSuccess: (data) => {
        setSavedConceptId(data.id);
      }
    });
  };

  const handleGenerateFlashcards = () => {
    navigate("/flashcards");
  };

  const handleExportPDF = () => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    // TODO: Implement actual PDF export when premium is live
    toast.info("PDF Export", {
      description: "PDF export will be available soon!",
    });
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
          disabled={isSaved || saveConcept.isPending}
        >
          {saveConcept.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isSaved ? (
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
              className="flex-1"
              onClick={handleExportPDF}
            >
              {isPremium ? (
                <Download className="h-5 w-5" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
              Export PDF
            </GlintButton>
          </div>

          {/* New Topic Button */}
          <div className="mt-4">
            <GlintButton
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => {
                setCurrentConcept(null);
                setSavedConceptId(null);
                navigate("/");
              }}
            >
              <Plus className="h-5 w-5" />
              New Topic
            </GlintButton>
          </div>
        </div>
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal}
        title="Export to PDF is Premium"
        description="Upgrade to download your explanations and flashcards as PDFs for offline study."
      />
    </div>
  );
};

export default ResultsPage;

import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { GlintButton } from "@/components/ui/glint-button";
import { GlintTabs } from "@/components/ui/glint-tabs";
import { EnhancedExplanation } from "@/components/EnhancedExplanation";
import { UpgradeModal } from "@/components/UpgradeModal";
import Footer from "@/components/Footer";
import { useAppStore } from "@/store/appStore";
import { useSavedConcepts } from "@/hooks/useSavedConcepts";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Library, Sparkles, Bookmark, Plus, Check, Layers, Loader2, Download, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
      {/* Header - matches HomeHeader pattern */}
      <header className="w-full px-4 sm:px-6 py-4 flex items-center justify-between border-b border-border relative z-20">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="transition-transform hover:scale-105">
            <Logo size="md" />
          </Link>
          
          {/* Desktop Navigation - same pattern as HomeHeader */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            {user && (
              <Link
                to="/library"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Library className="h-4 w-4" />
                Library
              </Link>
            )}
            <Link
              to="/upgrade"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <Sparkles className="h-4 w-4" />
              Upgrade
            </Link>
          </nav>
        </div>
        
        {/* Save Button */}
        <div className="flex items-center gap-2">
          <GlintButton
            variant={isSaved ? "ghost" : "secondary"}
            size="sm"
            onClick={handleSave}
            disabled={isSaved || saveConcept.isPending}
          >
            {saveConcept.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline ml-1">Saving...</span>
              </>
            ) : isSaved ? (
              <>
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Save</span>
              </>
            )}
          </GlintButton>
        </div>
      </header>

      {/* Main Content - extra bottom padding for mobile nav */}
      <main className="flex-1 px-4 sm:px-6 py-8 pb-24 md:pb-8 overflow-auto">
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

          {/* Enhanced Explanation Display */}
          <EnhancedExplanation
            level={activeLevel}
            content={currentConcept.explanations[activeLevel]}
            className="mb-8 animate-fade-in"
          />

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

      <Footer />
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

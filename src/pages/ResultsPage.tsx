import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { UpgradeModal } from "@/components/UpgradeModal";
import Footer from "@/components/Footer";
import { useAppStore } from "@/store/appStore";
import { useSavedConcepts } from "@/hooks/useSavedConcepts";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useAuth } from "@/contexts/AuthContext";
import { useMotion } from "@/contexts/MotionContext";
import { 
  Home, 
  Library, 
  Sparkles, 
  Bookmark, 
  Plus, 
  Check, 
  Layers, 
  Loader2, 
  Download, 
  Lock,
  Zap,
  BookOpen,
  Microscope,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ExplanationLevel = "simplest" | "standard" | "deepDive";

const levelTabs = [
  { id: "simplest", label: "Simple", icon: Zap },
  { id: "standard", label: "Standard", icon: BookOpen },
  { id: "deepDive", label: "Deep Dive", icon: Microscope },
];

const levelLabels: Record<ExplanationLevel, string> = {
  simplest: "Simplest Explanation",
  standard: "Standard Explanation",
  deepDive: "Deep Dive",
};

const ResultsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { prefersReducedMotion } = useMotion();
  const { currentConcept, setCurrentConcept, savedConceptId, setSavedConceptId } = useAppStore();
  const { concepts, saveConcept } = useSavedConcepts();
  const { isPremium } = useUsageLimit();
  const [activeLevel, setActiveLevel] = useState<ExplanationLevel>("standard");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (!currentConcept) {
    navigate("/");
    return null;
  }

  // Check if this concept is already saved
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
    toast.info("PDF Export", {
      description: "PDF export will be available soon!",
    });
  };

  const motionProps = prefersReducedMotion 
    ? {} 
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.36, delay: 0.04, ease: [0.4, 0, 0.2, 1] as const }
      };

  return (
    <div className="min-h-screen bg-[hsl(210_40%_98%)] flex flex-col">
      {/* Sticky Navigation Bar */}
      <header className="sticky-nav-premium">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--violet-300)/0.5)] focus-visible:ring-offset-2 rounded">
            <Logo size="md" />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[hsl(var(--gray-500))] hover:text-[hsl(var(--gray-600))] hover:bg-[hsl(var(--gray-100))]"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            {user && (
              <Link
                to="/library"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[hsl(var(--gray-500))] hover:text-[hsl(var(--gray-600))] hover:bg-[hsl(var(--gray-100))]"
              >
                <Library className="h-4 w-4" />
                Library
              </Link>
            )}
            <Link
              to="/upgrade"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[hsl(var(--gray-500))] hover:text-[hsl(var(--gray-600))] hover:bg-[hsl(var(--gray-100))]"
            >
              <Sparkles className="h-4 w-4" />
              Upgrade
            </Link>
          </nav>
        </div>
        
        {/* Save Button */}
        <button
          className={cn(
            "nav-btn",
            isSaved && "bg-[hsl(var(--gray-50))]"
          )}
          onClick={handleSave}
          disabled={isSaved || saveConcept.isPending}
          aria-label={isSaved ? "Concept saved" : "Save concept"}
        >
          {saveConcept.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Saving...</span>
            </>
          ) : isSaved ? (
            <>
              <Check className="h-4 w-4 text-[hsl(var(--green-600))]" />
              <span className="hidden sm:inline">Saved</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 sm:py-12 pb-24 md:pb-12 overflow-auto">
        <motion.div 
          className="results-container"
          {...motionProps}
        >
          {/* Section Kicker + Title */}
          <div className="mb-8">
            <p className="results-kicker mb-3">EXPLAINING</p>
            <h1 className="results-title">{currentConcept.topic}</h1>
          </div>

          {/* Segmented Control */}
          <div className="mb-8" role="tablist" aria-label="Explanation depth">
            <div className="segment-rail overflow-x-auto">
              {levelTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeLevel === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    className={cn(
                      "segment-tab whitespace-nowrap",
                      isActive && "segment-tab-active"
                    )}
                    onClick={() => setActiveLevel(tab.id as ExplanationLevel)}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Card with Glow */}
          <div className="group relative mb-8">
            {/* Decorative Glow */}
            <div className="card-glow" aria-hidden="true" />
            
            {/* Card */}
            <div className="premium-card relative">
              {/* Card Header */}
              <div className="premium-card-header">
                <div className="flex items-center gap-3">
                  <div className="level-badge">
                    <Lightbulb aria-hidden="true" />
                  </div>
                  <span className="uppercase text-xs font-semibold tracking-wider text-[hsl(var(--gray-400))]">
                    {levelLabels[activeLevel]}
                  </span>
                </div>
                {/* Traffic Light Decoration */}
                <div className="traffic-dots" aria-hidden="true">
                  <div className="traffic-dot" />
                  <div className="traffic-dot" />
                  <div className="traffic-dot" />
                </div>
              </div>

              {/* Card Body */}
              <div 
                className="premium-card-body"
                role="tabpanel"
                id={`panel-${activeLevel}`}
                aria-labelledby={`tab-${activeLevel}`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeLevel}
                    initial={prefersReducedMotion ? {} : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={prefersReducedMotion ? {} : { opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="results-body prose prose-gray max-w-none prose-p:my-0 prose-p:mb-6 last:prose-p:mb-0 prose-strong:font-semibold prose-strong:text-[hsl(var(--slate-900))]"
                  >
                    <ReactMarkdown>
                      {currentConcept.explanations[activeLevel]}
                    </ReactMarkdown>
                  </motion.div>
                </AnimatePresence>

                {/* Key Takeaway Box (optional enhancement) */}
                {activeLevel === "simplest" && (
                  <div className="takeaway-box">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-[hsl(var(--violet-600))] mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="takeaway-tag mb-2 inline-block">Key Insight</span>
                        <p className="text-sm text-[hsl(var(--gray-600))] leading-relaxed mt-2">
                          This is the core concept distilled to its simplest form.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Helper Text */}
          <p className="text-center text-sm text-[hsl(var(--gray-400))] mb-8">
            Still fuzzy?{" "}
            <button
              onClick={() => setActiveLevel("simplest")}
              className="text-[hsl(var(--violet-600))] hover:text-[hsl(var(--violet-700))] font-medium underline-offset-2 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--violet-300)/0.5)] focus-visible:ring-offset-2 rounded"
            >
              Try the simpler version
            </button>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="btn-primary-premium flex-1"
              onClick={handleGenerateFlashcards}
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              Generate Flashcards
            </button>
            <button
              className="btn-secondary-premium flex-1"
              onClick={handleExportPDF}
            >
              {isPremium ? (
                <Download className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Lock className="h-4 w-4" aria-hidden="true" />
              )}
              Export PDF
            </button>
          </div>

          {/* New Topic Button */}
          <div className="mt-6 flex justify-center">
            <button
              className="btn-tertiary"
              onClick={() => {
                setCurrentConcept(null);
                setSavedConceptId(null);
                navigate("/");
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Topic
            </button>
          </div>
        </motion.div>
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

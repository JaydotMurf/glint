import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { GlintButton } from "@/components/ui/glint-button";
import { GlintProgress } from "@/components/ui/glint-progress";
import { Flashcard } from "@/components/Flashcard";
import { GenerationProgress } from "@/components/GenerationProgress";
import { FlashcardSkeleton } from "@/components/FlashcardSkeleton";
import { Confetti } from "@/components/Confetti";
import { useAppStore } from "@/store/appStore";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useSavedConcepts } from "@/hooks/useSavedConcepts";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Library, Sparkles, Check, RotateCcw, PartyPopper, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { generateFlashcards as generateFlashcardsAI } from "@/lib/ai";
import { toast } from "sonner";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface FlashcardItem {
  id: string;
  front: string;
  back: string;
}

const FlashcardsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentConcept, savedConceptId, setSavedConceptId } = useAppStore();
  const { saveConcept } = useSavedConcepts();
  const { flashcards: dbFlashcards, saveFlashcards, updateFlashcardStatus, isLoading: loadingDbFlashcards } = useFlashcards(savedConceptId || undefined);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    const loadOrGenerateFlashcards = async () => {
      if (!currentConcept) return;
      if (hasGenerated || isGenerating) return;

      if (savedConceptId && dbFlashcards.length > 0) {
        setFlashcards(dbFlashcards.map((f) => ({
          id: f.id,
          front: f.front_text,
          back: f.back_text,
        })));
        const mastered = new Set<string>();
        dbFlashcards.forEach((f) => {
          if (f.review_status === 'mastered') {
            mastered.add(f.id);
          }
        });
        setMasteredCards(mastered);
        setHasGenerated(true);
        return;
      }

      if (currentConcept.flashcards && currentConcept.flashcards.length > 0 && !savedConceptId) {
        const cards = currentConcept.flashcards.map((card, index) => ({
          id: `temp-${index}`,
          front: card.front,
          back: card.back,
        }));
        setFlashcards(cards);
        setHasGenerated(true);
        return;
      }

      setIsGenerating(true);
      setHasGenerated(true);
      try {
        const generated = await generateFlashcardsAI(
          currentConcept.topic,
          currentConcept.explanations.standard
        );
        
        const cards = generated.map((card, index) => ({
          id: `temp-${index}`,
          front: card.front,
          back: card.back,
        }));
        
        setFlashcards(cards);
      } catch (error) {
        console.error('Failed to generate flashcards:', error);
        toast.error('Failed to generate flashcards. Please try again in a moment.');
        navigate('/results');
      } finally {
        setIsGenerating(false);
      }
    };

    if (!loadingDbFlashcards) {
      loadOrGenerateFlashcards();
    }
  }, [currentConcept, savedConceptId, dbFlashcards, loadingDbFlashcards, navigate, hasGenerated, isGenerating]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete || isGenerating) return;
      
      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          handleFlip();
          break;
        case "ArrowLeft":
          if (isFlipped) handleReviewAgain();
          break;
        case "ArrowRight":
          if (isFlipped) handleGotIt();
          break;
        case "Escape":
          navigate("/results");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, isComplete, isGenerating, currentIndex]);

  if (!currentConcept) {
    navigate("/");
    return null;
  }

  const currentCard = flashcards[currentIndex];
  const progress = currentIndex + 1;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleGotIt = async () => {
    if (!currentCard) return;
    
    const newMastered = new Set(masteredCards);
    newMastered.add(currentCard.id);
    setMasteredCards(newMastered);
    setSwipeDirection("right");
    
    if (!currentCard.id.startsWith('temp-') && user) {
      updateFlashcardStatus.mutate({ id: currentCard.id, status: 'mastered' });
    }
    
    moveToNext();
  };

  const handleReviewAgain = async () => {
    if (!currentCard) return;
    setSwipeDirection("left");
    
    if (!currentCard.id.startsWith('temp-') && user) {
      updateFlashcardStatus.mutate({ id: currentCard.id, status: 'learning' });
    }
    
    moveToNext();
  };

  const moveToNext = () => {
    setIsFlipped(false);
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setSwipeDirection(null);
      }, 200);
    } else {
      setIsComplete(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  // Swipe gesture handler
  const handleSwipe = useCallback((info: PanInfo) => {
    if (!isFlipped) return;
    
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleGotIt();
    } else if (info.offset.x < -threshold) {
      handleReviewAgain();
    }
  }, [isFlipped]);

  const handleSaveAndExit = async () => {
    if (!user) {
      navigate("/");
      return;
    }

    setIsSaving(true);
    try {
      let conceptId = savedConceptId;

      if (!conceptId) {
        const result = await new Promise<{ id: string }>((resolve, reject) => {
          saveConcept.mutate({
            topic: currentConcept.topic,
            input_text: currentConcept.topic,
            explanation_simplest: currentConcept.explanations.simplest,
            explanation_standard: currentConcept.explanations.standard,
            explanation_deep: currentConcept.explanations.deepDive,
          }, {
            onSuccess: (data) => resolve(data),
            onError: reject,
          });
        });
        conceptId = result.id;
        setSavedConceptId(conceptId);
      }

      const newFlashcards = flashcards.filter((f) => f.id.startsWith('temp-'));
      if (newFlashcards.length > 0 && conceptId) {
        await saveFlashcards.mutateAsync({
          conceptId,
          flashcards: newFlashcards.map((f) => ({
            front: f.front,
            back: f.back,
          })),
        });
      }

      toast.success('Progress saved!');
      navigate("/");
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save progress');
    } finally {
      setIsSaving(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="main">
        <GenerationProgress type="flashcards" />
      </div>
    );
  }

  if (loadingDbFlashcards) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
        <header className="w-full px-4 sm:px-6 py-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="transition-transform hover:scale-105">
              <Logo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50">
                <Home className="h-4 w-4" />
                Home
              </Link>
              {user && (
                <Link to="/library" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50">
                  <Library className="h-4 w-4" />
                  Library
                </Link>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-8" role="main">
          <div className="w-full max-w-lg">
            <FlashcardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="main">
        <div className="text-center animate-fade-in">
          <p className="text-muted-foreground">No flashcards available</p>
          <GlintButton variant="primary" size="lg" onClick={() => navigate("/results")} className="mt-4">
            Go Back
          </GlintButton>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const masteredCount = masteredCards.size;
    const percentage = Math.round((masteredCount / flashcards.length) * 100);

    return (
      <>
        <Confetti isActive={showConfetti} />
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6" role="main">
          <motion.div 
            className="max-w-md mx-auto text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="mb-8">
              <motion.div 
                className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <PartyPopper className="h-10 w-10 text-success" aria-hidden="true" />
              </motion.div>
              <h1 className="text-display text-foreground mb-4">
                Nice work! 🎉
              </h1>
              <p className="text-body-lg text-muted-foreground mb-2">
                You've completed this set!
              </p>
              <p className="text-heading text-foreground">
                <span className="text-success">{masteredCount}</span> of {flashcards.length} cards mastered
              </p>
            </div>

            <div className="mb-8" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-success rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="text-caption text-muted-foreground mt-2">
                {percentage}% mastery
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <GlintButton
                variant="primary"
                size="lg"
                onClick={handleSaveAndExit}
                disabled={isSaving}
                className="min-h-[56px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" aria-hidden="true" />
                    Save & Continue
                  </>
                )}
              </GlintButton>
              <GlintButton
                variant="secondary"
                size="lg"
                className="min-h-[56px]"
                onClick={() => {
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setMasteredCards(new Set());
                  setIsComplete(false);
                }}
              >
                <RotateCcw className="h-5 w-5" aria-hidden="true" />
                Review Again
              </GlintButton>
              <GlintButton
                variant="ghost"
                size="lg"
                className="min-h-[56px]"
                onClick={() => navigate("/")}
              >
                <Home className="h-5 w-5" aria-hidden="true" />
                New Topic
              </GlintButton>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      {/* Header - matches HomeHeader pattern */}
      <header className="w-full px-4 sm:px-6 py-4 flex items-center justify-between border-b border-border relative z-20">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="transition-transform hover:scale-105">
            <Logo size="md" />
          </Link>
          
          {/* Desktop Navigation */}
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
        <span className="text-caption font-medium text-muted-foreground" aria-live="polite">
          {progress} of {flashcards.length}
        </span>
      </header>

      {/* Progress Bar */}
      <div className="px-6 py-3" role="progressbar" aria-valuenow={progress} aria-valuemin={1} aria-valuemax={flashcards.length}>
        <GlintProgress value={progress} max={flashcards.length} />
      </div>

      {/* Main Content */}
      <main 
        id="main-content" 
        className="flex-1 flex flex-col items-center justify-center px-6 py-8"
        role="main"
        tabIndex={-1}
      >
        <div className="w-full max-w-lg mx-auto">
          {/* Topic */}
          <p className="text-center text-caption text-muted-foreground mb-6">
            {currentConcept.topic}
          </p>

          {/* Flashcard with swipe gestures */}
          <motion.div 
            className="mb-8 touch-pan-y"
            drag={isFlipped ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => handleSwipe(info)}
          >
            <AnimatePresence mode="wait">
              {currentCard && (
                <motion.div
                  key={currentCard.id}
                  initial={{ opacity: 0, x: swipeDirection === "left" ? 100 : swipeDirection === "right" ? -100 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: swipeDirection === "left" ? -100 : 100 }}
                  transition={{ duration: 0.2 }}
                >
                  <Flashcard
                    front={currentCard.front}
                    back={currentCard.back}
                    isFlipped={isFlipped}
                    onFlip={handleFlip}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Action Buttons */}
          <AnimatePresence>
            {isFlipped && (
              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <GlintButton
                  variant="secondary"
                  size="lg"
                  className="flex-1 min-h-[56px]"
                  onClick={handleReviewAgain}
                  aria-label="Review this card again"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  Review again
                </GlintButton>
                <GlintButton
                  variant="success"
                  size="lg"
                  className="flex-1 min-h-[56px]"
                  onClick={handleGotIt}
                  aria-label="Mark as mastered"
                >
                  Got it!
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </GlintButton>
              </motion.div>
            )}
          </AnimatePresence>

          {!isFlipped && (
            <p className="text-center text-caption text-muted-foreground" aria-live="polite">
              Tap the card or press Space to reveal the answer
            </p>
          )}

          {/* Keyboard hints */}
          <p className="text-center text-small text-muted-foreground/50 mt-4 hidden md:block">
            Space to flip • ←/→ to answer • Esc to exit
          </p>
        </div>
      </main>
    </div>
  );
};

export default FlashcardsPage;

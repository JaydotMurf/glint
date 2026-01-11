import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { GlintButton } from "@/components/ui/glint-button";
import { GlintProgress } from "@/components/ui/glint-progress";
import { Flashcard } from "@/components/Flashcard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAppStore } from "@/store/appStore";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useSavedConcepts } from "@/hooks/useSavedConcepts";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Check, RotateCcw, PartyPopper, Home, Loader2 } from "lucide-react";
import { generateFlashcards as generateFlashcardsAI } from "@/lib/ai";
import { toast } from "sonner";

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

  useEffect(() => {
    const loadOrGenerateFlashcards = async () => {
      if (!currentConcept) return;

      // If we have a saved concept with flashcards in DB, use those
      if (savedConceptId && dbFlashcards.length > 0) {
        setFlashcards(dbFlashcards.map((f) => ({
          id: f.id,
          front: f.front_text,
          back: f.back_text,
        })));
        // Set mastered cards based on review status
        const mastered = new Set<string>();
        dbFlashcards.forEach((f) => {
          if (f.review_status === 'mastered') {
            mastered.add(f.id);
          }
        });
        setMasteredCards(mastered);
        return;
      }

      // Otherwise, generate new flashcards
      setIsGenerating(true);
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
        toast.error('Failed to generate flashcards');
        navigate('/results');
      } finally {
        setIsGenerating(false);
      }
    };

    if (!loadingDbFlashcards) {
      loadOrGenerateFlashcards();
    }
  }, [currentConcept, savedConceptId, dbFlashcards, loadingDbFlashcards, navigate]);

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
    
    // Update status in DB if it's a saved flashcard
    if (!currentCard.id.startsWith('temp-') && user) {
      updateFlashcardStatus.mutate({ id: currentCard.id, status: 'mastered' });
    }
    
    moveToNext();
  };

  const handleReviewAgain = async () => {
    if (!currentCard) return;
    
    // Update status in DB if it's a saved flashcard
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
      }, 200);
    } else {
      setIsComplete(true);
    }
  };

  const handleSaveAndExit = async () => {
    if (!user) {
      navigate("/");
      return;
    }

    setIsSaving(true);
    try {
      let conceptId = savedConceptId;

      // If concept isn't saved yet, save it first
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

      // Save flashcards if they're new (temp IDs)
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

  if (isGenerating || loadingDbFlashcards) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <LoadingSpinner size="lg" message="Generating your flashcards..." />
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="max-w-md mx-auto text-center animate-fade-in">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-6">
              <PartyPopper className="h-10 w-10 text-success" />
            </div>
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

          <div className="mb-8">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
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
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Save & Continue
                </>
              )}
            </GlintButton>
            <GlintButton
              variant="secondary"
              size="lg"
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setMasteredCards(new Set());
                setIsComplete(false);
              }}
            >
              <RotateCcw className="h-5 w-5" />
              Review Again
            </GlintButton>
            <GlintButton
              variant="ghost"
              size="lg"
              onClick={() => navigate("/")}
            >
              <Home className="h-5 w-5" />
              New Topic
            </GlintButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-4">
          <GlintButton
            variant="ghost"
            size="icon"
            onClick={() => navigate("/results")}
          >
            <ArrowLeft className="h-5 w-5" />
          </GlintButton>
          <Logo size="sm" />
        </div>
        <span className="text-caption font-medium text-muted-foreground">
          {progress} of {flashcards.length}
        </span>
      </header>

      {/* Progress Bar */}
      <div className="px-6 py-3">
        <GlintProgress value={progress} max={flashcards.length} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg mx-auto animate-fade-in">
          {/* Topic */}
          <p className="text-center text-caption text-muted-foreground mb-6">
            {currentConcept.topic}
          </p>

          {/* Flashcard */}
          <div className="mb-8">
            {currentCard && (
              <Flashcard
                front={currentCard.front}
                back={currentCard.back}
                isFlipped={isFlipped}
                onFlip={handleFlip}
              />
            )}
          </div>

          {/* Action Buttons */}
          {isFlipped && (
            <div className="flex gap-3 animate-fade-in">
              <GlintButton
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={handleReviewAgain}
              >
                <RotateCcw className="h-5 w-5" />
                Review again
              </GlintButton>
              <GlintButton
                variant="success"
                size="lg"
                className="flex-1"
                onClick={handleGotIt}
              >
                <Check className="h-5 w-5" />
                Got it!
              </GlintButton>
            </div>
          )}

          {!isFlipped && (
            <p className="text-center text-caption text-muted-foreground">
              Tap the card to reveal the answer
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default FlashcardsPage;

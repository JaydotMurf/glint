import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { GlintButton } from "@/components/ui/glint-button";
import { GlintProgress } from "@/components/ui/glint-progress";
import { Flashcard } from "@/components/Flashcard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAppStore } from "@/store/appStore";
import { ArrowLeft, Check, RotateCcw, PartyPopper, Home } from "lucide-react";

const FlashcardsPage = () => {
  const navigate = useNavigate();
  const { currentConcept, saveConcept } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate loading animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!currentConcept) {
    navigate("/");
    return null;
  }

  const flashcards = currentConcept.flashcards;
  const currentCard = flashcards[currentIndex];
  const progress = currentIndex + 1;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleGotIt = () => {
    const newMastered = new Set(masteredCards);
    newMastered.add(currentCard.id);
    setMasteredCards(newMastered);
    moveToNext();
  };

  const handleReviewAgain = () => {
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

  const handleSaveAndExit = () => {
    saveConcept(currentConcept);
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <LoadingSpinner size="lg" message="Generating your flashcards..." />
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
            >
              <Check className="h-5 w-5" />
              Save & Continue
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
            <Flashcard
              front={currentCard.front}
              back={currentCard.back}
              isFlipped={isFlipped}
              onFlip={handleFlip}
            />
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

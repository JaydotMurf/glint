import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { GlintButton } from "@/components/ui/glint-button";
import { GlintCard } from "@/components/ui/glint-card";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { useSavedConcepts } from "@/hooks/useSavedConcepts";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useAppStore } from "@/store/appStore";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Trash2, BookOpen, Search, Loader2 } from "lucide-react";
import { useState } from "react";

const LibraryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { concepts, isLoading, deleteConcept } = useSavedConcepts();
  const { isPremium } = useUsageLimit();
  const { setCurrentConcept, setSavedConceptId } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  const showUpgradeBanner = !isPremium && concepts.length >= 5;

  const filteredConcepts = concepts.filter((concept) =>
    concept.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenConcept = (conceptId: string) => {
    const concept = concepts.find((c) => c.id === conceptId);
    if (concept) {
      // Convert database concept to app store format
      setCurrentConcept({
        id: concept.id,
        topic: concept.topic,
        explanations: {
          simplest: concept.explanation_simplest || "",
          standard: concept.explanation_standard || "",
          deepDive: concept.explanation_deep || "",
        },
        flashcards: [],
        savedAt: new Date(concept.created_at),
      });
      setSavedConceptId(concept.id);
      navigate("/results");
    }
  };

  const handleDelete = async (e: React.MouseEvent, conceptId: string) => {
    e.stopPropagation();
    setDeletingId(conceptId);
    deleteConcept.mutate(conceptId, {
      onSettled: () => setDeletingId(null),
    });
  };

  const handleReview = (e: React.MouseEvent, conceptId: string) => {
    e.stopPropagation();
    const concept = concepts.find((c) => c.id === conceptId);
    if (concept) {
      setCurrentConcept({
        id: concept.id,
        topic: concept.topic,
        explanations: {
          simplest: concept.explanation_simplest || "",
          standard: concept.explanation_standard || "",
          deepDive: concept.explanation_deep || "",
        },
        flashcards: [],
        savedAt: new Date(concept.created_at),
      });
      setSavedConceptId(concept.id);
      navigate("/flashcards");
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center gap-4 border-b border-border">
        <GlintButton
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-5 w-5" />
        </GlintButton>
        <Logo size="sm" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-display text-foreground mb-2">
              Saved Concepts
            </h1>
            <p className="text-body text-muted-foreground">
              {isLoading ? "Loading..." : `${concepts.length} concept${concepts.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>

          {/* Upgrade Banner for users with 5+ saved concepts */}
          {showUpgradeBanner && (
            <UpgradeBanner 
              message="You're building a great study library! Upgrade to Premium for PDF exports and spaced repetition reminders."
              className="mb-6 animate-fade-in"
            />
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Search */}
          {!isLoading && concepts.length > 0 && (
            <div className="relative mb-6 animate-fade-in animation-delay-100">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-body
                         placeholder:text-muted-foreground focus:outline-none focus:border-primary
                         focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>
          )}

          {/* Concepts List */}
          {!isLoading && filteredConcepts.length > 0 ? (
            <div className="grid gap-3 animate-fade-in animation-delay-200">
              {filteredConcepts.map((concept) => (
                <GlintCard
                  key={concept.id}
                  variant="concept"
                  className="group"
                  onClick={() => handleOpenConcept(concept.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {concept.topic}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-caption text-muted-foreground">
                          {formatDate(concept.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GlintButton
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleReview(e, concept.id)}
                      >
                        <BookOpen className="h-4 w-4" />
                        Review
                      </GlintButton>
                      <GlintButton
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDelete(e, concept.id)}
                        disabled={deletingId === concept.id}
                      >
                        {deletingId === concept.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </GlintButton>
                    </div>
                  </div>
                </GlintCard>
              ))}
            </div>
          ) : !isLoading && concepts.length > 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <p className="text-body text-muted-foreground">
                No concepts match "{searchQuery}"
              </p>
            </div>
          ) : !isLoading ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-heading text-foreground mb-2">
                No saved concepts yet
              </h3>
              <p className="text-body text-muted-foreground mb-6">
                Start exploring topics to build your library
              </p>
              <GlintButton
                variant="primary"
                size="lg"
                onClick={() => navigate("/")}
              >
                Explore Topics
              </GlintButton>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default LibraryPage;

import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { GlintButton } from "@/components/ui/glint-button";
import { GlintCard } from "@/components/ui/glint-card";
import { useAppStore } from "@/store/appStore";
import { ArrowLeft, Trash2, Layers, BookOpen, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LibraryPage = () => {
  const navigate = useNavigate();
  const { savedConcepts, removeConcept, setCurrentConcept } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConcepts = savedConcepts.filter((concept) =>
    concept.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenConcept = (conceptId: string) => {
    const concept = savedConcepts.find((c) => c.id === conceptId);
    if (concept) {
      setCurrentConcept(concept);
      navigate("/results");
    }
  };

  const handleDelete = (e: React.MouseEvent, conceptId: string) => {
    e.stopPropagation();
    removeConcept(conceptId);
    toast.success("Removed from library");
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
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
              {savedConcepts.length} concept{savedConcepts.length !== 1 ? "s" : ""} saved
            </p>
          </div>

          {/* Search */}
          {savedConcepts.length > 0 && (
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
          {filteredConcepts.length > 0 ? (
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
                        <span className="text-caption text-muted-foreground flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {concept.flashcards.length} cards
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {formatDate(concept.savedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GlintButton
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentConcept(concept);
                          navigate("/flashcards");
                        }}
                      >
                        <BookOpen className="h-4 w-4" />
                        Review
                      </GlintButton>
                      <GlintButton
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDelete(e, concept.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </GlintButton>
                    </div>
                  </div>
                </GlintCard>
              ))}
            </div>
          ) : savedConcepts.length > 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <p className="text-body text-muted-foreground">
                No concepts match "{searchQuery}"
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </main>
    </div>
  );
};

export default LibraryPage;

import { useNavigate } from "react-router-dom";
import { GlintButton } from "@/components/ui/glint-button";
import { useAppStore, Concept } from "@/store/appStore";
import { ArrowRight } from "lucide-react";

export function RecentConcepts() {
  const navigate = useNavigate();
  const { savedConcepts, setCurrentConcept } = useAppStore();

  if (savedConcepts.length === 0) return null;

  const handleConceptClick = (concept: Concept) => {
    setCurrentConcept(concept);
    navigate("/results");
  };

  return (
    <div className="px-6 pb-8 animate-fade-in animation-delay-200">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-subheading text-foreground">Recent</h2>
          <GlintButton
            variant="ghost"
            size="sm"
            onClick={() => navigate("/library")}
          >
            See all
            <ArrowRight className="h-4 w-4" />
          </GlintButton>
        </div>
        <div className="grid gap-3">
          {savedConcepts.slice(0, 3).map((concept) => (
            <button
              key={concept.id}
              onClick={() => handleConceptClick(concept)}
              className="glint-card text-left flex items-center justify-between group"
            >
              <div>
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {concept.topic}
                </p>
                <p className="text-caption text-muted-foreground">
                  {concept.flashcards.length} flashcards
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

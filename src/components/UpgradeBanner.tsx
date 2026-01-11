import { useNavigate } from "react-router-dom";
import { GlintButton } from "@/components/ui/glint-button";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

interface UpgradeBannerProps {
  message?: string;
  className?: string;
}

export function UpgradeBanner({ 
  message = "Upgrade to Premium for unlimited explanations and PDF exports.",
  className = ""
}: UpgradeBannerProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={`bg-primary/10 border border-primary/20 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-foreground">{message}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <GlintButton
            variant="primary"
            size="sm"
            onClick={() => navigate("/upgrade")}
          >
            Upgrade
          </GlintButton>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

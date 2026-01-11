import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlintButton } from "@/components/ui/glint-button";
import { Sparkles, Zap, Download, Bell } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

const features = [
  { icon: Zap, text: "Unlimited explanations" },
  { icon: Download, text: "Export flashcards to PDF" },
  { icon: Bell, text: "Spaced repetition reminders" },
];

export function UpgradeModal({ 
  open, 
  onOpenChange, 
  title = "You've hit today's limit",
  description = "Upgrade to Premium for unlimited explanations and more."
}: UpgradeModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/upgrade");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {features.map((feature) => (
            <div key={feature.text} className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <GlintButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleUpgrade}
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to Premium — $14.99/mo
          </GlintButton>
          <GlintButton
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </GlintButton>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-2">
          Your free uses reset tomorrow
        </p>
      </DialogContent>
    </Dialog>
  );
}

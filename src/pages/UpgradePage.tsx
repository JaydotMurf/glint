import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { GlintButton } from "@/components/ui/glint-button";
import { GlintCard } from "@/components/ui/glint-card";
import { ArrowLeft, Check, Sparkles, Zap, Download, Bell } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Unlimited explanations",
    description: "No daily limits. Learn as much as you want.",
  },
  {
    icon: Download,
    title: "Export flashcards",
    description: "Download your cards as PDF for offline study.",
  },
  {
    icon: Bell,
    title: "Spaced repetition",
    description: "Smart reminders to review at optimal times.",
  },
  {
    icon: Sparkles,
    title: "Priority speed",
    description: "Faster generation times, even during peak hours.",
  },
];

const UpgradePage = () => {
  const navigate = useNavigate();

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
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-md mx-auto text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Glint Premium
          </div>

          {/* Headline */}
          <h1 className="text-display text-foreground mb-4">
            Unlock unlimited learning
          </h1>
          <p className="text-body-lg text-muted-foreground mb-8">
            You've hit today's free limit. Upgrade for unlimited explanations and premium features.
          </p>

          {/* Pricing Card */}
          <GlintCard variant="elevated" className="mb-8 text-left">
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-foreground">$14.99</span>
              <span className="text-body text-muted-foreground">/month</span>
            </div>

            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{feature.title}</p>
                    <p className="text-caption text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlintCard>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <GlintButton
              variant="primary"
              size="xl"
              className="w-full"
              onClick={() => {
                // TODO: Integrate with payment provider
                alert("Payment integration coming soon!");
              }}
            >
              <Check className="h-5 w-5" />
              Upgrade to Premium
            </GlintButton>
            <GlintButton
              variant="ghost"
              size="lg"
              onClick={() => navigate("/")}
            >
              Maybe later
            </GlintButton>
          </div>

          <p className="text-caption text-muted-foreground mt-6">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </main>
    </div>
  );
};

export default UpgradePage;

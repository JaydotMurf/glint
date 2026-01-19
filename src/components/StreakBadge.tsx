import { Flame } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function StreakBadge() {
  const { user } = useAuth();
  const { currentStreak, longestStreak, isLoading } = useStreak();

  // Don't show anything if not logged in
  if (!user) return null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-8 w-12 bg-muted/50 animate-pulse rounded-full" />
    );
  }

  // Don't show badge if no streak
  if (!currentStreak || currentStreak === 0) return null;

  // Determine flame intensity based on streak length
  const getFlameVariant = () => {
    if (currentStreak >= 100) return "legendary";
    if (currentStreak >= 30) return "hot";
    if (currentStreak >= 7) return "warm";
    return "default";
  };

  const flameVariant = getFlameVariant();

  const flameStyles = {
    default: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    warm: "bg-orange-500/25 text-orange-400 border-orange-400/40",
    hot: "bg-red-500/25 text-red-400 border-red-400/40",
    legendary: "bg-gradient-to-r from-orange-500/30 to-red-500/30 text-red-300 border-red-300/50",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${flameStyles[flameVariant]} cursor-default`}
          >
            <motion.div
              animate={
                flameVariant === "legendary"
                  ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }
                  : flameVariant === "hot"
                  ? { scale: [1, 1.1, 1] }
                  : {}
              }
              transition={{
                repeat: Infinity,
                duration: flameVariant === "legendary" ? 1.5 : 2,
                ease: "easeInOut",
              }}
            >
              <Flame className="h-4 w-4" />
            </motion.div>
            <span className="text-sm font-semibold tabular-nums">
              {currentStreak}
            </span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-center">
          <p className="font-medium">🔥 {currentStreak} day streak!</p>
          {longestStreak > currentStreak && (
            <p className="text-xs text-muted-foreground">
              Best: {longestStreak} days
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Keep learning daily!
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { useStreak } from "@/hooks/useStreak";
import { GlintButton } from "@/components/ui/glint-button";
import { Flame, Trophy, Star, Zap, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { Confetti } from "@/components/Confetti";

const milestoneConfig: Record<number, { 
  icon: typeof Flame; 
  title: string; 
  message: string;
  color: string;
}> = {
  7: {
    icon: Zap,
    title: "Week Warrior!",
    message: "7 days of consistent learning. You're building a powerful habit!",
    color: "text-yellow-400",
  },
  30: {
    icon: Star,
    title: "Monthly Master!",
    message: "30 days strong! Your dedication is inspiring. Keep that momentum!",
    color: "text-orange-400",
  },
  100: {
    icon: Trophy,
    title: "Century Champion!",
    message: "100 days of learning! You're in the top 1% of dedicated learners!",
    color: "text-red-400",
  },
  365: {
    icon: Crown,
    title: "Legendary Learner!",
    message: "A full year of daily learning! You've achieved something truly remarkable!",
    color: "text-purple-400",
  },
};

export function StreakMilestoneModal() {
  const { pendingMilestone, clearMilestone, currentStreak } = useStreak();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (pendingMilestone) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [pendingMilestone]);

  if (!pendingMilestone) return null;

  const config = milestoneConfig[pendingMilestone];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <>
      <Confetti isActive={showConfetti} />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={clearMilestone}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 mb-6 ${config.color}`}
            >
              <Icon className="h-10 w-10" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-2xl font-bold mb-2 ${config.color}`}
            >
              {config.title}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <Flame className="h-6 w-6 text-orange-500" />
              <span className="text-4xl font-bold text-foreground">
                {currentStreak}
              </span>
              <span className="text-lg text-muted-foreground">days</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground mb-8"
            >
              {config.message}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <GlintButton variant="primary" onClick={clearMilestone}>
                Keep Going! 🚀
              </GlintButton>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

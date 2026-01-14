import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
}

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
}

const colors = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "#FFD700",
  "#FF69B4",
];

const Confetti: React.FC<ConfettiProps> = ({ isActive, duration = 2000 }) => {
  const [pieces, setPieces] = React.useState<ConfettiPiece[]>([]);

  React.useEffect(() => {
    if (isActive) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.3,
        rotation: Math.random() * 360,
      }));
      setPieces(newPieces);

      // Clear after duration
      const timer = setTimeout(() => {
        setPieces([]);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [isActive, duration]);

  // Respect reduced motion preference
  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  if (prefersReducedMotion || pieces.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              top: "-5%",
              left: `${piece.x}%`,
              opacity: 1,
              rotate: 0,
              scale: 1,
            }}
            animate={{
              top: "105%",
              opacity: [1, 1, 0],
              rotate: piece.rotation + 720,
              scale: [1, 0.8, 0.6],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2.5,
              delay: piece.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              position: "absolute",
              width: 10,
              height: 10,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export { Confetti };

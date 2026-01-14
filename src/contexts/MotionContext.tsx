import * as React from "react";

interface MotionContextType {
  prefersReducedMotion: boolean;
  toggleReducedMotion: () => void;
}

const MotionContext = React.createContext<MotionContextType | undefined>(undefined);

export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(() => {
    // Check localStorage first
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("prefers-reduced-motion");
      if (stored !== null) {
        return stored === "true";
      }
      // Fall back to system preference
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  // Listen for system preference changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a manual preference
      const stored = localStorage.getItem("prefers-reduced-motion");
      if (stored === null) {
        setPrefersReducedMotion(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Apply to document for CSS animations
  React.useEffect(() => {
    if (prefersReducedMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  }, [prefersReducedMotion]);

  const toggleReducedMotion = React.useCallback(() => {
    setPrefersReducedMotion((prev) => {
      const newValue = !prev;
      localStorage.setItem("prefers-reduced-motion", String(newValue));
      return newValue;
    });
  }, []);

  return (
    <MotionContext.Provider value={{ prefersReducedMotion, toggleReducedMotion }}>
      {children}
    </MotionContext.Provider>
  );
};

export const useMotion = () => {
  const context = React.useContext(MotionContext);
  if (context === undefined) {
    throw new Error("useMotion must be used within a MotionProvider");
  }
  return context;
};

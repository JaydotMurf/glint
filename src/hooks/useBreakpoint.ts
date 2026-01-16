import * as React from "react";

/**
 * Content-driven responsive breakpoints for Glint
 * 
 * xs:  480px  - Extra small mobile (portrait)
 * sm:  640px  - Small mobile (landscape) / large phones
 * md:  768px  - Tablets (portrait)
 * lg:  1024px - Tablets (landscape) / small laptops
 * xl:  1280px - Laptops / small desktops
 * 2xl: 1440px - Large desktops and monitors
 */

export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1440,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Returns the current breakpoint based on window width
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint | "base">("base");

  React.useEffect(() => {
    const getBreakpoint = (width: number): Breakpoint | "base" => {
      if (width >= BREAKPOINTS["2xl"]) return "2xl";
      if (width >= BREAKPOINTS.xl) return "xl";
      if (width >= BREAKPOINTS.lg) return "lg";
      if (width >= BREAKPOINTS.md) return "md";
      if (width >= BREAKPOINTS.sm) return "sm";
      if (width >= BREAKPOINTS.xs) return "xs";
      return "base";
    };

    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
}

/**
 * Returns true if the current breakpoint is at or above the specified breakpoint
 */
export function useMinBreakpoint(minBreakpoint: Breakpoint) {
  const [isAbove, setIsAbove] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsAbove(window.innerWidth >= BREAKPOINTS[minBreakpoint]);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [minBreakpoint]);

  return isAbove;
}

/**
 * Returns true if the current breakpoint is at or below the specified breakpoint
 */
export function useMaxBreakpoint(maxBreakpoint: Breakpoint) {
  const [isBelow, setIsBelow] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsBelow(window.innerWidth < BREAKPOINTS[maxBreakpoint]);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [maxBreakpoint]);

  return isBelow;
}

/**
 * Returns true if the current width is between two breakpoints (inclusive start, exclusive end)
 */
export function useBetweenBreakpoints(minBreakpoint: Breakpoint, maxBreakpoint: Breakpoint) {
  const [isBetween, setIsBetween] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsBetween(width >= BREAKPOINTS[minBreakpoint] && width < BREAKPOINTS[maxBreakpoint]);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [minBreakpoint, maxBreakpoint]);

  return isBetween;
}

/**
 * Device-type helper hooks for common patterns
 */
export function useIsMobilePortrait() {
  return useMaxBreakpoint("xs");
}

export function useIsMobile() {
  return useMaxBreakpoint("md");
}

export function useIsTablet() {
  return useBetweenBreakpoints("md", "lg");
}

export function useIsDesktop() {
  return useMinBreakpoint("lg");
}

export function useIsLargeDesktop() {
  return useMinBreakpoint("xl");
}

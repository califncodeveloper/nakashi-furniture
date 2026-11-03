"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { frame, cancelFrame } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const LenisContext = createContext<Lenis | null>(null);

/**
 * Access the global Lenis instance.
 * Useful for stopping/starting scroll (e.g. mobile menus or modal dialogs)
 * or triggering programmatic smooth scrolls.
 */
export function useLenis() {
  return useContext(LenisContext);
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

interface LenisProviderProps {
  children: ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Disable native browser automatic scroll restoration to avoid
    // delayed jumps or fighting with Lenis during navigation.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const instance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
      autoRaf: false, // Driven by Framer Motion's frame loop below
      stopInertiaOnNavigate: true,
      prevent: (node) => node.hasAttribute("data-lenis-prevent"),
    });

    lenisRef.current = instance;
    setLenis(instance);

    // Synchronize Lenis with Framer Motion's internal animation loop.
    // This ensures parallax transforms (useScroll / useTransform)
    // and reveal animations run in lockstep without frame lag.
    function update({ timestamp }: { timestamp: number }) {
      instance.raf(timestamp);
    }

    frame.update(update, true);

    return () => {
      cancelFrame(update);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

/* ------------------------------------------------------------------ */
/*  Scroll-to-top on route change                                      */
/* ------------------------------------------------------------------ */

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Ensures that upon page navigation:
 * 1. The previous page's scroll position is never retained.
 * 2. The new page immediately displays from the very top before paint.
 * 3. Prevents unwanted automatic scrolling or delayed scroll jumps.
 * 4. Ensures scroll reveal animations (Framer Motion whileInView) calculate
 *    viewport intersections correctly from y=0.
 */
export function useLenisScrollToTop(pathname: string) {
  const lenis = useLenis();
  const prevPathRef = useRef<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    // On first mount: if no hash anchor, ensure we start at the top
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      if (typeof window !== "undefined" && !window.location.hash) {
        window.scrollTo(0, 0);
        lenis?.scrollTo(0, { immediate: true, force: true });
      }
      return;
    }

    // On pathname change (navigating to another page)
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;

      // 1. Immediately reset native window scroll before paint
      window.scrollTo(0, 0);

      // 2. Immediately reset Lenis internal scroll position
      if (lenis) {
        lenis.scrollTo(0, { immediate: true, force: true });
        lenis.resize();
      }

      // 3. In the subsequent RAF, re-verify scroll is top and recalculate
      //    dimensions once the new page DOM layout has mounted
      const rafId = requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        if (lenis) {
          lenis.scrollTo(0, { immediate: true, force: true });
          lenis.resize();
        }
      });

      return () => cancelAnimationFrame(rafId);
    }

    return undefined;
  }, [pathname, lenis]);
}

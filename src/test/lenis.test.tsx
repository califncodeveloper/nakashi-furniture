import { render, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { LenisProvider, useLenis, useLenisScrollToTop } from "@/lib/lenis";
import { getRouter } from "@/router";

describe("Lenis Smooth Scrolling & Navigation Integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("configures router scroll restoration to false to delegate to Lenis", () => {
    const router = getRouter();
    expect(router.options.scrollRestoration).toBe(false);
  });

  it("renders LenisProvider and provides context to children", () => {
    let capturedLenis: ReturnType<typeof useLenis> = null;

    function TestConsumer() {
      capturedLenis = useLenis();
      return <div>Lenis Child</div>;
    }

    const { getByText } = render(
      <LenisProvider>
        <TestConsumer />
      </LenisProvider>,
    );

    expect(getByText("Lenis Child")).toBeInTheDocument();
    expect(capturedLenis).not.toBeNull();
  });

  it("resets scroll position immediately to top when navigating to a new page", () => {
    const scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy;

    function TestScrollComponent({ pathname }: { pathname: string }) {
      useLenisScrollToTop(pathname);
      return <div>Page: {pathname}</div>;
    }

    const { rerender } = render(
      <LenisProvider>
        <TestScrollComponent pathname="/" />
      </LenisProvider>,
    );

    // Initial render at "/" resets or checks scroll
    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    scrollToSpy.mockClear();

    // Navigate to "/about"
    act(() => {
      rerender(
        <LenisProvider>
          <TestScrollComponent pathname="/about" />
        </LenisProvider>,
      );
    });

    // Immediate scroll-to-top must be triggered for "/about"
    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    scrollToSpy.mockClear();

    // Navigate to "/shop"
    act(() => {
      rerender(
        <LenisProvider>
          <TestScrollComponent pathname="/shop" />
        </LenisProvider>,
      );
    });

    // Immediate scroll-to-top must be triggered for "/shop"
    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
  });

  it("does not trigger extra scroll-to-top when rerendered with the same pathname", () => {
    const scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy;

    function TestScrollComponent({ pathname }: { pathname: string }) {
      useLenisScrollToTop(pathname);
      return <div>Page: {pathname}</div>;
    }

    const { rerender } = render(
      <LenisProvider>
        <TestScrollComponent pathname="/contact" />
      </LenisProvider>,
    );

    scrollToSpy.mockClear();

    // Rerender with SAME pathname
    act(() => {
      rerender(
        <LenisProvider>
          <TestScrollComponent pathname="/contact" />
        </LenisProvider>,
      );
    });

    // Should NOT call scrollTo again if pathname hasn't changed
    expect(scrollToSpy).not.toHaveBeenCalled();
  });
});

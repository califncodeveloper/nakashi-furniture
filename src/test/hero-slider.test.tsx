import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HeroSlider, HERO_SLIDES } from "@/components/home/HeroSlider";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, className, ...props }: any) => (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  ),
}));

describe("HeroSlider Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the initial slide title and badge", () => {
    render(<HeroSlider slides={HERO_SLIDES} />);

    expect(screen.getByText(/The Nakashi Furnitures · Pallikaranai, Chennai/i)).toBeInTheDocument();
    expect(screen.getByText(/Make Your Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Beautiful/i)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /Hero Furniture Highlights/i })).toBeInTheDocument();
  });

  it("renders CTA buttons and navigation elements", () => {
    render(<HeroSlider slides={HERO_SLIDES} />);

    expect(screen.getByRole("link", { name: /Explore Collection/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Visit Showroom/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Previous slide/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next slide/i })).toBeInTheDocument();
  });

  it("advances to the next slide when the next button is clicked", () => {
    render(<HeroSlider slides={HERO_SLIDES} />);

    const nextBtn = screen.getByRole("button", { name: /Next slide/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Royal Teakwood Bedrooms · Pallikaranai Atelier/i)).toBeInTheDocument();
    expect(screen.getByText(/Sanctuary of Rest &/i)).toBeInTheDocument();
  });

  it("navigates to previous slide when prev button is clicked", () => {
    render(<HeroSlider slides={HERO_SLIDES} />);

    const prevBtn = screen.getByRole("button", { name: /Previous slide/i });
    fireEvent.click(prevBtn);

    // Clicking prev on slide 0 wraps around to slide 3 (reading lounge)
    expect(screen.getByText(/Bespoke Lounges · Premium Velvets & Linens/i)).toBeInTheDocument();
  });

  it("jumps to a specific slide when pagination dot is clicked", () => {
    render(<HeroSlider slides={HERO_SLIDES} />);

    const thirdDot = screen.getByRole("tab", { name: /Go to slide 3/i });
    fireEvent.click(thirdDot);

    expect(screen.getByText(/Solid Hardwood Dining · Family Gatherings/i)).toBeInTheDocument();
    expect(screen.getByText(/Artisanal Tables Built for/i)).toBeInTheDocument();
  });

  it("supports keyboard navigation with left and right arrow keys", () => {
    render(<HeroSlider slides={HERO_SLIDES} />);

    const slider = screen.getByRole("region", { name: /Hero Furniture Highlights/i });

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(screen.getByText(/Royal Teakwood Bedrooms · Pallikaranai Atelier/i)).toBeInTheDocument();

    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(screen.getByText(/The Nakashi Furnitures · Pallikaranai, Chennai/i)).toBeInTheDocument();
  });

  it("supports touch / swipe gestures", () => {
    render(<HeroSlider slides={HERO_SLIDES} />);

    const slider = screen.getByRole("region", { name: /Hero Furniture Highlights/i });

    // Swipe left (deltaX = 100 - 200 = -100) -> Next slide
    fireEvent.touchStart(slider, {
      touches: [{ clientX: 200, clientY: 100 }],
    });
    fireEvent.touchEnd(slider, {
      changedTouches: [{ clientX: 100, clientY: 100 }],
    });

    expect(screen.getByText(/Royal Teakwood Bedrooms · Pallikaranai Atelier/i)).toBeInTheDocument();

    // Swipe right (deltaX = 250 - 100 = 150) -> Prev slide
    fireEvent.touchStart(slider, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(slider, {
      changedTouches: [{ clientX: 250, clientY: 100 }],
    });

    expect(screen.getByText(/The Nakashi Furnitures · Pallikaranai, Chennai/i)).toBeInTheDocument();
  });

  it("allows toggling pause / play manually", () => {
    render(<HeroSlider slides={HERO_SLIDES} />);

    const pauseBtn = screen.getByRole("button", { name: /Pause slider autoplay/i });
    expect(pauseBtn).toBeInTheDocument();

    fireEvent.click(pauseBtn);
    expect(screen.getByRole("button", { name: /Resume slider autoplay/i })).toBeInTheDocument();
  });
});


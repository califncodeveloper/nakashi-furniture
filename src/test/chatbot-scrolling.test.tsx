import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NakashiChatbot } from "@/components/chatbot/NakashiChatbot";

// Mock the chat API to test conversations and responses
vi.mock("@/lib/chatbot/chat-api", () => ({
  chatWithAssistant: vi.fn().mockResolvedValue({
    message: "Here is a lengthy response with formatting:\n\n```json\n{\n  \"item\": \"Grand Teak Bed\",\n  \"price\": 45000\n}\n```\n\n| Feature | Specification |\n|---|---|\n| Wood | Solid Grade-A Teak |\n| Warranty | 10 Years |\n\nThis is a superlongwordthattestsoverflowbreakwordbehaviorwithoutbreakingthelayoutatall.",
    productCards: [
      {
        id: "prod_1",
        name: "Grand Solid Teak Bed",
        slug: "grand-solid-teak-bed",
        price: 45000,
        originalPrice: 52000,
        category: "Beds",
        image: "/assets/cat-bed.jpg",
        isAvailable: true,
      },
    ],
  }),
}));

describe("NakashiChatbot Scrolling & Layout Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    // Mark welcome toast as already shown so it doesn't interfere
    sessionStorage.setItem("nk_chat_welcome_shown", "true");
  });

  it("renders the chat trigger button and opens the chat dialog", () => {
    render(<NakashiChatbot />);
    const launcher = screen.getByRole("button", { name: /Open NAKASHI Assistant/i });
    expect(launcher).toBeInTheDocument();

    fireEvent.click(launcher);

    const dialog = screen.getByRole("dialog", { name: /NAKASHI Chat Assistant/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("data-lenis-prevent", "true");
  });

  it("maintains fixed header at the top and fixed input area at the bottom", () => {
    render(<NakashiChatbot />);
    const launcher = screen.getByRole("button", { name: /Open NAKASHI Assistant/i });
    fireEvent.click(launcher);

    const dialog = screen.getByRole("dialog", { name: /NAKASHI Chat Assistant/i });
    const header = dialog.querySelector(".nk-chat-header");
    const inputArea = dialog.querySelector(".nk-chat-input-area");
    const messagesArea = dialog.querySelector(".nk-chat-messages");

    expect(header).toBeInTheDocument();
    expect(inputArea).toBeInTheDocument();
    expect(messagesArea).toBeInTheDocument();

    // Verify messages container has data-lenis-prevent attribute
    expect(messagesArea).toHaveAttribute("data-lenis-prevent", "true");
  });

  it("ensures textarea and send button remain accessible", () => {
    render(<NakashiChatbot />);
    fireEvent.click(screen.getByRole("button", { name: /Open NAKASHI Assistant/i }));

    const textarea = screen.getByLabelText(/Chat message input/i);
    const sendButton = screen.getByLabelText(/Send message/i);

    expect(textarea).toBeInTheDocument();
    expect(sendButton).toBeInTheDocument();
    expect(sendButton).toBeDisabled();

    fireEvent.change(textarea, { target: { value: "Tell me about your beds" } });
    expect(textarea).toHaveValue("Tell me about your beds");
    expect(sendButton).not.toBeDisabled();
  });

  it("scrolls message container automatically when a new message is sent and received", async () => {
    render(<NakashiChatbot />);
    fireEvent.click(screen.getByRole("button", { name: /Open NAKASHI Assistant/i }));

    const messagesContainer = screen.getByRole("dialog").querySelector(".nk-chat-messages") as HTMLDivElement;
    expect(messagesContainer).toBeInTheDocument();

    const scrollToMock = vi.fn();
    messagesContainer.scrollTo = scrollToMock;

    const textarea = screen.getByLabelText(/Chat message input/i);
    const sendButton = screen.getByLabelText(/Send message/i);

    await act(async () => {
      fireEvent.change(textarea, { target: { value: "Tell me about your beds" } });
      fireEvent.click(sendButton);
    });

    // Wait for the async assistant reply to resolve
    expect(await screen.findByText(/Solid Grade-A Teak/i)).toBeInTheDocument();
    expect(screen.getByText("Grand Solid Teak Bed")).toBeInTheDocument();

    // Verify scrollTo was called to keep user scrolled to the latest message
    expect(scrollToMock).toHaveBeenCalled();
  });

  it("prevents outer webpage scrolling when wheeling at container boundaries or over non-scrollable header", () => {
    render(<NakashiChatbot />);
    fireEvent.click(screen.getByRole("button", { name: /Open NAKASHI Assistant/i }));

    const dialog = screen.getByRole("dialog") as HTMLDivElement;
    const header = dialog.querySelector(".nk-chat-header") as HTMLDivElement;
    const messagesContainer = dialog.querySelector(".nk-chat-messages") as HTMLDivElement;

    // Simulate mock dimensions
    Object.defineProperty(messagesContainer, "scrollHeight", { value: 800, configurable: true });
    Object.defineProperty(messagesContainer, "clientHeight", { value: 400, configurable: true });
    Object.defineProperty(messagesContainer, "scrollTop", { value: 0, writable: true, configurable: true });

    // 1. Wheel event on header -> must preventDefault
    const headerWheelEvent = new WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true });
    header.dispatchEvent(headerWheelEvent);
    expect(headerWheelEvent.defaultPrevented).toBe(true);

    // 2. Wheel event scrolling UP when already at top -> must preventDefault
    const topWheelEvent = new WheelEvent("wheel", { deltaY: -50, bubbles: true, cancelable: true });
    messagesContainer.dispatchEvent(topWheelEvent);
    expect(topWheelEvent.defaultPrevented).toBe(true);

    // 3. Wheel event scrolling DOWN when in the middle -> allowed (default NOT prevented)
    messagesContainer.scrollTop = 200;
    const midWheelEvent = new WheelEvent("wheel", { deltaY: 50, bubbles: true, cancelable: true });
    messagesContainer.dispatchEvent(midWheelEvent);
    expect(midWheelEvent.defaultPrevented).toBe(false);

    // 4. Wheel event scrolling DOWN when at bottom (scrollTop + clientHeight = 800) -> must preventDefault
    messagesContainer.scrollTop = 400;
    const bottomWheelEvent = new WheelEvent("wheel", { deltaY: 50, bubbles: true, cancelable: true });
    messagesContainer.dispatchEvent(bottomWheelEvent);
    expect(bottomWheelEvent.defaultPrevented).toBe(true);
  });

  it("handles long AI formatted content (tables, code blocks, long words) without errors", async () => {
    render(<NakashiChatbot />);
    fireEvent.click(screen.getByRole("button", { name: /Open NAKASHI Assistant/i }));

    const textarea = screen.getByLabelText(/Chat message input/i);
    const sendButton = screen.getByLabelText(/Send message/i);

    await act(async () => {
      fireEvent.change(textarea, { target: { value: "Show me specs" } });
      fireEvent.click(sendButton);
    });

    // Check code block is rendered inside <pre><code>
    const preEl = screen.getByRole("dialog").querySelector(".nk-chat-pre");
    expect(preEl).toBeInTheDocument();
    expect(preEl?.textContent).toContain("Grand Teak Bed");

    // Check table is rendered inside .nk-chat-table-wrap
    const tableWrap = screen.getByRole("dialog").querySelector(".nk-chat-table-wrap");
    expect(tableWrap).toBeInTheDocument();
    expect(tableWrap?.querySelector("table")).toBeInTheDocument();

    // Check product card is rendered
    expect(screen.getByText("Grand Solid Teak Bed")).toBeInTheDocument();
  });
});


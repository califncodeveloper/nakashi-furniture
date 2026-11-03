import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type FormEvent,
} from "react";
import { MessageCircle, X, Minus, Send, Trash2, RotateCcw, Sparkles } from "lucide-react";
import { chatWithAssistant } from "@/lib/chatbot/chat-api";
import type { ChatMessage, ProductCard } from "@/lib/chatbot/types";
import { BRAND, formatPrice } from "@/constants/brand";
import { categories } from "@/constants/catalog";

/* ------------------------------------------------------------------ */
/*  Markdown-like renderer (safe, no raw HTML injection)              */
/* ------------------------------------------------------------------ */

function renderMarkdown(text: string): string {
  if (!text) return "";

  let html = text
    // Escape HTML entities first (XSS protection)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Italic: *text* or _text_ (but not inside **)
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");

  // Headings: ### text, ## text, # text
  html = html.replace(/^### (.+)$/gm, '<h4 class="nk-chat-h4">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 class="nk-chat-h3">$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h3 class="nk-chat-h3">$1</h3>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="nk-chat-hr" />');

  // Unordered lists: - item or * item
  html = html.replace(/^[-*] (.+)$/gm, '<li class="nk-chat-li">$1</li>');

  // Numbered lists: 1. item
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="nk-chat-li nk-chat-oli">$1</li>');

  // Wrap consecutive <li> items in <ul>
  html = html.replace(
    /(<li class="nk-chat-li">[\s\S]*?<\/li>(\n|$))+/g,
    (match) => `<ul class="nk-chat-ul">${match}</ul>`,
  );

  // Links: [text](url) — only allow safe URLs
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, linkText, url) => {
    // Only allow relative URLs and https URLs
    if (url.startsWith("/") || url.startsWith("https://")) {
      return `<a href="${url}" class="nk-chat-link" target="${url.startsWith("http") ? "_blank" : "_self"}" rel="noopener noreferrer">${linkText}</a>`;
    }
    return linkText;
  });

  // Tables: | col1 | col2 |
  const tableRegex = /(\|.+\|[\r\n]+\|[-\s|:]+\|[\r\n]+(?:\|.+\|[\r\n]*)+)/g;
  html = html.replace(tableRegex, (match) => {
    const rows = match
      .trim()
      .split("\n")
      .filter((r) => r.trim());
    if (rows.length < 2) return match;

    const firstRow = rows[0];
    if (!firstRow) return match;
    const headerCells = firstRow.split("|").filter((c) => c.trim());
    // Skip separator row (rows[1])
    const bodyRows = rows.slice(2);

    let table = '<div class="nk-chat-table-wrap"><table class="nk-chat-table"><thead><tr>';
    for (const cell of headerCells) {
      table += `<th>${cell.trim()}</th>`;
    }
    table += "</tr></thead><tbody>";
    for (const row of bodyRows) {
      const cells = row.split("|").filter((c) => c.trim());
      table += "<tr>";
      for (const cell of cells) {
        table += `<td>${cell.trim()}</td>`;
      }
      table += "</tr>";
    }
    table += "</tbody></table></div>";
    return table;
  });

  // Paragraphs: convert double newlines to paragraph breaks
  html = html.replace(/\n\n/g, "</p><p>");
  // Single newlines to <br>
  html = html.replace(/\n/g, "<br />");

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith("<")) {
    html = `<p>${html}</p>`;
  }

  return html;
}

/* ------------------------------------------------------------------ */
/*  Quick Suggestion Chips                                            */
/* ------------------------------------------------------------------ */

function getQuickSuggestions(): { emoji: string; label: string; query: string }[] {
  const catNames = categories.map((c) => c.name.toLowerCase());

  const suggestions: { emoji: string; label: string; query: string }[] = [];

  suggestions.push({
    emoji: "🛋️",
    label: "Explore Furniture",
    query: "Show me your furniture collection",
  });

  if (catNames.some((c) => c.includes("bed"))) {
    suggestions.push({
      emoji: "🛏️",
      label: "Find a Bed",
      query: "Show me your bed collection with prices",
    });
  }
  if (catNames.some((c) => c.includes("chair"))) {
    suggestions.push({
      emoji: "🪑",
      label: "Explore Chairs",
      query: "Show me your chair collection",
    });
  }
  if (catNames.some((c) => c.includes("sofa"))) {
    suggestions.push({
      emoji: "🛋️",
      label: "Browse Sofas",
      query: "Show me your sofa collection with specifications",
    });
  }

  suggestions.push(
    {
      emoji: "💰",
      label: "Products Under ₹10,000",
      query: "Show me furniture products under ₹10,000",
    },
    {
      emoji: "🔍",
      label: "Find by Budget",
      query: "I'm looking for furniture within a specific budget. What do you recommend?",
    },
    {
      emoji: "📦",
      label: "Delivery Support",
      query: "What are your delivery options and charges?",
    },
    {
      emoji: "👨‍💻",
      label: "Contact Support",
      query: "How can I contact the showroom or speak to someone?",
    },
  );

  return suggestions;
}

/* ------------------------------------------------------------------ */
/*  Product Card Component                                            */
/* ------------------------------------------------------------------ */

function ChatProductCard({ product }: { product: ProductCard }) {
  return (
    <a
      href={`/product/${product.slug || product.id}`}
      className="nk-chat-product-card"
      target="_self"
    >
      <div className="nk-chat-product-img-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="nk-chat-product-img"
          loading="lazy"
        />
        {product.isAvailable === false && <span className="nk-chat-product-oos">Out of Stock</span>}
      </div>
      <div className="nk-chat-product-info">
        <p className="nk-chat-product-cat">{product.category}</p>
        <h4 className="nk-chat-product-name">{product.name}</h4>
        {product.price ? (
          <div className="nk-chat-product-price-row">
            <span className="nk-chat-product-price">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="nk-chat-product-orig-price">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        ) : (
          <p className="nk-chat-product-contact">Contact for Price</p>
        )}
        <span className="nk-chat-product-view">View Product →</span>
      </div>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Typing Indicator                                                   */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  return (
    <div className="nk-chat-typing">
      <div className="nk-chat-typing-avatar">NK</div>
      <div className="nk-chat-typing-dots">
        <span className="nk-chat-dot" />
        <span className="nk-chat-dot" />
        <span className="nk-chat-dot" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Chatbot Component                                            */
/* ------------------------------------------------------------------ */

const INITIAL_GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content: `Hello! 👋 Welcome to **${BRAND.name}**.\n\nI'm your virtual furniture shopping assistant. I can help you explore our furniture collection, compare products, understand specifications, check pricing, and answer your shopping questions.\n\nWhat are you looking for today?`,
  timestamp: Date.now(),
};

export function NakashiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Unique client ID for rate limiting
  const clientIdRef = useRef(
    typeof window !== "undefined"
      ? sessionStorage.getItem("nk_chat_client") ||
          (() => {
            const id = `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            sessionStorage.setItem("nk_chat_client", id);
            return id;
          })()
      : "server",
  );

  // Welcome message logic — show once per session
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeenWelcome = sessionStorage.getItem("nk_chat_welcome_shown");
    if (!hasSeenWelcome) {
      const showTimer = setTimeout(() => setShowWelcome(true), 1500);
      const hideTimer = setTimeout(() => {
        setShowWelcome(false);
        sessionStorage.setItem("nk_chat_welcome_shown", "true");
      }, 4500); // 1.5s delay + 3s visible = 4.5s total

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
    return undefined;
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, isMinimized]);

  const toggleChat = useCallback(() => {
    if (isMinimized) {
      setIsMinimized(false);
      return;
    }
    setIsOpen((prev) => !prev);
    setShowWelcome(false);
  }, [isMinimized]);

  const minimizeChat = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([{ ...INITIAL_GREETING, id: `greeting_${Date.now()}`, timestamp: Date.now() }]);
    setShowSuggestions(true);
    setInputValue("");
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      // Prevent duplicate messages
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (
        lastUserMsg &&
        lastUserMsg.content === trimmed &&
        Date.now() - lastUserMsg.timestamp < 2000
      ) {
        return;
      }

      setShowSuggestions(false);
      setInputValue("");

      const userMessage: ChatMessage = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Build conversation history for context
        const conversationHistory = [...messages, userMessage]
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-10) // Last 10 messages for context
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

        const response = await chatWithAssistant({
          data: {
            messages: conversationHistory,
            clientId: clientIdRef.current,
          },
        });

        const assistantMessage: ChatMessage = {
          id: `assistant_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          role: "assistant",
          content: response.error
            ? `I apologize, but I'm having trouble right now. ${response.error}\n\nYou can also reach us directly:\n- 📞 Phone: +91 ${BRAND.phone}\n- 💬 WhatsApp: [Chat with us](https://wa.me/91${BRAND.phone})\n- 📧 Email: ${BRAND.email}`
            : response.message,
          timestamp: Date.now(),
          productCards: response.productCards,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        console.error("Chat error:", err);
        const errorMessage: ChatMessage = {
          id: `error_${Date.now()}`,
          role: "assistant",
          content: `I apologize for the inconvenience. Something went wrong on my end.\n\nPlease try again, or contact our showroom directly:\n- 📞 Phone: +91 ${BRAND.phone}\n- 💬 [WhatsApp](https://wa.me/91${BRAND.phone})\n- 📧 ${BRAND.email}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      sendMessage(inputValue);
    },
    [inputValue, sendMessage],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inputValue);
      }
    },
    [inputValue, sendMessage],
  );

  const handleSuggestionClick = useCallback(
    (query: string) => {
      sendMessage(query);
    },
    [sendMessage],
  );

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // SSR safety
  if (typeof window === "undefined") return null;

  return (
    <>
      {/* Welcome Toast */}
      <div className={`nk-chat-welcome ${showWelcome ? "nk-chat-welcome--visible" : ""}`}>
        <span>👋 Hi! How can we help you!</span>
      </div>

      {/* Floating Chat Button */}
      <button
        id="nakashi-chat-launcher"
        className={`nk-chat-fab ${isOpen ? "nk-chat-fab--open" : ""}`}
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open NAKASHI Assistant"}
        title="Chat with NAKASHI Assistant"
      >
        <span className="nk-chat-fab-icon">
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </span>
        {!isOpen && <span className="nk-chat-fab-pulse" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className={`nk-chat-window ${isMinimized ? "nk-chat-window--minimized" : ""}`}
          role="dialog"
          aria-label="NAKASHI Chat Assistant"
        >
          {/* Header */}
          <div className="nk-chat-header">
            <div className="nk-chat-header-info">
              <div className="nk-chat-header-avatar">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="nk-chat-header-title">NAKASHI Assistant</h3>
                <p className="nk-chat-header-subtitle">
                  <span className="nk-chat-online-dot" />
                  Your furniture shopping assistant
                </p>
              </div>
            </div>
            <div className="nk-chat-header-actions">
              <button
                onClick={clearChat}
                className="nk-chat-header-btn"
                title="New conversation"
                aria-label="Start new conversation"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={minimizeChat}
                className="nk-chat-header-btn"
                title="Minimize"
                aria-label="Minimize chat"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={closeChat}
                className="nk-chat-header-btn"
                title="Close"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div className="nk-chat-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`nk-chat-msg ${msg.role === "user" ? "nk-chat-msg--user" : "nk-chat-msg--assistant"}`}
                  >
                    {msg.role === "assistant" && <div className="nk-chat-msg-avatar">NK</div>}
                    <div className="nk-chat-msg-content">
                      <div
                        className="nk-chat-msg-bubble"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(msg.content),
                        }}
                      />
                      {/* Product Cards */}
                      {msg.productCards && msg.productCards.length > 0 && (
                        <div className="nk-chat-products-grid">
                          {msg.productCards.map((card) => (
                            <ChatProductCard key={card.id} product={card} />
                          ))}
                        </div>
                      )}
                      <span className="nk-chat-msg-time">{formatTimestamp(msg.timestamp)}</span>
                    </div>
                  </div>
                ))}

                {isLoading && <TypingIndicator />}

                {/* Quick Suggestions */}
                {showSuggestions && messages.length <= 1 && !isLoading && (
                  <div className="nk-chat-suggestions">
                    {getQuickSuggestions().map((s) => (
                      <button
                        key={s.label}
                        className="nk-chat-suggestion-chip"
                        onClick={() => handleSuggestionClick(s.query)}
                      >
                        <span className="nk-chat-chip-emoji">{s.emoji}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="nk-chat-input-area">
                <div className="nk-chat-input-wrap">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="nk-chat-input"
                    rows={1}
                    disabled={isLoading}
                    aria-label="Chat message input"
                  />
                  <button
                    type="submit"
                    className="nk-chat-send-btn"
                    disabled={!inputValue.trim() || isLoading}
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <p className="nk-chat-input-hint">Press Enter to send · Shift+Enter for new line</p>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}

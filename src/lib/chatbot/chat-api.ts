import { createServerFn } from "@tanstack/react-start";
import { buildSystemPrompt, formatProductsForContext } from "./system-prompt";
import type { ChatResponse, ProductCard } from "./types";

/* ------------------------------------------------------------------ */
/*  Rate limiting (in-memory, per-server instance)                    */
/* ------------------------------------------------------------------ */

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20; // max 20 requests per minute per IP

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(clientId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count += 1;
  return true;
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 300_000);

/* ------------------------------------------------------------------ */
/*  Input sanitization                                                 */
/* ------------------------------------------------------------------ */

function sanitizeInput(text: string): string {
  if (!text || typeof text !== "string") return "";
  // Trim and limit length
  return text.trim().slice(0, 2000);
}

/* ------------------------------------------------------------------ */
/*  Product database fetcher (server-side, uses Supabase directly)    */
/* ------------------------------------------------------------------ */

async function fetchProductCatalogForAI(): Promise<{
  context: string;
  cards: ProductCard[];
}> {
  try {
    // Dynamic import to avoid bundling supabase client in places it shouldn't be
    const { createClient } = await import("@supabase/supabase-js");

    const supabaseUrl =
      process.env["VITE_SUPABASE_URL"] || "https://sgpleeuwhjmmcgjdcdxp.supabase.co";
    const supabaseKey =
      process.env["VITE_SUPABASE_ANON_KEY"] ||
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
      "sb_publishable_AQ-qNinEwZx23Gtzwi7w3Q_Uv587Wjp";

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Fall back to static catalog
      return fetchStaticCatalog();
    }

    const context = formatProductsForContext(data as any[]);
    const cards: ProductCard[] = data.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug || undefined,
      category: p.category,
      price: p.price ?? undefined,
      originalPrice: p.original_price ?? undefined,
      image: p.image,
      description: p.description || undefined,
      material: p.material || undefined,
      dimensions: p.dimensions || undefined,
      warranty: p.warranty || undefined,
      isAvailable: p.is_available !== false,
    }));

    return { context, cards };
  } catch (err) {
    console.warn("Chatbot: Supabase fetch failed, using static catalog", err);
    return fetchStaticCatalog();
  }
}

async function fetchStaticCatalog(): Promise<{
  context: string;
  cards: ProductCard[];
}> {
  // Import static catalog at runtime
  const { bestsellers, newArrivals } = await import("@/constants/catalog");
  const { enrichProduct } = await import("@/lib/productService");

  const all = [...bestsellers, ...newArrivals].map(enrichProduct);
  const context = formatProductsForContext(all);
  const cards: ProductCard[] = all.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug || undefined,
    category: p.category,
    price: p.price ?? undefined,
    originalPrice: p.originalPrice ?? undefined,
    image: p.image,
    description: p.description || undefined,
    material: p.material || undefined,
    dimensions: p.dimensions || undefined,
    warranty: p.warranty || undefined,
    isAvailable: p.isAvailable !== false,
  }));

  return { context, cards };
}

/* ------------------------------------------------------------------ */
/*  Groq API call                                                      */
/* ------------------------------------------------------------------ */

async function callGroqApi(
  systemPrompt: string,
  messages: { role: string; content: string }[],
): Promise<string> {
  const apiKey = process.env["GROQ_API_KEY"];
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured. Please set it in your environment variables.");
  }

  const model = process.env["GROQ_MODEL"] || "llama-3.3-70b-versatile";

  const groqMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // Keep conversation history manageable — last 20 messages + system prompt
  const trimmedMessages = [
    groqMessages[0], // system prompt
    ...groqMessages.slice(1).slice(-20),
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000); // 30s timeout

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: trimmedMessages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`Groq API error ${response.status}:`, errorText);

      if (response.status === 429) {
        throw new Error(
          "Our AI assistant is currently experiencing high demand. Please try again in a moment.",
        );
      }
      if (response.status === 401) {
        throw new Error("AI service configuration error. Please contact support.");
      }
      throw new Error(`AI service temporarily unavailable (${response.status}). Please try again.`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from AI service.");
    }

    return content;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please try again with a shorter question.");
    }
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/*  Extract mentioned product IDs/slugs from AI response              */
/* ------------------------------------------------------------------ */

function extractMentionedProducts(aiResponse: string, allCards: ProductCard[]): ProductCard[] {
  const mentioned: ProductCard[] = [];
  const seenIds = new Set<string>();

  for (const card of allCards) {
    // Check if product name (or significant part of it) appears in the response
    const nameNorm = card.name.toLowerCase();
    const responseNorm = aiResponse.toLowerCase();

    if (
      responseNorm.includes(nameNorm) ||
      responseNorm.includes(nameNorm.split(" ").slice(0, 3).join(" "))
    ) {
      if (!seenIds.has(card.id)) {
        seenIds.add(card.id);
        mentioned.push(card);
      }
    }

    // Also check for slug references
    if (card.slug && responseNorm.includes(card.slug.toLowerCase())) {
      if (!seenIds.has(card.id)) {
        seenIds.add(card.id);
        mentioned.push(card);
      }
    }
  }

  return mentioned.slice(0, 5); // Max 5 product cards per response
}

/* ------------------------------------------------------------------ */
/*  Smart Catalog Assistant (offline / fallback / demo mode)          */
/* ------------------------------------------------------------------ */

function generateSmartCatalogResponse(
  messages: { role: string; content: string }[],
  cards: ProductCard[],
): { message: string; cards: ProductCard[] } {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const q = lastUserMsg.toLowerCase();

  // Helper to filter cards by category or query
  const findCards = (predicate: (c: ProductCard) => boolean, limit = 3): ProductCard[] => {
    return cards.filter(predicate).slice(0, limit);
  };

  // 1. Sofa / Living room queries
  if (
    q.includes("sofa") ||
    q.includes("couch") ||
    q.includes("living") ||
    q.includes("chesterfield")
  ) {
    const matched = findCards(
      (c) => c.category.toLowerCase().includes("sofa") || c.name.toLowerCase().includes("sofa"),
    );
    return {
      message:
        "Here are our handcrafted **luxury sofas**, built with seasoned solid teakwood and high-density comfort cushioning:\n\n" +
        "• **The Chesterfield Heritage Velvet Sofa** — Deep button diamond tufting in royal velvet, kiln-dried Grade-A teak frame with hand-hammered brass nailheads (₹48,999).\n" +
        "• **Customization Available**: All sofas can be customized with your choice of premium Belgian linen, royal velvet, or top-grain leather, plus custom dimensions to fit your living room perfectly.\n\n" +
        "Would you like to explore bespoke fabric swatches or schedule a showroom visit?",
      cards: matched.length > 0 ? matched : cards.slice(0, 2),
    };
  }

  // 2. Bed / Bedroom queries
  if (
    q.includes("bed") ||
    q.includes("bedroom") ||
    q.includes("mattress") ||
    q.includes("storage")
  ) {
    const matched = findCards(
      (c) => c.category.toLowerCase().includes("bed") || c.name.toLowerCase().includes("bed"),
    );
    return {
      message:
        "Explore our master bedroom collection crafted for timeless elegance and lasting durability:\n\n" +
        "• **Royale King Upholstered Bed with Storage** — Tall cushioned wingback headboard with German pneumatic gas-lift hydraulic storage beneath the solid teak base (₹64,500).\n" +
        "• **Solid Teak Structure**: Engineered to eliminate creaks and sagging, supported by our **10-Year Structural Warranty**.\n" +
        "• Available in standard King (72″ × 78″) and Queen sizes, or custom dimensions upon request.",
      cards: matched.length > 0 ? matched : cards.slice(0, 2),
    };
  }

  // 3. Dining table queries
  if (q.includes("dining") || q.includes("table") || q.includes("dinner") || q.includes("food")) {
    const matched = findCards(
      (c) =>
        c.category.toLowerCase().includes("dining") ||
        c.name.toLowerCase().includes("dining") ||
        c.name.toLowerCase().includes("table"),
    );
    return {
      message:
        "Our **solid wood dining tables** bring family and friends together with heirloom-grade teak craftsmanship:\n\n" +
        "• Hand-finished with heat- and moisture-resistant matte natural teak polish.\n" +
        "• Available in 4-seater, 6-seater, and 8-seater configurations with matching ergonomic upholstered dining chairs.\n" +
        "• Every table includes complimentary white-glove delivery and on-site assembly.",
      cards: matched.length > 0 ? matched : cards.slice(0, 2),
    };
  }

  // 4. Chairs / Seating queries
  if (
    q.includes("chair") ||
    q.includes("accent") ||
    q.includes("cane") ||
    q.includes("lounge") ||
    q.includes("seating")
  ) {
    const matched = findCards(
      (c) => c.category.toLowerCase().includes("chair") || c.name.toLowerCase().includes("chair"),
    );
    return {
      message:
        "Take a look at our artisan seating and accent chair collection:\n\n" +
        "• **Malabar Cane & Teak Accent Lounge Chair** — Hand-woven natural forest rattan backrest framed in steam-bent solid Malabar teakwood with linen seat pad (₹18,500).\n" +
        "• Ideal for reading corners, balconies, and luxury reception areas.",
      cards: matched.length > 0 ? matched : cards.slice(0, 2),
    };
  }

  // 5. Custom / Bespoke inquiry
  if (
    q.includes("custom") ||
    q.includes("bespoke") ||
    q.includes("make") ||
    q.includes("size") ||
    q.includes("dimension")
  ) {
    return {
      message:
        "**Bespoke Custom Furniture at NAKASHI**\n\n" +
        "We specialize in made-to-order furniture tailored precisely to your floor plan and interior aesthetic:\n\n" +
        "1. **Wood Selection**: 100% Grade-A Kiln-Dried Teakwood, Rosewood, or Oak\n" +
        "2. **Finishes**: Natural Teak, Warm Walnut, Smoked Oak, or Antique Distressed\n" +
        "3. **Fabrics**: Velvet, Belgian Linen, Bouclé, or Leatherette\n" +
        "4. **Process**: Share your room layout or photo reference with our design team. We provide 3D CAD visualization before crafting.\n\n" +
        "You can connect directly with our Master Craftsman on WhatsApp at **+91 9043278618** to start your custom project!",
      cards: cards.slice(0, 2),
    };
  }

  // 6. Warranty & Materials
  if (
    q.includes("warranty") ||
    q.includes("guarantee") ||
    q.includes("wood") ||
    q.includes("teak") ||
    q.includes("quality")
  ) {
    return {
      message:
        "**Our Quality & Warranty Guarantee**\n\n" +
        "• **5 to 10-Year Comprehensive Warranty** on all solid teakwood frames and structures.\n" +
        "• **Kiln-Dried Hardwood**: Moisture-controlled wood seasoned to prevent warping, cracking, or termite infestation.\n" +
        "• **Traditional Joinery**: Mortise-and-tenon joinery reinforced with internal corner blocks for lifelong stability.\n" +
        "• **German Hardware**: Heavy-duty pneumatic gas lifts, soft-close hinges, and smooth drawer runners.",
      cards: cards.slice(0, 2),
    };
  }

  // 7. Delivery & Shipping
  if (
    q.includes("delivery") ||
    q.includes("ship") ||
    q.includes("install") ||
    q.includes("return")
  ) {
    return {
      message:
        "**Delivery & Installation Services**\n\n" +
        "• **Complimentary White-Glove Delivery**: Free across Chennai within 2-4 business days, including in-room placement and technician assembly.\n" +
        "• **Pan-India Shipping**: Insured wooden crate transport across Tamil Nadu and all major Indian cities.\n" +
        "• **Hassle-Free Returns**: 7-day transit damage replacement guarantee.",
      cards: [],
    };
  }

  // 8. Contact / Showroom inquiry
  if (
    q.includes("contact") ||
    q.includes("showroom") ||
    q.includes("address") ||
    q.includes("phone") ||
    q.includes("location") ||
    q.includes("visit")
  ) {
    return {
      message:
        "**Visit THE NAKASHI FURNITURES Showroom**\n\n" +
        "📍 **Location**: Chennai, Tamil Nadu, India\n" +
        "⏰ **Showroom Timings**: Monday – Sunday: 10:00 AM – 9:00 PM\n" +
        "📞 **Direct Line**: +91 9043278618\n" +
        "💬 **WhatsApp**: [+91 9043278618](https://wa.me/919043278618)\n" +
        "✉️ **Email**: contact@nakashifurnitures.com\n\n" +
        "We welcome you to visit our showroom to experience the comfort, wood finishes, and craftsmanship in person!",
      cards: [],
    };
  }

  // Default welcome response with bestsellers
  return {
    message:
      "Welcome to **NAKASHI – The Nakashi Furnitures**! I am your personal AI shopping assistant.\n\n" +
      "We handcraft heirloom-quality solid teakwood furniture for living rooms, bedrooms, and dining spaces. How may I assist you today?\n\n" +
      "• Ask for **sofas**, **beds**, or **dining tables**\n" +
      "• Inquire about **custom furniture & bespoke dimensions**\n" +
      "• Learn about our **10-year warranty** and **free white-glove delivery**\n" +
      "• Check our **showroom timings & location**",
    cards: cards.slice(0, 3),
  };
}

/* ------------------------------------------------------------------ */
/*  Main Server Function — POST /api/chat                             */
/* ------------------------------------------------------------------ */

export const chatWithAssistant = createServerFn({ method: "POST" })
  .validator(
    (data: { messages: { role: "user" | "assistant"; content: string }[]; clientId?: string }) => {
      if (!data.messages || !Array.isArray(data.messages) || data.messages.length === 0) {
        throw new Error("Messages are required.");
      }

      // Validate and sanitize each message
      const sanitized = data.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role,
          content: sanitizeInput(m.content),
        }))
        .filter((m) => m.content.length > 0);

      if (sanitized.length === 0) {
        throw new Error("Please enter a message.");
      }

      return {
        messages: sanitized,
        clientId: data.clientId || "anonymous",
      };
    },
  )
  .handler(async ({ data }): Promise<ChatResponse> => {
    try {
      // Rate limiting
      if (!checkRateLimit(data.clientId)) {
        return {
          message: "",
          error: "You're sending messages too quickly. Please wait a moment and try again.",
        };
      }

      // Fetch product catalog for context
      const { context, cards } = await fetchProductCatalogForAI();

      // Check for real Groq API key
      const rawApiKey = process.env["GROQ_API_KEY"];
      const hasRealApiKey = Boolean(
        rawApiKey &&
        rawApiKey !== "your_groq_api_key_here" &&
        !rawApiKey.includes("your_") &&
        rawApiKey.startsWith("gsk_"),
      );

      let aiResponse: string;
      let mentionedProducts: ProductCard[] = [];

      if (hasRealApiKey) {
        try {
          const systemPrompt = buildSystemPrompt(context);
          aiResponse = await callGroqApi(systemPrompt, data.messages);
          mentionedProducts = extractMentionedProducts(aiResponse, cards);
        } catch (apiErr) {
          console.warn("Groq API error, falling back to smart catalog assistant:", apiErr);
          const fallback = generateSmartCatalogResponse(data.messages, cards);
          aiResponse = fallback.message;
          mentionedProducts = fallback.cards;
        }
      } else {
        // Instant response using rich catalog data and NAKASHI brand rules
        const fallback = generateSmartCatalogResponse(data.messages, cards);
        aiResponse = fallback.message;
        mentionedProducts = fallback.cards;
      }

      const result: ChatResponse = {
        message: aiResponse,
      };
      if (mentionedProducts.length > 0) {
        result.productCards = mentionedProducts;
      }
      return result;
    } catch (err: any) {
      console.error("Chat handler error:", err);
      return {
        message: "",
        error:
          err.message ||
          "I'm having trouble connecting right now. Please try again or contact our showroom directly at +91 9043278618.",
      };
    }
  });

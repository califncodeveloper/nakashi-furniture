export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  /** Optional product cards attached to this message */
  productCards?: ProductCard[] | undefined;
}

export interface ProductCard {
  id: string;
  name: string;
  slug?: string | undefined;
  category: string;
  price?: number | undefined;
  originalPrice?: number | undefined;
  image: string;
  description?: string | undefined;
  material?: string | undefined;
  dimensions?: string | undefined;
  warranty?: string | undefined;
  isAvailable?: boolean | undefined;
}

export interface ChatRequest {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  /** Optional: products context injected by the server */
  productContext?: string | undefined;
}

export interface ChatResponse {
  message: string;
  productCards?: ProductCard[] | undefined;
  error?: string | undefined;
}

export interface ConversationState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

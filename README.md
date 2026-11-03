# The Nakashi Furnitures 🛋️

A modern, high-performance luxury furniture e-commerce website and catalog web application built with **TanStack Start**, **React 19**, **Tailwind CSS**, and **Supabase**.

---

## ✨ Features

- **Interactive Furniture Catalog**: Browse premium collections including Sofas, Dining Tables, Beds, Luxury Chairs, Coffee Tables, and Wardrobes with dynamic filtering, sorting, and search.
- **Detailed Product Pages**: Multi-angle product imagery, dimension highlights, material specifications, and related recommendation carousels.
- **Cart & Direct Ordering**: Real-time shopping cart with one-click direct WhatsApp order generation and dynamic order summaries.
- **UPI QR Payment Gateway**: Instant UPI QR code generator compatible with Google Pay, PhonePe, Paytm, and BHIM with customizable payment notes and deep links.
- **AI Design & Sales Assistant**: Integrated chat assistant powered by Groq (LLaMA 3.3) for customer styling advice, product matching, and pricing inquiries.
- **Admin Management Portal**: Secure catalog management to view, add, edit, and publish furniture items directly to Supabase.
- **Smooth Motion & Accessibility**: Powered by Lenis smooth scrolling, Framer Motion animations, and full reduced-motion support.

---

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) + [Vite](https://vitejs.dev/)
- **UI & Components**: [React 19](https://react.dev/), [Radix UI](https://www.radix-ui.com/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons & Animation**: [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/), [Lenis](https://lenis.darkroom.engineering/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **AI Chatbot**: [Groq API](https://console.groq.com/) (LLaMA 3.3 70B Versatile)
- **Validation & State**: [Zod](https://zod.dev/), [TanStack Query](https://tanstack.com/query)

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm**, **pnpm**, or **bun**

### 2. Clone and Install

```bash
git clone https://github.com/califncodeveloper/nakashi-furniture.git
cd nakashi-furniture
npm install
```

### 3. Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Groq API Configuration (Server-Side Only for AI Chatbot)
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile
```

> ⚠️ **Important**: Never commit your `.env` file to version control. It is ignored in `.gitignore`.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) to view the site.

---

## 📜 Available Scripts

| Script              | Description                                        |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Starts the Vite development server with HMR        |
| `npm run build`     | Builds the client and server bundle for production |
| `npm run preview`   | Previews the production build locally              |
| `npm run typecheck` | Runs TypeScript compiler to verify all types       |
| `npm run lint`      | Runs ESLint to check code quality and style        |
| `npm run format`    | Formats all code files with Prettier               |
| `npm run test`      | Runs test suite using Vitest                       |

---

## 🎨 Lovable Synchronization

This project is connected with [Lovable](https://lovable.dev/projects/0aeb6b96-8ea0-4c1b-a414-6699346d880c).

- Commits pushed to `main` sync back to Lovable.
- Avoid force-pushing or rewriting published history on the connected branch to maintain history integrity.

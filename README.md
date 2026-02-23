# 📝 Jotion — Notion Clone

A full-featured, real-time Notion clone built with **Next.js 14**, **TypeScript**, **Convex**, and **Tailwind CSS**. Jotion replicates the core Notion experience — nested documents, rich-text editing, cover images, custom icons, and live collaboration — all in a clean, dark-mode-friendly interface.

🌐 **Live Demo:** [notion-clone-blush-nu.vercel.app](https://notion-clone-blush-nu.vercel.app)

---

## ✨ Features

- 📄 **Infinite Nested Documents** — Create pages within pages just like Notion
- ✏️ **Rich-Text Editor** — Block-based editor with full text formatting support
- 🖼️ **Cover Images & Icons** — Personalize every document with emojis and banners
- 🗑️ **Trash & Restore** — Soft-delete with full restore capability
- 🔄 **Real-Time Sync** — Powered by Convex for live, multi-tab data updates
- 🔐 **Authentication** — Secure sign-in via Clerk
- 🌑 **Dark Mode** — Fully themed with `next-themes`
- 📱 **Responsive Design** — Works seamlessly on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database / Real-time | Convex |
| Authentication | Clerk |
| Styling | Tailwind CSS + shadcn/ui |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ARtoRiAs10/notion-clone.git
cd notion-clone

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the root:

```env
CONVEX_DEPLOYMENT=your_convex_deployment_url
NEXT_PUBLIC_CONVEX_URL=your_convex_public_url

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
```

### Run the Development Server

```bash
# Start Convex backend
npx convex dev

# In a new terminal, start Next.js
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📁 Project Structure

```
notion-clone/
├── app/                  # Next.js App Router pages & layouts
├── components/           # Reusable UI components
│   ├── editor/           # Rich-text editor components
│   ├── modals/           # Cover image, icon, confirm dialogs
│   └── ui/               # shadcn/ui base components
├── convex/               # Convex schema, queries & mutations
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/               # Static assets
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [Apache-2.0 License](./LICENSE).

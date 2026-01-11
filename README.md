# WeShare AI 🚀

<div align="center">
  <h3>Share at the speed of thought.</h3>
  <p>AI-powered, secure, and lightning-fast file sharing platform.</p>
</div>

## ✨ Features

- **⚡ Instant Sharing**: Upload files and get a shareable link in seconds.
- **🔒 Secure Transfer**: Optional password protection and military-grade encryption.
- **🧠 AI Summaries**: (Coming Soon) Auto-generate summaries for documents.
- **👤 User Dashboard**: track your history, manage files, and view stats.
- **🎨 Modern UI**: Beautiful dark-mode glassmorphism design.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS.
- **Backend (Serverless)**: Vercel Functions (Node.js).
- **Storage**: Vercel Blob (Files) & Vercel KV / Redis (Metadata).
- **Deployment**: Vercel.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Vercel CLI (optional, for local serverless dev)

### Local Development (Mock Server)
If you want to run offline without Vercel:
```bash
npm install
node server/index.js  # Starts mock backend on :3001
npm run dev           # Starts frontend on :3000
```

### Local Development (Vercel Mode - Recommended)
To run with real cloud APIs (requires env vars):
```bash
vercel dev
```

## 📦 Deployment

This project is optimized for [Vercel](https://vercel.com).
See **[DEPLOYMENT.md](DEPLOYMENT.md)** for a step-by-step production guide.

## 📄 License

MIT


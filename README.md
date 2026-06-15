<h1 align="center">✨ Full-Stack Realtime Chat App (Mobile + Web + API) ✨</h1>

![Demo App](/web/public/screenshot-for-readme.png)

✨ **Highlights:**

- 📱 Fully Functional Real-Time Chat Mobile App (React Native)
- 💻 Web Chat Application (React) — Same API, Same Features
- 💬 Real-Time Messaging (Built From Scratch — No 3rd Party Services)
- ⌨️ Typing Indicators
- 🟢 Online & Offline Presence
- 🔐 Authentication with Clerk (React, React Native & Express SDKs)
- 🌐 Shared Backend for Mobile & Web
- 🧠 Custom Socket Server (No Firebase / Pusher / Ably)
- 🚀 Backend with Bun, Express, MongoDB & TypeScript
- 📡 Real-Time Events & WebSocket Communication
- 🎨 Clean, Modern & Production-Ready UI
- 📱 Cross-Platform Development (iOS, Android & Web)
- 🛠️ REST API Design & Implementation
- 🧪 Error Monitoring & Crash Reporting with Sentry
- 🚀 Deployment on Sevalla (Live API + Web App)
- 🧰 Real-World Git & GitHub Workflow
- 🌱 Feature Branches, Commits, Pull Requests & Merges
- 🤖 Automated Code Reviews with CodeRabbit
- 🔒 Secure & Scalable Architecture Best Practices
- 📚 Learn React vs React Native by Building a Real Product
- 🎯 From Absolute Beginner to Production-Level Real-Time App

---

## 🧪 `.env` Setup

### 🟦 Backend (`/backend`)

```bash
MONGODB_URI=<YOUR_MONGO_URI>

PORT=3000
NODE_ENV=development

CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PUBLISHABLE_KEY>
CLERK_SECRET_KEY=<YOUR_CLERK_SECRET_KEY>

FRONTEND_URL=http://localhost:5173
```

---

### 🟩 Web Version (/web)

```bash
VITE_CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PUBLISHABLE_KEY>
VITE_API_URL=<YOUR_DEPLOYED_API_URL>

VITE_SENTRY_DSN=<YOUR_SENTRY_DSN>
```

---

### 🟧 Mobile App (/mobile)

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PUBLISHABLE_KEY>

SENTRY_AUTH_TOKEN=<YOUR_SENTRY_AUTH_TOKEN>

```

## 🔧 Run the Backend

```bash

cd backend
npm install
npm run dev
```

---

## 🔧 Run the Admin

```
bash
cd admin
npm install
npm run dev
```

---

## 🔧 Run the Mobile

```
bash
cd mobile
npm install
npx expo start
*And then scan the QR Code from your phone*
```

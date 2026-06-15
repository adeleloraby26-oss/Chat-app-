# Whisper – Supabase Migration Guide

This project has been migrated from **MongoDB + Clerk** to **Supabase (PostgreSQL + Auth)**.

---

## 1. Create a Supabase Project

1. Go to https://supabase.com and create a new project.
2. Note your **Project URL**, **anon key**, and **service_role key** from  
   `Project Settings → API`.

---

## 2. Run the Database Setup

In your Supabase Dashboard → **SQL Editor**, open and run the file:

```
supabase/setup.sql
```

This creates all tables, indexes, RLS policies, and triggers in one shot.

---

## 3. Enable OAuth Providers (optional)

Go to `Authentication → Providers` in the Supabase Dashboard:
- **Google** – paste your Google OAuth Client ID & Secret
- **Apple** – paste your Apple Client ID, Team ID, Key ID & private key

Set the redirect URL to:
- Web: `https://your-domain.com/auth/callback`
- Mobile: `whisper://auth/callback`

---

## 4. Environment Variables

### Backend (`backend/.env`)
```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
NODE_ENV=development
FRONTEND_URL=https://your-frontend.com
```

### Web (`web/.env`)
```env
VITE_API_URL=https://your-backend.com
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Mobile (`mobile/.env`)
```env
EXPO_PUBLIC_API_URL=https://your-backend.com
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 5. Install Dependencies

```bash
# Backend
cd backend && bun install

# Web
cd web && npm install @supabase/supabase-js @supabase/auth-helpers-react

# Mobile
cd mobile && npx expo install @supabase/supabase-js @supabase/auth-helpers-react expo-web-browser expo-auth-session
```

---

## 6. How Auth Works Now

| Before (Clerk) | After (Supabase) |
|---|---|
| `<ClerkProvider>` | `<SessionContextProvider supabaseClient={supabase}>` |
| `useUser()` / `useAuth()` | `useSession()` from `@supabase/auth-helpers-react` |
| `getToken()` | `session.access_token` |
| `clerkMiddleware` on backend | JWT verified via `supabase.auth.getUser(token)` |
| Clerk SSO buttons | `supabase.auth.signInWithOAuth({ provider: 'google' })` |

After sign-in, the client calls `POST /api/auth/callback` once — this upserts
the user's profile into the `public.users` table so the rest of the app can
reference it by UUID.

---

## 7. Database Schema

```
users
  id (uuid PK)
  supabase_uid (uuid, links to auth.users)
  name, email, avatar
  created_at, updated_at

chats
  id (uuid PK)
  participant_1_id → users.id
  participant_2_id → users.id
  last_message_id → messages.id (deferred FK)
  last_message_at
  created_at

messages
  id (uuid PK)
  chat_id → chats.id
  sender_id → users.id
  text
  created_at
```

---

## 8. Files Changed

| File | Change |
|---|---|
| `backend/src/config/database.ts` | MongoDB → Supabase client |
| `backend/src/models/*` | Removed (Mongoose models) |
| `backend/src/types/index.ts` | Added (TypeScript interfaces) |
| `backend/src/middleware/auth.ts` | Clerk → Supabase JWT verification |
| `backend/src/controllers/authController.ts` | Clerk → Supabase Auth, added `/callback` |
| `backend/src/controllers/chatController.ts` | Mongoose → Supabase queries |
| `backend/src/controllers/messageController.ts` | Mongoose → Supabase queries |
| `backend/src/controllers/userController.ts` | Mongoose → Supabase queries |
| `backend/src/utils/socket.ts` | Clerk → Supabase JWT for socket auth |
| `backend/src/app.ts` | Removed `clerkMiddleware`, cleaned up |
| `backend/package.json` | Removed `mongoose`, `@clerk/*`; added `@supabase/supabase-js` |
| `mobile/app/_layout.tsx` | ClerkProvider → SessionContextProvider |
| `mobile/hooks/useSocialAuth.ts` | Clerk SSO → `supabase.auth.signInWithOAuth` |
| `mobile/hooks/useAuth.ts` | Clerk hooks → Supabase session |
| `mobile/lib/axios.ts` | Clerk token → `session.access_token` |
| `mobile/lib/socket.ts` | Clerk token → Supabase session token |
| `mobile/components/AuthSync.tsx` | New – syncs profile on sign-in |
| `web/src/main.jsx` | ClerkProvider → SessionContextProvider |
| `web/src/lib/axios.js` | Clerk token → Supabase interceptor |
| `web/src/lib/socket.js` | Clerk token → Supabase session token |
| `web/src/hooks/useAuth.js` | New – Supabase auth helpers |
| `web/src/hooks/useSocialAuth.js` | New – Supabase OAuth |
| `web/src/pages/AuthCallback.jsx` | New – handles OAuth redirect |
| `supabase/setup.sql` | New – full DB schema + RLS |

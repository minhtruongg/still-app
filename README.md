<<<<<<< HEAD
# Still

Upload your old chats. Talk to them again.

## Folder Structure

```
ghostthemback/
├── app/
│   ├── (auth)/
│   │   ├── login/page.jsx        # Sign in page
│   │   └── signup/page.jsx       # Sign up page
│   ├── (legal)/
│   │   ├── privacy/page.jsx      # Privacy policy
│   │   └── terms/page.jsx        # Terms of service
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.js   # NextAuth handler
│   │   │   └── signup/route.js          # Email signup endpoint
│   │   ├── chat/route.js          # Anthropic API proxy (hides key)
│   │   └── personas/route.js      # Save/get/delete personas
│   ├── dashboard/
│   │   ├── page.jsx               # Protected dashboard (server)
│   │   └── DashboardClient.jsx    # Dashboard UI (client)
│   ├── globals.css
│   ├── layout.jsx
│   ├── page.jsx                   # Landing page
│   └── providers.jsx              # SessionProvider wrapper
├── components/
│   └── ChatApp.jsx                # Full chat flow component
├── lib/
│   ├── auth.js                    # NextAuth config
│   ├── db.js                      # Prisma client singleton
│   └── parsers.js                 # Chat log parsers
├── prisma/
│   └── schema.prisma              # Database schema
├── .env.example                   # Environment variables template
└── package.json
```

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Set up the database

You need a PostgreSQL database. Free options:

- **[Neon](https://neon.tech)** — recommended, serverless Postgres
- **[Supabase](https://supabase.com)** — Postgres + extras
- **[Railway](https://railway.app)** — easy deploy

After getting your connection string, add it to `.env.local` and run:

```bash
npm run db:push
```

### 4. Set up Google OAuth (optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy client ID and secret to `.env.local`

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add all environment variables from `.env.local`
4. Change `NEXTAUTH_URL` to your production domain
5. Add production redirect URI to Google OAuth: `https://yourdomain.com/api/auth/callback/google`
6. Deploy

---

## Tech Stack

- **Next.js 14** — App Router
- **NextAuth v4** — Authentication (credentials + Google OAuth)
- **Prisma** — ORM
- **PostgreSQL** — Database
- **Anthropic Claude** — AI backend
- **bcryptjs** — Password hashing
=======
# still-app
>>>>>>> afb34a233c9cd909fc85bef31a9e1c874efdf1d0

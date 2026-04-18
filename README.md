<<<<<<< HEAD
# AmazCart — Full Stack Amazon Affiliate Site

Built with **Next.js 14**, **Supabase** (database + storage), and **JWT authentication**.

---

## What's included

| Feature | Details |
|---|---|
| Product grid | Category filters, search, featured picks |
| Product detail | Image, description, specs, affiliate button |
| Star ratings | Users rate 1–5 stars when commenting |
| Comments | Anyone can post, admin can delete |
| Admin login | Password-protected, JWT token, persists in localStorage |
| Admin dashboard | Stats, category breakdown, recent comments |
| Add product | Name, description, category, affiliate link, image upload, featured toggle |
| Edit product | Edit any field including image |
| Delete product | Deletes image from storage too |
| Delete comments | From admin comments tab |
| Image upload | Direct to Supabase Storage via secure API |
| Mobile friendly | Responsive grid layout throughout |

---

## Setup in 5 steps

### Step 1 — Clone and install

```bash
# Unzip the project, then:
cd amazcart
npm install
```

### Step 2 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → sign up free
2. Click **New project** → choose a name and region
3. Wait ~2 minutes for it to spin up

### Step 3 — Set up the database

1. In your Supabase project, go to **SQL Editor**
2. Click **New query**
3. Paste the entire contents of `supabase-setup.sql`
4. Click **Run**

### Step 4 — Create Storage bucket

1. Go to **Storage** in Supabase sidebar
2. Click **New bucket**
3. Name it exactly: `product-images`
4. Toggle **Public bucket** ON
5. Click **Create bucket**
6. Go to **Policies** for the bucket → add:
   - `SELECT` for everyone (public reads)
   - `INSERT/UPDATE/DELETE` for service_role

### Step 5 — Configure environment variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in your values:

```env
# Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...   (anon / public key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...       (service_role key — keep secret!)

# You choose these:
ADMIN_PASSWORD=choose-a-strong-password
JWT_SECRET=any-long-random-string-here
```

> **Never commit `.env.local` to git!** It's already in `.gitignore`.

### Step 6 — Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel (free)

1. Push project to a **GitHub repo**
2. Go to [vercel.com](https://vercel.com) → **Import project**
3. Select your repo
4. Under **Environment Variables**, add all 5 variables from your `.env.local`
5. Click **Deploy** — live in ~1 minute!

---

## How to use the admin panel

1. Go to `/admin` on your site
2. Enter your `ADMIN_PASSWORD`
3. You're in! The token is saved for 7 days.

**Dashboard tab** — see total products, comments, and category breakdown

**Products tab** — list all products, search, edit or delete any

**Add product tab** — fill the form, upload an image, set featured, save

**Comments tab** — see all comments across all products, delete spam

---

## Project structure

```
amazcart/
├── app/
│   ├── page.js                    ← Homepage (product grid + hero + search)
│   ├── layout.js
│   ├── globals.css
│   ├── product/[id]/page.js       ← Product detail + star rating comments
│   ├── admin/page.js              ← Full admin panel
│   └── api/
│       ├── products/
│       │   ├── route.js           ← GET all, POST new
│       │   ├── [id]/route.js      ← GET, PUT, DELETE single
│       │   └── upload/route.js    ← Image upload to Supabase Storage
│       ├── comments/
│       │   └── route.js           ← GET, POST, DELETE comments
│       └── admin/
│           ├── login/route.js     ← Password → JWT token
│           └── stats/route.js     ← Dashboard stats
├── components/
│   ├── Navbar.js
│   ├── ProductCard.js
│   └── Toast.js
├── lib/
│   ├── supabase.js                ← Browser Supabase client
│   ├── supabaseAdmin.js           ← Server Supabase client (service role)
│   └── auth.js                    ← JWT sign/verify helpers
├── supabase-setup.sql             ← Run this in Supabase SQL Editor
└── .env.local.example             ← Copy to .env.local and fill in
```

---

## Security notes

- Admin password is stored only in your `.env.local` / Vercel env vars — never in the DB
- JWT tokens expire after 7 days
- All write operations (add/edit/delete product, upload image, delete comment) require a valid JWT
- The Supabase service role key is only used server-side in API routes — never exposed to the browser
- Image uploads are validated for file type server-side
=======
# amazcart
>>>>>>> 684627e9f48639fc6c4c5e9e394dd3247b8b8907

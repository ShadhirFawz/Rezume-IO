# RezumeIO - Supabase Authentication & Database Integration

This directory contains the database schema and instructions for integrating Supabase Authentication with RezumeIO.

---

## 1. Architecture Overview

RezumeIO implements a dual-layer authentication & user management system:
1. **Supabase Auth (`auth.users`)**: Handles user security, session cookies/JWT tokens, password hashing, and OAuth/email verification.
2. **Custom 'users' Table (`public.users`)**: A dedicated table in Supabase Table Editor storing application-level user profiles, roles (`user`, `recruiter`, `admin`), full name, avatar, and timestamps.
3. **Automatic Synchronization**: A PostgreSQL trigger automatically creates and updates records in `public.users` whenever a user registers or updates their credentials in Supabase Auth, with a client-side fallback upsert mechanism in `authService.js`.

---

## 2. Supabase Setup (3 Quick Steps)

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a free project.

### Step 2: Run the Schema in Supabase SQL Editor
1. In your Supabase Dashboard, open the **SQL Editor** tab from the left sidebar.
2. Click **New Query**.
3. Copy and paste the entire contents of [`supabase/schema.sql`](./schema.sql).
4. Click **Run**.
5. Go to the **Table Editor** tab: you will now see the `users` table with Row Level Security (RLS) enabled.

### Step 3: Configure Local Environment Secrets
1. In the Supabase Dashboard, go to **Project Settings** > **API**.
2. Copy your **Project URL** and **anon / public** API key.
3. Open `Frontend/.env.local` in your code editor and populate:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

> **Security Note:** `Frontend/.env.local` is listed in `.gitignore` and will never be committed to public Git repositories.

---

## 3. Frontend Folder Structure

```
Frontend/
├── .env.example              # Git-safe placeholder template
├── .env.local                # Local environment secrets (IGNORED by Git)
├── src/
│   ├── components/
│   │   └── auth/
│   │       ├── AuthModal.jsx        # Tabbed Login, Register & Password Reset modal
│   │       ├── ProfileModal.jsx     # View & edit custom 'users' table profile
│   │       ├── UserProfileMenu.jsx  # Navbar avatar, session menu & guest buttons
│   │       └── ProtectedRoute.jsx   # Role & authentication route guard
│   ├── context/
│   │   └── AuthContext.jsx          # AuthProvider with session listener & state
│   ├── hooks/
│   │   └── useAuth.js               # Clean React hook for auth context
│   ├── lib/
│   │   └── supabaseClient.js        # Supabase client singleton & config validator
│   └── services/
│       └── authService.js           # Decoupled Supabase Auth & 'users' table queries
```

---

## 4. Role-Based Authorization

The `public.users` table stores user roles:
- `user`: Standard candidate/job seeker account.
- `recruiter`: Recruiter or HR reviewer account.
- `admin`: Full administrative access.

Use the `ProtectedRoute` component to restrict features:
```jsx
import ProtectedRoute from './components/auth/ProtectedRoute';

<ProtectedRoute requiredRole="recruiter">
  <RecruiterInsightsDashboard />
</ProtectedRoute>
```


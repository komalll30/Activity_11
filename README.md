# IronNest Gym Membership Management

React, Vite, React Router, and Supabase/PostgreSQL.

## Setup

1. Install dependencies with `npm install`.
2. In PowerShell, run `Copy-Item .env.example .env.local`, then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` to your Supabase project URL and public anon/publishable key. Find them in Supabase Project Settings. Never put a service-role key in this app.
3. In the Supabase Dashboard, open **SQL Editor**, choose **New query**, paste the complete contents of `supabase/schema.sql`, and select **Run**. This creates and seeds memberships and trainers, configures member registration, and enables row-level security.
4. Start the app with `npm run dev`.

Without `.env.local`, pages show a connection message rather than fabricated database records. Restart Vite after changing environment variables.

## Pages

- `/` home and live gym statistics
- `/memberships` searchable plans from Supabase
- `/join` validated member registration
- `/trainers` searchable trainer directory
- `/members` member and membership history
- `/dashboard` live counts and recent registrations

## Security note

The SQL policies are configured for a public college/demo project. Anonymous users can register, and the member directory exposes names, email addresses, and phone numbers because the requested frontend displays them. Do not use this public policy setup for real member data without authentication and stricter access controls.

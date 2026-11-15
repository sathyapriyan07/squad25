# IPL Squad Builder — Supabase Setup

## Configure Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor.
3. Configure Google as an OAuth provider in Supabase Authentication if Google sign-in is needed. Add the app URL and Supabase callback URL to the provider's allowed redirect URLs.
4. Add these values to `.env.local`:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

   Never put a Supabase service-role key in client-side environment variables.

   The migration's final `GRANT` statements provide PostgREST table privileges; RLS policies then control which rows each role can access. If the schema was already created and the app reports `42501` / `permission denied`, run only the `GRANT` statements at the end of the migration in the SQL Editor. Do not rerun the entire migration over an existing schema.

   The migration also creates the public `catalog-images` Storage bucket. If your database schema was already initialized before image uploads were added, run the storage bucket, storage grants, and storage policy statements at the end of the migration once.

## Add catalog data

1. Create a user using the app's registration screen.
2. In the Supabase SQL Editor, grant the account admin access:

   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'your-admin-email@example.com';
   ```

3. Sign in again and open `/admin`.
4. The catalog starts empty. Add seasons and franchises from their administration pages, then add players, eligibility, ratings, and season rules.
5. `/admin/imports` provides header-only `.xlsx` templates for importing your own catalog data.

The app does not load or synchronize bundled sample data. Removing the bundled data does not delete or alter existing rows in your Supabase project.

Catalog records use text identifiers, while Supabase Auth users use UUIDs. Row Level Security protects profiles, squads, comparisons, imports, catalog mutations, and image uploads. Catalog images are publicly readable; only admins can upload, replace, or delete them.

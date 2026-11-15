-- IPL Squad Builder schema for Supabase Auth and Postgres.
-- Catalog identifiers remain TEXT because the app uses stable keys such as
-- "ipl-2025", "csk", and player slugs.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  favorite_team_id TEXT,
  default_season_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, favorite_team_id, default_season_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Manager'),
    NEW.email,
    'csk',
    'ipl-2025'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.seasons (
  id TEXT PRIMARY KEY,
  year INTEGER NOT NULL UNIQUE CHECK (year >= 2008),
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  impact_player_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  banner_url TEXT,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  city TEXT NOT NULL,
  titles INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.season_teams (
  id TEXT PRIMARY KEY,
  season_id TEXT NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  historical_squad_size INTEGER,
  UNIQUE (season_id, team_id)
);

CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  dob DATE,
  nationality TEXT NOT NULL,
  country_flag TEXT NOT NULL DEFAULT 'IN',
  image_url TEXT,
  biography TEXT NOT NULL DEFAULT '',
  primary_role TEXT NOT NULL CHECK (primary_role IN ('WK', 'BAT', 'AR', 'BOWL')),
  secondary_role TEXT,
  batting_style TEXT NOT NULL DEFAULT '',
  bowling_style TEXT NOT NULL DEFAULT '',
  is_capped BOOLEAN NOT NULL DEFAULT TRUE,
  is_wicketkeeper BOOLEAN NOT NULL DEFAULT FALSE,
  is_overseas BOOLEAN NOT NULL DEFAULT FALSE,
  jersey_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.player_seasons (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  season_id TEXT NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  actual_team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  actual_squad_status TEXT NOT NULL DEFAULT 'Active'
    CHECK (actual_squad_status IN ('Active', 'Injured', 'Withdrawn', 'Replacement', 'Available Pool')),
  is_overseas_snapshot BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (player_id, season_id)
);

CREATE TABLE IF NOT EXISTS public.player_statistics (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  season_id TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'career' CHECK (scope IN ('career', 'season')),
  matches INTEGER NOT NULL DEFAULT 0,
  innings_bat INTEGER NOT NULL DEFAULT 0,
  runs INTEGER NOT NULL DEFAULT 0,
  highest_score TEXT NOT NULL DEFAULT '0',
  batting_average NUMERIC(6,2) NOT NULL DEFAULT 0,
  strike_rate NUMERIC(6,2) NOT NULL DEFAULT 0,
  centuries INTEGER NOT NULL DEFAULT 0,
  half_centuries INTEGER NOT NULL DEFAULT 0,
  fours INTEGER NOT NULL DEFAULT 0,
  sixes INTEGER NOT NULL DEFAULT 0,
  innings_bowl INTEGER NOT NULL DEFAULT 0,
  overs NUMERIC(6,1) NOT NULL DEFAULT 0,
  runs_conceded INTEGER NOT NULL DEFAULT 0,
  wickets INTEGER NOT NULL DEFAULT 0,
  economy NUMERIC(5,2) NOT NULL DEFAULT 0,
  bowling_average NUMERIC(6,2) NOT NULL DEFAULT 0,
  bowling_strike_rate NUMERIC(6,2) NOT NULL DEFAULT 0,
  best_bowling TEXT NOT NULL DEFAULT '0/0',
  five_wicket_hauls INTEGER NOT NULL DEFAULT 0,
  catches INTEGER NOT NULL DEFAULT 0,
  run_outs INTEGER NOT NULL DEFAULT 0,
  stumpings INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.player_ratings (
  player_id TEXT PRIMARY KEY REFERENCES public.players(id) ON DELETE CASCADE,
  batting INTEGER NOT NULL DEFAULT 50 CHECK (batting BETWEEN 0 AND 100),
  power_hitting INTEGER NOT NULL DEFAULT 50 CHECK (power_hitting BETWEEN 0 AND 100),
  technique INTEGER NOT NULL DEFAULT 50 CHECK (technique BETWEEN 0 AND 100),
  finishing INTEGER NOT NULL DEFAULT 50 CHECK (finishing BETWEEN 0 AND 100),
  pace_bowling INTEGER NOT NULL DEFAULT 0 CHECK (pace_bowling BETWEEN 0 AND 100),
  spin_bowling INTEGER NOT NULL DEFAULT 0 CHECK (spin_bowling BETWEEN 0 AND 100),
  wicketkeeping INTEGER NOT NULL DEFAULT 0 CHECK (wicketkeeping BETWEEN 0 AND 100),
  fielding INTEGER NOT NULL DEFAULT 60 CHECK (fielding BETWEEN 0 AND 100),
  overall INTEGER NOT NULL DEFAULT 50 CHECK (overall BETWEEN 0 AND 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.season_rules (
  season_id TEXT PRIMARY KEY REFERENCES public.seasons(id) ON DELETE CASCADE,
  min_squad_size INTEGER NOT NULL DEFAULT 18,
  max_squad_size INTEGER NOT NULL DEFAULT 25,
  max_overseas INTEGER NOT NULL DEFAULT 8,
  playing_xi_size INTEGER NOT NULL DEFAULT 11,
  max_overseas_in_xi INTEGER NOT NULL DEFAULT 4,
  min_indian_players INTEGER NOT NULL DEFAULT 10,
  impact_player_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  max_substitutes INTEGER NOT NULL DEFAULT 5,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.custom_squads (
  id TEXT PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  season_id TEXT NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  player_ids TEXT[] NOT NULL DEFAULT '{}',
  playing_xi_ids TEXT[] NOT NULL DEFAULT '{}',
  substitute_ids TEXT[] NOT NULL DEFAULT '{}',
  captain_id TEXT,
  vice_captain_id TEXT,
  wicketkeeper_id TEXT,
  impact_player JSONB NOT NULL DEFAULT '{"nomineeId": null, "replacesPlayerId": null}',
  ratings JSONB NOT NULL DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  share_slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.squad_shares (
  share_slug TEXT PRIMARY KEY,
  squad_id TEXT NOT NULL REFERENCES public.custom_squads(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.squad_comparisons (
  id TEXT PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  season_id TEXT NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  squad_ids TEXT[] NOT NULL DEFAULT '{}',
  combined_xi_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.import_logs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('players', 'eligibility', 'statistics')),
  file_name TEXT NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  imported_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,
  imported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_player_seasons_season ON public.player_seasons(season_id);
CREATE INDEX IF NOT EXISTS idx_player_statistics_player ON public.player_statistics(player_id);
CREATE INDEX IF NOT EXISTS idx_custom_squads_owner ON public.custom_squads(owner_id);
CREATE INDEX IF NOT EXISTS idx_squad_shares_squad ON public.squad_shares(squad_id);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_at ON public.import_logs(created_at DESC);

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_seasons_updated ON public.seasons;
CREATE TRIGGER trg_seasons_updated BEFORE UPDATE ON public.seasons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_teams_updated ON public.teams;
CREATE TRIGGER trg_teams_updated BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_players_updated ON public.players;
CREATE TRIGGER trg_players_updated BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_custom_squads_updated ON public.custom_squads;
CREATE TRIGGER trg_custom_squads_updated BEFORE UPDATE ON public.custom_squads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_squad_comparisons_updated ON public.squad_comparisons;
CREATE TRIGGER trg_squad_comparisons_updated BEFORE UPDATE ON public.squad_comparisons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own profile or admin" ON public.profiles;
CREATE POLICY "Read own profile or admin" ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "Create own profile" ON public.profiles;
CREATE POLICY "Create own profile" ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid() AND role = 'user');
DROP POLICY IF EXISTS "Update own profile or admin" ON public.profiles;
CREATE POLICY "Update own profile or admin" ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK ((id = auth.uid() AND role = 'user') OR public.is_admin());

CREATE POLICY "Public read seasons" ON public.seasons FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage seasons" ON public.seasons FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Public read teams" ON public.teams FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage teams" ON public.teams FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Public read season teams" ON public.season_teams FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage season teams" ON public.season_teams FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Public read players" ON public.players FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage players" ON public.players FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Public read player seasons" ON public.player_seasons FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage player seasons" ON public.player_seasons FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Public read player statistics" ON public.player_statistics FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage player statistics" ON public.player_statistics FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Public read player ratings" ON public.player_ratings FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage player ratings" ON public.player_ratings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Public read season rules" ON public.season_rules FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage season rules" ON public.season_rules FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Read own public or admin squads" ON public.custom_squads FOR SELECT
  USING (owner_id = auth.uid() OR visibility = 'public' OR public.is_admin());
CREATE POLICY "Manage own squads" ON public.custom_squads FOR ALL
  USING (owner_id = auth.uid() OR public.is_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Read active squad shares" ON public.squad_shares FOR SELECT USING (is_active OR public.is_admin());
CREATE POLICY "Manage owned squad shares" ON public.squad_shares FOR ALL
  USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.custom_squads s WHERE s.id = squad_id AND s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.custom_squads s WHERE s.id = squad_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Manage own comparisons" ON public.squad_comparisons FOR ALL
  USING (owner_id = auth.uid() OR public.is_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admin manage import logs" ON public.import_logs FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PostgreSQL grants are required in addition to RLS policies.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON
  public.seasons,
  public.teams,
  public.season_teams,
  public.players,
  public.player_seasons,
  public.player_statistics,
  public.player_ratings,
  public.season_rules,
  public.squad_shares
TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.seasons,
  public.teams,
  public.season_teams,
  public.players,
  public.player_seasons,
  public.player_statistics,
  public.player_ratings,
  public.season_rules,
  public.custom_squads,
  public.squad_shares,
  public.squad_comparisons,
  public.import_logs
TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Public catalog images with uploads restricted to admins.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'catalog-images',
  'catalog-images',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

DROP POLICY IF EXISTS "Public read catalog images" ON storage.objects;
CREATE POLICY "Public read catalog images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'catalog-images');

DROP POLICY IF EXISTS "Admin upload catalog images" ON storage.objects;
CREATE POLICY "Admin upload catalog images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'catalog-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin update catalog images" ON storage.objects;
CREATE POLICY "Admin update catalog images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'catalog-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'catalog-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin delete catalog images" ON storage.objects;
CREATE POLICY "Admin delete catalog images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'catalog-images' AND public.is_admin());

NOTIFY pgrst, 'reload schema';

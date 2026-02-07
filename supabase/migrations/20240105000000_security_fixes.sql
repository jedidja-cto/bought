-- 1. Secure the handle_new_user function by setting a fixed search_path
-- This prevents malicious users from hijacking the search path to execute arbitrary code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Move pg_trgm extension to a dedicated schema if it exists in public
-- This keeps the public schema clean and secure
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on the new schema so users can still use the functions
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Move the extension (Using DO block to handle if it doesn't exist smoothly, though we know it likely does)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        ALTER EXTENSION pg_trgm SET SCHEMA extensions;
    END IF;
END
$$;

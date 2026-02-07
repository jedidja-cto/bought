-- Revoke dangerous permissions granted in initial migration
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

-- Grant minimal required permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to specific tables based on RLS policies
-- Note: RLS is already enabled on these tables, so we can grant SELECT/INSERT/UPDATE/DELETE
-- and let RLS handle the row-level restriction.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.images TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO anon, authenticated;

-- Grant usage on sequences (required for auto-incrementing IDs if used, though we use UUIDs mostly)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

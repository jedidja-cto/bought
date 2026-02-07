-- Revoke all overly permissive grants first
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

-- Grant minimal necessary permissions
-- Allow usage of the schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Allow access to tables (RLS will still enforce row-level access)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Allow access to sequences (needed for auto-incrementing IDs if any, mostly for UUIDs it's fine but good for future)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- We typically don't need to grant execute on all routines to anon/authenticated unless specific RPCs are used.
-- If you use specific functions, grant EXECUTE on them individually.

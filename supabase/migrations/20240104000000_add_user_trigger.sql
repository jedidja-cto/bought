-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, avatar_url)
  VALUES (
    new.id,
    new.email,
    -- Use username from metadata if available, otherwise default to email prefix
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    -- Use avatar_url from metadata if available (for OAuth)
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
-- Drop if exists to avoid errors on re-runs (though usually we just create)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

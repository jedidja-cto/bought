-- Allow users to create their own profile
-- This is necessary for the registration flow where the client inserts the profile
CREATE POLICY "Users can create their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

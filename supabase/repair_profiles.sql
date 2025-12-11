-- Sync Profiles from Auth Users
-- Run this to restore profiles for users who already exist in Authentication but lost their profile record.

INSERT INTO public.profiles (id, full_name, role)
SELECT 
    id, 
    raw_user_meta_data->>'full_name', 
    COALESCE(raw_user_meta_data->>'role', 'customer')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

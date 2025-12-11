-- Run this in your Supabase SQL Editor to fix the "Could not find column" error

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE;

-- Force schema cache reload (Supabase sometimes caches schema structure)
NOTIFY pgrst, 'reload schema';

-- Drop the old insecure RPC functions for resolving emails
DROP FUNCTION IF EXISTS public.get_user_email_by_username(p_username TEXT, p_password TEXT);
DROP FUNCTION IF EXISTS public.get_user_email_by_username(p_username TEXT);

-- Ensure profiles table has username and is unique
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the Sundar profile mapping
INSERT INTO public.profiles (id, username, display_name)
VALUES ('a8ae9a36-ba0f-4986-b74a-4bf2acb41f90', 'sundar', 'Sundar')
ON CONFLICT (id) DO UPDATE SET username = 'sundar';

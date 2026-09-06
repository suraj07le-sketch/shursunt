-- Create verification_tokens table for pre-signup OTP verification
CREATE TABLE IF NOT EXISTS public.verification_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Ensure profiles table has verified boolean column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- Create index for fast lookup of tokens by user_id and token code
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_token ON public.verification_tokens (user_id, token);

-- Enable Row Level Security (RLS) on verification_tokens
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

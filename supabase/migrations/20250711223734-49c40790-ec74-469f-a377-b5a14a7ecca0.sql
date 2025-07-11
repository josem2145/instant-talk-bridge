-- Enable realtime for messages and conversations tables
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Update profiles table to auto-update last_seen
CREATE OR REPLACE FUNCTION public.update_user_last_seen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET last_seen = now(), status = 'online'
  WHERE user_id = auth.uid();
  RETURN NULL;
END;
$$;

-- Create trigger to update last_seen when user is active
CREATE OR REPLACE FUNCTION public.handle_user_activity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET last_seen = now(), status = 'online'
  WHERE user_id = auth.uid();
END;
$$;
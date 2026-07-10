
CREATE TABLE IF NOT EXISTS public.duvidas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  answer_text text,
  answered_by uuid REFERENCES auth.users(id),
  answered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.duvidas TO authenticated;
GRANT ALL ON public.duvidas TO service_role;

ALTER TABLE public.duvidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all questions"
  ON public.duvidas FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' = 'samuel@amplifyugc.co');

CREATE POLICY "Students can view public or own questions"
  ON public.duvidas FOR SELECT TO authenticated
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Students can insert own questions"
  ON public.duvidas FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update own questions"
  ON public.duvidas FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any question"
  ON public.duvidas FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'samuel@amplifyugc.co')
  WITH CHECK (auth.jwt() ->> 'email' = 'samuel@amplifyugc.co');

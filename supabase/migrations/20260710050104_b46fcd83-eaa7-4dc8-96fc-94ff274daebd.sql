
CREATE OR REPLACE FUNCTION public.duvidas_guard_answer_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean := (auth.jwt() ->> 'email') = 'samuel@amplifyugc.co';
BEGIN
  IF is_admin THEN
    RETURN NEW;
  END IF;

  IF NEW.status       IS DISTINCT FROM OLD.status
  OR NEW.answer_text  IS DISTINCT FROM OLD.answer_text
  OR NEW.answered_by  IS DISTINCT FROM OLD.answered_by
  OR NEW.answered_at  IS DISTINCT FROM OLD.answered_at THEN
    RAISE EXCEPTION 'Somente administradores podem alterar os campos de resposta desta dúvida.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS duvidas_guard_answer_fields_trg ON public.duvidas;
CREATE TRIGGER duvidas_guard_answer_fields_trg
BEFORE UPDATE ON public.duvidas
FOR EACH ROW EXECUTE FUNCTION public.duvidas_guard_answer_fields();

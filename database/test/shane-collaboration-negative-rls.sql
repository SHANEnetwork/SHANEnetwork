-- SHANE Test negative RLS assertions. Requires isolated synthetic fixtures.
-- Each expected denial is caught in a PL/pgSQL exception subtransaction.
-- Unexpected successful writes fail the script; all changes roll back.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
DO $$
DECLARE denied boolean := false;
BEGIN
 BEGIN
  INSERT INTO public.shane_collaboration_messages(request_id,sender_id,body)
  VALUES ('88888888-8888-4888-8888-888888888888','33333333-3333-4333-8333-333333333333','Outsider test');
 EXCEPTION WHEN insufficient_privilege THEN denied := true;
 END;
 IF NOT denied THEN RAISE EXCEPTION 'Outsider message insertion was allowed'; END IF;
END $$;
ROLLBACK;
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
DO $$
DECLARE denied boolean := false;
BEGIN
 BEGIN
  INSERT INTO public.shane_collaboration_messages(request_id,sender_id,body)
  VALUES ('88888888-8888-4888-8888-888888888888','11111111-1111-4111-8111-111111111111','Impersonation test');
 EXCEPTION WHEN insufficient_privilege THEN denied := true;
 END;
 IF NOT denied THEN RAISE EXCEPTION 'Sender impersonation was allowed'; END IF;
END $$;
ROLLBACK;

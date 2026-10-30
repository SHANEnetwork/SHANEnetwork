-- SHANE TEST ONLY: run with psql -v ON_ERROR_STOP=1 -f database/test/shane-collaboration-rls-regression.sql
-- Requires the synthetic fixtures installed in isolated SHANE Test, never production.
-- All updates and messages are rolled back. Assertions raise an exception on failure.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.shane_collaboration_messages WHERE request_id='88888888-8888-4888-8888-888888888888') <> 1 THEN RAISE EXCEPTION 'Owner message read failed'; END IF;
 IF (SELECT count(*) FROM public.shane_collaboration_tasks WHERE request_id='88888888-8888-4888-8888-888888888888') <> 1 THEN RAISE EXCEPTION 'Owner task read failed'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
UPDATE public.shane_collaboration_tasks SET completed=true WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
DO $$ BEGIN
 IF NOT (SELECT completed FROM public.shane_collaboration_tasks WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') THEN RAISE EXCEPTION 'Collaborator task edit failed'; END IF;
END $$;
INSERT INTO public.shane_collaboration_messages(request_id,sender_id,body)
VALUES ('88888888-8888-4888-8888-888888888888','22222222-2222-4222-8222-222222222222','Synthetic regression message');
DO $$ BEGIN
 IF (SELECT count(*) FROM public.shane_collaboration_messages WHERE request_id='88888888-8888-4888-8888-888888888888') <> 2 THEN RAISE EXCEPTION 'Collaborator send failed'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.shane_collaboration_messages WHERE request_id='88888888-8888-4888-8888-888888888888') THEN RAISE EXCEPTION 'Outsider can read messages'; END IF;
 IF EXISTS(SELECT 1 FROM public.shane_collaboration_tasks WHERE request_id='88888888-8888-4888-8888-888888888888') THEN RAISE EXCEPTION 'Outsider can read tasks'; END IF;
 IF EXISTS(SELECT 1 FROM public.shane_collaboration_overviews WHERE request_id='88888888-8888-4888-8888-888888888888') THEN RAISE EXCEPTION 'Outsider can read overview'; END IF;
END $$;
ROLLBACK;
-- Negative INSERT tests must be run as separate transactions, expecting SQLSTATE 42501:
-- outsider message insertion, outsider impersonation, collaborator impersonation.

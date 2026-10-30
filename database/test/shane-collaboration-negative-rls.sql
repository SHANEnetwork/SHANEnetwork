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
-- Reject empty messages even from an accepted participant.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
DO $$
DECLARE denied boolean := false;
BEGIN
 BEGIN
  INSERT INTO public.shane_collaboration_messages(request_id,sender_id,body)
  VALUES ('88888888-8888-4888-8888-888888888888','22222222-2222-4222-8222-222222222222','');
 EXCEPTION WHEN insufficient_privilege OR check_violation THEN denied := true;
 END;
 IF NOT denied THEN RAISE EXCEPTION 'Empty collaboration message was allowed'; END IF;
END $$;
ROLLBACK;
-- Reject oversized messages from an accepted participant.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
DO $$
DECLARE denied boolean := false;
BEGIN
 BEGIN
  INSERT INTO public.shane_collaboration_messages(request_id,sender_id,body)
  VALUES ('88888888-8888-4888-8888-888888888888','22222222-2222-4222-8222-222222222222',repeat('x',4001));
 EXCEPTION WHEN insufficient_privilege OR check_violation THEN denied := true;
 END;
 IF NOT denied THEN RAISE EXCEPTION 'Oversized collaboration message was allowed'; END IF;
END $$;
ROLLBACK;
-- An accepted collaborator cannot assign a task to an outsider.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
DO $$
DECLARE denied boolean := false;
BEGIN
 BEGIN
  UPDATE public.shane_collaboration_tasks
  SET assignee_id='33333333-3333-4333-8333-333333333333'
  WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 EXCEPTION WHEN insufficient_privilege OR check_violation THEN denied := true;
 END;
 IF NOT denied THEN RAISE EXCEPTION 'Task assignment to outsider was allowed'; END IF;
END $$;
ROLLBACK;
-- Task creator identity is immutable to authenticated collaborators.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
DO $$
DECLARE denied boolean := false;
BEGIN
 BEGIN
  UPDATE public.shane_collaboration_tasks
  SET creator_id='22222222-2222-4222-8222-222222222222'
  WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 EXCEPTION WHEN insufficient_privilege THEN denied := true;
 END;
 IF NOT denied THEN RAISE EXCEPTION 'Task creator identity could be rewritten'; END IF;
END $$;
ROLLBACK;
-- An accepted invitation cannot be rewritten to substitute another sender.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
DO $$
DECLARE denied boolean := false;
BEGIN
 BEGIN
  UPDATE public.shane_collaboration_requests
  SET sender_id='33333333-3333-4333-8333-333333333333'
  WHERE id='88888888-8888-4888-8888-888888888888';
 EXCEPTION WHEN raise_exception OR insufficient_privilege OR check_violation THEN denied := true;
 END;
 IF NOT denied THEN RAISE EXCEPTION 'Accepted invitation sender identity could be rewritten'; END IF;
END $$;
ROLLBACK;
-- A completed invitation cannot be changed to a different response.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
DO $$
DECLARE denied boolean := false;
BEGIN
 BEGIN
  UPDATE public.shane_collaboration_requests
  SET status='declined'
  WHERE id='88888888-8888-4888-8888-888888888888';
 EXCEPTION WHEN raise_exception OR insufficient_privilege OR check_violation THEN denied := true;
 END;
 IF NOT denied THEN RAISE EXCEPTION 'Accepted invitation could be declined after completion'; END IF;
END $$;
ROLLBACK;

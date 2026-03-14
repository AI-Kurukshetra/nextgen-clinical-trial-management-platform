-- Remove legacy study_team policies to prevent recursion/conflicts.

DROP POLICY IF EXISTS "Admins manage study team" ON public.study_team;
DROP POLICY IF EXISTS "Users view own membership" ON public.study_team;
DROP POLICY IF EXISTS "Managers manage study team" ON public.study_team;
DROP POLICY IF EXISTS "Creators can add self as manager" ON public.study_team;

-- ══════════════════════════════════════════
-- FIX: Proper RLS for sensitive tables
-- ══════════════════════════════════════════

-- workout_plans: admin can do all, client sees only their own
drop policy if exists "Allow all workout_plans" on public.workout_plans;
create policy "Admin or own workout_plans" on public.workout_plans
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (select 1 from public.clients c where c.id = workout_plans.client_id and c.auth_user_id = auth.uid())
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (select 1 from public.clients c where c.id = workout_plans.client_id and c.auth_user_id = auth.uid())
  );

-- nutrition_plans: same pattern
drop policy if exists "Allow all nutrition_plans" on public.nutrition_plans;
create policy "Admin or own nutrition_plans" on public.nutrition_plans
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (select 1 from public.clients c where c.id = nutrition_plans.client_id and c.auth_user_id = auth.uid())
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (select 1 from public.clients c where c.id = nutrition_plans.client_id and c.auth_user_id = auth.uid())
  );

-- client_messages: admin can do all, client sees only their own
drop policy if exists "Allow all client_messages" on public.client_messages;
create policy "Admin or own client_messages" on public.client_messages
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (select 1 from public.clients c where c.id = client_messages.client_id and c.auth_user_id = auth.uid())
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (select 1 from public.clients c where c.id = client_messages.client_id and c.auth_user_id = auth.uid())
  );

-- competitor_reels + dm_templates: admin only (no client access needed)
drop policy if exists "Allow all competitor_reels" on public.competitor_reels;
create policy "Admin only competitor_reels" on public.competitor_reels
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Allow all dm_templates" on public.dm_templates;
create policy "Admin only dm_templates" on public.dm_templates
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

notify pgrst, 'reload schema';

-- =========================================================================
-- Admin 可更新任何人的 profile（角色/單位管理用）
-- 原有 profiles_update_self 保留，RLS 政策為 OR 關係
-- =========================================================================

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

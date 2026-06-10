import { isSupabaseEnabled } from './supabaseClient';
import { pushProject } from './cloudSync';

/**
 * 將既有 localStorage 機種一次性上傳到 Supabase(雲端為空時的初次遷移)。
 * 回傳成功遷移的筆數。
 */
export async function migrateLocalProjects(workspace, localProjects) {
  if (!isSupabaseEnabled || !Array.isArray(localProjects) || localProjects.length === 0) return 0;
  let migrated = 0;
  for (const p of localProjects) {
    try {
      await pushProject(workspace, p);
      migrated += 1;
    } catch (e) {
      console.warn('[migrate] 機種遷移失敗:', p?.id, e);
    }
  }
  return migrated;
}

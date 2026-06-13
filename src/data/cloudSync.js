import { supabase, isSupabaseEnabled } from './supabaseClient';

/* 前端 project ⇄ projects 資料表的對應 */
const toRow = (p, workspace, userId) => ({
  id: p.id,
  name: p.name,
  data: p.data ?? {},
  original_wb: p.originalWbBase64 ?? null,
  alignment_rate: p.alignmentRate ?? 0,
  workspace,
  updated_by: userId ?? null,
});

const fromRow = (r) => ({
  id: r.id,
  name: r.name,
  data: r.data ?? {},
  originalWbBase64: r.original_wb ?? '',
  alignmentRate: r.alignment_rate ?? 0,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  updatedBy: r.updated_by ?? null,
});

const normalizeFactoryName = (name) => String(name || '').trim();

const fromFactoryRow = (r) => ({
  id: r.id,
  name: normalizeFactoryName(r.name),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  updatedBy: r.updated_by ?? null,
});

/** 拉取某工作區的全部機種(Supabase 未啟用回傳 null,呼叫端沿用本機資料) */
export async function pullProjects(workspace) {
  if (!isSupabaseEnabled) return null;
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace', workspace)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

/** 上推單一機種(upsert)。userId 用於標記更新者,讓即時訂閱可過濾自己的回音 */
export async function pushProject(workspace, project, userId) {
  if (!isSupabaseEnabled || !project?.id) return;
  const { error } = await supabase.from('projects').upsert(toRow(project, workspace, userId));
  if (error) throw error;
}

/** 雲端刪除 */
export async function deleteProjectRemote(id) {
  if (!isSupabaseEnabled || !id) return;
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

/** 拉取全系統共用的委外加工廠主檔 */
export async function pullFactories() {
  if (!isSupabaseEnabled) return null;
  const { data, error } = await supabase
    .from('factories')
    .select('*')
    .order('created_at', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data.map((row) => fromFactoryRow(row).name).filter(Boolean);
}

/** 將既有本機加工廠清單一次性遷移到共用雲端主檔 */
export async function migrateFactories(factories, userId) {
  if (!isSupabaseEnabled || !Array.isArray(factories)) return [];
  const names = Array.from(new Set(factories.map(normalizeFactoryName).filter(Boolean)));
  if (names.length === 0) return [];
  const rows = names.map((name) => ({ name, updated_by: userId ?? null }));
  const { data, error } = await supabase
    .from('factories')
    .upsert(rows, { onConflict: 'name' })
    .select('*');
  if (error) throw error;
  return data.map((row) => fromFactoryRow(row).name).filter(Boolean);
}

/** 新增或確認一筆委外加工廠主檔 */
export async function addFactoryRemote(name, userId) {
  if (!isSupabaseEnabled) return normalizeFactoryName(name);
  const trimmed = normalizeFactoryName(name);
  if (!trimmed) return '';
  const { data, error } = await supabase
    .from('factories')
    .upsert({ name: trimmed, updated_by: userId ?? null }, { onConflict: 'name' })
    .select('*')
    .single();
  if (error) throw error;
  return fromFactoryRow(data).name;
}

/** 刪除一筆委外加工廠主檔 */
export async function deleteFactoryRemote(name) {
  if (!isSupabaseEnabled) return;
  const trimmed = normalizeFactoryName(name);
  if (!trimmed) return;
  const { error } = await supabase.from('factories').delete().eq('name', trimmed);
  if (error) throw error;
}

/**
 * 訂閱某工作區機種的即時變更(P3)。
 * onChange 收到 { eventType, new, old };回傳取消訂閱函式。
 */
export function subscribeProjects(workspace, onChange) {
  if (!isSupabaseEnabled) return () => {};
  const channel = supabase
    .channel(`projects:${workspace}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'projects', filter: `workspace=eq.${workspace}` },
      (payload) => onChange({ eventType: payload.eventType, new: payload.new ? fromRow(payload.new) : null, old: payload.old }),
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

/**
 * 訂閱全系統共用的委外加工廠主檔變更。
 * onChange 收到 { eventType, new, old };回傳取消訂閱函式。
 */
export function subscribeFactories(onChange) {
  if (!isSupabaseEnabled) return () => {};
  const channel = supabase
    .channel('factories:shared')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'factories' },
      (payload) => onChange({
        eventType: payload.eventType,
        new: payload.new ? fromFactoryRow(payload.new) : null,
        old: payload.old ? fromFactoryRow(payload.old) : null,
      }),
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

/**
 * 在線狀態(presence):同一機種有哪些人正在檢視。
 * onSync 收到 user 陣列;回傳取消訂閱函式。
 */
export function subscribePresence(channelName, meta, onSync) {
  if (!isSupabaseEnabled) return () => {};
  const channel = supabase.channel(channelName, { config: { presence: { key: meta.key || 'anon' } } });
  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      onSync(Object.values(state).flat());
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        try { await channel.track(meta); }
        catch (e) { if (import.meta.env.DEV) console.warn('[presence] track 失敗', e); }
      }
    });
  return () => { supabase.removeChannel(channel); };
}

export { fromRow, toRow, fromFactoryRow };

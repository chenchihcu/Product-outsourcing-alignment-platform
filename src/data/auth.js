import { supabase, isSupabaseEnabled } from './supabaseClient';

/* Supabase session + profile → App 的 currentUser 形狀 */
function toCurrentUser(profile, user) {
  return {
    id: user?.id,
    email: user?.email,
    username: profile?.username || user?.email || '',
    unit: profile?.unit || '',
    role: profile?.role || 'rd',
    level: profile?.level || '',
    signature: profile?.signature || null,
  };
}

/** 以 email/密碼登入,回傳 currentUser */
export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return getCurrentUser();
}

/** 註冊新帳號(角色/單位寫入 user metadata,trigger 會建立 profile) */
export async function signUp({ email, password, username, unit, role, level }) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, unit, role, level } },
  });
  if (error) throw error;
}

export async function signOut() {
  if (isSupabaseEnabled) {
    try { await supabase.auth.signOut(); } catch { /* 忽略登出錯誤 */ }
  }
}

/** 從現有 session 還原 currentUser(無 session 回傳 null) */
export async function getCurrentUser() {
  if (!isSupabaseEnabled) return null;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();
  return toCurrentUser(profile, session.user);
}

/** 更新本人簽章到 profile */
export async function updateMySignature(signature) {
  if (!isSupabaseEnabled) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  await supabase.from('profiles').update({ signature }).eq('id', session.user.id);
}

/** 監聽登入狀態變化(回傳取消訂閱) */
export function onAuthChange(cb) {
  if (!isSupabaseEnabled) return () => {};
  const { data } = supabase.auth.onAuthStateChange(() => { cb(); });
  return () => data.subscription.unsubscribe();
}

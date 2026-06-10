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

// =========================================================================
// Admin 專用：使用者管理（須搭配 invite-user Edge Function + admin RLS）
// =========================================================================

/** 以 Edge Function 邀請新使用者（service_role 隔在伺服器端） */
export async function inviteUser({ email, username, unit, role, level }) {
  if (!isSupabaseEnabled) throw new Error('雲端模式未啟用');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('請先登入');

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, username, unit, role, level }),
    },
  );
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || '邀請失敗');
  return payload;
}

/** 取得所有使用者的 profile（admin RLS 允許讀取） */
export async function listAllProfiles() {
  if (!isSupabaseEnabled) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

/** 更新指定使用者的 profile 欄位（須 admin RLS） */
export async function updateUserProfile(userId, updates) {
  if (!isSupabaseEnabled) return;
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
}

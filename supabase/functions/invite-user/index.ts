import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: '未提供授權標頭' }, 401);

    // 以呼叫者 token 建立 client，驗證身分與角色
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authErr } = await supabaseUser.auth.getUser();
    if (authErr || !user) return json({ error: '身分驗證失敗' }, 401);

    const { data: callerProfile } = await supabaseUser
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (callerProfile?.role !== 'admin') {
      return json({ error: '僅系統管理員可邀請使用者' }, 403);
    }

    // 解析 body
    const { email, username, unit, role, level } = await req.json();
    if (!email || !role) return json({ error: '缺少必要欄位：email、role' }, 400);

    // 以 service_role 執行實際邀請（傳入 metadata，trigger 建 profile 時使用）
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        username: username || email.split('@')[0],
        unit: unit ?? '',
        role,
        level: level ?? '',
      },
    });

    if (error) throw error;

    return json({ success: true, userId: data.user.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '邀請失敗';
    return json({ error: msg }, 500);
  }
});

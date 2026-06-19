import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const REQUIRED_ACK = 'QA_TEST_ONLY_WITH_BACKUP';
const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const accountSpecs = {
  rd: [process.env.QA_RD_EMAIL, process.env.QA_RD_PASSWORD],
  eng: [process.env.QA_ENG_EMAIL, process.env.QA_ENG_PASSWORD],
  qa: [process.env.QA_QA_EMAIL, process.env.QA_QA_PASSWORD],
  admin: [process.env.QA_ADMIN_EMAIL, process.env.QA_ADMIN_PASSWORD],
};

function requireValue(value, name) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

if (process.env.ALLOW_PRODUCTION_SECURITY_AUDIT !== REQUIRED_ACK) {
  throw new Error(`Refusing remote writes. Set ALLOW_PRODUCTION_SECURITY_AUDIT=${REQUIRED_ACK} after backup.`);
}
requireValue(url, 'VITE_SUPABASE_URL');
requireValue(anonKey, 'VITE_SUPABASE_ANON_KEY');
for (const [role, [email, password]] of Object.entries(accountSpecs)) {
  requireValue(email, `QA_${role.toUpperCase()}_EMAIL`);
  requireValue(password, `QA_${role.toUpperCase()}_PASSWORD`);
}

const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const defaultProjectId = `QA_TEST_SECURITY_DEFAULT_${stamp}`;
const adminProjectId = `QA_TEST_SECURITY_ADMIN_${stamp}`;
const deniedAdminProjectId = `${adminProjectId}_DENIED`;
const factoryName = `QA_TEST_SECURITY_FACTORY_${stamp}`;
const deniedFactoryName = `${factoryName}_DENIED`;
const clients = {};
const users = {};
const profileSnapshots = {};
let passed = 0;
let failed = 0;
let baselineCounts = null;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function step(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`  ✗ ${name}: ${error.message}`);
  }
}

async function login(role, email, password) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw error || new Error(`${role} login returned no user`);
  clients[role] = client;
  users[role] = data.user;
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('id, username, unit, role, level, signature')
    .eq('id', data.user.id)
    .single();
  if (profileError) throw profileError;
  if (profile.role !== role) throw new Error(`${role} account has profile role ${profile.role}`);
  profileSnapshots[role] = profile;
}

async function cleanup() {
  const admin = clients.admin;
  if (admin) {
    await admin.from('projects').delete().in('id', [defaultProjectId, adminProjectId, deniedAdminProjectId]);
    await admin.from('factories').delete().in('name', [factoryName, deniedFactoryName]);
    for (const [role, snapshot] of Object.entries(profileSnapshots)) {
      await admin.from('profiles').update({
        username: snapshot.username,
        unit: snapshot.unit,
        role: snapshot.role,
        level: snapshot.level,
        signature: snapshot.signature,
      }).eq('id', users[role].id);
    }
  }
}

async function getAdminVisibleCounts() {
  const admin = clients.admin;
  const [projects, factories, profiles] = await Promise.all([
    admin.from('projects').select('*', { count: 'exact', head: true }),
    admin.from('factories').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
  ]);
  for (const result of [projects, factories, profiles]) {
    if (result.error) throw result.error;
  }
  return { projects: projects.count, factories: factories.count, profiles: profiles.count };
}

console.log('\n── Production Supabase security matrix (QA_TEST only) ──');

try {
  for (const [role, [email, password]] of Object.entries(accountSpecs)) {
    await login(role, email, password);
  }
  baselineCounts = await getAdminVisibleCounts();

  await step('non-admin cannot promote own profile role', async () => {
    const result = await clients.rd.from('profiles')
      .update({ role: 'admin' })
      .eq('id', users.rd.id)
      .select('role');
    if (!result.error) {
      await clients.admin.from('profiles').update({ role: profileSnapshots.rd.role }).eq('id', users.rd.id);
    }
    assert(result.error, 'RD role escalation unexpectedly succeeded');
  });

  await step('non-admin cannot read another user profile', async () => {
    const { data, error } = await clients.rd.from('profiles').select('id').eq('id', users.eng.id);
    if (error) throw error;
    assert(data.length === 0, 'RD can read another user profile');
  });

  await step('RD can create a QA_TEST project in default workspace', async () => {
    const { error } = await clients.rd.from('projects').insert({
      id: defaultProjectId,
      name: defaultProjectId,
      data: { audit: true },
      workspace: 'default',
      updated_by: users.rd.id,
    });
    if (error) throw error;
  });

  await step('ENG can collaborate on the default QA_TEST project', async () => {
    const { data, error } = await clients.eng.from('projects')
      .update({ data: { audit: true, collaborator: 'eng' }, updated_by: users.eng.id })
      .eq('id', defaultProjectId)
      .select('id');
    if (error) throw error;
    assert(data.length === 1, 'ENG did not update the default project');
  });

  await step('Admin can create an admin_test QA_TEST project', async () => {
    const { error } = await clients.admin.from('projects').insert({
      id: adminProjectId,
      name: adminProjectId,
      data: { audit: true },
      workspace: 'admin_test',
      updated_by: users.admin.id,
    });
    if (error) throw error;
  });

  await step('non-admin cannot read admin_test project', async () => {
    const { data, error } = await clients.rd.from('projects').select('id').eq('id', adminProjectId);
    if (error) throw error;
    assert(data.length === 0, 'RD can read admin_test data');
  });

  await step('non-admin cannot insert into admin_test workspace', async () => {
    const { error } = await clients.qa.from('projects').insert({
      id: deniedAdminProjectId,
      name: deniedAdminProjectId,
      data: { audit: true },
      workspace: 'admin_test',
      updated_by: users.qa.id,
    });
    assert(error, 'QA insert into admin_test unexpectedly succeeded');
  });

  await step('Admin can maintain factory master data', async () => {
    const { error } = await clients.admin.from('factories').insert({
      name: factoryName,
      updated_by: users.admin.id,
    });
    if (error) throw error;
  });

  await step('non-admin can read but cannot mutate factory master data', async () => {
    const read = await clients.rd.from('factories').select('name').eq('name', factoryName);
    if (read.error) throw read.error;
    assert(read.data.length === 1, 'RD cannot read factory master data');
    const insert = await clients.rd.from('factories').insert({
      name: deniedFactoryName,
      updated_by: users.rd.id,
    });
    assert(insert.error, 'RD factory insert unexpectedly succeeded');
    const remove = await clients.rd.from('factories').delete().eq('name', factoryName).select('name');
    assert(remove.error || remove.data.length === 0, 'RD factory delete unexpectedly succeeded');
  });

  await step('user can update own signature but not privileged fields', async () => {
    const marker = `QA_TEST_SIGNATURE_${stamp}`;
    const update = await clients.rd.from('profiles')
      .update({ signature: marker })
      .eq('id', users.rd.id)
      .select('signature');
    if (update.error) throw update.error;
    assert(update.data[0]?.signature === marker, 'signature update was not persisted');
    const restore = await clients.rd.from('profiles')
      .update({ signature: profileSnapshots.rd.signature })
      .eq('id', users.rd.id);
    if (restore.error) throw restore.error;
  });

  await step('Admin can update and restore another test profile', async () => {
    const marker = `QA_TEST_LEVEL_${stamp}`;
    const update = await clients.admin.from('profiles')
      .update({ level: marker })
      .eq('id', users.rd.id)
      .select('level');
    if (update.error) throw update.error;
    assert(update.data[0]?.level === marker, 'Admin profile update was not persisted');
    const restore = await clients.admin.from('profiles')
      .update({ level: profileSnapshots.rd.level })
      .eq('id', users.rd.id);
    if (restore.error) throw restore.error;
  });
} finally {
  try {
    await cleanup();
    if (baselineCounts && clients.admin) {
      const afterCounts = await getAdminVisibleCounts();
      const clean = JSON.stringify(afterCounts) === JSON.stringify(baselineCounts);
      if (clean) {
        passed += 1;
        console.log('  ✓ QA_TEST cleanup restored table counts');
      } else {
        failed += 1;
        console.error(`  ✗ QA_TEST cleanup count mismatch: before=${JSON.stringify(baselineCounts)} after=${JSON.stringify(afterCounts)}`);
      }
    }
    await Promise.all(Object.values(clients).map((client) => client.auth.signOut({ scope: 'local' })));
  } catch (error) {
    failed += 1;
    console.error(`  ✗ QA_TEST cleanup failed: ${error.message}`);
  }
}

console.log(`\nCloud security results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;

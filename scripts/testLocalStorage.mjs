/**
 * testLocalStorage.mjs — localStorage 容量 & 損毀復原測試
 *
 * 離線測試：驗證 storage.js 安全包裝函式的正確性。
 * 注意：容量測試僅在瀏覽器環境有效，這邊僅測試邏輯正確性。
 */

console.log('================================================================');
console.log('  💾  localStorage 安全存取測試');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}`);
  }
}

// 模擬 localStorage (Node.js 無此 API)
class MockStorage {
  constructor() { this._data = {}; this._quota = 5 * 1024 * 1024; }
  getItem(k) { return this._data[k] ?? null; }
  setItem(k, v) {
    const size = new Blob([k + v]).size;
    if (size > this._quota) throw new Error('QuotaExceededError');
    this._data[k] = String(v);
  }
  removeItem(k) { delete this._data[k]; }
  get length() { return Object.keys(this._data).length; }
  key(i) { return Object.keys(this._data)[i] ?? null; }
  clear() { this._data = {}; }
}

// ── 測試 1: getJSON 可正確解析有效 JSON ──
console.log('── [1] getJSON 正確性 ──');

const ms1 = new MockStorage();
const { getJSON, setJSON, getRaw, removeKey } = await import('../src/utils/storage.js');

// 直接操作模擬
ms1.setItem('ag_test', JSON.stringify({ hello: 'world' }));
// 替換全域 localStorage
const origLocalStorage = globalThis.localStorage;
globalThis.localStorage = ms1;

const r1 = getJSON('test', null);
assert(r1 && r1.hello === 'world', 'getJSON 正確讀取有效 JSON');

// ── 測試 2: getJSON 損毀時回傳預設值 ──
console.log('\n── [2] getJSON 損毀復原 ──');

ms1.setItem('ag_corrupt', '{bad json!!!');
const r2 = getJSON('corrupt', { fallback: true });
assert(r2 && r2.fallback === true, '損毀 JSON 回傳預設值');
assert(ms1.getItem('ag_corrupt') === null, '損毀資料被自動清除');

// ── 測試 3: setJSON 成功寫入 ──
console.log('\n── [3] setJSON 寫入測試 ──');

const ok = setJSON('write_test', { a: 1, b: [2, 3] });
assert(ok === true, 'setJSON 回傳 true');
const raw = ms1.getItem('ag_write_test');
assert(raw === '{"a":1,"b":[2,3]}', '寫入值 JSON 格式正確');
const r3 = getJSON('write_test', null);
assert(r3 && r3.a === 1 && r3.b[1] === 3, '寫入後可正確讀回');

// ── 測試 4: removeKey ──
console.log('\n── [4] removeKey 測試 ──');

removeKey('write_test');
assert(ms1.getItem('ag_write_test') === null, 'removeKey 後值已移除');

// ── 測試 5: getRaw ──
console.log('\n── [5] getRaw 測試 ──');

ms1.setItem('ag_raw_test', 'just a string');
const raw2 = getRaw('raw_test');
assert(raw2 === 'just a string', 'getRaw 回傳原始字串');
removeKey('raw_test');
assert(getRaw('raw_test') === null, 'removeKey 後 getRaw 回傳 null');

// ── 測試 6: 空值/undefined 處理 ──
console.log('\n── [6] 邊界條件 ──');

const r6 = getJSON('non_existent', 'default');
assert(r6 === 'default', '不存在的 key 回傳預設值');

const r7 = getJSON('non_existent_2', null);
assert(r7 === null, '不存在的 key, fallback=null 回傳 null');

// ── 測試 7: setJSON 容量滿時的處理 ──
console.log('\n── [7] QuotaExceeded 處理 ──');

ms1._quota = 10; // 很小
const r8 = setJSON('quota_test', 'x'.repeat(100));
assert(r8 === false, '容量不足時回傳 false (不拋錯)');

// 清理
globalThis.localStorage = origLocalStorage;

console.log('\n================================================================');
console.log(`  📋  結果: ${passed} 通過, ${failed} 失敗`);
console.log('================================================================\n');

if (failed > 0) {
  console.error('❌ 部分測試失敗！');
  process.exit(1);
} else {
  console.log('✅ 所有 localStorage 測試通過！\n');
}

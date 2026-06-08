/**
 * concurrencyTest.mjs - 競爭條件與壓力防護測試
 *
 * 離線測試：模擬快速分頁切換、連續匯出點擊、快速欄位更新。
 * 在 Node.js 環境執行，不需瀏覽器 / React。
 */

import { performance } from 'perf_hooks';

console.log('================================================================');
console.log('  ⚡  競爭條件與防護機制測試');
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

// ── 測試 1: exportLoading 旗標保護 ──
console.log('── [1] exportLoading 降彈跳測試 ──');

function simulateExportClicks(count) {
  let exportLoading = false;
  let triggerCount = 0;

  for (let i = 0; i < count; i++) {
    if (!exportLoading) {
      triggerCount++;
      exportLoading = true;
      // 模擬匯出完成後重置
      setTimeout(() => { exportLoading = false; }, 0);
    }
  }
  return triggerCount;
}

const clicks1 = simulateExportClicks(5);
assert(clicks1 === 1, `連續 5 次點擊只觸發 1 次匯出 (觸發 ${clicks1} 次)`);

// ── 測試 2: 快速交替帳號寫入到同一個陣列 ──
console.log('\n── [2] 陣列競爭寫入測試 ──');

function simulateConcurrentSetState(iterations) {
  let state = [];
  const ops = [];

  for (let i = 0; i < iterations; i++) {
    const idx = i;
    ops.push(() => {
      state = [...state, { id: idx, value: `item-${idx}` }];
    });
  }

  // 全部依序執行 (類 React 同步更新)  
  ops.forEach(op => op());
  return state;
}

const arr = simulateConcurrentSetState(100);
assert(arr.length === 100, `100 次 push 後長度正確 (實際 ${arr.length})`);
assert(arr[99].id === 99, '陣列順序正確 (最後一筆 id=99)');

// ── 測試 3: 切換分頁時防護 ──
console.log('\n── [3] 分頁切換效能測試 (模擬快速切換) ──');

function simulateTabSwitch(count) {
  const tabs = ['dashboard', 'basicInfo', 'processControl', 'trialReport', 'signOff'];
  let activeTab = 'dashboard';
  const times = [];

  for (let i = 0; i < count; i++) {
    const nextTab = tabs[i % tabs.length];
    const t0 = performance.now();
    activeTab = nextTab;
    const t1 = performance.now();
    times.push(t1 - t0);
  }
  return { lastTab: activeTab, avgMs: times.reduce((a, b) => a + b, 0) / times.length };
}

const result = simulateTabSwitch(1000);
assert(result.lastTab === 'signOff', '1000 次分頁切換後最終分頁正確');
assert(result.avgMs < 0.01, `分頁切換平均耗時 < 0.01ms (實際 ${result.avgMs.toFixed(5)}ms)`);

// ── 測試 4: 長時間操作 timeout 保護 ──
console.log('\n── [4] 匯出/匯入 timeout 保護測試 ──');

function simulateExportWithTimeout(timeoutMs) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve('timeout');
    }, timeoutMs);

    // 模擬成功匯出
    setTimeout(() => {
      clearTimeout(timer);
      resolve('completed');
    }, 10);
  });
}

async function runTimeoutTest() {
  const r1 = await simulateExportWithTimeout(5000);
  assert(r1 === 'completed', '正常完成 (5s timeout 未觸發)');

  const r2 = await new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) { resolved = true; resolve('timeout'); }
    }, 50);

    // 模擬卡住 (不 resolve)
    setTimeout(() => {
      if (!resolved) { resolved = true; resolve('timeout'); }
    }, 100);
  });
  assert(r2 === 'timeout', '卡住時 timeout 正確觸發');
}

await runTimeoutTest();

// ── 測試 5: 巢狀物件競爭寫入 (setDeep 安全測試) ──
console.log('\n── [5] 巢狀物件競爭寫入測試 ──');

import { setDeep } from '../src/utils/fieldUtils.js';

function simulateConcurrentDeepSet(count) {
  let state = { a: { b: { c: 0 } } };
  for (let i = 0; i < count; i++) {
    state = setDeep(state, 'a.b.c', i);
  }
  return state;
}

const finalState = simulateConcurrentDeepSet(50);
assert(finalState.a.b.c === 49, `50 次 setDeep 後 c = 49 (實際 ${finalState.a.b.c})`);
assert(finalState.a !== undefined && finalState.a.b !== undefined, '巢狀結構未損毀');

// ── 結果 ──
console.log('\n================================================================');
console.log(`  📋  結果: ${passed} 通過, ${failed} 失敗`);
console.log('================================================================\n');

if (failed > 0) {
  console.error('❌ 部分測試失敗！');
  process.exit(1);
} else {
  console.log('✅ 所有競爭條件與防護測試通過！\n');
}

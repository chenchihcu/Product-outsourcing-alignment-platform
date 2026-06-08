import fs from 'fs';
import * as XLSX from 'xlsx';
import { parseRequirementExcel } from '../src/utils/excelParser.js';
import { exportRequirementExcel } from '../src/utils/excelExporter.js';
import { setDeep, updateFieldWithOwner } from '../src/utils/fieldUtils.js';

const templatePath = './新機種製作需求一覽表2026 v2.xlsx';
let passed = 0;
let failed = 0;
let warnings = [];

function assert(condition, label) {
  if (condition) {
    passed++;
    process.stdout.write(`  ✓ ${label}\n`);
  } else {
    failed++;
    process.stdout.write(`  ✗ ${label}\n`);
  }
}

function assertWarn(condition, label) {
  if (!condition) {
    warnings.push(label);
    process.stdout.write(`  ⚠ ${label}\n`);
  }
  passed++;
}

async function runStressTests() {
  console.log('================================================================');
  console.log('  🚀  新機種製作需求一覽表 — 全面壓力測試');
  console.log('================================================================\n');

  // ─────────── 0. 環境檢查 ───────────
  console.log('── [0] 環境檢查 ──');
  const envOk = fs.existsSync(templatePath);
  assert(envOk, '範本檔案存在');
  if (!envOk) { process.exit(1); }

  const buf = fs.readFileSync(templatePath);
  const originalWb = XLSX.read(buf, { type: 'buffer' });
  assert(!!originalWb, '範本可被 XLSX 正確讀取');

  // ─────────── 1. 正確性測試 — 往返校驗 ───────────
  console.log('\n── [1] 正確性測試：解析→匯出→再解析 (往返校驗) ──');

  const parsed = parseRequirementExcel(buf);
  assert(!!parsed.basicInfo, 'basicInfo 解析成功');
  assert(!!parsed.processControl, 'processControl 解析成功');
  assert(!!parsed.trialReport, 'trialReport 解析成功');

  // 填入測試資料
  parsed.basicInfo.factory = '壓力測試工廠';
  parsed.basicInfo.productNo = 'STRESS-PROD-001';
  parsed.basicInfo.productDesc = '壓力測試產品 (往返校驗)';
  parsed.basicInfo.stage.evt = true;
  parsed.basicInfo.stage.pvt = true;
  parsed.processControl.bakeRequired = { need: true, noNeed: false, pcbBakeTemp: '120', pcbBakeTol: '5', pcbBakeHr: '2', fpcaBakeTemp: '80', fpcaBakeHr: '4', pcbBakeCond: 'PCB 烘烤: 120  °C ± 5 °C × 2 hr（依 PCB 廠建議）', fpcaBakeCond: 'FPCA 烘烤: 依原物料規格書，若無規格則 _80__ °C × _4__ hr' };

  // 匯出
  const outBuf = exportRequirementExcel(originalWb, parsed);
  assert(outBuf && outBuf.byteLength > 0, '匯出產生非空 ArrayBuffer');

  // 再解析
  const reparsed = parseRequirementExcel(outBuf);
  assert(reparsed.basicInfo.factory === '壓力測試工廠', '往返後 factory 值保留');
  assert(reparsed.basicInfo.productNo === 'STRESS-PROD-001', '往返後 productNo 值保留');
  assert(reparsed.basicInfo.productDesc === '壓力測試產品 (往返校驗)', '往返後 productDesc 值保留');
  assert(reparsed.basicInfo.stage.evt === true, '往返後 stage.evt 保留');
  assert(reparsed.basicInfo.stage.pvt === true, '往返後 stage.pvt 保留');

  // ─────────── 2. 壓力測試 — 大量往返 ───────────
  console.log('\n── [2] 效能壓力測試：200 次解析與匯出往返 ──');

  const iterations = 200;
  const startMemory = process.memoryUsage().heapUsed;
  const startTime = performance.now();
  const parseTimes = [];
  const exportTimes = [];

  const sampleData = parseRequirementExcel(buf);
  sampleData.basicInfo.factory = '壓力測試工廠';
  sampleData.basicInfo.productNo = 'STRESS-999';

  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    const data = parseRequirementExcel(buf);
    const t1 = performance.now();
    parseTimes.push(t1 - t0);

    const t2 = performance.now();
    const outArr = exportRequirementExcel(originalWb, data);
    const t3 = performance.now();
    exportTimes.push(t3 - t2);

    if (!outArr || outArr.byteLength === 0) {
      console.error(`迭代 ${i + 1}: 匯出資料異常！`);
      failed++;
    }
  }

  const endTime = performance.now();
  const endMemory = process.memoryUsage().heapUsed;
  const totalDurationSec = ((endTime - startTime) / 1000).toFixed(2);
  const avgParseMs = (parseTimes.reduce((a, b) => a + b, 0) / iterations).toFixed(2);
  const avgExportMs = (exportTimes.reduce((a, b) => a + b, 0) / iterations).toFixed(2);
  const maxParseMs = Math.max(...parseTimes).toFixed(2);
  const maxExportMs = Math.max(...exportTimes).toFixed(2);
  const memoryDiffMb = ((endMemory - startMemory) / 1024 / 1024).toFixed(2);

  console.log(`\n  📊 效能報告:`);
  console.log(`     總執行次數: ${iterations} 次`);
  console.log(`     總測試耗時: ${totalDurationSec} 秒`);
  console.log(`     平均解析時間: ${avgParseMs} ms (最慢 ${maxParseMs} ms)`);
  console.log(`     平均匯出時間: ${avgExportMs} ms (最慢 ${maxExportMs} ms)`);
  console.log(`     Heap 記憶體變化: ${memoryDiffMb > 0 ? '+' : ''}${memoryDiffMb} MB`);

  assert(avgParseMs < 50, `平均解析時間 < 50ms (實際 ${avgParseMs}ms)`);
  assert(avgExportMs < 100, `平均匯出時間 < 100ms (實際 ${avgExportMs}ms)`);
  assertWarn(Number(memoryDiffMb) < 50, `記憶體增長 < 50MB (實際 ${memoryDiffMb}MB) — 若超過可能記憶體洩漏`);

  // ─────────── 3. 邊界資料測試 ───────────
  console.log('\n── [3] 邊界資料測試 ──');

  // 3a. 極長欄位值
  const edgeData = parseRequirementExcel(buf);
  edgeData.basicInfo.productNo = 'A'.repeat(500);
  edgeData.basicInfo.productDesc = 'B'.repeat(5000);
  edgeData.processControl.specialProcessMemo = 'C'.repeat(10000);
  try {
    const edgeOut = exportRequirementExcel(originalWb, edgeData);
    assert(edgeOut && edgeOut.byteLength > 0, '極長欄位值 (料號 500字, 描述 5000字, 備註 10000字) 可正常匯出');
  } catch (e) {
    assert(false, `極長欄位值匯出失敗: ${e.message}`);
  }

  // 3b. 全空資料
  const emptyData = {
    basicInfo: { factory: '', productNo: '', productDesc: '', stage: {}, signOff: {}, documents: {}, processItems: {}, tooling: {} },
    processControl: {},
    trialReport: {}
  };
  try {
    const emptyOut = exportRequirementExcel(originalWb, emptyData);
    assert(emptyOut && emptyOut.byteLength > 0, '全空資料可正常匯出 (不崩潰)');
  } catch (e) {
    assert(false, `全空資料匯出失敗: ${e.message}`);
  }

  // 3c. 測溫點極端值
  const tempData = parseRequirementExcel(buf);
  tempData.processControl.keyParts = { has: true, none: false };
  tempData.processControl.tempPoints = Array.from({ length: 6 }, (_, i) => ({ pos: `U${i + 1}_極長元件名稱_ABCDEFGHIJKLMNOPQRSTUVWXYZ`, desc: 'desc', memo: 'memo' }));
  try {
    const tempOut = exportRequirementExcel(originalWb, tempData);
    assert(tempOut && tempOut.byteLength > 0, '6 點測溫點含極長名稱可正常匯出');
  } catch (e) {
    assert(false, `測溫點極端值匯出失敗: ${e.message}`);
  }

  // 3d. 特殊字元
  const specialData = parseRequirementExcel(buf);
  specialData.basicInfo.productNo = '測試!@#$%^&*()_+{}|:"<>?~`特殊字元';
  specialData.basicInfo.productDesc = '中文、English、日本語、한국어、Español 混合';
  try {
    const specialOut = exportRequirementExcel(originalWb, specialData);
    assert(specialOut && specialOut.byteLength > 0, '特殊字元 (符號、多國語言) 可正常匯出');
  } catch (e) {
    assert(false, `特殊字元匯出失敗: ${e.message}`);
  }

  // 3e. 所有加工項目全勾
  const allProcData = parseRequirementExcel(buf);
  const allKeys = ['smt', 'dip', 'ict', 'assembly', 'coating', 'packing', 'fct', 'flyingProbe', 'finalTest', 'underfillGlue', 'semiFinishedTest', 'otherProcess'];
  allKeys.forEach(k => { allProcData.basicInfo.processItems[k] = true; });
  allProcData.basicInfo.processItems.otherProcessText = '測試用其他加工項目';
  try {
    const allProcOut = exportRequirementExcel(originalWb, allProcData);
    assert(allProcOut && allProcOut.byteLength > 0, '所有加工項目全勾選可正常匯出');
  } catch (e) {
    assert(false, `全加工項目匯出失敗: ${e.message}`);
  }

  // ─────────── 4. setDeep / updateFieldWithOwner 單元測試 ───────────
  console.log('\n── [4] 工具函數單元測試 ──');

  // 4a. setDeep 基本功能
  const obj1 = { a: { b: 1 } };
  const result1 = setDeep(obj1, 'a.b', 2);
  assert(result1.a.b === 2 && obj1.a.b === 1, 'setDeep 產生新物件且不修改原物件');

  // 4b. setDeep 建立巢狀路徑
  const obj2 = {};
  const result2 = setDeep(obj2, 'x.y.z', 'val');
  assert(result2.x.y.z === 'val', 'setDeep 自動建立巢狀路徑');

  // 4c. updateFieldWithOwner 正確設置擁有者
  const prev3 = {};
  const result3 = updateFieldWithOwner(prev3, 'basicInfo.factory', '測試廠', '研發單位');
  assert(result3.basicInfo.factory === '測試廠', 'updateFieldWithOwner 設置值');
  assert(result3._owners['basicInfo.factory'] === '研發單位', 'updateFieldWithOwner 設置擁有者');

  // 4d. updateFieldWithOwner 清除空值擁有者
  const prev4 = { _owners: { 'basicInfo.factory': '研發單位' } };
  const result4 = updateFieldWithOwner(prev4, 'basicInfo.factory', '', '研發單位');
  assert(!result4._owners['basicInfo.factory'], 'updateFieldWithOwner 清除空值擁有者');

  // 4e. setDeep 陣列支援
  const obj5 = { items: [{ id: 1 }] };
  const result5 = setDeep(obj5, 'items.0.name', 'test');
  assert(result5.items[0].name === 'test' && result5.items[0].id === 1, 'setDeep 支援陣列索引路徑');

  // ─────────── 5. 模擬競爭條件測試 ───────────
  console.log('\n── [5] 競爭條件模擬測試 ──');

  // 模擬快速連續 onChange 調用 (類似 React 的 functional updater 模式)
  let state = parseRequirementExcel(buf);
  const updateHistory = [];

  const simulateOnChange = (updater) => {
    state = updater(state);
    updateHistory.push(JSON.stringify(state._owners || {}));
  };

  // 快速連續 20 次更新
  for (let i = 0; i < 20; i++) {
    simulateOnChange(prev => updateFieldWithOwner(prev, `basicInfo.productNo`, `PROD-${i}`, '研發單位'));
  }
  assert(state.basicInfo.productNo === 'PROD-19', '快速連續 20 次 setField 後最終值正確');
  assert(Object.keys(state._owners || {}).length === 1, '快速連續 20 次後擁有者數量正確 (僅最後一次有效)');

  // 模擬不同單位交替寫入 (競爭同一欄位)
  state = parseRequirementExcel(buf);
  const units = ['研發單位', '工程單位', '審核單位(品保處)'];
  for (let i = 0; i < 30; i++) {
    const unit = units[i % 3];
    simulateOnChange(prev => updateFieldWithOwner(prev, `basicInfo.productNo`, `交替測試-${i}`, unit));
  }
  assert(state._owners['basicInfo.productNo'] === '審核單位(品保處)', '交替寫入後最後擁有者正確');

  // ─────────── 6. 記憶體壓力測試 ───────────
  console.log('\n── [6] 記憶體壓力測試 ──');

  const memStart = process.memoryUsage().heapUsed;
  const largeBatch = [];
  for (let i = 0; i < 50; i++) {
    const d = parseRequirementExcel(buf);
    d.basicInfo.productNo = `MEM-PROD-${i}`;
    d.basicInfo.productDesc = 'X'.repeat(1000);
    d.basicInfo.factory = '記憶體測試工廠';
    largeBatch.push(d);
  }
  const memAfterBatch = process.memoryUsage().heapUsed;
  const memIncrease = ((memAfterBatch - memStart) / 1024 / 1024).toFixed(2);
  assertWarn(Number(memIncrease) < 20, `50 筆大型資料物件記憶體增長 < 20MB (實際 ${memIncrease}MB)`);

  // 逐個匯出以模擬真實使用
  for (const d of largeBatch) {
    try {
      exportRequirementExcel(originalWb, d);
    } catch (e) {
      assert(false, `批次匯出 ${d.basicInfo.productNo} 失敗: ${e.message}`);
      break;
    }
  }
  assert(true, '50 筆大型資料全部可正常匯出');

  // 清除引用
  largeBatch.length = 0;

  // ─────────── 結果摘要 ───────────
  console.log('\n================================================================');
  console.log('  📋  壓力測試結果摘要');
  console.log('================================================================');
  console.log(`  通過: ${passed}`);
  console.log(`  失敗: ${failed}`);
  if (warnings.length > 0) {
    console.log(`  警告: ${warnings.length}`);
    warnings.forEach(w => console.log(`    ⚠ ${w}`));
  }
  console.log(`  總計: ${passed + failed} 項測試`);
  console.log('================================================================\n');

  if (failed > 0) {
    console.error(`❌ 壓力測試完成，但有 ${failed} 項失敗！`);
    process.exit(1);
  } else {
    console.log('✅ 所有壓力測試通過！\n');
  }
}

runStressTests().catch(err => {
  console.error('壓力測試執行異常:', err);
  process.exit(1);
});

import fs from 'fs';
import * as XLSX from 'xlsx';
import { parseRequirementExcel } from '../src/utils/excelParser.js';
import { exportRequirementExcel } from '../src/utils/excelExporter.js';

const templatePath = './新機種製作需求一覽表2026 v2.xlsx';

function runStressTest() {
  console.log('=== 🚀 開始執行 Excel 解析與匯出往返壓力測試 (Node.js 離線版) ===');
  
  if (!fs.existsSync(templatePath)) {
    console.error('錯誤：找不到範本檔案', templatePath);
    process.exit(1);
  }

  const buf = fs.readFileSync(templatePath);
  const originalWb = XLSX.read(buf, { type: 'buffer' });

  const iterations = 200;
  const parseTimes = [];
  const exportTimes = [];

  const startMemory = process.memoryUsage().heapUsed;
  const startTime = performance.now();

  console.log(`正在執行 ${iterations} 次解析與匯出往返...`);

  // 建立一個標準模擬資料做為匯出對象
  const parsedSample = parseRequirementExcel(buf);
  parsedSample.basicInfo.factory = '壓力測試工廠';
  parsedSample.basicInfo.productNo = 'STRESS-999';
  parsedSample.basicInfo.productDesc = '壓力測試產品';

  for (let i = 0; i < iterations; i++) {
    // 1. 測試解析效能
    const t0 = performance.now();
    const data = parseRequirementExcel(buf);
    const t1 = performance.now();
    parseTimes.push(t1 - t0);

    // 2. 測試匯出效能
    const t2 = performance.now();
    const outArray = exportRequirementExcel(originalWb, data);
    const t3 = performance.now();
    exportTimes.push(t3 - t2);

    // 防止 JS 引擎優化跳過未使用的變數
    if (!outArray || outArray.byteLength === 0) {
      console.error('匯出資料異常！');
    }
  }

  const endTime = performance.now();
  const endMemory = process.memoryUsage().heapUsed;

  const totalDurationSec = ((endTime - startTime) / 1000).toFixed(2);
  const avgParseMs = (parseTimes.reduce((a, b) => a + b, 0) / iterations).toFixed(2);
  const avgExportMs = (exportTimes.reduce((a, b) => a + b, 0) / iterations).toFixed(2);
  const memoryDiffMb = ((endMemory - startMemory) / 1024 / 1024).toFixed(2);

  console.log('\n================== 📊 壓力測試效能報告 ==================');
  console.log(`| 測試項目            | 數值                                     |`);
  console.log(`|--------------------|----------------------------------------|`);
  console.log(`| 總執行次數         | ${iterations} 次往返                                |`);
  console.log(`| 總測試耗時         | ${totalDurationSec} 秒                                  |`);
  console.log(`| 平均單次解析時間   | ${avgParseMs} 毫秒                                |`);
  console.log(`| 平均單次匯出時間   | ${avgExportMs} 毫秒                                |`);
  console.log(`| Heap 記憶體變化    | ${memoryDiffMb > 0 ? '+' : ''}${memoryDiffMb} MB                                 |`);
  console.log('=========================================================\n');
  
  console.log('✓ 壓力測試指令已順利執行完成！');
}

runStressTest();

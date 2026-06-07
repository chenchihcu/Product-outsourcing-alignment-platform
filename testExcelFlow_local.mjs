import fs from 'fs';
import * as XLSX from 'xlsx';
import { parseRequirementExcel } from './src/utils/excelParser.js';
import { exportRequirementExcel } from './src/utils/excelExporter.js';

const templatePath = './新機種製作需求一覽表2026 v2.xlsx';

function runTest() {
  console.log('=== 開始 Excel Parser 與 Exporter 整合測試 (Local) ===');
  
  if (!fs.existsSync(templatePath)) {
    console.error('範本不存在:', templatePath);
    process.exit(1);
  }

  // 1. 讀取並解析原始範本
  const buf = fs.readFileSync(templatePath);
  const originalWb = XLSX.read(buf, { type: 'buffer' });
  const data = parseRequirementExcel(buf);

  console.log('原始解析成功！驗證預設值是否為空白...');
  console.log('B4 factory:', JSON.stringify(data.basicInfo.factory)); // 應為 ''
  console.log('B33 thickness:', JSON.stringify(data.basicInfo.tooling.stencil.thickness)); // 應為 ''
  console.log('C33 apertureRatio:', JSON.stringify(data.basicInfo.tooling.stencil.apertureRatio)); // 應為 ''
  console.log('D33 stencilType:', JSON.stringify(data.basicInfo.tooling.stencil.stencilType)); // 應為 ''
  console.log('smtCarrier:', JSON.stringify(data.basicInfo.tooling.smtCarrier)); 
  console.log('otherFixture:', JSON.stringify(data.basicInfo.tooling.otherFixture));

  // 驗證預設空白防呆
  if (data.basicInfo.factory !== '' || data.basicInfo.tooling.stencil.thickness !== '') {
    console.error('❌ 測試失敗: 預設欄位未成功清理為空白！');
    process.exit(1);
  }

  // 2. 模擬使用者填寫資料
  data.basicInfo.factory = '捷普科技';
  data.basicInfo.productNo = 'JAP-88899-001';
  data.basicInfo.productDesc = '測試智慧手環 PCBA';
  
  // 產品階段
  data.basicInfo.stage = {
    evt: true,
    dvt: false,
    pvt: true,
    politRun: false,
    ecn: true
  };

  // 鋼板設定為需要，並填寫規格
  data.basicInfo.processItems = { smt: true, dip: true };
  data.basicInfo.tooling.stencil = {
    need: true,
    noNeed: false,
    thickness: '0.13',
    apertureRatio: '95',
    stencilType: '奈米鋼板'
  };

  // 新治具設定
  data.basicInfo.tooling.smtCarrier = {
    need: true,
    noNeed: false,
    upper: true,
    lower: false
  };

  data.basicInfo.tooling.otherFixture = {
    need: true,
    noNeed: false,
    name: '特製防焊測試載板-A型',
    qty: '3 SETs'
  };

  // 簽章
  data.basicInfo.signOff = {
    rdConfirm: 'RD張三',
    engineeringReview: 'PE李四',
    qaConfirm: 'QA王五'
  };

  // 模擬 owners 鎖定
  data._owners = {
    'basicInfo.factory': '研發單位',
    'basicInfo.productNo': '研發單位',
    'stage.evt': '研發單位',
    'stage.pvt': '工程單位'
  };

  // 3. 匯出 Excel
  console.log('正在匯出修改後的資料到臨時 Excel...');
  const outArray = exportRequirementExcel(originalWb, data);
  const tempOutPath = './temp_test_out_local.xlsx';
  fs.writeFileSync(tempOutPath, Buffer.from(outArray));
  console.log('匯出成功，寫入到:', tempOutPath);

  // 4. 再次讀入臨時 Excel 並解析，確認資料完整還原
  console.log('正在讀取臨時 Excel 並重新解析驗證...');
  const outBuf = fs.readFileSync(tempOutPath);
  const reParsedData = parseRequirementExcel(outBuf);

  // 5. 斷言驗證 (Assertions)
  const assert = (actual, expected, message) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      console.error(`❌ 斷言失敗: ${message}`);
      console.error(`   預期值: ${JSON.stringify(expected)}`);
      console.error(`   實際值: ${JSON.stringify(actual)}`);
      cleanup();
      process.exit(1);
    } else {
      console.log(`✓ 驗證通過: ${message}`);
    }
  };

  assert(reParsedData.basicInfo.factory, '捷普科技', '委外加工廠回填還原');
  assert(reParsedData.basicInfo.productNo, 'JAP-88899-001', '產品料號還原');
  assert(reParsedData.basicInfo.stage.evt, true, '產品階段 EVT 還原');
  assert(reParsedData.basicInfo.stage.dvt, false, '產品階段 DVT 還原');
  assert(reParsedData.basicInfo.stage.ecn, true, '產品階段 ECN 還原');

  assert(reParsedData.basicInfo.tooling.stencil.need, true, '鋼板規格 Need 還原');
  assert(reParsedData.basicInfo.tooling.stencil.thickness, '0.13', '鋼板厚度還原');
  assert(reParsedData.basicInfo.tooling.stencil.apertureRatio, '95', '鋼板開口比還原');
  assert(reParsedData.basicInfo.tooling.stencil.stencilType, '奈米鋼板', '鋼板類型 (三選一) 還原');

  assert(reParsedData.basicInfo.tooling.smtCarrier.need, true, 'SMT刷錫載具 Need 還原');
  assert(reParsedData.basicInfo.tooling.smtCarrier.upper, true, 'SMT刷錫載具 上載板 還原');
  assert(reParsedData.basicInfo.tooling.smtCarrier.lower, false, 'SMT刷錫載具 下載板 還原');

  assert(reParsedData.basicInfo.tooling.otherFixture.need, true, '其他治具 Need 還原');
  assert(reParsedData.basicInfo.tooling.otherFixture.name, '特製防焊測試載板-A型', '其他治具名稱還原');
  assert(reParsedData.basicInfo.tooling.otherFixture.qty, '3 SETs', '其他治具數量還原');

  assert(reParsedData.basicInfo.signOff.rdConfirm, 'RD張三', '研發確認簽章還原');
  assert(reParsedData.basicInfo.signOff.engineeringReview, 'PE李四', '工程審核簽章還原');
  assert(reParsedData.basicInfo.signOff.qaConfirm, 'QA王五', '品保最後審核簽章還原');

  // 驗證 G1 中的 owners 鎖定狀態是否被還原
  assert(reParsedData._owners?.['basicInfo.factory'], '研發單位', '防呆鎖定 factory owner 還原');
  assert(reParsedData._owners?.['stage.pvt'], '工程單位', '防呆鎖定 stage.pvt owner 還原');

  console.log('=== 🎉 恭喜！所有 Excel 往返同步測試與防呆鎖定狀態 Persistence 測試全部通過！ ===');
  cleanup();
}

function cleanup() {
  const tempOutPath = './temp_test_out_local.xlsx';
  if (fs.existsSync(tempOutPath)) {
    fs.unlinkSync(tempOutPath);
    console.log('清理臨時測試檔案完成。');
  }
}

runTest();

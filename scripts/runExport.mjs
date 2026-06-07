import fs from 'fs';
import * as XLSX from 'xlsx';
import { exportRequirementExcel } from '../src/utils/excelExporter.js';

// 讀取範本活頁簿（專案根目錄的 Excel 檔）
const templatePath = './新機種製作需求一覽表2026 v2.xlsx';
if (!fs.existsSync(templatePath)) {
  console.error('Template not found:', templatePath);
  process.exit(1);
}

const buf = fs.readFileSync(templatePath);
const wb = XLSX.read(buf, { type: 'buffer', cellStyles: true });

// 建立一個簡單的範例資料供匯出使用
const sampleData = {
  basicInfo: {
    factory: '示例工廠',
    stage: { evt: true, dvt: false, pvt: true, mpSmall: false, ecn: false },
    pcbBake: '120C 2hr',
    fpcaBake: '100C 1hr',
    category: { general: true, medical: false },
    productNo: 'PRD-2026-001',
    productDesc: '範例產品說明',
    pcbMaterial: 'FR4',
    pcbLayers: '4',
    pcbSurface: { enig: true, osp: false },
    qualityLevel: { class2: true, class3: false },
    ipcStandard: { ipcA610: true, jStd001: false },
    pcbaType: { single: false, double: true },
    processItems: { smt: true, dip: false, ict: false, assembly: true, coating: false, packing: true, fct: false, flyingProbe: false, finalTest: true },
    aoi: { top: true, bottom: false },
    glue: true,
    qrCode: { need: false, noNeed: true },
    snControl: { need: true, noNeed: false },
    riskParts: [ { name: 'IC123', packageType: 'QFN', riskDesc: '長交期' }, { name: 'CAP456', packageType: '0603', riskDesc: '特殊值' } ],
    documents: { bom: true, gerber: true, coordinate: false, placement: true, materialSpec: false, mechDrawing: true, productSpec: true, reflowProfile: false, assemblySop: true, testSop: true, smtSpec: true, packingSop: false },
    tooling: { stencil: { thickness: '0.1', apertureRatio: '70%', laserCut: true, qty: 2 }, routingFixture: { need: false, noNeed: true, qty: 0 }, glueFixture: { need: false, noNeed: true, qty: 0 }, testFixture: { need: true, noNeed: false, qty: 1 }, assemblyFixture: { need: false, noNeed: true, qty: 0 } },
    signOff: { supplierConfirm: '供應商A', engineeringReview: '工程B', rdConfirm: '研發C' }
  },
  processControl: {
    sampleProvided: { trialBoard: true, tempBoard: false, standardPart: true },
    bakeRequired: { need: true, noNeed: false, pcbBakeCond: '120C', fpcaBakeCond: '100C' },
    smtFirstPiece: { polarity: true, measureLcr: false },
    smtOrder: { bToT: true, tToB: false },
    dipOrder: { bToT: false, tToB: true },
    keyParts: { has: true, none: false },
    tempPoints: [ { pos: 'T1', desc: 'Top center', memo: '' }, { pos: 'B1', desc: 'Bottom left', memo: '' } ],
    underfill: { bakeCond: '', glueModel: '' },
    reworkMark: { need: false, noNeed: true, sopMark: '' },
    specialProcessMemo: '無',
    packaging: { staticBag: true, honeycomb: false, tray: true }
  },
  trialReport: {
    printRecords: [ { checked: true }, { checked: false } ],
    inspectRecords: [ { checked: true }, { checked: true } ],
    photoRecords: [ { checked: false }, { checked: true } ]
  }
};

const out = exportRequirementExcel(wb, sampleData);
const outPath = './out_對齊簽核版.xlsx';
fs.writeFileSync(outPath, Buffer.from(out));
console.log('Exported to', outPath);

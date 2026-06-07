import * as XLSX from 'xlsx';

// 輔助函數：解析 Checkbox 狀態
// 接受儲存格的值，如果包含 ☑ 或是等於 '☑'，回傳 true；如果包含 ☐ 則回傳 false。
// 若為字串且不含 checkbox 符號，若有值則為 true。
function parseCheckbox(val) {
  if (val === null || val === undefined) return false;
  const str = String(val).trim();
  if (str.includes('☑')) return true;
  if (str.includes('☐')) return false;
  if (str === '1' || str === 1 || str === 'true' || str === true) return true;
  return false;
}

// 輔助函數：去除 Checkbox 符號，只拿文字
function cleanText(val) {
  if (val === null || val === undefined) return '';
  return String(val).replace(/[☑☐]/g, '').trim();
}

/**
 * 解析新機種製作需求一覽表 Excel 檔案
 * @param {ArrayBuffer} arrayBuffer 
 * @returns {Object} 結構化 JSON 資料
 */
export function parseRequirementExcel(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  const data = {
    basicInfo: {},
    processControl: {},
    trialReport: {}
  };

  // 1. 解析【產品基本資料】工作表
  const sheet1 = workbook.Sheets['產品基本資料'] || workbook.Sheets[workbook.SheetNames[0]];
  if (sheet1) {
    const getVal = (addr) => sheet1[addr] ? sheet1[addr].v : null;

    // 基本資訊
    data.basicInfo.title = getVal('A1') || '';
    data.basicInfo.date = getVal('B2') || '';
    data.basicInfo.version = getVal('E2') || '';
    data.basicInfo.factory = getVal('B5') || '';
    data.basicInfo.factoryArea = getVal('G5') || '';

    // 產品階段 (Checkbox)
    data.basicInfo.stage = {
      evt: parseCheckbox(getVal('B6')),
      dvt: parseCheckbox(getVal('C6')),
      pvt: parseCheckbox(getVal('E6')), // 依據原始 Sheet2 或是工作表1
      mpSmall: parseCheckbox(getVal('F6')),
      ecn: parseCheckbox(getVal('G6'))
    };
    
    // 烘烤參數 (發包方預填/加工廠參考)
    data.basicInfo.pcbBake = getVal('D6') || '';
    data.basicInfo.fpcaBake = getVal('D7') || '';

    // 產品類別
    data.basicInfo.category = {
      general: parseCheckbox(getVal('B7')),
      medical: parseCheckbox(getVal('C7'))
    };

    data.basicInfo.productNo = getVal('B8') || '';
    data.basicInfo.productDesc = getVal('B9') || '';

    // PCB 板材
    data.basicInfo.pcbMaterial = getVal('B10') || '';
    data.basicInfo.pcbLayers = getVal('D10') || '';
    data.basicInfo.pcbSurface = {
      enig: parseCheckbox(getVal('F10')),
      osp: parseCheckbox(getVal('G10'))
    };

    // 品質水準
    data.basicInfo.qualityLevel = {
      class2: parseCheckbox(getVal('B11')),
      class3: parseCheckbox(getVal('C11'))
    };
    data.basicInfo.ipcStandard = {
      ipcA610: parseCheckbox(getVal('E11')),
      jStd001: parseCheckbox(getVal('F11'))
    };

    // PCBA 資訊
    data.basicInfo.pcbaType = {
      single: parseCheckbox(getVal('B12')),
      double: parseCheckbox(getVal('C12'))
    };

    // 加工項目 (Checkbox)
    data.basicInfo.processItems = {
      smt: parseCheckbox(getVal('A15')),
      dip: parseCheckbox(getVal('B15')),
      ict: parseCheckbox(getVal('C15')),
      assembly: parseCheckbox(getVal('D15')),
      coating: parseCheckbox(getVal('E15')),
      packing: parseCheckbox(getVal('F15')),
      fct: parseCheckbox(getVal('A16')),
      flyingProbe: parseCheckbox(getVal('B16')),
      finalTest: parseCheckbox(getVal('C16'))
    };

    // AOI
    data.basicInfo.aoi = {
      top: parseCheckbox(getVal('B17')),
      bottom: parseCheckbox(getVal('C17'))
    };

    // 點膠與 QR code
    data.basicInfo.glue = parseCheckbox(getVal('A18'));
    data.basicInfo.qrCode = {
      need: parseCheckbox(getVal('E18')),
      noNeed: parseCheckbox(getVal('F18'))
    };

    // 序號管控
    data.basicInfo.snControl = {
      need: parseCheckbox(getVal('B19')),
      noNeed: parseCheckbox(getVal('C19'))
    };

    // 特殊/風險零件清單 (R23, R24)
    data.basicInfo.riskParts = [
      {
        id: 1,
        name: getVal('B23') || '',
        packageType: getVal('D23') || '',
        riskDesc: getVal('E23') || ''
      },
      {
        id: 2,
        name: getVal('B24') || '',
        packageType: getVal('D24') || '',
        riskDesc: getVal('E24') || ''
      }
    ];

    // 工程文件一覽表 (Checkbox)
    data.basicInfo.documents = {
      bom: parseCheckbox(getVal('A28')),
      gerber: parseCheckbox(getVal('C28')),
      coordinate: parseCheckbox(getVal('E28')),
      placement: parseCheckbox(getVal('G28')),
      materialSpec: parseCheckbox(getVal('A29')),
      mechDrawing: parseCheckbox(getVal('C29')),
      productSpec: parseCheckbox(getVal('E29')),
      reflowProfile: parseCheckbox(getVal('G29')),
      assemblySop: parseCheckbox(getVal('A30')),
      testSop: parseCheckbox(getVal('C30')),
      smtSpec: parseCheckbox(getVal('E30')),
      packingSop: parseCheckbox(getVal('G30'))
    };

    // 治工具一覽表
    data.basicInfo.tooling = {
      stencil: {
        thickness: getVal('B34') || '',
        apertureRatio: getVal('C34') || '',
        laserCut: parseCheckbox(getVal('D34')),
        qty: getVal('E34') || ''
      },
      routingFixture: {
        need: parseCheckbox(getVal('B35')),
        noNeed: parseCheckbox(getVal('C35')),
        qty: getVal('D35') || ''
      },
      glueFixture: {
        need: parseCheckbox(getVal('B36')),
        noNeed: parseCheckbox(getVal('C36')),
        qty: getVal('D36') || ''
      },
      testFixture: {
        need: parseCheckbox(getVal('B37')),
        noNeed: parseCheckbox(getVal('C37')),
        qty: getVal('D37') || ''
      },
      assemblyFixture: {
        need: parseCheckbox(getVal('B38')),
        noNeed: parseCheckbox(getVal('C38')),
        qty: getVal('D38') || ''
      }
    };

    // 簽核欄
    data.basicInfo.signOff = {
      supplierConfirm: getVal('B41') || getVal('A41') || '',
      engineeringReview: getVal('D41') || getVal('C41') || '',
      rdConfirm: getVal('G41') || getVal('F41') || ''
    };
  }

  // 2. 解析【製程管制與前置作業】工作表
  const sheet2 = workbook.Sheets['製程管制與前置作業'];
  if (sheet2) {
    const getVal = (addr) => sheet2[addr] ? sheet2[addr].v : null;

    // 前置作業
    data.processControl.sampleProvided = {
      trialBoard: parseCheckbox(getVal('B5')),
      tempBoard: parseCheckbox(getVal('C5')),
      standardPart: parseCheckbox(getVal('D5'))
    };

    data.processControl.bakeRequired = {
      need: parseCheckbox(getVal('B6')),
      noNeed: parseCheckbox(getVal('C6')),
      pcbBakeCond: getVal('D6') || '',
      fpcaBakeCond: getVal('D7') || ''
    };

    data.processControl.smtFirstPiece = {
      polarity: parseCheckbox(getVal('B8')),
      measureLcr: parseCheckbox(getVal('D8'))
    };

    // SMT/DIP 製程管制
    data.processControl.smtOrder = {
      bToT: parseCheckbox(getVal('B11')),
      tToB: parseCheckbox(getVal('C11'))
    };
    data.processControl.dipOrder = {
      bToT: parseCheckbox(getVal('E11')),
      tToB: parseCheckbox(getVal('F11'))
    };

    data.processControl.keyParts = {
      has: parseCheckbox(getVal('B12')),
      none: parseCheckbox(getVal('C12'))
    };

    // 測溫點配置 (R15, R16)
    data.processControl.tempPoints = [
      {
        id: 1,
        pos: getVal('B15') || '',
        desc: getVal('C15') || '',
        memo: getVal('D15') || ''
      },
      {
        id: 2,
        pos: getVal('B16') || '',
        desc: getVal('C16') || '',
        memo: getVal('D16') || ''
      }
    ];

    // Underfill
    data.processControl.underfill = {
      bakeCond: getVal('B18') || '',
      glueModel: getVal('D18') || ''
    };

    // PCBA 重工/維修記號
    data.processControl.reworkMark = {
      need: parseCheckbox(getVal('B19')),
      noNeed: parseCheckbox(getVal('C19')),
      sopMark: getVal('E19') || ''
    };

    // 特殊製程備註
    data.processControl.specialProcessMemo = getVal('A22') || '';

    // 包裝方式
    data.processControl.packaging = {
      staticBag: parseCheckbox(getVal('B25')),
      honeycomb: parseCheckbox(getVal('D25')),
      tray: parseCheckbox(getVal('F25'))
    };
  }

  // 3. 解析【試產報告要求】工作表
  const sheet3 = workbook.Sheets['試產報告要求'];
  if (sheet3) {
    const getVal = (addr) => sheet3[addr] ? sheet3[addr].v : null;

    // 試產驗證目標
    data.trialReport.passCriteria = {
      smtYield: getVal('C6') || '',
      boardBending: getVal('C7') || '',
      spiCpk: getVal('C8') || '',
      dfmPoints: getVal('C9') || ''
    };

    // A. 印刷品質 / 迴焊紀錄
    data.trialReport.printRecords = [
      { id: 1, name: getVal('B13') || '', checked: parseCheckbox(getVal('C13')), date: getVal('D13') || '' },
      { id: 2, name: getVal('B14') || '', checked: parseCheckbox(getVal('C14')), date: getVal('D14') || '' },
      { id: 3, name: getVal('B15') || '', checked: parseCheckbox(getVal('C15')), date: getVal('D15') || '' }
    ];

    // B. 檢驗紀錄
    data.trialReport.inspectRecords = [
      { id: 1, name: getVal('B19') || '', checked: parseCheckbox(getVal('C19')), date: getVal('D19') || '' },
      { id: 2, name: getVal('B20') || '', checked: parseCheckbox(getVal('C20')), date: getVal('D20') || '' },
      { id: 3, name: getVal('B21') || '', checked: parseCheckbox(getVal('C21')), date: getVal('D21') || '' },
      { id: 4, name: getVal('B22') || '', checked: parseCheckbox(getVal('C22')), date: getVal('D22') || '' },
      { id: 5, name: getVal('B23') || '', checked: parseCheckbox(getVal('C23')), date: getVal('D23') || '' },
      { id: 6, name: getVal('B24') || '', checked: parseCheckbox(getVal('C24')), date: getVal('D24') || '' }
    ];

    // D. 照片提供
    data.trialReport.photoRecords = [
      { id: 1, name: getVal('B31') || '', checked: parseCheckbox(getVal('C31')), date: getVal('D31') || '' },
      { id: 2, name: getVal('B32') || '', checked: parseCheckbox(getVal('C32')), date: getVal('D32') || '' },
      { id: 3, name: getVal('B33') || '', checked: parseCheckbox(getVal('C33')), date: getVal('D33') || '' },
      { id: 4, name: getVal('B34') || '', checked: parseCheckbox(getVal('C34')), date: getVal('D34') || '' },
      { id: 5, name: getVal('B35') || '', checked: parseCheckbox(getVal('C35')), date: getVal('D35') || '' }
    ];
  }

  return data;
}

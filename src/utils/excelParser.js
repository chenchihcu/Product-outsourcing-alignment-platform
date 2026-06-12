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
  return cleanPlaceholder(String(val).replace(/[☑☐]/g, '').trim());
}

// 輔助函數：清洗數量欄位，去除 Checkbox 符號及方格字元
function cleanQty(val) {
  if (val === null || val === undefined) return '';
  return cleanPlaceholder(String(val).replace(/[☑☐□口]/g, '').trim());
}

// 輔助函數：清洗 Excel 佔位符
function cleanPlaceholder(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/[_]{2,}/.test(str)) return '';
  if (/^厚度\s*_+/i.test(str) || String(str).includes('厚度 ____ mm')) return '';
  if (/^開口比\s*_+/i.test(str) || String(str).includes('開口比 ____ %')) return '';
  if (str === '數量' || str === '數量:' || str === 'qty' || str === '______') return '';
  if (str === '委外加工廠' || str === '加工廠' || str === '公司名稱') return '';
  return str;
}


/**
 * 解析新機種製作需求一覽表 Excel 檔案
 * @param {ArrayBuffer} arrayBuffer 
 * @returns {Object} 結構化 JSON 資料
 */
export function parseRequirementExcel(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // D4 — 驗證必要工作表是否存在
  const requiredSheets = ['產品基本資料', '製程管制與前置作業', '試產報告要求'];
  const missingSheets = requiredSheets.filter(s => !workbook.SheetNames.includes(s));
  if (missingSheets.length > 0) {
    throw new Error(`此檔案不符合需求一覽表模板格式（缺少工作表：${missingSheets.join('、')}）`);
  }
  // D4 — 驗證標題列(官方範本 A1 為「…新產品導入…」,舊版為「…新機種…」,兩者皆接受)
  const titleCell = workbook.Sheets['產品基本資料']?.['A1'];
  const titleStr = String(titleCell?.v || '');
  if (titleCell && !titleStr.includes('新機種') && !titleStr.includes('新產品導入')) {
    throw new Error('此檔案不符合需求一覽表模板格式（A1 標題不符）');
  }

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
    data.basicInfo.date = '';
    data.basicInfo.version = '';
    data.basicInfo.factory = cleanPlaceholder(getVal('B4'));
    data.basicInfo.factoryArea = '';

    // 產品階段 (Checkbox)
    data.basicInfo.stage = {
      evt: parseCheckbox(getVal('B5')),
      dvt: parseCheckbox(getVal('C5')),
      pvt: parseCheckbox(getVal('E5')), 
      politRun: parseCheckbox(getVal('F5')),
      ecn: parseCheckbox(getVal('G5'))
    };
    
    // 烘烤參數 (發包方預填/加工廠參考)
    data.basicInfo.pcbBake = getVal('D5') || '';
    data.basicInfo.fpcaBake = getVal('D6') || '';

    // 產品類別 (已移除)
    data.basicInfo.category = { general: false, medical: false };

    data.basicInfo.productNo = getVal('B7') || '';
    data.basicInfo.productDesc = getVal('B8') || '';

    // 品質水準
    data.basicInfo.qualityLevel = {
      class2: parseCheckbox(getVal('B10')),
      class3: parseCheckbox(getVal('C10'))
    };
    data.basicInfo.ipcStandard = {
      ipcA610: parseCheckbox(getVal('E10')),
      jStd001: parseCheckbox(getVal('F10'))
    };

    // PCBA 資訊 (已移除)
    data.basicInfo.pcbaType = { single: false, double: false };
    data.basicInfo.materialType = '';

    // 加工項目 (Checkbox)
    const f15Val = String(getVal('F15') || '');
    const otherProcess = parseCheckbox(getVal('F15'));
    let otherProcessText = '';
    if (otherProcess) {
      const match = f15Val.match(/[☑☐]\s*其他[:：]?\s*(.*)/) || f15Val.match(/其他[:：]?\s*(.*)/);
      if (match) {
        otherProcessText = match[1].replace(/_+/g, '').trim();
      }
    }

    data.basicInfo.processItems = {
      smt: parseCheckbox(getVal('A14')),
      dip: parseCheckbox(getVal('B14')),
      ict: parseCheckbox(getVal('C14')),
      assembly: parseCheckbox(getVal('D14')),
      coating: parseCheckbox(getVal('E14')),
      packing: parseCheckbox(getVal('F14')),
      fct: parseCheckbox(getVal('A15')),
      flyingProbe: parseCheckbox(getVal('B15')),
      finalTest: parseCheckbox(getVal('C15')),
      underfillGlue: parseCheckbox(getVal('D15')),
      semiFinishedTest: parseCheckbox(getVal('E15')),
      otherProcess: otherProcess,
      otherProcessText: otherProcessText
    };

    // AOI
    data.basicInfo.aoi = {
      top: parseCheckbox(getVal('B16')),
      bottom: parseCheckbox(getVal('C16'))
    };

    // 點膠與 QR code
    data.basicInfo.glue = parseCheckbox(getVal('A17'));
    data.basicInfo.qrCode = {
      need: parseCheckbox(getVal('E17')),
      noNeed: parseCheckbox(getVal('F17'))
    };

    // 序號管控
    data.basicInfo.snControl = {
      need: parseCheckbox(getVal('B18')),
      noNeed: parseCheckbox(getVal('C18'))
    };

    // 特殊/風險零件清單 (Row 22, Row 23)
    data.basicInfo.riskParts = [
      {
        id: 1,
        name: getVal('B22') || '',
        packageType: getVal('D22') || '',
        riskDesc: getVal('E22') || ''
      },
      {
        id: 2,
        name: getVal('B23') || '',
        packageType: getVal('D23') || '',
        riskDesc: getVal('E23') || ''
      }
    ];

    // 工程文件一覽表 (Checkbox)
    data.basicInfo.documents = {
      bom: parseCheckbox(getVal('A27')),
      gerber: parseCheckbox(getVal('C27')),
      coordinate: parseCheckbox(getVal('E27')),
      placement: parseCheckbox(getVal('G27')),
      materialSpec: parseCheckbox(getVal('A28')),
      reflowProfile: parseCheckbox(getVal('G28')),
      assemblyPackingSop: parseCheckbox(getVal('A29')) || parseCheckbox(getVal('G29')),
      testSop: parseCheckbox(getVal('C29'))
    };

    // 治工具一覽表
    const d33Val = String(getVal('D33') || '');
    let stencilStyle = 'general';
    if (d33Val.includes('☑ 階梯鋼板')) {
      stencilStyle = 'step';
    } else if (d33Val.includes('☑ 一般鋼板')) {
      stencilStyle = 'general';
    }
    const nanoCoating = d33Val.includes('☑ 奈米鋼板');

    // 解析 A38 SMT刷錫載具
    const a38Val = String(getVal('A38') || '');
    const smtCarrier = {
      need: a38Val.includes('☑ SMT刷錫載具'),
      noNeed: a38Val.includes('☐ SMT刷錫載具'),
      upper: a38Val.includes('☑ 上載板'),
      lower: a38Val.includes('☑ 下載板')
    };
    if (!smtCarrier.need && !smtCarrier.noNeed) {
      smtCarrier.need = false;
      smtCarrier.noNeed = false;
    }

    // 解析 B38 其他治具
    const b38Val = String(getVal('B38') || '');
    const otherFixture = {
      need: b38Val.includes('☑ 其他治具'),
      noNeed: b38Val.includes('☐ 其他治具'),
      name: '',
      qty: ''
    };
    if (otherFixture.need) {
      const match = b38Val.match(/☑ 其他治具:\s*(.*?)(?:\s+數量:\s*(.*))?$/);
      if (match) {
        otherFixture.name = match[1].trim();
        otherFixture.qty = match[2] ? match[2].trim() : '';
      }
    }
    if (!otherFixture.need && !otherFixture.noNeed) {
      otherFixture.need = false;
      otherFixture.noNeed = false;
    }

    const stencilNeed = true; // SMT鋼板需求是 100%，強制為 true
    data.basicInfo.tooling = {
      stencil: {
        need: stencilNeed,
        noNeed: false,
        thickness: cleanPlaceholder(getVal('B33')),
        apertureRatio: cleanPlaceholder(getVal('C33')),
        style: stencilStyle,
        nanoCoating: nanoCoating
      },
      routingFixture: {
        need: parseCheckbox(getVal('B34')),
        noNeed: parseCheckbox(getVal('C34')),
        qty: cleanQty(getVal('D34'))
      },
      glueFixture: {
        need: parseCheckbox(getVal('B35')),
        noNeed: parseCheckbox(getVal('C35')),
        qty: cleanQty(getVal('D35'))
      },
      testFixture: {
        need: parseCheckbox(getVal('B36')),
        noNeed: parseCheckbox(getVal('C36')),
        qty: cleanQty(getVal('D36'))
      },
      assemblyFixture: {
        need: parseCheckbox(getVal('B37')),
        noNeed: parseCheckbox(getVal('C37')),
        qty: cleanQty(getVal('D37'))
      },
      smtCarrier,
      otherFixture
    };

    // 簽核欄 (更新對應：B40 研發, D40 工程, G40 品保)
    data.basicInfo.signOff = {
      rdConfirm: getVal('B40') || '',
      engineeringReview: getVal('D40') || '',
      qaConfirm: getVal('G40') || ''
    };

    // 解析 G1 儲存格以還原防呆鎖定狀態與電子簽章
    const g1Val = getVal('G1');
    if (g1Val) {
      try {
        const parsed = JSON.parse(g1Val);
        if (parsed && typeof parsed === 'object') {
          if ('owners' in parsed && 'signatures' in parsed) {
            data._owners = parsed.owners || {};
            // 還原簽名圖檔
            if (data.basicInfo.signOff && parsed.signatures) {
              data.basicInfo.signOff.rdSignature = parsed.signatures.rdSignature || '';
              data.basicInfo.signOff.engineeringReviewSignature = parsed.signatures.engineeringReviewSignature || '';
              data.basicInfo.signOff.qaSignature = parsed.signatures.qaSignature || '';
            }
          } else {
            // 舊版相容性：G1 直接是 owners
            data._owners = parsed;
          }
        } else {
          data._owners = {};
        }
      } catch (e) {
        // V4 — G1 損毀時給出可見警告
        console.warn('[parser] G1 欄位擁有者資料損毀，已重設為預設值，請確認填寫權限是否正確。', e);
        data._owners = {};
      }
    } else {
      data._owners = {};
      // 第一次載入且無 G1 備份時，自動初始化特定角色欄位擁有權
      if (data.basicInfo.stage?.evt) data._owners['basicInfo.stage.evt'] = '研發單位';
      if (data.basicInfo.stage?.dvt) data._owners['basicInfo.stage.dvt'] = '研發單位';
      if (data.basicInfo.stage?.pvt) data._owners['basicInfo.stage.pvt'] = '工程單位';
      if (data.basicInfo.stage?.politRun) data._owners['basicInfo.stage.politRun'] = '工程單位';
    }

    // 相容舊版：將殘留的 stage.* 擁有者 key 遷移為 basicInfo.stage.*
    ['evt', 'dvt', 'pvt', 'politRun', 'ecn'].forEach(k => {
      if (data._owners[`stage.${k}`] !== undefined) {
        data._owners[`basicInfo.stage.${k}`] = data._owners[`stage.${k}`];
        delete data._owners[`stage.${k}`];
      }
    });
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

    const pcbCondVal = getVal('D6') || '';
    const fpcaCondVal = getVal('D7') || '';
    
    // 解析 PCB 烘烤條件 (V3 — 支援全形 ℃ 與多餘空白)
    const pcbNorm = String(pcbCondVal).replace(/℃/g, '°C').replace(/\s+/g, ' ');
    const pcbMatch = pcbNorm.match(/PCB 烘烤:\s*([_\d]+)\s*°C\s*±\s*([_\d]+)\s*°C\s*×\s*([_\d]+)\s*hr[（(]依 PCB 廠建議[）)]/);
    let pcbBakeTemp = '', pcbBakeTol = '', pcbBakeHr = '';
    if (pcbMatch) {
      pcbBakeTemp = pcbMatch[1].replace(/_/g, '').trim();
      pcbBakeTol = pcbMatch[2].replace(/_/g, '').trim();
      pcbBakeHr = pcbMatch[3].replace(/_/g, '').trim();
    } else {
      const numbers = String(pcbCondVal).match(/\d+/g);
      if (numbers && numbers.length >= 3) {
        pcbBakeTemp = numbers[0];
        pcbBakeTol = numbers[1];
        pcbBakeHr = numbers[2];
      }
    }

    // 解析 FPCA 烘烤條件 (V3 — 支援全形 ℃ 與多餘空白)
    const fpcaNorm = String(fpcaCondVal).replace(/℃/g, '°C').replace(/\s+/g, ' ');
    const fpcaMatch = fpcaNorm.match(/FPCA 烘烤:\s*依原物料規格書，若無規格則\s*_*([_\d]+)_*\s*°C\s*×\s*_*([_\d]+)_*\s*hr/);
    let fpcaBakeTemp = '', fpcaBakeHr = '';
    if (fpcaMatch) {
      fpcaBakeTemp = fpcaMatch[1].replace(/_/g, '').trim();
      fpcaBakeHr = fpcaMatch[2].replace(/_/g, '').trim();
    } else {
      const numbers = String(fpcaCondVal).match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        fpcaBakeTemp = numbers[0];
        fpcaBakeHr = numbers[1];
      }
    }

    data.processControl.bakeRequired = {
      need: parseCheckbox(getVal('B6')),
      noNeed: parseCheckbox(getVal('C6')),
      pcbBakeCond: pcbCondVal,
      fpcaBakeCond: fpcaCondVal,
      pcbBakeTemp,
      pcbBakeTol,
      pcbBakeHr,
      fpcaBakeTemp,
      fpcaBakeHr
    };

    data.processControl.smtFirstPiece = {
      polarity: parseCheckbox(getVal('B8')),
      measureLcr: parseCheckbox(getVal('D8')),
      spi: parseCheckbox(getVal('C8')),
      steelTension: parseCheckbox(getVal('E8')),
      ledTest: parseCheckbox(getVal('F8')) ? 'yes' : (parseCheckbox(getVal('G8')) ? 'no' : null),
      pcbReflow: parseCheckbox(getVal('H8')),
      solderability: parseCheckbox(getVal('I8'))
    };

    const cleanDipMemo = (val) => {
      if (!val) return '';
      return String(val).replace(/^注意事項[:：]\s*/, '').trim();
    };

    data.processControl.dipFirstPiece = {
      cutLead: parseCheckbox(getVal('B9')),
      memo: cleanDipMemo(getVal('D9'))
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

    // 測溫點配置 (點 1 獨立，點 2~6 拼接拆分)
    const pts = [];
    pts.push({
      id: 1,
      pos: String(getVal('B15') || '').trim(),
      desc: String(getVal('C15') || '').trim(),
      memo: String(getVal('D15') || '').trim()
    });

    const rawPos = String(getVal('B16') || '').split(/[,，]+/);
    const rawDesc = String(getVal('C16') || '').split(/[,，\s\n]+/);
    const rawMemo = String(getVal('D16') || '').split(/[,，\s\n]+/);

    for (let i = 0; i < 5; i++) {
      pts.push({
        id: i + 2,
        pos: (rawPos[i] || '').trim(),
        desc: (rawDesc[i] || '').trim(),
        memo: (rawMemo[i] || '').trim()
      });
    }
    data.processControl.tempPoints = pts;

    // Underfill
    const rawBake = getVal('B18') || '';
    let bakeTemp = '';
    let bakeTime = '';
    if (rawBake && !String(rawBake).includes('__')) {
      const match = String(rawBake).match(/(\d+)\s*°C.*(\d+)\s*min/i);
      if (match) {
        bakeTemp = match[1];
        bakeTime = match[2];
      }
    }

    const rawGlue = getVal('D18') || '';
    let glueModel = String(rawGlue).trim();
    if (glueModel.includes('___') || glueModel === '膠材型號:' || glueModel === '膠材型號:___________') {
      glueModel = '';
    }

    data.processControl.underfill = {
      bakeTemp,
      bakeTime,
      glueModel
    };

    // PCBA 重工/維修記號
    data.processControl.reworkMark = {
      need: parseCheckbox(getVal('B19')),
      noNeed: parseCheckbox(getVal('C19')),
      sopMark: getVal('E19') || ''
    };

    // 特殊製程備註
    data.processControl.specialProcessMemo = getVal('A22') || '';

    // 包裝與包材方式 (解析 B25 的 PCBA，以及 B26 的 FPCA)
    const parsePkgStr = (val) => {
      if (!val) return { staticBag: false, honeycomb: false, tray: false, sensorCover: false, cameraCover: false };
      const str = String(val);
      return {
        staticBag: str.includes('靜電袋'),
        honeycomb: str.includes('蜂巢式抗靜電隔板') || str.includes('蜂巢隔板'),
        tray: str.includes('Tray 抗靜電脆盤') || str.includes('脆盤'),
        sensorCover: str.includes('Sensor 保護貼') || str.includes('Sensor保護貼'),
        cameraCover: str.includes('Camera 保護貼') || str.includes('Camera保護貼')
      };
    };

    data.processControl.pcbaPackaging = parsePkgStr(getVal('B25'));
    data.processControl.fpcaPackaging = parsePkgStr(getVal('B26'));
  }

  // 3. 解析【試產報告要求】工作表
  const sheet3 = workbook.Sheets['試產報告要求'];
  if (sheet3) {
    const getVal = (addr) => sheet3[addr] ? sheet3[addr].v : null;

    // 試產驗證目標 (Pass Criteria 已刪除，傳回空)
    data.trialReport.passCriteria = {};

    // A. 印刷品質 / 迴焊紀錄
    data.trialReport.printRecords = [
      { id: 1, name: getVal('B6') || '', checked: parseCheckbox(getVal('C6')), date: '' },
      { id: 2, name: getVal('B7') || '', checked: parseCheckbox(getVal('C7')), date: '' },
      { id: 3, name: getVal('B8') || '', checked: parseCheckbox(getVal('C8')), date: '' }
    ];

    // B. 檢驗紀錄（移除鋼板IQC；板彎翹曲改原材料檢驗）
    data.trialReport.inspectRecords = [
      { id: 1, name: 'PCB 板彎/翹曲檢驗紀錄（原材料檢驗：烘烤前/烘烤後）', checked: parseCheckbox(getVal('C12')), date: '' },
      { id: 2, name: getVal('B13') || '', checked: parseCheckbox(getVal('C13')), date: '' },
      { id: 3, name: getVal('B14') || '', checked: parseCheckbox(getVal('C14')), date: '' },
      { id: 4, name: getVal('B16') || '', checked: parseCheckbox(getVal('C16')), date: '' },
      { id: 5, name: getVal('B17') || '', checked: parseCheckbox(getVal('C17')), date: '' }
    ];

    // C. SMT 良率報告（單一 checkbox）
    data.trialReport.yieldReport = {
      ready: parseCheckbox(getVal('C20'))
    };

    // D. 照片提供
    const parseXrayParts = (val) => {
      if (!val) return ['', '', '', ''];
      const str = String(val);
      const match = str.match(/指定零件[:：]\s*(.*)/);
      if (match && match[1]) {
          const parts = match[1].split(/[,，\s]+/).map(p => cleanPlaceholder(p.trim())).filter(Boolean);
        const res = ['', '', '', ''];
        for (let i = 0; i < 4; i++) {
          res[i] = parts[i] || '';
        }
        return res;
      }
      return ['', '', '', ''];
    };

    const photoB25 = getVal('B25') || '';
    data.trialReport.photoRecords = [
      { id: 1, name: getVal('B24') || '', checked: parseCheckbox(getVal('C24')), date: '' },
      { 
        id: 2, 
        name: photoB25, 
        checked: parseCheckbox(getVal('C25')), 
        date: '',
        isXray: true,
        parts: parseXrayParts(photoB25)
      },
      { id: 3, name: getVal('B26') || '', checked: parseCheckbox(getVal('C26')), date: '' },
      { id: 4, name: getVal('B27') || '', checked: parseCheckbox(getVal('C27')), date: '' },
      { id: 5, name: getVal('B28') || '', checked: parseCheckbox(getVal('C28')), date: '' }
    ];
  }

  return data;
}


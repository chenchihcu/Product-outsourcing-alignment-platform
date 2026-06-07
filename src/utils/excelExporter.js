import * as XLSX from 'xlsx';

// 輔助函數：更新單個儲存格的值
function writeCell(sheet, addr, val) {
  if (!sheet[addr]) {
    sheet[addr] = { t: 's', v: '' };
  }
  sheet[addr].v = val;
  sheet[addr].t = typeof val === 'number' ? 'n' : 's';
  delete sheet[addr].w; // 清除格式化快取，強迫重算
}

// 輔助函數：更新 Checkbox 儲存格
function writeCheckbox(sheet, addr, label, isChecked) {
  const mark = isChecked ? '☑' : '☐';
  writeCell(sheet, addr, `${mark} ${label}`);
}

// 套用排版格式（欄寬、合併儲存格、以及簽核區對齊）
function applyFormatting(sheet) {
  if (!sheet) return;

  // 設定更佳的欄寬（wch = characters width）以避免內容被裁切
  sheet['!cols'] = [
    { wch: 8 },  // A
    { wch: 22 }, // B
    { wch: 18 }, // C
    { wch: 15 }, // D
    { wch: 22 }, // E
    { wch: 15 }, // F
    { wch: 18 }, // G
  ];

  // 設定統一列高以優化行距與排版
  sheet['!rows'] = sheet['!rows'] || [];
  for (let i = 0; i < 45; i++) {
    sheet['!rows'][i] = sheet['!rows'][i] || {};
    if (i === 0) {
      sheet['!rows'][i].hpt = 32; // 跨欄標題行高
    } else {
      sheet['!rows'][i].hpt = 22; // 一般欄位行高
    }
  }

  // 初始化 merges 容器
  sheet['!merges'] = sheet['!merges'] || [];

  // 嘗試合併簽核區，使簽核欄位看起來像正式報表
  // B40:C40 (供應商確認)、D40:E40 (工程覆核)、F40:G40 (RD確認)
  try {
    sheet['!merges'].push({ s: { r: 39, c: 1 }, e: { r: 39, c: 2 } });
    sheet['!merges'].push({ s: { r: 39, c: 3 }, e: { r: 39, c: 4 } });
    sheet['!merges'].push({ s: { r: 39, c: 5 }, e: { r: 39, c: 6 } });
  } catch (e) {
    // ignore merge errors
  }

  // 嘗試合併標題列（若存在 A1）為跨欄標題，提升報表感
  try {
    if (sheet['A1']) {
      // 合併 A1 到 G1
      sheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } });
      sheet['A1'].s = sheet['A1'].s || {};
      sheet['A1'].s.font = sheet['A1'].s.font || {};
      sheet['A1'].s.font.sz = 14;
      sheet['A1'].s.font.bold = true;
      sheet['A1'].s.font.name = '微軟正黑體';
      sheet['A1'].s.alignment = sheet['A1'].s.alignment || {};
      sheet['A1'].s.alignment.horizontal = 'center';
      sheet['A1'].s.alignment.vertical = 'center';

      // 設定第一列高度（點數）
      sheet['!rows'] = sheet['!rows'] || [];
      sheet['!rows'][0] = sheet['!rows'][0] || {};
      sheet['!rows'][0].hpt = 22; // height in points
    }
  } catch (e) {
    // ignore
  }

  // 設定列印與頁面方向（A4 橫向）
  try {
    sheet['!pageSetup'] = sheet['!pageSetup'] || {};
    sheet['!pageSetup'].orientation = 'landscape';
    sheet['!pageSetup'].paperSize = 9; // A4
    sheet['!pageSetup'].fitToPage = true;
  } catch (e) {
    // ignore
  }

  // 邊框 helper：為儲存格設定細邊框
  const setThinBorder = (cell) => {
    if (!cell) return;
    cell.s = cell.s || {};
    cell.s.border = {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
    };
  };

  // 為標題列 A1:G1 設邊框
  try {
    const headerAddrs = ['A1','B1','C1','D1','E1','F1','G1'];
    headerAddrs.forEach(a => setThinBorder(sheet[a]));
  } catch (e) {}

  // 為簽核合併區設定邊框與列高
  try {
    // 簽核列在 40（index 39）
    sheet['!rows'] = sheet['!rows'] || [];
    sheet['!rows'][39] = sheet['!rows'][39] || {};
    sheet['!rows'][39].hpt = 26;

    // top-left cells of merged sign areas
    setThinBorder(sheet['B40']);
    setThinBorder(sheet['D40']);
    setThinBorder(sheet['F40']);
  } catch (e) {}

  // 將簽核儲存格置中對齊（如果存在）
  const setAlign = (addr) => {
    const cell = sheet[addr];
    if (!cell) return;
    cell.s = cell.s || {};
    cell.s.alignment = cell.s.alignment || {};
    cell.s.alignment.horizontal = 'center';
    cell.s.alignment.vertical = 'center';
  };

  setAlign('B40');
  setAlign('D40');
  setAlign('G40');

  // 對於第一行或重要表頭，可嘗試置中（若存在）
  if (sheet['A1']) {
    sheet['A1'].s = sheet['A1'].s || {};
    sheet['A1'].s.alignment = sheet['A1'].s.alignment || {};
    sheet['A1'].s.alignment.horizontal = 'center';
  }
}

/**
 * 將使用者填寫好的資料回填至原始 Excel 活頁簿中並導出
 * @param {Object} originalWorkbook - 原始讀入的 SheetJS workbook 物件
 * @param {Object} data - 更新後的 JSON 資料
 * @returns {ArrayBuffer} 導出的 Excel ArrayBuffer
 */
export function exportRequirementExcel(originalWorkbook, data) {
  // 複製一份 workbook 以免修改到原始的
  const wb = JSON.parse(JSON.stringify(originalWorkbook));

  // 1. 更新【產品基本資料】
  const sheet1 = wb.Sheets['產品基本資料'] || wb.Sheets[wb.SheetNames[0]];
  if (sheet1) {
    const bi = data.basicInfo || {};
    
    // 基本欄位
    writeCell(sheet1, 'B4', bi.factory || '');

    // 產品階段 Checkbox (mpSmall 改為 politRun)
    const stage = bi.stage || {};
    writeCheckbox(sheet1, 'B5', 'EVT', stage.evt);
    writeCheckbox(sheet1, 'C5', 'DVT', stage.dvt);
    writeCheckbox(sheet1, 'E5', '量產', stage.pvt); 
    writeCheckbox(sheet1, 'F5', 'Polit-run', stage.politRun);
    writeCheckbox(sheet1, 'G5', 'ECN改版', stage.ecn);

    // 烘烤
    writeCell(sheet1, 'D5', bi.pcbBake || '');
    writeCell(sheet1, 'D6', bi.fpcaBake || '');

    // 產品類別
    const cat = bi.category || {};
    writeCheckbox(sheet1, 'B6', '一般', cat.general);
    writeCheckbox(sheet1, 'C6', '醫療', cat.medical);

    writeCell(sheet1, 'B7', bi.productNo || '');
    writeCell(sheet1, 'B8', bi.productDesc || '');

    // PCB 板材
    writeCell(sheet1, 'B9', bi.pcbMaterial || '');
    writeCell(sheet1, 'D9', bi.pcbLayers || '');
    const pcbSurf = bi.pcbSurface || {};
    writeCheckbox(sheet1, 'F9', 'ENIG', pcbSurf.enig);
    writeCheckbox(sheet1, 'G9', 'OSP', pcbSurf.osp);

    // 品質水準
    const ql = bi.qualityLevel || {};
    writeCheckbox(sheet1, 'B10', 'Class 2', ql.class2);
    writeCheckbox(sheet1, 'C10', 'Class 3', ql.class3);
    const ipc = bi.ipcStandard || {};
    writeCheckbox(sheet1, 'E10', 'IPC-A-610', ipc.ipcA610);
    writeCheckbox(sheet1, 'F10', 'J-STD-001', ipc.jStd001);

    // PCBA 資訊
    const pcba = bi.pcbaType || {};
    writeCheckbox(sheet1, 'B11', '單面', pcba.single);
    writeCheckbox(sheet1, 'C11', '雙面', pcba.double);

    // 加工項目
    const pi = bi.processItems || {};
    writeCheckbox(sheet1, 'A14', 'SMT', pi.smt);
    writeCheckbox(sheet1, 'B14', 'DIP', pi.dip);
    writeCheckbox(sheet1, 'C14', 'ICT', pi.ict);
    writeCheckbox(sheet1, 'D14', '組裝', pi.assembly);
    writeCheckbox(sheet1, 'E14', '三防膠塗覆', pi.coating);
    writeCheckbox(sheet1, 'F14', '包裝', pi.packing);
    writeCheckbox(sheet1, 'A15', 'FCT', pi.fct);
    writeCheckbox(sheet1, 'B15', 'Flying Probe', pi.flyingProbe);
    writeCheckbox(sheet1, 'C15', '成品測試', pi.finalTest);

    // AOI
    const aoi = bi.aoi || {};
    writeCheckbox(sheet1, 'B16', 'Top', aoi.top);
    writeCheckbox(sheet1, 'C16', 'Bottom', aoi.bottom);

    // 點膠與 QR code
    writeCheckbox(sheet1, 'A17', '點膠', bi.glue);
    const qr = bi.qrCode || {};
    writeCheckbox(sheet1, 'E17', '需要', qr.need);
    writeCheckbox(sheet1, 'F17', '不需要', qr.noNeed);

    // 序號管控
    const sn = bi.snControl || {};
    writeCheckbox(sheet1, 'B18', '需要', sn.need);
    writeCheckbox(sheet1, 'C18', '不需要', sn.noNeed);

    // 特殊零件
    if (bi.riskParts && bi.riskParts.length >= 2) {
      writeCell(sheet1, 'B22', bi.riskParts[0].name || '');
      writeCell(sheet1, 'D22', bi.riskParts[0].packageType || '');
      writeCell(sheet1, 'E22', bi.riskParts[0].riskDesc || '');

      writeCell(sheet1, 'B23', bi.riskParts[1].name || '');
      writeCell(sheet1, 'D23', bi.riskParts[1].packageType || '');
      writeCell(sheet1, 'E23', bi.riskParts[1].riskDesc || '');
    }

    // 工程文件
    const docs = bi.documents || {};
    writeCheckbox(sheet1, 'A27', '材料清單 BOM', docs.bom);
    writeCheckbox(sheet1, 'C27', 'Gerber file / CAD', docs.gerber);
    writeCheckbox(sheet1, 'E27', '座標檔', docs.coordinate);
    writeCheckbox(sheet1, 'G27', '零件位置圖', docs.placement);
    writeCheckbox(sheet1, 'A28', '原物料規格書', docs.materialSpec);
    writeCheckbox(sheet1, 'C28', '機構圖', docs.mechDrawing);
    writeCheckbox(sheet1, 'E28', '產品規格書', docs.productSpec);
    writeCheckbox(sheet1, 'G28', 'Reflow 建議曲線圖', docs.reflowProfile);
    writeCheckbox(sheet1, 'A29', '組裝作業標準書', docs.assemblySop);
    writeCheckbox(sheet1, 'C29', '測試作業標準書', docs.testSop);
    writeCheckbox(sheet1, 'E29', 'SMT工藝規範', docs.smtSpec);
    writeCheckbox(sheet1, 'G29', '包裝作業標準書', docs.packingSop);

    // 治工具
    const tool = bi.tooling || {};
    writeCell(sheet1, 'B33', tool.stencil?.thickness || '');
    writeCell(sheet1, 'C33', tool.stencil?.apertureRatio || '');
    writeCheckbox(sheet1, 'D33', '雷射切割', tool.stencil?.laserCut);
    writeCell(sheet1, 'E33', tool.stencil?.qty || '');

    const checkFixtureWrite = (addrNeed, addrNoNeed, addrQty, fData) => {
      writeCheckbox(sheet1, addrNeed, '', fData?.need);
      writeCheckbox(sheet1, addrNoNeed, '', fData?.noNeed);
      writeCell(sheet1, addrQty, fData?.qty || '');
    };
    checkFixtureWrite('B34', 'C34', 'D34', tool.routingFixture);
    checkFixtureWrite('B35', 'C35', 'D35', tool.glueFixture);
    checkFixtureWrite('B36', 'C36', 'D36', tool.testFixture);
    checkFixtureWrite('B37', 'C37', 'D37', tool.assemblyFixture);

    // 簽核回寫對齊 (B40 研發, D40 工程, G40 品保)
    const sign = bi.signOff || {};
    writeCell(sheet1, 'B40', sign.rdConfirm || '');
    writeCell(sheet1, 'D40', sign.engineeringReview || '');
    writeCell(sheet1, 'G40', sign.qaConfirm || '');
  }

  // 2. 更新【製程管制與前置作業】
  const sheet2 = wb.Sheets['製程管制與前置作業'];
  if (sheet2) {
    const pc = data.processControl || {};
    const bi = data.basicInfo || {};
    
    // 同步料號
    writeCell(sheet2, 'B2', bi.productNo || '');
    writeCell(sheet2, 'D2', bi.productNo || '');

    // 樣品提供
    const sample = pc.sampleProvided || {};
    writeCheckbox(sheet2, 'B5', '試錫板', sample.trialBoard);
    writeCheckbox(sheet2, 'C5', '測溫板', sample.tempBoard);
    writeCheckbox(sheet2, 'D5', '標準件', sample.standardPart);

    // 烘烤
    const bake = pc.bakeRequired || {};
    writeCheckbox(sheet2, 'B6', '需要', bake.need);
    writeCheckbox(sheet2, 'C6', '不需要', bake.noNeed);
    writeCell(sheet2, 'D6', bake.pcbBakeCond || '');
    writeCell(sheet2, 'D7', bake.fpcaBakeCond || '');

    // 首件
    const smtFirst = pc.smtFirstPiece || {};
    writeCheckbox(sheet2, 'B8', '極性方向', smtFirst.polarity);
    writeCheckbox(sheet2, 'D8', '量測電容、電阻、電感', smtFirst.measureLcr);

    // 焊接順序
    const smtOrder = pc.smtOrder || {};
    writeCheckbox(sheet2, 'B11', '先焊底面(B→T)', smtOrder.bToT);
    writeCheckbox(sheet2, 'C11', '先焊頂面(T→B)', smtOrder.tToB);

    const dipOrder = pc.dipOrder || {};
    writeCheckbox(sheet2, 'E11', '先焊底面(B→T)', dipOrder.bToT);
    writeCheckbox(sheet2, 'F11', '先焊頂面(T→B)', dipOrder.tToB);

    // 關鍵零件
    const kp = pc.keyParts || {};
    writeCheckbox(sheet2, 'B12', '有', kp.has);
    writeCheckbox(sheet2, 'C12', '無', kp.none);

    // 測溫點
    if (pc.tempPoints && pc.tempPoints.length >= 2) {
      writeCell(sheet2, 'B15', pc.tempPoints[0].pos || '');
      writeCell(sheet2, 'C15', pc.tempPoints[0].desc || '');
      writeCell(sheet2, 'D15', pc.tempPoints[0].memo || '');

      writeCell(sheet2, 'B16', pc.tempPoints[1].pos || '');
      writeCell(sheet2, 'C16', pc.tempPoints[1].desc || '');
      writeCell(sheet2, 'D16', pc.tempPoints[1].memo || '');
    }

    // Underfill (將溫度與時間拼接回寫)
    const uf = pc.underfill || {};
    const bakeCond = (uf.bakeTemp && uf.bakeTime) ? `${uf.bakeTemp}°C × ${uf.bakeTime}min` : '';
    writeCell(sheet2, 'B18', bakeCond);
    writeCell(sheet2, 'D18', uf.glueModel ? `膠材型號: ${uf.glueModel}` : '');

    // 重工記號
    const rework = pc.reworkMark || {};
    writeCheckbox(sheet2, 'B19', '需要', rework.need);
    writeCheckbox(sheet2, 'C19', '不需要', rework.noNeed);
    writeCell(sheet2, 'E19', rework.sopMark || '');

    // 特殊備註
    writeCell(sheet2, 'A22', pc.specialProcessMemo || '');

    // 包材
    const pkg = pc.packaging || {};
    writeCheckbox(sheet2, 'B25', '靜電袋', pkg.staticBag);
    writeCheckbox(sheet2, 'D25', '蜂巢式抗靜電隔板', pkg.honeycomb);
    writeCheckbox(sheet2, 'F25', 'Tray 抗靜電脆盤', pkg.tray);

    // 簽核 (稽核人員確認 - 回寫品保確認人)
    const sign = bi.signOff || {};
    writeCell(sheet2, 'E34', sign.qaConfirm || '');
  }

  // 3. 更新【試產報告要求】
  const sheet3 = wb.Sheets['試產報告要求'];
  if (sheet3) {
    const tr = data.trialReport || {};
    const bi = data.basicInfo || {};
    writeCell(sheet3, 'B2', bi.productNo || '');

    // 驗證目標保持原有模版內容，不進行寫入

    // 更新列表（A.印刷紀錄, B.檢驗紀錄, D.照片提供）
    const updateRecords = (records, startRow) => {
      records.forEach((rec, idx) => {
        const r = startRow + idx;
        writeCheckbox(sheet3, `C${r}`, '', rec.checked);
      });
    };

    if (tr.printRecords) updateRecords(tr.printRecords, 6);
    if (tr.inspectRecords) updateRecords(tr.inspectRecords, 12);
    if (tr.photoRecords) updateRecords(tr.photoRecords, 24);
  }

  // 在寫出前對每個要輸出的 sheet 套用排版改善
  try {
    const s1 = wb.Sheets['產品基本資料'] || wb.Sheets[wb.SheetNames[0]];
    const s2 = wb.Sheets['製程管制與前置作業'];
    const s3 = wb.Sheets['試產報告要求'];
    applyFormatting(s1);
    applyFormatting(s2);
    applyFormatting(s3);
  } catch (e) {
    // 忽略格式化錯誤，仍然嘗試輸出
    console.warn('applyFormatting error', e);
  }

  const wopts = { bookType: 'xlsx', bookSST: false, type: 'array' };
  const out = XLSX.write(wb, wopts);
  return out;
}

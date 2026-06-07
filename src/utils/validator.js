/**
 * 驗證發包方與委外加工廠的填寫資料，計算對齊率與列出警示資訊
 * @param {Object} data - parseRequirementExcel 解析後的資料
 * @returns {Object} 包含對齊率、警示清單及詳細欄位狀態
 */
export function validateAlignment(data) {
  const warnings = [];
  let totalChecks = 0;
  let passedChecks = 0;

  const check = (condition, warningMsg, type = 'error') => {
    totalChecks++;
    if (condition) {
      passedChecks++;
      return true;
    } else {
      warnings.push({ type, message: warningMsg });
      return false;
    }
  };

  // --- 發包方 (研發/工程) 填寫檢核 ---
  const bi = data.basicInfo || {};
  check(!!bi.productNo, '發包方未填寫「產品料號」', 'error');
  check(!!bi.productDesc, '發包方未填寫「產品名稱 / 描述」', 'warning');

  // 產品階段至少勾選一個
  const stage = bi.stage || {};
  const hasStage = stage.evt || stage.dvt || stage.pvt || stage.mpSmall || stage.ecn;
  check(hasStage, '發包方未勾選「產品階段」（EVT / DVT / PVT / 量產 / ECN）', 'error');

  // 產品類別至少勾選一個
  const cat = bi.category || {};
  const hasCat = cat.general || cat.medical;
  check(hasCat, '發包方未勾選「產品類別」（一般 / 醫療）', 'error');

  // 品質水準要求與 IPC 標準
  const ql = bi.qualityLevel || {};
  const hasQl = ql.class2 || ql.class3;
  check(hasQl, '發包方未勾選「品質水準要求」（Class 2 / Class 3）', 'warning');

  const ipc = bi.ipcStandard || {};
  const hasIpc = ipc.ipcA610 || ipc.jStd001;
  check(hasIpc, '發包方未勾選「IPC 標準」（IPC-A-610 / J-STD-001）', 'warning');

  // PCBA 資訊
  const pcba = bi.pcbaType || {};
  const hasPcba = pcba.single || pcba.double;
  check(hasPcba, '發包方未勾選「PCBA 資訊」（單面 / 雙面）', 'error');

  // 加工項目至少勾選一項
  const pi = bi.processItems || {};
  const hasPi = Object.values(pi).some(v => v);
  check(hasPi, '發包方未勾選任何「加工項目」（如 SMT, DIP 等）', 'error');

  // 工程文件至少勾選一項
  const docs = bi.documents || {};
  const hasDocs = Object.values(docs).some(v => v);
  check(hasDocs, '發包方未勾選任何已具備的「工程文件」（BOM, Gerber 等）', 'warning');

  // --- 委外加工廠回填檢核 ---
  check(!!bi.factory, '加工廠未填寫「委外加工廠」名稱', 'error');

  // 烘烤參數確認
  const pc = data.processControl || {};
  const bake = pc.bakeRequired || {};
  const hasBakeSelect = bake.need || bake.noNeed;
  check(hasBakeSelect, '加工廠未確認是否需要「PCB / FPC 烘烤」', 'error');
  
  if (bake.need) {
    check(!!bake.pcbBakeCond && !bake.pcbBakeCond.includes('_____'), '已勾選需要烘烤，但未填寫「PCB 烘烤條件」', 'error');
    check(!!bake.fpcaBakeCond && !bake.fpcaBakeCond.includes('_____'), '已勾選需要烘烤，但未填寫「FPCA 烘烤條件」', 'error');
  }

  // 治工具對齊檢核
  const tooling = bi.tooling || {};
  if (pi.smt) {
    // 鋼板厚度與開口比
    check(!!tooling.stencil.thickness && !tooling.stencil.thickness.includes('____'), '加工廠未填寫鋼板「厚度」', 'error');
    check(!!tooling.stencil.apertureRatio && !tooling.stencil.apertureRatio.includes('____'), '加工廠未填寫鋼板「開口比」', 'error');
    check(tooling.stencil.laserCut, '加工廠未確認鋼板是否為「雷射切割」', 'warning');
    check(!!tooling.stencil.qty && !tooling.stencil.qty.includes('__'), '加工廠未填寫鋼板「數量」', 'error');
  }

  // 治具對齊：若加工項目需要，應確認治具
  const checkFixture = (fixture, name) => {
    const hasFixtureConfirm = fixture.need || fixture.noNeed;
    check(hasFixtureConfirm, `加工廠未確認「${name}」是否需要或提供`, 'error');
    if (fixture.need) {
      check(!!fixture.qty && !fixture.qty.includes('__'), `已確認需要「${name}」，但未填寫數量`, 'error');
    }
  };
  checkFixture(tooling.routingFixture, 'Routing 治具');
  checkFixture(tooling.glueFixture, '塗膠治具');
  checkFixture(tooling.testFixture, '測試治具');
  checkFixture(tooling.assemblyFixture, '組裝治具');

  // SMT/DIP 首件檢查與樣品提供
  const hasSample = pc.sampleProvided?.trialBoard || pc.sampleProvided?.tempBoard || pc.sampleProvided?.standardPart;
  check(hasSample, '加工廠未勾選任何提供的「樣品種類」（試錫板 / 測溫板 / 標準件）', 'warning');

  const smtFirst = pc.smtFirstPiece || {};
  const hasSmtFirst = smtFirst.polarity || smtFirst.measureLcr;
  check(hasSmtFirst, '加工廠未確認「SMT 首件檢查」項目（極性方向 / LCR量測）', 'error');

  // SMT/DIP 焊接順序
  const smtOrder = pc.smtOrder || {};
  const hasSmtOrder = smtOrder.bToT || smtOrder.tToB;
  check(hasSmtOrder, '加工廠未確認「SMT 焊接順序」（先焊底面 / 先焊頂面）', 'error');

  if (pi.dip) {
    const dipOrder = pc.dipOrder || {};
    const hasDipOrder = dipOrder.bToT || dipOrder.tToB;
    check(hasDipOrder, '加工廠未確認「DIP 焊接順序」', 'error');
  }

  // 測溫點配置：如果有關鍵零件 (或者有 SMT) 且有設測溫點
  const hasKeyParts = pc.keyParts?.has;
  if (hasKeyParts) {
    const tempPoints = pc.tempPoints || [];
    const validPoints = tempPoints.filter(p => !!p.pos && !!p.desc);
    check(validPoints.length >= 2, '已勾選有關鍵零件，但「測溫點配置」未填滿至少 2 點（位置與描述）', 'error');
  }

  // 包材種類
  const pkg = pc.packaging || {};
  const hasPkg = pkg.staticBag || pkg.honeycomb || pkg.tray;
  check(hasPkg, '加工廠未確認「PCBA 包材種類」（靜電袋 / 蜂巢隔板 / 抗靜電脆盤）', 'error');

  // 簽核欄對齊
  const sign = bi.signOff || {};
  check(!!sign.supplierConfirm, '「供應商確認」簽核未填寫', 'error');
  check(!!sign.engineeringReview, '「工程審核」簽核未填寫', 'warning');
  check(!!sign.rdConfirm, '「研發確認」簽核未填寫', 'error');

  // 計算對齊率
  const alignmentRate = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return {
    alignmentRate,
    passedChecks,
    totalChecks,
    warnings
  };
}

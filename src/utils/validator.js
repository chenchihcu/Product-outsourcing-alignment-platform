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
  const pi = bi.processItems || {};
  check(!!bi.productNo, '未填寫「產品料號」', 'error');
  check(!!bi.productDesc, '未填寫「產品名稱 / 描述」', 'warning');

  // 產品階段至少勾選一個 (mpSmall 改為 politRun)
  const stage = bi.stage || {};
  const hasStage = stage.evt || stage.dvt || stage.pvt || stage.politRun || stage.ecn;
  check(hasStage, '未勾選「產品階段」（EVT / DVT / PVT / Pilot-run / ECN）', 'error');

  // --- 委外加工廠回填檢核 ---
  check(!!(bi.factory || '').trim(), '未填寫「委外加工廠」名稱', 'error');

  // 烘烤參數確認
  const pc = data.processControl || {};
  const bake = pc.bakeRequired || {};
  const hasBakeSelect = bake.need || bake.noNeed;
  check(hasBakeSelect, '未確認是否需要「PCB / FPCA 烘烤」', 'error');
  
  if (bake.need) {
    const pcbValid = !!bake.pcbBakeTemp && !!bake.pcbBakeTol && !!bake.pcbBakeHr;
    check(pcbValid, '已勾選需要烘烤，但未填妥「PCB 烘烤條件」數值（溫度 / 容差 / 時間）', 'error');
    const fpcaValid = !!bake.fpcaBakeTemp && !!bake.fpcaBakeHr;
    check(fpcaValid, '已勾選需要烘烤，但未填妥「FPCA 烘烤條件」數值（溫度 / 時間）', 'error');
  }

  const tooling = bi.tooling || {};
  if (pi.smt) {
    const thickStr = String(tooling.stencil.thickness || '');
    const apertStr = String(tooling.stencil.apertureRatio || '');
    check(!!tooling.stencil.thickness && !thickStr.includes('____'), '未填寫鋼板「厚度」', 'error');
    check(!!tooling.stencil.apertureRatio && !apertStr.includes('____'), '未填寫鋼板「開口比」', 'error');
    const hasType = ['general', 'step'].includes(tooling.stencil.style);
    check(hasType, '未選擇鋼板樣式「一般鋼板 / 階梯鋼板」', 'error');
  }

  // 治具對齊：若加工項目需要，應確認治具
  const checkFixture = (fixture, name) => {
    const hasFixtureConfirm = fixture?.need || fixture?.noNeed;
    check(hasFixtureConfirm, `未確認「${name}」是否需要或提供`, 'error');
    if (fixture?.need) {
      const qtyStr = String(fixture.qty || '');
      check(!!fixture.qty && !qtyStr.includes('__'), `已確認需要「${name}」，但未填寫數量`, 'error');
    }
  };
  checkFixture(tooling.routingFixture, 'Routing 治具');
  checkFixture(tooling.glueFixture, '塗膠治具');
  checkFixture(tooling.testFixture, '測試治具');
  checkFixture(tooling.assemblyFixture, '組裝治具');

  // 新增治具校驗
  const smtCarrier = tooling.smtCarrier || {};
  const hasCarrierConfirm = smtCarrier.need || smtCarrier.noNeed;
  check(hasCarrierConfirm, '未確認「SMT 刷錫載具」是否需要', 'error');
  if (smtCarrier.need) {
    const hasCarrierOption = smtCarrier.upper || smtCarrier.lower;
    check(hasCarrierOption, '已勾選需要「SMT 刷錫載具」，但未選擇「上載板」或「下載板」', 'error');
  }

  const otherFixture = tooling.otherFixture || {};
  const hasOtherConfirm = otherFixture.need || otherFixture.noNeed;
  check(hasOtherConfirm, '未確認「其他治具」是否需要', 'error');
    if (otherFixture.need) {
      const otherNameStr = String(otherFixture.name || '');
      const otherQtyStr = String(otherFixture.qty || '');
      check(!!otherFixture.name && !otherNameStr.includes('___'), '已勾選需要「其他治具」，但未填寫治具名稱', 'error');
      check(!!otherFixture.qty && !otherQtyStr.includes('__'), '已勾選需要「其他治具」，但未填寫治具數量', 'error');
    }

  // SMT/DIP 首件檢查與樣品提供
  const hasSample = pc.sampleProvided?.trialBoard || pc.sampleProvided?.tempBoard || pc.sampleProvided?.standardPart;
  check(hasSample, '未勾選任何提供的「樣品種類」（試錫板 / 測溫板 / 標準件）', 'warning');

  const smtFirst = pc.smtFirstPiece || {};
  if (pi.smt) {
    const hasSmtFirst = smtFirst.polarity || smtFirst.measureLcr || smtFirst.spi || smtFirst.steelTension || (smtFirst.ledTest === 'yes' || smtFirst.ledTest === 'no') || smtFirst.pcbReflow || smtFirst.solderability;
    check(hasSmtFirst, '未確認「SMT 首件檢查」項目（極性方向 / LCR量測 / SPI / 鋼板張力量測 / LED點亮測試 / PCB外觀檢查 / 濕潤性檢查）', 'error');

    const hasLedTest = smtFirst.ledTest === 'yes' || smtFirst.ledTest === 'no';
    check(hasLedTest, '未確認 SMT「LED點亮測試」為「有」或「無 (不適用)」', 'error');
  }

  // 新增: DIP 首件校驗 (如果加工項目包含 DIP)
  if (pi.dip) {
    const dipFirst = pc.dipFirstPiece || {};
    check(dipFirst.cutLead, '未勾選 DIP 首件「剪腳前置作業」', 'error');
    if (dipFirst.memo) {
      check(dipFirst.memo.length <= 50, 'DIP 注意事項字數不得超過 50 字', 'error');
    }
  }

  // SMT/DIP 焊接順序
  const smtOrder = pc.smtOrder || {};
  const hasSmtOrder = smtOrder.bToT || smtOrder.tToB;
  check(hasSmtOrder, '未確認「SMT 焊接順序」（先焊底面 / 先焊頂面）', 'error');

  if (pi.dip) {
    const dipOrder = pc.dipOrder || {};
    const hasDipOrder = dipOrder.bToT || dipOrder.tToB;
    check(hasDipOrder, '未確認「DIP 焊接順序」', 'error');
  }

  // 測溫點配置：如果有關鍵零件，最少要有 6 個位置
  const hasKeyParts = pc.keyParts?.has;
  if (hasKeyParts) {
    const tempPoints = pc.tempPoints || [];
    const validPoints = tempPoints.filter(p => !!p.pos);
    check(validPoints.length >= 6, '已勾選有關鍵零件，但「測溫點配置」未填滿至少 6 點位置', 'error');
  }

  // 包材種類 (PCBA 與 FPCA 各需確認至少一項)
  const pcbaPkg = pc.pcbaPackaging || {};
  const hasPcbaPkg = pcbaPkg.staticBag || pcbaPkg.honeycomb || pcbaPkg.tray || pcbaPkg.sensorCover || pcbaPkg.cameraCover;
  check(hasPcbaPkg, '未確認「PCBA 包材種類」（靜電袋 / 蜂巢 / 脆盤 / 保護貼）', 'error');

  const fpcaPkg = pc.fpcaPackaging || {};
  const hasFpcaPkg = fpcaPkg.staticBag || fpcaPkg.honeycomb || fpcaPkg.tray || fpcaPkg.sensorCover || fpcaPkg.cameraCover;
  check(hasFpcaPkg, '未確認「FPCA 包材種類」（靜電袋 / 蜂巢 / 脆盤 / 保護貼）', 'error');

  // 簽核欄對齊（檢查電子簽章圖片）
  const sign = bi.signOff || {};
  check(!!sign.rdSignature, '「研發」電子簽章未上傳', 'error');
  check(!!sign.engineeringReviewSignature, '「工程」電子簽章未上傳', 'error');
  check(!!sign.qaSignature, '「品保處」電子簽章未上傳', 'error');

  // 計算對齊率
  const alignmentRate = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return {
    alignmentRate,
    passedChecks,
    totalChecks,
    warnings
  };
}

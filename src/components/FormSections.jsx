import React from 'react';
import './FormSections.css';

const sectionSvg = {
  chip: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="section-svg">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6v6H9z" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="section-svg">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="section-svg">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  wrench: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="section-svg">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  thermometer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="section-svg">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      <circle cx="11.5" cy="18.5" r="2.5" />
    </svg>
  ),
  microscope: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="section-svg">
      <path d="M6 18h8" />
      <path d="M3 22h18" />
      <path d="M14 22a7 7 0 1 0 0-14h-1" />
      <path d="M9 14h2" />
      <path d="M9 12a1 1 0 0 1 0-2 1 1 0 0 0 0-2" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="section-svg">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="section-svg">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="section-svg">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  printer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="section-svg">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="section-svg">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="section-svg">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
  layers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="section-svg">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
};

const getDocumentIcon = (key) => {
  const commonProps = {
    className: "doc-svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };

  switch (key) {
    case 'bom': // 材料清單 BOM (表格清單)
      return (
        <svg {...commonProps}>
          <path d="M12 6h9M12 12h9M12 18h9M3 6h.01M3 12h.01M3 18h.01" strokeWidth="2.5" />
        </svg>
      );
    case 'gerber': // Gerber file / CAD (電路布線)
      return (
        <svg {...commonProps}>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      );
    case 'coordinate': // 元件座標檔 (靶標定位)
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 2v20M2 12h20" />
        </svg>
      );
    case 'placement': // 零件位置圖 (晶片方向/板子位置)
      return (
        <svg {...commonProps}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="7" y="7" width="10" height="10" rx="1" />
          <path d="M12 7v10M7 12h10" />
        </svg>
      );
    case 'materialSpec': // 原物料規格書 (證書/手冊)
      return (
        <svg {...commonProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case 'reflowProfile': // Reflow 建議曲線 (溫度曲線)
      return (
        <svg {...commonProps}>
          <path d="M3 20h18M3 17l4-4 4 4 6-10 3 3" />
        </svg>
      );
    case 'assemblyPackingSop': // 組裝(包裝)作業標準書 (螺絲起子與工具)
      return (
        <svg {...commonProps}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'testSop': // 測試作業標準書 (波形檢驗)
      return (
        <svg {...commonProps}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
  }
};

export default function FormSections({ data, activeSection, onChange, onNext, currentUser, factories, highlightField }) {
  
  // 取得欄位跳轉定位閃爍之 class
  const getFieldHighlightClass = (fieldName) => {
    if (!highlightField) return '';
    
    // 將警示訊息中的關鍵字對應到對應表單欄位上
    const mapping = {
      factory: ['加工廠'],
      productNo: ['產品料號', '料號'],
      productDesc: ['產品描述', '說明', '描述'],
      stage: ['產品階段', '階段'],
      processItems: ['加工項目'],
      stencil: ['鋼板'],
      routingFixture: ['Routing 治具'],
      glueFixture: ['塗膠治具'],
      testFixture: ['測試治具'],
      assemblyFixture: ['組裝治具'],
      smtCarrier: ['SMT 刷錫載具'],
      otherFixture: ['其他治具'],
      sampleProvided: ['樣品種類'],
      bakeRequired: ['烘烤'],
      smtFirstPiece: ['SMT 首件檢查', 'SMT首件'],
      ledTest: ['LED點亮測試', 'LED'],
      dipFirstPiece: ['DIP 首件檢查', 'DIP首件', '剪腳前置作業'],
      smtOrder: ['SMT 焊接順序'],
      dipOrder: ['DIP 焊接順序'],
      tempPoints: ['測溫點'],
      pcbaPackaging: ['PCBA 包材種類', 'PCBA包材'],
      fpcaPackaging: ['FPCA 包材種類', 'FPCA包材']
    };

    const keywords = mapping[fieldName];
    if (keywords && keywords.some(k => highlightField.includes(k))) {
      return 'highlight-pulse';
    }
    return '';
  };

  // 防呆唯讀管控邏輯
  const isFieldDisabled = (fieldPath) => {
    if (!currentUser) return true;
    if (currentUser.role === 'qa') return true; // QA 品保處僅有審核權，無填寫/修改權
    if (currentUser.role === 'admin') return false; // 管理員不受限

    // 委外加工廠欄位為全域公共資料，不應被鎖定
    if (fieldPath === 'basicInfo.factory') return false;

    // 研發負責 EVT/DVT，工程負責 PVT/Pilot-run
    if (fieldPath === 'stage.evt' || fieldPath === 'stage.dvt') {
      return currentUser.role !== 'rd';
    }
    if (fieldPath === 'stage.pvt' || fieldPath === 'stage.politRun') {
      return currentUser.role !== 'eng';
    }

    // ECN 共享但先勾選鎖定
    if (fieldPath === 'stage.ecn') {
      const ecnChecked = data.basicInfo.stage?.ecn;
      const owner = data._owners?.['stage.ecn'];
      if (ecnChecked && owner && owner !== currentUser.unit) {
        return true;
      }
      return false; 
    }

    // A單位已填寫的, B/C單位無法變更 (通用鎖定 - 支援遞迴檢查父路徑擁有權)
    const parts = fieldPath.split('.');
    let currentPath = '';
    for (let i = 0; i < parts.length; i++) {
      currentPath = currentPath ? `${currentPath}.${parts[i]}` : parts[i];
      const owner = data._owners?.[currentPath];
      if (owner && owner !== currentUser.unit) {
        // 發包方內部（研發單位 與 工程單位）共享編輯基本資料與治工具，不互相鎖定
        const isInternalUnit = (u) => u === '研發單位' || u === '工程單位';
        if (isInternalUnit(owner) && isInternalUnit(currentUser.unit)) {
          continue;
        }
        return true;
      }
    }

    return false;
  };

  const handleBasicChange = (field, val) => {
    const updated = { ...data.basicInfo, [field]: val };
    const path = `basicInfo.${field}`;
    const owners = { ...(data._owners || {}) };
    if (val !== '') {
      owners[path] = currentUser.unit;
    } else {
      delete owners[path];
    }
    onChange({ ...data, basicInfo: updated, _owners: owners });
  };

  const handleStageChange = (field, checked) => {
    const updatedStage = { ...data.basicInfo.stage, [field]: checked };
    const updated = { ...data.basicInfo, stage: updatedStage };
    const path = `stage.${field}`;
    const owners = { ...(data._owners || {}) };
    if (checked) {
      owners[path] = currentUser.unit;
    } else {
      delete owners[path];
    }
    onChange({ ...data, basicInfo: updated, _owners: owners });
  };

  const handleProcessItemsChange = (field, checked) => {
    const updatedItems = { ...data.basicInfo.processItems, [field]: checked };
    const updated = { ...data.basicInfo, processItems: updatedItems };
    const path = `basicInfo.processItems.${field}`;
    const owners = { ...(data._owners || {}) };
    if (checked) {
      owners[path] = currentUser.unit;
    } else {
      delete owners[path];
    }
    onChange({ ...data, basicInfo: updated, _owners: owners });
  };

  const handleToolingChange = (toolKey, field, val) => {
    const tool = data.basicInfo.tooling[toolKey] || {};
    const updatedTool = { ...tool, [field]: val };
    const updatedTooling = { ...data.basicInfo.tooling, [toolKey]: updatedTool };
    const updated = { ...data.basicInfo, tooling: updatedTooling };
    const path = `basicInfo.tooling.${toolKey}.${field}`;
    const owners = { ...(data._owners || {}) };
    if (val !== '' && val !== false) {
      owners[path] = currentUser.unit;
    } else {
      delete owners[path];
    }
    onChange({ ...data, basicInfo: updated, _owners: owners });
  };

  const handleProcessChange = (field, val) => {
    const updated = { ...data.processControl, [field]: val };
    const path = `processControl.${field}`;
    const owners = { ...(data._owners || {}) };
    if (val !== '' && val !== false) {
      owners[path] = currentUser.unit;
    } else {
      delete owners[path];
    }
    onChange({ ...data, processControl: updated, _owners: owners });
  };

  const handleSampleChange = (field, checked) => {
    const updatedSample = { ...data.processControl.sampleProvided, [field]: checked };
    const updated = { ...data.processControl, sampleProvided: updatedSample };
    const path = `processControl.sampleProvided.${field}`;
    const owners = { ...(data._owners || {}) };
    if (checked) {
      owners[path] = currentUser.unit;
    } else {
      delete owners[path];
    }
    onChange({ ...data, processControl: updated, _owners: owners });
  };

  const handleBakeChange = (field, val) => {
    // 數字欄位防呆過濾：僅允許輸入數字
    if (['pcbBakeTemp', 'pcbBakeTol', 'pcbBakeHr', 'fpcaBakeTemp', 'fpcaBakeHr'].includes(field)) {
      val = val.replace(/[^\d]/g, '');
    }

    let updatedBake = { ...data.processControl.bakeRequired, [field]: val };

    if (field === 'need' && val === true) {
      updatedBake.noNeed = false;
      // 預設填寫 FPCA 預設值 (80°C × 4hr)
      if (!updatedBake.fpcaBakeTemp) updatedBake.fpcaBakeTemp = '80';
      if (!updatedBake.fpcaBakeHr) updatedBake.fpcaBakeHr = '4';
    } else if (field === 'noNeed' && val === true) {
      updatedBake.need = false;
    }

    // 重組 PCB 烘烤字串
    if (['pcbBakeTemp', 'pcbBakeTol', 'pcbBakeHr'].includes(field) || (field === 'need' && val === true)) {
      const tempStr = updatedBake.pcbBakeTemp || '_____';
      const tolStr = updatedBake.pcbBakeTol || '___';
      const hrStr = updatedBake.pcbBakeHr || '___';
      updatedBake.pcbBakeCond = `PCB 烘烤: ${tempStr}  °C ± ${tolStr} °C × ${hrStr} hr（依 PCB 廠建議）`;
    }

    // 重組 FPCA 烘烤字串
    if (['fpcaBakeTemp', 'fpcaBakeHr'].includes(field) || (field === 'need' && val === true)) {
      const tempStr = updatedBake.fpcaBakeTemp || '80';
      const hrStr = updatedBake.fpcaBakeHr || '4';
      updatedBake.fpcaBakeCond = `FPCA 烘烤: 依原物料規格書，若無規格則 _${tempStr}__ °C × _${hrStr}__ hr`;
    }

    const updated = { ...data.processControl, bakeRequired: updatedBake };
    const path = `processControl.bakeRequired.${field}`;
    const owners = { ...(data._owners || {}) };
    if (val !== '' && val !== false) {
      owners[path] = currentUser.unit;
    } else {
      delete owners[path];
    }
    onChange({ ...data, processControl: updated, _owners: owners });
  };

  const handleTempPointChange = (index, field, val) => {
    const points = [...data.processControl.tempPoints];
    points[index] = { ...points[index], [field]: val };
    const updated = { ...data.processControl, tempPoints: points };
    const path = `processControl.tempPoints.${index}.${field}`;
    const owners = { ...(data._owners || {}) };
    if (val !== '') {
      owners[path] = currentUser.unit;
    } else {
      delete owners[path];
    }
    onChange({ ...data, processControl: updated, _owners: owners });
  };

  const handleTrialChange = (field, val) => {
    const updatedCriteria = { ...data.trialReport.passCriteria, [field]: val };
    const updated = { ...data.trialReport, passCriteria: updatedCriteria };
    const path = `trialReport.passCriteria.${field}`;
    const owners = { ...(data._owners || {}) };
    if (val !== '' && val !== false) {
      owners[path] = currentUser.unit;
    } else {
      delete owners[path];
    }
    onChange({ ...data, trialReport: updated, _owners: owners });
  };

  const handleRecordChange = (category, index, field, val) => {
    const records = [...data.trialReport[category]];
    records[index] = { ...records[index], [field]: val };
    const updated = { ...data.trialReport, [category]: records };
    const path = `trialReport.${category}.${index}.${field}`;
    const owners = { ...(data._owners || {}) };
    if (val !== '' && val !== false) {
      owners[path] = currentUser.unit;
    } else {
      delete owners[path];
    }
    onChange({ ...data, trialReport: updated, _owners: owners });
  };

  const handleXrayPartChange = (partIdx, val) => {
    const records = [...data.trialReport.photoRecords];
    const xrayIdx = records.findIndex(r => r.isXray);
    if (xrayIdx !== -1) {
      const parts = [...(records[xrayIdx].parts || ['', '', '', ''])];
      parts[partIdx] = val;
      records[xrayIdx] = { ...records[xrayIdx], parts };
      const path = `trialReport.photoRecords.xray.parts.${partIdx}`;
      const owners = { ...(data._owners || {}) };
      if (val !== '') {
        owners[path] = currentUser.unit;
      } else {
        delete owners[path];
      }
      onChange({ ...data, trialReport: { ...data.trialReport, photoRecords: records }, _owners: owners });
    }
  };

  return (
    <div className="sections-container glass-card">
      
      {/* 分頁 1: 產品基本資料 */}
      {activeSection === 'basicInfo' && (
        <div className="section-form animate-fade-in">
          <h2 className="section-title">基本資料</h2>
          <p className="section-subtitle">請核對發包方資訊，並由加工廠確實填寫廠區及治工具資訊。</p>

          {/* 卡片 1: 機種基本資訊 */}
          <div className="form-section-card glass-card" data-accent="indigo">
            <h3 className="card-title"><span className="card-icon-circle">{sectionSvg.chip}</span>機種基本資訊</h3>
            <div className="form-row-grid-3">
              <div className={`form-group required-highlight ${getFieldHighlightClass('factory')}`}>
                <label className="form-label">委外加工廠 <span className="req">*</span></label>
                <select 
                  className="form-input edit-active" 
                  value={data.basicInfo.factory || ''} 
                  onChange={(e) => handleBasicChange('factory', e.target.value)}
                  disabled={isFieldDisabled('basicInfo.factory')}
                >
                  <option value="">-- 請選擇委外加工廠 --</option>
                  {(() => {
                    const currentFac = data.basicInfo.factory;
                    const list = [...factories];
                    if (currentFac && !list.includes(currentFac)) {
                      list.unshift(currentFac);
                    }
                    return list.map(fac => (
                      <option key={fac} value={fac}>{fac}</option>
                    ));
                  })()}
                </select>
              </div>
              <div className={`form-group required-highlight ${getFieldHighlightClass('productNo')}`}>
                <label className="form-label">產品料號 <span className="req">*</span></label>
                <input 
                  type="text" 
                  className="form-input edit-active" 
                  placeholder="請輸入產品料號"
                  value={data.basicInfo.productNo || ''} 
                  onChange={(e) => handleBasicChange('productNo', e.target.value)}
                  disabled={isFieldDisabled('basicInfo.productNo')}
                />
              </div>
              <div className={`form-group ${getFieldHighlightClass('productDesc')}`}>
                <label className="form-label">產品名稱 / 描述</label>
                <input 
                  type="text" 
                  className="form-input edit-active" 
                  placeholder="請輸入產品名稱 / 描述"
                  value={data.basicInfo.productDesc || ''} 
                  onChange={(e) => handleBasicChange('productDesc', e.target.value)}
                  disabled={isFieldDisabled('basicInfo.productDesc')}
                />
              </div>
            </div>

            <div className="form-row-grid-2" style={{ marginTop: '16px' }}>
              <div className={`form-group required-highlight ${getFieldHighlightClass('stage')}`}>
                <label className="form-label">產品階段 <span className="req">*</span></label>
                <div className="checkbox-flex">
                  {Object.keys(data.basicInfo.stage || {}).map(k => (
                    <label key={k} className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={data.basicInfo.stage[k] || false} 
                        onChange={(e) => handleStageChange(k, e.target.checked)}
                        disabled={isFieldDisabled(`stage.${k}`)}
                      />
                      <span>{k === 'politRun' ? 'Pilot-run' : k.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* 卡片 3: 品質與驗收標準 */}
          <div className="form-section-card glass-card" data-accent="emerald">
            <h3 className="card-title"><span className="card-icon-circle">{sectionSvg.shield}</span>品質與驗收標準</h3>
            <div className="form-row-grid-2">
              <div className="form-group">
                <label className="form-label">品質水準要求</label>
                <div className="checkbox-flex">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={data.basicInfo.qualityLevel?.class2 || false} 
                      onChange={(e) => {
                        const ql = { ...(data.basicInfo.qualityLevel || {}), class2: e.target.checked };
                        handleBasicChange('qualityLevel', ql);
                      }}
                      disabled={isFieldDisabled('basicInfo.qualityLevel.class2')}
                    />
                    <span>Class 2</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={data.basicInfo.qualityLevel?.class3 || false} 
                      onChange={(e) => {
                        const ql = { ...(data.basicInfo.qualityLevel || {}), class3: e.target.checked };
                        handleBasicChange('qualityLevel', ql);
                      }}
                      disabled={isFieldDisabled('basicInfo.qualityLevel.class3')}
                    />
                    <span>Class 3</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">IPC 驗收標準</label>
                <div className="checkbox-flex">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={data.basicInfo.ipcStandard?.ipcA610 || false} 
                      onChange={(e) => {
                        const ipc = { ...(data.basicInfo.ipcStandard || {}), ipcA610: e.target.checked };
                        handleBasicChange('ipcStandard', ipc);
                      }}
                      disabled={isFieldDisabled('basicInfo.ipcStandard.ipcA610')}
                    />
                    <span>IPC-A-610</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={data.basicInfo.ipcStandard?.jStd001 || false} 
                      onChange={(e) => {
                        const ipc = { ...(data.basicInfo.ipcStandard || {}), jStd001: e.target.checked };
                        handleBasicChange('ipcStandard', ipc);
                      }}
                      disabled={isFieldDisabled('basicInfo.ipcStandard.jStd001')}
                    />
                    <span>J-STD-001</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 卡片 4: 加工製程與管制需求 */}
          <div className="form-section-card glass-card" data-accent="amber">
            <h3 className="card-title"><span className="card-icon-circle">{sectionSvg.gear}</span>加工製程與管制需求</h3>
            <div className="form-row-grid-3">
              <div className="form-group">
                <label className="form-label">點膠工藝</label>
                <div className="checkbox-flex">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={data.basicInfo.glue || false} 
                      onChange={(e) => handleBasicChange('glue', e.target.checked)}
                      disabled={isFieldDisabled('basicInfo.glue')}
                    />
                    <span>需要點膠</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">QR Code 掃描需求</label>
                <div className="radio-group" style={{ padding: '4px 0' }}>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="qrCodeScan" 
                      checked={data.basicInfo.qrCode?.need || false} 
                      onChange={() => {
                        const qr = { need: true, noNeed: false };
                        handleBasicChange('qrCode', qr);
                      }}
                      disabled={isFieldDisabled('basicInfo.qrCode.need')}
                    />
                    <span>需要</span>
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="qrCodeScan" 
                      checked={data.basicInfo.qrCode?.noNeed || false} 
                      onChange={() => {
                        const qr = { need: false, noNeed: true };
                        handleBasicChange('qrCode', qr);
                      }}
                      disabled={isFieldDisabled('basicInfo.qrCode.noNeed')}
                    />
                    <span>不需要</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">序號管控需求</label>
                <div className="radio-group" style={{ padding: '4px 0' }}>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="snControlReq" 
                      checked={data.basicInfo.snControl?.need || false} 
                      onChange={() => {
                        const sn = { need: true, noNeed: false };
                        handleBasicChange('snControl', sn);
                      }}
                      disabled={isFieldDisabled('basicInfo.snControl.need')}
                    />
                    <span>需要</span>
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="snControlReq" 
                      checked={data.basicInfo.snControl?.noNeed || false} 
                      onChange={() => {
                        const sn = { need: false, noNeed: true };
                        handleBasicChange('snControl', sn);
                      }}
                      disabled={isFieldDisabled('basicInfo.snControl.noNeed')}
                    />
                    <span>不需要</span>
                  </label>
                </div>
              </div>
              <div className={`form-group ${getFieldHighlightClass('aoi')}`}>
                <label className="form-label">AOI 檢驗面</label>
                <div className="checkbox-flex">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={data.basicInfo.aoi?.top || false} 
                      onChange={(e) => {
                        const aoi = { ...(data.basicInfo.aoi || {}), top: e.target.checked };
                        handleBasicChange('aoi', aoi);
                      }}
                      disabled={isFieldDisabled('basicInfo.aoi.top')}
                    />
                    <span>Top (頂面)</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={data.basicInfo.aoi?.bottom || false} 
                      onChange={(e) => {
                        const aoi = { ...(data.basicInfo.aoi || {}), bottom: e.target.checked };
                        handleBasicChange('aoi', aoi);
                      }}
                      disabled={isFieldDisabled('basicInfo.aoi.bottom')}
                    />
                    <span>Bottom (底面)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className={`form-group required-highlight ${getFieldHighlightClass('processItems')}`} style={{ marginTop: '16px' }}>
              <label className="form-label">主要加工項目 <span className="req">*</span></label>
              <div className="checkbox-flex" style={{ flexWrap: 'wrap', gap: '12px 18px', alignItems: 'center' }}>
                {[
                  ['smt', 'SMT'],
                  ['dip', 'DIP'],
                  ['ict', 'In-Circuit Test'],
                  ['assembly', '組裝'],
                  ['coating', '三防膠塗覆'],
                  ['packing', '包裝'],
                  ['fct', 'FCT 功能測試'],
                  ['flyingProbe', '飛針測試'],
                  ['underfillGlue', 'Underfill 塗膠'],
                  ['semiFinishedTest', '半成品測試'],
                  ['finalTest', '成品測試']
                ].map(([key, label]) => (
                  <label key={key} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={data.basicInfo.processItems?.[key] || false} 
                      onChange={(e) => handleProcessItemsChange(key, e.target.checked)}
                      disabled={isFieldDisabled(`basicInfo.processItems.${key}`)}
                    />
                    <span>{label}</span>
                  </label>
                ))}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label className="checkbox-label" style={{ margin: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={data.basicInfo.processItems?.otherProcess || false} 
                      onChange={(e) => {
                        handleProcessItemsChange('otherProcess', e.target.checked);
                        if (!e.target.checked) {
                          const updated = { ...data.basicInfo.processItems, otherProcess: false, otherProcessText: '' };
                          onChange({ ...data, basicInfo: { ...data.basicInfo, processItems: updated } });
                        }
                      }}
                      disabled={isFieldDisabled('basicInfo.processItems.otherProcess')}
                    />
                    <span>其他:</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-input edit-active compact" 
                    placeholder="請說明其他加工項目"
                    value={data.basicInfo.processItems?.otherProcessText || ''} 
                    onChange={(e) => {
                      const updated = { ...data.basicInfo.processItems, otherProcessText: e.target.value };
                      onChange({ ...data, basicInfo: { ...data.basicInfo, processItems: updated } });
                    }}
                    disabled={!data.basicInfo.processItems?.otherProcess || isFieldDisabled('basicInfo.processItems.otherProcessText')}
                    style={{ width: '160px', maxWidth: '100%', padding: '4px 8px', fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 卡片 5: 鋼板與治工具一覽表 */}
          <div className="form-section-card glass-card" data-accent="slate">
            <h3 className="card-title"><span className="card-icon-circle">{sectionSvg.wrench}</span>鋼板與治工具一覽表</h3>
          
          {/* SMT 鋼板規格 */}
          {data.basicInfo.processItems?.smt && (
            <div className={`tooling-box ${getFieldHighlightClass('stencil')}`} style={{ marginBottom: '16px' }}>
              <span className="tooling-badge">SMT 鋼板</span>
              
              <div className="form-row-grid-3 animate-fade-in" style={{ marginTop: '8px' }}>
                <div className={`form-group required-highlight ${getFieldHighlightClass('stencil.thickness')}`}>
                  <label className="form-label">鋼板厚度 (mm) <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-input edit-active" 
                    placeholder="例如: 0.12" 
                    value={data.basicInfo.tooling?.stencil?.thickness || ''}
                    onChange={(e) => handleToolingChange('stencil', 'thickness', e.target.value)}
                    disabled={isFieldDisabled('basicInfo.tooling.stencil.thickness')}
                  />
                </div>
                <div className={`form-group required-highlight ${getFieldHighlightClass('stencil.apertureRatio')}`}>
                  <label className="form-label">開口比例 (%) <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-input edit-active" 
                    placeholder="例如: 100" 
                    value={data.basicInfo.tooling?.stencil?.apertureRatio || ''}
                    onChange={(e) => handleToolingChange('stencil', 'apertureRatio', e.target.value)}
                    disabled={isFieldDisabled('basicInfo.tooling.stencil.apertureRatio')}
                  />
                </div>
                <div className="form-group required-highlight">
                  <label className="form-label">鋼板樣式選擇 <span className="req">*</span></label>
                  <div className="checkbox-flex" style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <label className="radio-label" style={{ padding: 0 }}>
                        <input 
                          type="radio" 
                          name="stencilStyle"
                          checked={(data.basicInfo.tooling?.stencil?.style || 'general') === 'general'} 
                          onChange={() => handleToolingChange('stencil', 'style', 'general')}
                          disabled={isFieldDisabled('basicInfo.tooling.stencil.style')}
                        />
                        <span>一般鋼板</span>
                      </label>
                      <label className="radio-label" style={{ padding: 0 }}>
                        <input 
                          type="radio" 
                          name="stencilStyle"
                          checked={data.basicInfo.tooling?.stencil?.style === 'step'} 
                          onChange={() => handleToolingChange('stencil', 'style', 'step')}
                          disabled={isFieldDisabled('basicInfo.tooling.stencil.style')}
                        />
                        <span>階梯鋼板</span>
                      </label>
                    </div>
                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '6px', marginTop: '2px' }}>
                      <label className="checkbox-label" style={{ padding: 0, margin: 0 }}>
                        <input 
                          type="checkbox" 
                          checked={data.basicInfo.tooling?.stencil?.nanoCoating || false} 
                          onChange={(e) => handleToolingChange('stencil', 'nanoCoating', e.target.checked)}
                          disabled={isFieldDisabled('basicInfo.tooling.stencil.nanoCoating')}
                        />
                        <span style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: '600' }}>表面奈米塗層 (可複選)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 其他治具（使用 tooling-grid 網格併排） */}
          <div className="tooling-grid">
            {['routingFixture', 'glueFixture', 'testFixture', 'assemblyFixture'].map((key) => {
              const labelMap = {
                routingFixture: 'Routing 治具',
                glueFixture: '塗膠治具',
                testFixture: '測試治具',
                assemblyFixture: '組裝治具'
              };
              const item = data.basicInfo.tooling?.[key] || {};
              return (
                <div key={key} className={`tooling-row-align required-highlight ${getFieldHighlightClass(key)}`} style={{ margin: 0 }}>
                  <span className="tool-name" style={{ minWidth: '90px' }}>{labelMap[key]}</span>
                  <div className="radio-group" style={{ gap: '0.8rem' }}>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name={key} 
                        checked={item.need || false}
                        onChange={() => {
                          const tool = data.basicInfo.tooling?.[key] || {};
                          const updatedTool = { ...tool, need: true, noNeed: false };
                          const updatedTooling = { ...data.basicInfo.tooling, [key]: updatedTool };
                          onChange({ ...data, basicInfo: { ...data.basicInfo, tooling: updatedTooling } });
                        }} 
                        disabled={isFieldDisabled(`basicInfo.tooling.${key}.need`)}
                      />
                      <span>Offset / 需要</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name={key} 
                        checked={item.noNeed || false}
                        onChange={() => {
                          const tool = data.basicInfo.tooling?.[key] || {};
                          const updatedTool = { ...tool, need: false, noNeed: true, qty: '' };
                          const updatedTooling = { ...data.basicInfo.tooling, [key]: updatedTool };
                          onChange({ ...data, basicInfo: { ...data.basicInfo, tooling: updatedTooling } });
                        }} 
                        disabled={isFieldDisabled(`basicInfo.tooling.${key}.noNeed`)}
                      />
                      <span>不需要</span>
                    </label>
                  </div>
                  {item.need && (
                    <div className="fixture-qty-input animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '140px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#6b7280', whiteSpace: 'nowrap' }}>數量:</span>
                      <input 
                        type="text" 
                        className="form-input edit-active compact" 
                        placeholder="例: 2 SETs" 
                        value={item.qty || ''}
                        onChange={(e) => handleToolingChange(key, 'qty', e.target.value)}
                        disabled={isFieldDisabled(`basicInfo.tooling.${key}.qty`)}
                        style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SMT刷錫載具 與 其他治具併排 */}
          <div className="tooling-grid" style={{ marginTop: '16px' }}>
            <div className={`tooling-row-align required-highlight ${getFieldHighlightClass('smtCarrier')}`} style={{ margin: 0 }}>
              <span className="tool-name" style={{ minWidth: '90px' }}>SMT刷錫載具</span>
              <div className="radio-group" style={{ gap: '0.8rem' }}>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="smtCarrierNeed" 
                    checked={data.basicInfo.tooling?.smtCarrier?.need || false}
                    onChange={() => {
                      const tool = data.basicInfo.tooling?.smtCarrier || {};
                      const updatedTool = { ...tool, need: true, noNeed: false };
                      const updatedTooling = { ...data.basicInfo.tooling, smtCarrier: updatedTool };
                      const owners = { ...(data._owners || {}) };
                      owners['basicInfo.tooling.smtCarrier.need'] = currentUser.unit;
                      delete owners['basicInfo.tooling.smtCarrier.noNeed'];
                      onChange({ ...data, basicInfo: { ...data.basicInfo, tooling: updatedTooling }, _owners: owners });
                    }} 
                    disabled={isFieldDisabled('basicInfo.tooling.smtCarrier.need')}
                  />
                  <span>需要</span>
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="smtCarrierNeed" 
                    checked={data.basicInfo.tooling?.smtCarrier?.noNeed || false}
                    onChange={() => {
                      const tool = data.basicInfo.tooling?.smtCarrier || {};
                      const updatedTool = { ...tool, need: false, noNeed: true, upper: false, lower: false };
                      const updatedTooling = { ...data.basicInfo.tooling, smtCarrier: updatedTool };
                      const owners = { ...(data._owners || {}) };
                      owners['basicInfo.tooling.smtCarrier.noNeed'] = currentUser.unit;
                      delete owners['basicInfo.tooling.smtCarrier.need'];
                      delete owners['basicInfo.tooling.smtCarrier.upper'];
                      delete owners['basicInfo.tooling.smtCarrier.lower'];
                      onChange({ ...data, basicInfo: { ...data.basicInfo, tooling: updatedTooling }, _owners: owners });
                    }} 
                    disabled={isFieldDisabled('basicInfo.tooling.smtCarrier.noNeed')}
                  />
                  <span>不需要</span>
                </label>
              </div>
              {data.basicInfo.tooling?.smtCarrier?.need && (
                <div className="fixture-qty-input animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '160px' }}>
                  <label className="checkbox-label" style={{ margin: 0, padding: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={data.basicInfo.tooling?.smtCarrier?.upper || false}
                      onChange={(e) => handleToolingChange('smtCarrier', 'upper', e.target.checked)}
                      disabled={isFieldDisabled('basicInfo.tooling.smtCarrier.upper')}
                    />
                    <span style={{ fontSize: '0.8rem' }}>上載板</span>
                  </label>
                  <label className="checkbox-label" style={{ margin: 0, padding: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={data.basicInfo.tooling?.smtCarrier?.lower || false}
                      onChange={(e) => handleToolingChange('smtCarrier', 'lower', e.target.checked)}
                      disabled={isFieldDisabled('basicInfo.tooling.smtCarrier.lower')}
                    />
                    <span style={{ fontSize: '0.8rem' }}>下載板</span>
                  </label>
                </div>
              )}
            </div>

            <div className={`tooling-row-align required-highlight ${getFieldHighlightClass('otherFixture')}`} style={{ margin: 0 }}>
              <span className="tool-name" style={{ minWidth: '90px' }}>其他治具</span>
              <div className="radio-group" style={{ gap: '0.8rem' }}>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="otherFixtureNeed" 
                    checked={data.basicInfo.tooling?.otherFixture?.need || false}
                    onChange={() => {
                      const tool = data.basicInfo.tooling?.otherFixture || {};
                      const updatedTool = { ...tool, need: true, noNeed: false };
                      const updatedTooling = { ...data.basicInfo.tooling, otherFixture: updatedTool };
                      const owners = { ...(data._owners || {}) };
                      owners['basicInfo.tooling.otherFixture.need'] = currentUser.unit;
                      delete owners['basicInfo.tooling.otherFixture.noNeed'];
                      onChange({ ...data, basicInfo: { ...data.basicInfo, tooling: updatedTooling }, _owners: owners });
                    }} 
                    disabled={isFieldDisabled('basicInfo.tooling.otherFixture.need')}
                  />
                  <span>需要</span>
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="otherFixtureNeed" 
                    checked={data.basicInfo.tooling?.otherFixture?.noNeed || false}
                    onChange={() => {
                      const tool = data.basicInfo.tooling?.otherFixture || {};
                      const updatedTool = { ...tool, need: false, noNeed: true, name: '', qty: '' };
                      const updatedTooling = { ...data.basicInfo.tooling, otherFixture: updatedTool };
                      const owners = { ...(data._owners || {}) };
                      owners['basicInfo.tooling.otherFixture.noNeed'] = currentUser.unit;
                      delete owners['basicInfo.tooling.otherFixture.need'];
                      delete owners['basicInfo.tooling.otherFixture.name'];
                      delete owners['basicInfo.tooling.otherFixture.qty'];
                      onChange({ ...data, basicInfo: { ...data.basicInfo, tooling: updatedTooling }, _owners: owners });
                    }} 
                    disabled={isFieldDisabled('basicInfo.tooling.otherFixture.noNeed')}
                  />
                  <span>不需要</span>
                </label>
              </div>
              {data.basicInfo.tooling?.otherFixture?.need && (
                <div className="fixture-qty-input animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, maxWidth: '200px' }}>
                  <input 
                    type="text" 
                    className="form-input edit-active compact" 
                    placeholder="治具名稱" 
                    value={data.basicInfo.tooling?.otherFixture?.name || ''}
                    onChange={(e) => handleToolingChange('otherFixture', 'name', e.target.value)}
                    disabled={isFieldDisabled('basicInfo.tooling.otherFixture.name')}
                    style={{ flex: 2, padding: '4px 6px', fontSize: '0.8rem' }}
                  />
                  <input 
                    type="text" 
                    className="form-input edit-active compact" 
                    placeholder="數量" 
                    value={data.basicInfo.tooling?.otherFixture?.qty || ''}
                    onChange={(e) => handleToolingChange('otherFixture', 'qty', e.target.value)}
                    disabled={isFieldDisabled('basicInfo.tooling.otherFixture.qty')}
                    style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

          <div className="action-row">
            <button className="btn btn-primary" onClick={onNext}>
              下一步：製程管制與前置作業
            </button>
          </div>
        </div>
      )}

      {/* 分頁 2: 製程管制 */}
      {activeSection === 'processControl' && (
        <div className="section-form animate-fade-in">
          <h2 className="section-title">製程管制</h2>
          <p className="section-subtitle">請回填樣品提供狀態、烘烤確認、焊接順序及測溫點等關鍵生產防呆項目。</p>

          {/* 樣品提供與烘烤 */}
          <div className="form-row-grid" data-accent="indigo">
            <div className={`form-group required-highlight ${getFieldHighlightClass('sampleProvided')}`}>
              <label className="form-label"><span className="card-icon-circle card-icon-xs">{sectionSvg.clipboard}</span> 樣品提供確認 <span className="req">*</span></label>
              <div className="checkbox-flex">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={data.processControl?.sampleProvided?.trialBoard || false}
                    onChange={(e) => handleSampleChange('trialBoard', e.target.checked)}
                    disabled={isFieldDisabled('processControl.sampleProvided.trialBoard')}
                  />
                  <span>試錫板</span>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={data.processControl?.sampleProvided?.tempBoard || false}
                    onChange={(e) => handleSampleChange('tempBoard', e.target.checked)}
                    disabled={isFieldDisabled('processControl.sampleProvided.tempBoard')}
                  />
                  <span>測溫板</span>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={data.processControl?.sampleProvided?.standardPart || false}
                    onChange={(e) => handleSampleChange('standardPart', e.target.checked)}
                    disabled={isFieldDisabled('processControl.sampleProvided.standardPart')}
                  />
                  <span>標準件</span>
                </label>
              </div>
            </div>

            <div className={`form-group required-highlight ${getFieldHighlightClass('bakeRequired')}`}>
              <label className="form-label"><span className="card-icon-circle card-icon-xs">{sectionSvg.thermometer}</span> PCB / FPCA 烘烤需求 <span className="req">*</span></label>
              <div className="radio-group">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="bakeRequired" 
                    checked={data.processControl?.bakeRequired?.need || false}
                    onChange={() => handleBakeChange('need', true)}
                    disabled={isFieldDisabled('processControl.bakeRequired.need')}
                  />
                  <span>需要烘烤</span>
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="bakeRequired" 
                    checked={data.processControl?.bakeRequired?.noNeed || false}
                    onChange={() => handleBakeChange('noNeed', true)}
                    disabled={isFieldDisabled('processControl.bakeRequired.noNeed')}
                  />
                  <span>不需要</span>
                </label>
              </div>
            </div>
          </div>

          {data.processControl?.bakeRequired?.need && (
            <div className="bake-cond-box animate-fade-in">
              <div className="form-row-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className={`form-group required-highlight ${getFieldHighlightClass('bakeRequired')}`}>
                  <label className="form-label">PCB 烘烤條件 <span className="req">*</span></label>
                  <div className="inline-bake-inputs edit-active">
                    <span>PCB 烘烤: </span>
                    <input 
                      type="text" 
                      className="inline-num-input"
                      placeholder="120"
                      value={data.processControl?.bakeRequired?.pcbBakeTemp || ''}
                      onChange={(e) => handleBakeChange('pcbBakeTemp', e.target.value)}
                      disabled={isFieldDisabled('processControl.bakeRequired.pcbBakeTemp')}
                    />
                    <span> °C ± </span>
                    <input 
                      type="text" 
                      className="inline-num-input inline-num-small"
                      placeholder="5"
                      value={data.processControl?.bakeRequired?.pcbBakeTol || ''}
                      onChange={(e) => handleBakeChange('pcbBakeTol', e.target.value)}
                      disabled={isFieldDisabled('processControl.bakeRequired.pcbBakeTol')}
                    />
                    <span> °C × </span>
                    <input 
                      type="text" 
                      className="inline-num-input inline-num-small"
                      placeholder="2"
                      value={data.processControl?.bakeRequired?.pcbBakeHr || ''}
                      onChange={(e) => handleBakeChange('pcbBakeHr', e.target.value)}
                      disabled={isFieldDisabled('processControl.bakeRequired.pcbBakeHr')}
                    />
                    <span> hr（依 PCB 廠建議）</span>
                  </div>
                  {/* PCB 烘烤合理值警告 */}
                  {((data.processControl?.bakeRequired?.pcbBakeTemp && (parseInt(data.processControl.bakeRequired.pcbBakeTemp) < 90 || parseInt(data.processControl.bakeRequired.pcbBakeTemp) > 150)) ||
                    (data.processControl?.bakeRequired?.pcbBakeHr && (parseInt(data.processControl.bakeRequired.pcbBakeHr) < 1 || parseInt(data.processControl.bakeRequired.pcbBakeHr) > 12))) && (
                    <div className="inline-input-warning animate-fade-in">
                      ⚠️ 警告：PCB 烘烤建議溫度為 100°C~140°C，時間為 2~6 hr。請確認填寫數值是否正確。
                    </div>
                  )}
                </div>
                <div className={`form-group required-highlight ${getFieldHighlightClass('bakeRequired')}`}>
                  <label className="form-label">FPCA 烘烤條件 <span className="req">*</span></label>
                  <div className="inline-bake-inputs edit-active">
                    <span>FPCA 烘烤: 依原物料規格書，若無規格則 </span>
                    <input 
                      type="text" 
                      className="inline-num-input"
                      placeholder="80"
                      value={data.processControl?.bakeRequired?.fpcaBakeTemp || ''}
                      onChange={(e) => handleBakeChange('fpcaBakeTemp', e.target.value)}
                      disabled={isFieldDisabled('processControl.bakeRequired.fpcaBakeTemp')}
                    />
                    <span> °C × </span>
                    <input 
                      type="text" 
                      className="inline-num-input inline-num-small"
                      placeholder="4"
                      value={data.processControl?.bakeRequired?.fpcaBakeHr || ''}
                      onChange={(e) => handleBakeChange('fpcaBakeHr', e.target.value)}
                      disabled={isFieldDisabled('processControl.bakeRequired.fpcaBakeHr')}
                    />
                    <span> hr</span>
                  </div>
                  {/* FPCA 烘烤合理值警告 */}
                  {((data.processControl?.bakeRequired?.fpcaBakeTemp && (parseInt(data.processControl.fpcaBakeTemp) < 50 || parseInt(data.processControl.fpcaBakeTemp) > 110)) ||
                    (data.processControl?.bakeRequired?.fpcaBakeHr && (parseInt(data.processControl.fpcaBakeHr) < 1 || parseInt(data.processControl.fpcaBakeHr) > 12))) && (
                    <div className="inline-input-warning animate-fade-in">
                      ⚠️ 警告：FPCA 烘烤建議溫度為 60°C~100°C，時間為 2~8 hr。請確認填寫數值是否正確。
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="divider"></div>

          {/* 測溫點配置 (關鍵防呆) */}
          <h3 className="sub-section-title"><span className="card-icon-circle card-icon-sm">{sectionSvg.thermometer}</span>測溫點配置與 Reflow 參數 (關鍵零件要求)</h3>
          
          <div className={`form-group ${getFieldHighlightClass('tempPoints')}`}>
            <label className="form-label">關鍵零件狀態</label>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="keyParts" 
                  checked={data.processControl?.keyParts?.has || false}
                  onChange={() => handleProcessChange('keyParts', { has: true, none: false })}
                  disabled={isFieldDisabled('processControl.keyParts.has')}
                />
                <span>有關鍵零件 (需配置至少 6 點測溫)</span>
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="keyParts" 
                  checked={data.processControl?.keyParts?.none || false}
                  onChange={() => handleProcessChange('keyParts', { has: false, none: true })}
                  disabled={isFieldDisabled('processControl.keyParts.none')}
                />
                <span>無關鍵零件</span>
              </label>
            </div>
          </div>

          {data.processControl?.keyParts?.has && (
            <div className={`temp-points-table-wrapper animate-fade-in ${getFieldHighlightClass('tempPoints')}`}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                {[0, 1, 2].map((idx) => {
                  const point = data.processControl.tempPoints?.[idx] || {};
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#000000' }}>#{idx + 1}</label>
                      <input 
                        type="text" 
                        className="form-input edit-active" 
                        placeholder="例如: U12, Q5" 
                        value={point.pos || ''}
                        onChange={(e) => handleTempPointChange(idx, 'pos', e.target.value)}
                        disabled={isFieldDisabled(`processControl.tempPoints.${idx}.pos`)}
                        style={{ fontSize: '0.9rem' }}
                      />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[3, 4, 5].map((idx) => {
                  const point = data.processControl.tempPoints?.[idx] || {};
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#000000' }}>#{idx + 1}</label>
                      <input 
                        type="text" 
                        className="form-input edit-active" 
                        placeholder="例如: U12, Q5" 
                        value={point.pos || ''}
                        onChange={(e) => handleTempPointChange(idx, 'pos', e.target.value)}
                        disabled={isFieldDisabled(`processControl.tempPoints.${idx}.pos`)}
                        style={{ fontSize: '0.9rem' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* SMT 與 DIP 首件/焊接順序併排（2 欄 Grid） */}
          <div className="form-row-grid" data-accent="cyan">
            {/* 左側：SMT 製程管制 */}
            <div className={`form-group required-highlight ${getFieldHighlightClass('smtFirstPiece')}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
              <label className="form-label"><span className="card-icon-circle card-icon-xs">{sectionSvg.layers}</span> SMT 首件檢查項目 <span className="req">*</span>
                {!data.basicInfo.processItems?.smt && <span style={{ marginLeft: '8px', color: '#ef4444', fontSize: '0.82rem', fontWeight: 'bold' }}>(不適用，請至基本資料勾選加工項目 SMT)</span>}
              </label>
              <div className={`checkbox-flex ${!data.basicInfo.processItems?.smt ? 'readonly-flex' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px' }}>
                  {[
                    ['polarity', '極性方向檢查'],
                    ['measureLcr', '量測 LCR'],
                    ['spi', 'SPI 錫膏厚度'],
                    ['steelTension', '鋼板張力量測'],
                    ['pcbReflow', 'PCB外觀檢查'],
                    ['solderability', '濕潤性檢查']
                  ].map(([key, label]) => (
                    <label key={key} className="checkbox-label" style={{ fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={data.processControl?.smtFirstPiece?.[key] || false}
                        onChange={(e) => {
                          const smtObj = { ...(data.processControl?.smtFirstPiece || {}), [key]: e.target.checked };
                          handleProcessChange('smtFirstPiece', smtObj);
                        }}
                        disabled={isFieldDisabled(`processControl.smtFirstPiece.${key}`) || !data.basicInfo.processItems?.smt}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                
                {/* LED 點亮測試 */}
                <div className={getFieldHighlightClass('ledTest')} style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 550, whiteSpace: 'nowrap' }}>LED點亮測試:</span>
                  <div className="radio-group" style={{ display: 'inline-flex', gap: '10px' }}>
                    <label className="radio-label" style={{ fontSize: '0.8rem' }}>
                      <input 
                        type="radio" 
                        name="ledTest"
                        checked={data.processControl?.smtFirstPiece?.ledTest === 'yes'}
                        onChange={() => handleProcessChange('smtFirstPiece', { ...(data.processControl?.smtFirstPiece || {}), ledTest: 'yes' })}
                        disabled={isFieldDisabled('processControl.smtFirstPiece.ledTest') || !data.basicInfo.processItems?.smt}
                      />
                      <span>有</span>
                    </label>
                    <label className="radio-label" style={{ fontSize: '0.8rem' }}>
                      <input 
                        type="radio" 
                        name="ledTest"
                        checked={data.processControl?.smtFirstPiece?.ledTest === 'no'}
                        onChange={() => handleProcessChange('smtFirstPiece', { ...(data.processControl?.smtFirstPiece || {}), ledTest: 'no' })}
                        disabled={isFieldDisabled('processControl.smtFirstPiece.ledTest') || !data.basicInfo.processItems?.smt}
                      />
                      <span>無</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SMT 焊接順序 */}
              <div className={`form-group required-highlight ${getFieldHighlightClass('smtOrder')}`} style={{ marginTop: '12px', marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>SMT 焊接順序 <span className="req">*</span></label>
                <div className="radio-group" style={{ padding: '2px 0' }}>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="smtOrder" 
                      checked={data.processControl?.smtOrder?.bToT || false}
                      onChange={() => handleProcessChange('smtOrder', { bToT: true, tToB: false })}
                      disabled={isFieldDisabled('processControl.smtOrder.bToT') || !data.basicInfo.processItems?.smt}
                    />
                    <span>先焊底面 (B→T)</span>
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="smtOrder" 
                      checked={data.processControl?.smtOrder?.tToB || false}
                      onChange={() => handleProcessChange('smtOrder', { bToT: false, tToB: true })}
                      disabled={isFieldDisabled('processControl.smtOrder.tToB') || !data.basicInfo.processItems?.smt}
                    />
                    <span>先焊頂面 (T→B)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 右側：DIP 製程管制 */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
              <label className="form-label"><span className="card-icon-circle card-icon-xs">{sectionSvg.microscope}</span> DIP 首件檢查項目 <span className="req">*</span>
                {!data.basicInfo.processItems?.dip && <span style={{ marginLeft: '8px', color: '#ef4444', fontSize: '0.82rem', fontWeight: 'bold' }}>(不適用，請至基本資料勾選加工項目 DIP)</span>}
              </label>
              <div className={`checkbox-flex ${!data.basicInfo.processItems?.dip ? 'readonly-flex' : ''}`} style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label className="checkbox-label" style={{ fontSize: '0.85rem' }}>
                  <input 
                    type="checkbox" 
                    checked={data.processControl?.dipFirstPiece?.cutLead || false}
                    onChange={(e) => handleProcessChange('dipFirstPiece', { ...(data.processControl?.dipFirstPiece || {}), cutLead: e.target.checked })}
                    disabled={isFieldDisabled('processControl.dipFirstPiece.cutLead') || !data.basicInfo.processItems?.dip}
                  />
                  <span>剪腳前置作業 (切腳、折腳、預成型)</span>
                </label>
                
                {/* DIP 注意事項 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 550 }}>DIP 注意事項 (限 50 字):</span>
                  <textarea 
                    className="form-input edit-active compact" 
                    placeholder={data.basicInfo.processItems?.dip ? "請輸入 DIP 注意事項..." : "不適用"}
                    maxLength={50}
                    value={data.processControl?.dipFirstPiece?.memo || ''}
                    onChange={(e) => handleProcessChange('dipFirstPiece', { ...(data.processControl?.dipFirstPiece || {}), memo: e.target.value })}
                    disabled={isFieldDisabled('processControl.dipFirstPiece.memo') || !data.basicInfo.processItems?.dip}
                    style={{ padding: '6px 8px', fontSize: '0.82rem', height: '70px', resize: 'none' }}
                  />
                </div>
              </div>

              {/* DIP 焊接順序 */}
              <div className={`form-group required-highlight ${getFieldHighlightClass('dipOrder')}`} style={{ marginTop: '12px', marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>DIP 焊接順序 <span className="req">*</span></label>
                <div className="radio-group" style={{ padding: '2px 0' }}>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="dipOrder" 
                      checked={data.processControl?.dipOrder?.bToT || false}
                      onChange={() => handleProcessChange('dipOrder', { bToT: true, tToB: false })}
                      disabled={isFieldDisabled('processControl.dipOrder.bToT') || !data.basicInfo.processItems?.dip}
                    />
                    <span>先焊底面 (B→T)</span>
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="dipOrder" 
                      checked={data.processControl?.dipOrder?.tToB || false}
                      onChange={() => handleProcessChange('dipOrder', { bToT: false, tToB: true })}
                      disabled={isFieldDisabled('processControl.dipOrder.tToB') || !data.basicInfo.processItems?.dip}
                    />
                    <span>先焊頂面 (T→B)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* Underfill 與維修記號 */}
          <div className="form-row-grid">
            <div className="form-group">
              <label className="form-label">Underfill 後烘烤</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="text" 
                  className="form-input edit-active compact" 
                  placeholder="溫度" 
                  value={data.processControl?.underfill?.bakeTemp || ''}
                  onChange={(e) => handleProcessChange('underfill', { ...data.processControl.underfill, bakeTemp: e.target.value })}
                  disabled={isFieldDisabled('processControl.underfill.bakeTemp')}
                  style={{ width: '80px' }}
                />
                <span style={{ color: '#6b7280' }}>°C x</span>
                <input 
                  type="text" 
                  className="form-input edit-active compact" 
                  placeholder="時間" 
                  value={data.processControl?.underfill?.bakeTime || ''}
                  onChange={(e) => handleProcessChange('underfill', { ...data.processControl.underfill, bakeTime: e.target.value })}
                  disabled={isFieldDisabled('processControl.underfill.bakeTime')}
                  style={{ width: '80px' }}
                />
                <span style={{ color: '#6b7280' }}>min</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">膠材型號</label>
              <input 
                type="text" 
                className="form-input edit-active" 
                placeholder="例如: Loctite 3513" 
                value={data.processControl?.underfill?.glueModel || ''}
                onChange={(e) => handleProcessChange('underfill', { ...data.processControl.underfill, glueModel: e.target.value })}
                disabled={isFieldDisabled('processControl.underfill.glueModel')}
              />
            </div>
          </div>

          {/* PCBA 包材種類 */}
          <div className={`form-group required-highlight ${getFieldHighlightClass('pcbaPackaging')}`} data-accent="violet">
            <label className="form-label"><span className="card-icon-circle card-icon-xs">{sectionSvg.box}</span> PCBA 包材種類 <span className="req">*</span></label>
            <div className="checkbox-flex" style={{ flexWrap: 'wrap', gap: '12px' }}>
              {[['staticBag', '靜電袋'], ['honeycomb', '蜂巢式抗靜電隔板'], ['tray', 'Tray 抗靜電脆盤'], ['sensorCover', 'Sensor 保護貼'], ['cameraCover', 'Camera 保護貼']].map(([key, label]) => (
                <label key={key} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={data.processControl?.pcbaPackaging?.[key] || false}
                    onChange={(e) => handleProcessChange('pcbaPackaging', { ...data.processControl.pcbaPackaging, [key]: e.target.checked })}
                    disabled={isFieldDisabled(`processControl.pcbaPackaging.${key}`)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* FPCA 包材種類 */}
          <div className={`form-group required-highlight ${getFieldHighlightClass('fpcaPackaging')}`} style={{ marginTop: '12px' }} data-accent="violet">
            <label className="form-label"><span className="card-icon-circle card-icon-xs">{sectionSvg.box}</span> FPCA 包材種類 <span className="req">*</span></label>
            <div className="checkbox-flex" style={{ flexWrap: 'wrap', gap: '12px' }}>
              {[['staticBag', '靜電袋'], ['honeycomb', '蜂巢式抗靜電隔板'], ['tray', 'Tray 抗靜電脆盤'], ['sensorCover', 'Sensor 保護貼'], ['cameraCover', 'Camera 保護貼']].map(([key, label]) => (
                <label key={key} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={data.processControl?.fpcaPackaging?.[key] || false}
                    onChange={(e) => handleProcessChange('fpcaPackaging', { ...data.processControl.fpcaPackaging, [key]: e.target.checked })}
                    disabled={isFieldDisabled(`processControl.fpcaPackaging.${key}`)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">特殊製程備註 (研發/工程)</label>
            <textarea 
              className="form-textarea edit-active" 
              rows={3} 
              placeholder="如有特殊焊接、清洗、塗覆要求，請在此填寫..."
              value={data.processControl?.specialProcessMemo || ''}
              onChange={(e) => handleProcessChange('specialProcessMemo', e.target.value)}
              disabled={isFieldDisabled('processControl.specialProcessMemo')}
            />
          </div>

          <div className="action-row">
            <button className="btn btn-primary" onClick={onNext}>
              下一步：試產報告要求
            </button>
          </div>
        </div>
      )}

      {/* 分頁 3: 試產報告要求 */}
      {activeSection === 'trialReport' && (
        <div className={`section-form animate-fade-in ${getFieldHighlightClass('trialReport')}`}>
          <h2 className="section-title">試產要求</h2>

          {/* 報告清單與完成日期確認 */}
          <h3 className="sub-section-title"><span className="card-icon-circle card-icon-sm">{sectionSvg.clipboard}</span>試產交付文件、檢驗紀錄與照片清單</h3>
          <p className="description-text">請勾選確認已完成的項目以利兩端追蹤。</p>

          {/* A. 印刷品質 */}
          <div className="record-list-section">
            <h4 className="list-group-title" data-accent="blue"><span className="card-icon-circle card-icon-xs">{sectionSvg.printer}</span>A. 印刷品質 / 迴焊紀錄</h4>
            <div className="records-grid">
              {data.trialReport?.printRecords?.map((rec, idx) => (
                <div key={rec.id} className="record-row edit-active" style={{ margin: 0 }}>
                  <label className="checkbox-label flex-1">
                    <input 
                      type="checkbox" 
                      checked={rec.checked || false}
                      onChange={(e) => handleRecordChange('printRecords', idx, 'checked', e.target.checked)}
                      disabled={isFieldDisabled(`trialReport.printRecords.${idx}.checked`)}
                    />
                    <span className="record-name">{rec.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* B. 檢驗紀錄 */}
          <div className="record-list-section">
            <h4 className="list-group-title" data-accent="purple"><span className="card-icon-circle card-icon-xs">{sectionSvg.search}</span>B. 檢驗紀錄</h4>
            <div className="records-grid">
              {data.trialReport?.inspectRecords?.map((rec, idx) => (
                <div key={rec.id} className="record-row edit-active" style={{ margin: 0 }}>
                  <label className="checkbox-label flex-1">
                    <input 
                      type="checkbox" 
                      checked={rec.checked || false}
                      onChange={(e) => handleRecordChange('inspectRecords', idx, 'checked', e.target.checked)}
                      disabled={isFieldDisabled(`trialReport.inspectRecords.${idx}.checked`)}
                    />
                    <span className="record-name">{rec.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* C. SMT 良率報告 */}
          <div className="record-list-section">
            <h4 className="list-group-title" data-accent="emerald"><span className="card-icon-circle card-icon-xs">{sectionSvg.chart}</span>C. SMT 生產良率報告（含可製造性設計問題分析 DFM）</h4>
            <div className="records-grid">
              <div className="record-row edit-active" style={{ margin: 0 }}>
                <label className="checkbox-label flex-1">
                  <input
                    type="checkbox"
                    checked={data.trialReport?.yieldReport?.ready || false}
                    onChange={(e) => {
                      const yr = { ready: e.target.checked };
                      const updatedTR = { ...data.trialReport, yieldReport: yr };
                      const owners = { ...(data._owners || {}) };
                      if (e.target.checked) {
                        owners["trialReport.yieldReport.ready"] = currentUser.unit;
                      } else {
                        delete owners["trialReport.yieldReport.ready"];
                      }
                      onChange({ ...data, trialReport: updatedTR, _owners: owners });
                    }}
                    disabled={isFieldDisabled("trialReport.yieldReport.ready")}
                  />
                  <span className="record-name">SMT 良率報告已備妥</span>
                </label>
              </div>
            </div>
          </div>

          {/* D. 照片提供 */}
          <div className="record-list-section">
            <h4 className="list-group-title" data-accent="pink"><span className="card-icon-circle card-icon-xs">{sectionSvg.camera}</span>D. 照片提供</h4>
            <div className="records-grid">
              {data.trialReport?.photoRecords?.map((rec, idx) => (
                <div key={rec.id} className="record-row edit-active" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', margin: 0 }}>
                  <label className="checkbox-label flex-1" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <input 
                      type="checkbox" 
                      checked={rec.checked || false}
                      onChange={(e) => handleRecordChange('photoRecords', idx, 'checked', e.target.checked)}
                      disabled={isFieldDisabled(`trialReport.photoRecords.${idx}.checked`)}
                    />
                    <span className="record-name">
                      {rec.isXray ? String(rec.name).split(/指定零件/)[0] + '指定零件:' : rec.name}
                    </span>
                  </label>

                  {rec.isXray && (
                    <div className="xray-parts-inputs animate-fade-in" style={{ display: 'flex', gap: '8px', marginLeft: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {[0, 1, 2, 3].map((pIdx) => (
                        <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{pIdx + 1}:</span>
                          <input 
                            type="text" 
                            className="form-input edit-active compact" 
                            placeholder={pIdx === 0 ? '預設空白' : `U${pIdx + 1}`}
                            value={rec.parts?.[pIdx] || ''}
                            onChange={(e) => handleXrayPartChange(pIdx, e.target.value)}
                            disabled={isFieldDisabled(`trialReport.photoRecords.xray.parts.${pIdx}`)}
                            style={{ width: '70px', padding: '2px 4px', fontSize: '0.8rem' }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="action-row">
            <button className="btn btn-primary" onClick={onNext}>
              下一步：工程文件一覽表
            </button>
          </div>
        </div>
      )}

      {/* 分頁 5: 工程文件 */}
      {activeSection === 'documents' && (
        <div className="section-form animate-fade-in">
          <h2 className="section-title">工程文件</h2>
          <p className="section-subtitle">請確認以下 8 項關鍵工程文件之對齊勾選狀態，這將會雙向同步寫入 Excel 報表中。</p>

          <div className="documents-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '20px' }}>
            {[
              ['bom', '材料清單 BOM', '主要電子零組件與電路板規格清單'],
              ['gerber', 'Gerber file / CAD', '電路板佈線與鋼網製造必要檔案'],
              ['coordinate', '元件座標檔', 'SMT 貼片機高速貼裝座標配置圖'],
              ['placement', '零件位置圖 (Placement)', '用以核對零件方向與極性參考圖面'],
              ['materialSpec', '原物料規格書', '特殊零件或連接器等規格說明書'],
              ['reflowProfile', 'Reflow 建議曲線圖', '零件耐熱極限與錫膏焊接建議溫度控制曲線'],
              ['assemblyPackingSop', '組裝(包裝)作業標準書 (SOP)', '指導生產線作業人員進行組裝與包裝的標準程序'],
              ['testSop', '測試作業標準書 (SOP)', '定義測試工位與測試軟硬體的標準操作']
            ].map(([key, label, desc]) => {
              const checked = data.basicInfo.documents?.[key] || false;
              return (
                <div key={key} className={`document-card glass-card ${checked ? 'checked-active' : ''}`} style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start', transition: 'all 0.25s' }}>
                  <label className="checkbox-label" style={{ margin: 0, display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', flex: 1 }}>
                    <input 
                      type="checkbox" 
                      checked={checked} 
                      onChange={(e) => {
                        const docs = { ...(data.basicInfo.documents || {}), [key]: e.target.checked };
                        const owners = { ...(data._owners || {}) };
                        const path = `basicInfo.documents.${key}`;
                        if (e.target.checked) {
                          owners[path] = currentUser.unit;
                        } else {
                          delete owners[path];
                        }
                        onChange({
                          ...data,
                          basicInfo: { ...data.basicInfo, documents: docs },
                          _owners: owners
                        });
                      }}
                      disabled={isFieldDisabled(`basicInfo.documents.${key}`)}
                      style={{ marginTop: '12px' }}
                    />
                    <div className="doc-icon-container">
                      {getDocumentIcon(key)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span className="doc-label" style={{ fontWeight: 600, fontSize: '0.95rem' }}>{label}</span>
                      <p className="doc-desc" style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '4px', lineHeight: 1.4 }}>{desc}</p>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>

          <div className="action-row" style={{ marginTop: '24px' }}>
            <button className="btn btn-primary" onClick={onNext}>
              下一步：雙向線上簽核
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

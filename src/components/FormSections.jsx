import React from 'react';
import './FormSections.css';

export default function FormSections({ data, activeSection, onChange, onNext, currentUser, factories }) {
  
  // 防呆唯讀管控邏輯
  const isFieldDisabled = (fieldPath) => {
    if (!currentUser) return true;
    if (currentUser.role === 'qa') return true; // QA 品保處僅有審核權，無填寫/修改權
    if (currentUser.role === 'admin') return false; // 管理員不受限

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

    // A單位已填寫的, B/C單位無法變更 (通用鎖定)
    const owner = data._owners?.[fieldPath];
    if (owner && owner !== currentUser.unit) {
      return true;
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
    const updatedBake = { ...data.processControl.bakeRequired, [field]: val };
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
          <h2 className="section-title">A. 產品基本資料</h2>
          <p className="section-subtitle">請核對發包方資訊，並請加工廠確實填寫工廠區及治工具資訊。</p>

          <div className="form-group required-highlight">
            <label className="form-label">委外加工廠 <span className="req">*</span></label>
            <select 
              className="form-input edit-active" 
              value={data.basicInfo.factory || ''} 
              onChange={(e) => handleBasicChange('factory', e.target.value)}
              disabled={isFieldDisabled('basicInfo.factory')}
            >
              <option value="">-- 請選擇委外加工廠 --</option>
              {factories.map(fac => (
                <option key={fac} value={fac}>{fac}</option>
              ))}
            </select>
          </div>

          <div className="divider"></div>

          {/* 產品料號與規格 */}
          <div className="form-row-grid">
            <div className="form-group">
              <label className="form-label">產品料號</label>
              <input 
                type="text" 
                className="form-input edit-active" 
                placeholder="請輸入產品料號"
                value={data.basicInfo.productNo || ''} 
                onChange={(e) => handleBasicChange('productNo', e.target.value)}
                disabled={isFieldDisabled('basicInfo.productNo')}
              />
            </div>
            <div className="form-group">
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

          {/* 產品階段 */}
          <div className="form-group">
            <label className="form-label">產品階段</label>
            <div className="checkbox-flex">
              {Object.keys(data.basicInfo.stage || {}).map(k => (
                <label key={k} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={data.basicInfo.stage[k] || false} 
                    onChange={(e) => handleStageChange(k, e.target.checked)}
                    disabled={isFieldDisabled(`stage.${k}`)}
                  />
                  <span>{k === 'politRun' ? 'Poilt-run' : k.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group required-highlight" style={{ marginTop: '12px' }}>
            <label className="form-label">主要加工項目 <span className="req">*</span></label>
            <div className="checkbox-flex" style={{ flexWrap: 'wrap', gap: '12px' }}>
              {[['smt', 'SMT'], ['dip', 'DIP']].map(([key, label]) => (
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
            </div>
          </div>

          <div className="divider"></div>

          {/* 鋼板與治工具一覽表 */}
          <h3 className="sub-section-title">🔧 鋼板與治工具一覽表</h3>
          
          {/* SMT 鋼板規格 */}
          {data.basicInfo.processItems.smt && (
            <div className="tooling-box">
              <span className="tooling-badge">SMT 鋼板</span>
              
              <div className="tooling-row-align" style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                <span className="tool-name" style={{ minWidth: '80px' }}>是否需要</span>
                <div className="radio-group">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="stencilNeed" 
                      checked={data.basicInfo.tooling?.stencil?.need || false}
                      onChange={() => {
                        handleToolingChange('stencil', 'need', true);
                        handleToolingChange('stencil', 'noNeed', false);
                      }} 
                      disabled={isFieldDisabled('basicInfo.tooling.stencil.need')}
                    />
                    <span>需要</span>
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="stencilNeed" 
                      checked={data.basicInfo.tooling?.stencil?.noNeed || false}
                      onChange={() => {
                        handleToolingChange('stencil', 'need', false);
                        handleToolingChange('stencil', 'noNeed', true);
                        handleToolingChange('stencil', 'thickness', '');
                        handleToolingChange('stencil', 'apertureRatio', '');
                        handleToolingChange('stencil', 'stencilType', '');
                      }} 
                      disabled={isFieldDisabled('basicInfo.tooling.stencil.noNeed')}
                    />
                    <span>不需要</span>
                  </label>
                </div>
              </div>

              {data.basicInfo.tooling?.stencil?.need && (
                <div className="form-row-grid-3 animate-fade-in">
                  <div className="form-group required-highlight">
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
                  <div className="form-group required-highlight">
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
                    <label className="form-label">鋼板類型 <span className="req">*</span></label>
                    <select 
                      className="form-input edit-active" 
                      value={data.basicInfo.tooling?.stencil?.stencilType || ''}
                      onChange={(e) => handleToolingChange('stencil', 'stencilType', e.target.value)}
                      disabled={isFieldDisabled('basicInfo.tooling.stencil.stencilType')}
                    >
                      <option value="">-- 請選擇 --</option>
                      <option value="一般鋼板">一般鋼板</option>
                      <option value="奈米鋼板">奈米鋼板</option>
                      <option value="階梯鋼板">階梯鋼板</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 其他治具 */}
          {['routingFixture', 'glueFixture', 'testFixture', 'assemblyFixture'].map((key) => {
            const labelMap = {
              routingFixture: 'Routing 治具',
              glueFixture: '塗膠治具',
              testFixture: '測試治具',
              assemblyFixture: '組裝治具'
            };
            const item = data.basicInfo.tooling[key] || {};
            return (
              <div key={key} className="tooling-row-align required-highlight">
                <span className="tool-name">{labelMap[key]}</span>
                <div className="radio-group">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name={key} 
                      checked={item.need || false}
                      onChange={() => {
                        const tool = data.basicInfo.tooling[key] || {};
                        const updatedTool = { ...tool, need: true, noNeed: false };
                        const updatedTooling = { ...data.basicInfo.tooling, [key]: updatedTool };
                        onChange({ ...data, basicInfo: { ...data.basicInfo, tooling: updatedTooling } });
                      }} 
                      disabled={isFieldDisabled(`basicInfo.tooling.${key}.need`)}
                    />
                    <span>需要</span>
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name={key} 
                      checked={item.noNeed || false}
                      onChange={() => {
                        const tool = data.basicInfo.tooling[key] || {};
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
                  <div className="fixture-qty-input animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '240px', width: '240px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>提供數量:</span>
                    <input 
                      type="text" 
                      className="form-input edit-active compact" 
                      placeholder="例: 2 SETs" 
                      value={item.qty || ''}
                      onChange={(e) => handleToolingChange(key, 'qty', e.target.value)}
                      disabled={isFieldDisabled(`basicInfo.tooling.${key}.qty`)}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* SMT刷錫載具 */}
          <div className="tooling-row-align required-highlight">
            <span className="tool-name">SMT刷錫載具</span>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="smtCarrierNeed" 
                  checked={data.basicInfo.tooling?.smtCarrier?.need || false}
                  onChange={() => {
                    handleToolingChange('smtCarrier', 'need', true);
                    handleToolingChange('smtCarrier', 'noNeed', false);
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
                    handleToolingChange('smtCarrier', 'need', false);
                    handleToolingChange('smtCarrier', 'noNeed', true);
                    handleToolingChange('smtCarrier', 'upper', false);
                    handleToolingChange('smtCarrier', 'lower', false);
                  }} 
                  disabled={isFieldDisabled('basicInfo.tooling.smtCarrier.noNeed')}
                />
                <span>不需要</span>
              </label>
            </div>
            {data.basicInfo.tooling?.smtCarrier?.need && (
              <div className="fixture-qty-input animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '320px', width: '320px' }}>
                <label className="checkbox-label" style={{ margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={data.basicInfo.tooling?.smtCarrier?.upper || false}
                    onChange={(e) => handleToolingChange('smtCarrier', 'upper', e.target.checked)}
                    disabled={isFieldDisabled('basicInfo.tooling.smtCarrier.upper')}
                  />
                  <span>上載板</span>
                </label>
                <label className="checkbox-label" style={{ margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={data.basicInfo.tooling?.smtCarrier?.lower || false}
                    onChange={(e) => handleToolingChange('smtCarrier', 'lower', e.target.checked)}
                    disabled={isFieldDisabled('basicInfo.tooling.smtCarrier.lower')}
                  />
                  <span>下載板</span>
                </label>
              </div>
            )}
          </div>

          {/* 其他治具 */}
          <div className="tooling-row-align required-highlight">
            <span className="tool-name">其他治具</span>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="otherFixtureNeed" 
                  checked={data.basicInfo.tooling?.otherFixture?.need || false}
                  onChange={() => {
                    handleToolingChange('otherFixture', 'need', true);
                    handleToolingChange('otherFixture', 'noNeed', false);
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
                    handleToolingChange('otherFixture', 'need', false);
                    handleToolingChange('otherFixture', 'noNeed', true);
                    handleToolingChange('otherFixture', 'name', '');
                    handleToolingChange('otherFixture', 'qty', '');
                  }} 
                  disabled={isFieldDisabled('basicInfo.tooling.otherFixture.noNeed')}
                />
                <span>不需要</span>
              </label>
            </div>
            {data.basicInfo.tooling?.otherFixture?.need && (
              <div className="fixture-qty-input animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '400px' }}>
                <input 
                  type="text" 
                  className="form-input edit-active compact" 
                  placeholder="治具名稱 (空白欄位)" 
                  value={data.basicInfo.tooling?.otherFixture?.name || ''}
                  onChange={(e) => handleToolingChange('otherFixture', 'name', e.target.value)}
                  disabled={isFieldDisabled('basicInfo.tooling.otherFixture.name')}
                  style={{ flex: 2 }}
                />
                <span style={{ fontSize: '0.85rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>數量:</span>
                <input 
                  type="text" 
                  className="form-input edit-active compact" 
                  placeholder="例: 1 SET" 
                  value={data.basicInfo.tooling?.otherFixture?.qty || ''}
                  onChange={(e) => handleToolingChange('otherFixture', 'qty', e.target.value)}
                  disabled={isFieldDisabled('basicInfo.tooling.otherFixture.qty')}
                  style={{ flex: 1 }}
                />
              </div>
            )}
          </div>

          <div className="action-row">
            <button className="btn btn-primary" onClick={onNext}>
              下一步：製程管制與前置作業
            </button>
          </div>
        </div>
      )}

      {/* 分頁 2: 製程管制與前置作業 */}
      {activeSection === 'processControl' && (
        <div className="section-form animate-fade-in">
          <h2 className="section-title">B. 製程管制與前置作業</h2>
          <p className="section-subtitle">請回填樣品提供狀態、烘烤確認、焊接順序及測溫點等關鍵生產防呆項目。</p>

          {/* 樣品提供與烘烤 */}
          <div className="form-row-grid">
            <div className="form-group required-highlight">
              <label className="form-label">樣品提供確認 <span className="req">*</span></label>
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

            <div className="form-group required-highlight">
              <label className="form-label">PCB / FPC 烘烤需求 <span className="req">*</span></label>
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
              <div className="form-row-grid">
                <div className="form-group required-highlight">
                  <label className="form-label">PCB 烘烤條件 <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-input edit-active" 
                    placeholder="例如: 120°C × 2hr"
                    value={data.processControl?.bakeRequired?.pcbBakeCond || ''}
                    onChange={(e) => handleBakeChange('pcbBakeCond', e.target.value)}
                    disabled={isFieldDisabled('processControl.bakeRequired.pcbBakeCond')}
                  />
                </div>
                <div className="form-group required-highlight">
                  <label className="form-label">FPCA 烘烤條件 <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-input edit-active" 
                    placeholder="例如: 80°C × 4hr"
                    value={data.processControl?.bakeRequired?.fpcaBakeCond || ''}
                    onChange={(e) => handleBakeChange('fpcaBakeCond', e.target.value)}
                    disabled={isFieldDisabled('processControl.bakeRequired.fpcaBakeCond')}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="divider"></div>

          {/* SMT 首件與焊接順序 */}
          <div className="form-row-grid">
            <div className="form-group required-highlight">
              <label className="form-label">SMT 首件檢查項目 <span className="req">*</span></label>
              <div className="checkbox-flex">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={data.processControl?.smtFirstPiece?.polarity || false}
                    onChange={(e) => handleProcessChange('smtFirstPiece', { ...data.processControl.smtFirstPiece, polarity: e.target.checked })}
                    disabled={isFieldDisabled('processControl.smtFirstPiece.polarity')}
                  />
                  <span>極性方向檢查</span>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={data.processControl?.smtFirstPiece?.measureLcr || false}
                    onChange={(e) => handleProcessChange('smtFirstPiece', { ...data.processControl.smtFirstPiece, measureLcr: e.target.checked })}
                    disabled={isFieldDisabled('processControl.smtFirstPiece.measureLcr')}
                  />
                  <span>量測 LCR (電容/電阻/電感)</span>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={data.processControl?.smtFirstPiece?.spi || false}
                    onChange={(e) => handleProcessChange('smtFirstPiece', { ...data.processControl.smtFirstPiece, spi: e.target.checked })}
                    disabled={isFieldDisabled('processControl.smtFirstPiece.spi')}
                  />
                  <span>SPI 錫膏厚度測試</span>
                </label>
              </div>
            </div>

            <div className="form-group required-highlight">
              <label className="form-label">SMT 焊接順序 <span className="req">*</span></label>
              <div className="radio-group">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="smtOrder" 
                    checked={data.processControl?.smtOrder?.bToT || false}
                    onChange={() => handleProcessChange('smtOrder', { bToT: true, tToB: false })}
                    disabled={isFieldDisabled('processControl.smtOrder.bToT')}
                  />
                  <span>先焊底面 (B→T)</span>
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="smtOrder" 
                    checked={data.processControl?.smtOrder?.tToB || false}
                    onChange={() => handleProcessChange('smtOrder', { bToT: false, tToB: true })}
                    disabled={isFieldDisabled('processControl.smtOrder.tToB')}
                  />
                  <span>先焊頂面 (T→B)</span>
                </label>
              </div>
            </div>
          </div>

          {/* DIP 首件與注意事項 */}
          {data.basicInfo.processItems.dip && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-row-grid">
                <div className="form-group required-highlight">
                  <label className="form-label">DIP 首件檢查項目 <span className="req">*</span></label>
                  <div className="checkbox-flex">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={data.processControl?.dipFirstPiece?.cutLead || false}
                        onChange={(e) => handleProcessChange('dipFirstPiece', { ...data.processControl.dipFirstPiece, cutLead: e.target.checked })}
                        disabled={isFieldDisabled('processControl.dipFirstPiece.cutLead')}
                      />
                      <span>剪腳前置作業</span>
                    </label>
                  </div>
                </div>

                <div className="form-group required-highlight">
                  <label className="form-label">DIP 焊接順序 <span className="req">*</span></label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="dipOrder" 
                        checked={data.processControl?.dipOrder?.bToT || false}
                        onChange={() => handleProcessChange('dipOrder', { bToT: true, tToB: false })}
                        disabled={isFieldDisabled('processControl.dipOrder.bToT')}
                      />
                      <span>先焊底面 (B→T)</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="dipOrder" 
                        checked={data.processControl?.dipOrder?.tToB || false}
                        onChange={() => handleProcessChange('dipOrder', { bToT: false, tToB: true })}
                        disabled={isFieldDisabled('processControl.dipOrder.tToB')}
                      />
                      <span>先焊頂面 (T→B)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">DIP 注意事項 (限 50 字)</label>
                <input 
                  type="text" 
                  className="form-input edit-active" 
                  placeholder="請輸入 DIP 注意事項 (50 字內)..."
                  maxLength={50}
                  value={data.processControl?.dipFirstPiece?.memo || ''}
                  onChange={(e) => handleProcessChange('dipFirstPiece', { ...data.processControl.dipFirstPiece, memo: e.target.value })}
                  disabled={isFieldDisabled('processControl.dipFirstPiece.memo')}
                />
              </div>
            </div>
          )}

          <div className="divider"></div>

          {/* 測溫點配置 (關鍵防呆) */}
          <h3 className="sub-section-title">🌡️ 測溫點配置與 Reflow 參數 (關鍵零件要求)</h3>
          
          <div className="form-group">
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
                <span>有關鍵零件 (需配置至少 2 點測溫)</span>
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
            <div className="temp-points-table-wrapper animate-fade-in">
              <table className="form-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>#</th>
                    <th>位置 / 位號 <span className="req">*</span></th>
                    <th>零件描述 <span className="req">*</span></th>
                    <th>備註</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const point = data.processControl.tempPoints?.[idx] || {};
                    return (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <input 
                            type="text" 
                            className="table-input edit-active" 
                            placeholder="例如: U12, Q5" 
                            value={point.pos || ''}
                            onChange={(e) => handleTempPointChange(idx, 'pos', e.target.value)}
                            disabled={isFieldDisabled(`processControl.tempPoints.${idx}.pos`)}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="table-input edit-active" 
                            placeholder="例如: BGA SOC / MCU" 
                            value={point.desc || ''}
                            onChange={(e) => handleTempPointChange(idx, 'desc', e.target.value)}
                            disabled={isFieldDisabled(`processControl.tempPoints.${idx}.desc`)}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="table-input edit-active" 
                            placeholder="選填備註" 
                            value={point.memo || ''}
                            onChange={(e) => handleTempPointChange(idx, 'memo', e.target.value)}
                            disabled={isFieldDisabled(`processControl.tempPoints.${idx}.memo`)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

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
                <span style={{ color: '#9ca3af' }}>°C x</span>
                <input 
                  type="text" 
                  className="form-input edit-active compact" 
                  placeholder="時間" 
                  value={data.processControl?.underfill?.bakeTime || ''}
                  onChange={(e) => handleProcessChange('underfill', { ...data.processControl.underfill, bakeTime: e.target.value })}
                  disabled={isFieldDisabled('processControl.underfill.bakeTime')}
                  style={{ width: '80px' }}
                />
                <span style={{ color: '#9ca3af' }}>min</span>
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
          <div className="form-group required-highlight">
            <label className="form-label">PCBA 包材種類 <span className="req">*</span></label>
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
          <div className="form-group required-highlight" style={{ marginTop: '12px' }}>
            <label className="form-label">FPCA 包材種類 <span className="req">*</span></label>
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
        <div className="section-form animate-fade-in">
          <h2 className="section-title">C. 試產報告與對齊確認</h2>

          {/* 報告清單與完成日期確認 */}
          <h3 className="sub-section-title">📂 試產交付文件、檢驗紀錄與照片清單</h3>
          <p className="description-text">請勾選確認已完成的項目以利兩端追蹤。</p>

          {/* A. 印刷品質 */}
          <div className="record-list-section">
            <h4 className="list-group-title">🖨️ A. 印刷品質 / 迴焊紀錄</h4>
            {data.trialReport?.printRecords?.map((rec, idx) => (
              <div key={rec.id} className="record-row edit-active">
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

          {/* B. 檢驗紀錄 */}
          <div className="record-list-section">
            <h4 className="list-group-title">🔍 B. 檢驗紀錄</h4>
            {data.trialReport?.inspectRecords?.map((rec, idx) => (
              <div key={rec.id} className="record-row edit-active">
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

          {/* D. 照片提供 */}
          <div className="record-list-section">
            <h4 className="list-group-title">📸 D. 照片提供</h4>
            {data.trialReport?.photoRecords?.map((rec, idx) => (
              <div key={rec.id} className="record-row edit-active" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                <label className="checkbox-label flex-1" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  <div className="xray-parts-inputs animate-fade-in" style={{ display: 'flex', gap: '8px', marginLeft: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {[0, 1, 2, 3].map((pIdx) => (
                      <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{pIdx + 1}:</span>
                        <input 
                          type="text" 
                          className="form-input edit-active compact" 
                          placeholder={`例如: U${pIdx + 1}`}
                          value={rec.parts?.[pIdx] || ''}
                          onChange={(e) => handleXrayPartChange(pIdx, e.target.value)}
                          disabled={isFieldDisabled(`trialReport.photoRecords.xray.parts.${pIdx}`)}
                          style={{ width: '80px', padding: '2px 6px', fontSize: '0.85rem' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="action-row">
            <button className="btn btn-primary" onClick={onNext}>
              下一步：雙向線上簽核
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

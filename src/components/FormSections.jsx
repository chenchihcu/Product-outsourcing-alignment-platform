import React from 'react';
import './FormSections.css';

export default function FormSections({ data, activeSection, onChange, onNext }) {
  
  const handleBasicChange = (field, val) => {
    const updated = { ...data.basicInfo, [field]: val };
    onChange({ ...data, basicInfo: updated });
  };

  const handleStageChange = (field, checked) => {
    const updatedStage = { ...data.basicInfo.stage, [field]: checked };
    const updated = { ...data.basicInfo, stage: updatedStage };
    onChange({ ...data, basicInfo: updated });
  };

  const handleProcessItemsChange = (field, checked) => {
    const updatedItems = { ...data.basicInfo.processItems, [field]: checked };
    const updated = { ...data.basicInfo, processItems: updatedItems };
    onChange({ ...data, basicInfo: updated });
  };

  const handleToolingChange = (toolKey, field, val) => {
    const tool = data.basicInfo.tooling[toolKey] || {};
    const updatedTool = { ...tool, [field]: val };
    const updatedTooling = { ...data.basicInfo.tooling, [toolKey]: updatedTool };
    const updated = { ...data.basicInfo, tooling: updatedTooling };
    onChange({ ...data, basicInfo: updated });
  };

  const handleProcessChange = (field, val) => {
    const updated = { ...data.processControl, [field]: val };
    onChange({ ...data, processControl: updated });
  };

  const handleSampleChange = (field, checked) => {
    const updatedSample = { ...data.processControl.sampleProvided, [field]: checked };
    const updated = { ...data.processControl, sampleProvided: updatedSample };
    onChange({ ...data, processControl: updated });
  };

  const handleBakeChange = (field, val) => {
    const updatedBake = { ...data.processControl.bakeRequired, [field]: val };
    const updated = { ...data.processControl, bakeRequired: updatedBake };
    onChange({ ...data, processControl: updated });
  };

  const handleTempPointChange = (index, field, val) => {
    const points = [...data.processControl.tempPoints];
    points[index] = { ...points[index], [field]: val };
    const updated = { ...data.processControl, tempPoints: points };
    onChange({ ...data, processControl: updated });
  };

  const handleTrialChange = (field, val) => {
    const updatedCriteria = { ...data.trialReport.passCriteria, [field]: val };
    const updated = { ...data.trialReport, passCriteria: updatedCriteria };
    onChange({ ...data, trialReport: updated });
  };

  const handleRecordChange = (category, index, field, val) => {
    const records = [...data.trialReport[category]];
    records[index] = { ...records[index], [field]: val };
    const updated = { ...data.trialReport, [category]: records };
    onChange({ ...data, trialReport: updated });
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
            <input 
              type="text" 
              className="form-input edit-active" 
              placeholder="例如: 富士康 / 捷普" 
              value={data.basicInfo.factory || ''} 
              onChange={(e) => handleBasicChange('factory', e.target.value)}
            />
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
              />
            </div>
          </div>

          {/* 產品階段 */}
          <div className="form-group">
            <label className="form-label">產品階段</label>
            <div className="checkbox-flex readonly-flex">
              {Object.keys(data.basicInfo.stage || {}).map(k => (
                <label key={k} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={data.basicInfo.stage[k] || false} 
                    disabled 
                  />
                  <span>{k.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="divider"></div>

          {/* 鋼板與治工具一覽表 (加工廠必填) */}
          <h3 className="sub-section-title">🔧 鋼板與治工具一覽表 (加工廠確認)</h3>
          
          {/* SMT 鋼板規格 */}
          {data.basicInfo.processItems.smt && (
            <div className="tooling-box">
              <span className="tooling-badge">SMT 鋼板</span>
              <div className="form-row-grid-4">
                <div className="form-group required-highlight">
                  <label className="form-label">鋼板厚度 (mm) <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-input edit-active" 
                    placeholder="例如: 0.12" 
                    value={data.basicInfo.tooling?.stencil?.thickness || ''}
                    onChange={(e) => handleToolingChange('stencil', 'thickness', e.target.value)}
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
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">雷射切割</label>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={data.basicInfo.tooling?.stencil?.laserCut || false}
                      onChange={(e) => handleToolingChange('stencil', 'laserCut', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="form-group required-highlight">
                  <label className="form-label">提供數量 <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-input edit-active" 
                    placeholder="例如: 1 SET" 
                    value={data.basicInfo.tooling?.stencil?.qty || ''}
                    onChange={(e) => handleToolingChange('stencil', 'qty', e.target.value)}
                  />
                </div>
              </div>
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
                      onChange={() => handleToolingChange(key, 'need', true)} 
                    />
                    <span>需要</span>
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name={key} 
                      checked={item.noNeed || false}
                      onChange={() => handleToolingChange(key, 'noNeed', true)} 
                    />
                    <span>不需要</span>
                  </label>
                </div>
                {item.need && (
                  <div className="fixture-qty-input animate-fade-in">
                    <input 
                      type="text" 
                      className="form-input edit-active compact" 
                      placeholder="填寫數量, 例: 2 SETs" 
                      value={item.qty || ''}
                      onChange={(e) => handleToolingChange(key, 'qty', e.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })}

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
                  />
                  <span>試錫板</span>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={data.processControl?.sampleProvided?.tempBoard || false}
                    onChange={(e) => handleSampleChange('tempBoard', e.target.checked)}
                  />
                  <span>測溫板</span>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={data.processControl?.sampleProvided?.standardPart || false}
                    onChange={(e) => handleSampleChange('standardPart', e.target.checked)}
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
                  />
                  <span>需要烘烤</span>
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="bakeRequired" 
                    checked={data.processControl?.bakeRequired?.noNeed || false}
                    onChange={() => handleBakeChange('noNeed', true)}
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
                  />
                  <span>極性方向檢查</span>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={data.processControl?.smtFirstPiece?.measureLcr || false}
                    onChange={(e) => handleProcessChange('smtFirstPiece', { ...data.processControl.smtFirstPiece, measureLcr: e.target.checked })}
                  />
                  <span>量測 LCR (電容/電阻/電感)</span>
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
                  />
                  <span>先焊底面 (B→T)</span>
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="smtOrder" 
                    checked={data.processControl?.smtOrder?.tToB || false}
                    onChange={() => handleProcessChange('smtOrder', { bToT: false, tToB: true })}
                  />
                  <span>先焊頂面 (T→B)</span>
                </label>
              </div>
            </div>
          </div>

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
                />
                <span>有關鍵零件 (需配置至少 2 點測溫)</span>
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="keyParts" 
                  checked={data.processControl?.keyParts?.none || false}
                  onChange={() => handleProcessChange('keyParts', { has: false, none: true })}
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
                  {[0, 1].map((idx) => {
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
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="table-input edit-active" 
                            placeholder="例如: BGA SOC / MCU" 
                            value={point.desc || ''}
                            onChange={(e) => handleTempPointChange(idx, 'desc', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="table-input edit-active" 
                            placeholder="選填備註" 
                            value={point.memo || ''}
                            onChange={(e) => handleTempPointChange(idx, 'memo', e.target.value)}
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
              <input 
                type="text" 
                className="form-input edit-active" 
                placeholder="例如: 110°C × 30min" 
                value={data.processControl?.underfill?.bakeCond || ''}
                onChange={(e) => handleProcessChange('underfill', { ...data.processControl.underfill, bakeCond: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">膠材型號</label>
              <input 
                type="text" 
                className="form-input edit-active" 
                placeholder="例如: Loctite 3513" 
                value={data.processControl?.underfill?.glueModel || ''}
                onChange={(e) => handleProcessChange('underfill', { ...data.processControl.underfill, glueModel: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group required-highlight">
            <label className="form-label">PCBA 包材種類 <span className="req">*</span></label>
            <div className="checkbox-flex">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={data.processControl?.packaging?.staticBag || false}
                  onChange={(e) => handleProcessChange('packaging', { ...data.processControl.packaging, staticBag: e.target.checked })}
                />
                <span>靜電袋</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={data.processControl?.packaging?.honeycomb || false}
                  onChange={(e) => handleProcessChange('packaging', { ...data.processControl.packaging, honeycomb: e.target.checked })}
                />
                <span>蜂巢式抗靜電隔板</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={data.processControl?.packaging?.tray || false}
                  onChange={(e) => handleProcessChange('packaging', { ...data.processControl.packaging, tray: e.target.checked })}
                />
                <span>Tray 抗靜電脆盤</span>
              </label>
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
          <p className="section-subtitle">核對印刷、檢驗紀錄與所須上傳的照片清單。</p>

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
              <div key={rec.id} className="record-row edit-active">
                <label className="checkbox-label flex-1">
                  <input 
                    type="checkbox" 
                    checked={rec.checked || false}
                    onChange={(e) => handleRecordChange('photoRecords', idx, 'checked', e.target.checked)}
                  />
                  <span className="record-name">{rec.name}</span>
                </label>
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

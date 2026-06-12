import React from 'react';
import { useFieldOwner } from '../hooks/useFieldOwner';
import { isFieldDisabled, getFieldHighlightClass, updateFieldWithOwner } from '../utils/fieldUtils';
import { sectionSvg } from '../utils/svgIcons';
import './FormSections.css';

export default function ProcessControlSection({ data, onChange, currentUser, highlightField, onNext }) {
  const { setField } = useFieldOwner(onChange, currentUser);

  const handleBakeChange = (field, val) => {
    if (['pcbBakeTemp', 'pcbBakeTol', 'pcbBakeHr', 'fpcaBakeTemp', 'fpcaBakeHr'].includes(field)) {
      val = String(val).replace(/[^\d]/g, '');
    }
    onChange(prev => {
      const pc = prev.processControl || {};
      const bakeObj = pc.bakeRequired || {};
      let updatedBake = { ...bakeObj, [field]: val };
      if (field === 'need' && val === true) {
        updatedBake.noNeed = false;
        if (!updatedBake.fpcaBakeTemp) updatedBake.fpcaBakeTemp = '80';
        if (!updatedBake.fpcaBakeHr) updatedBake.fpcaBakeHr = '4';
      } else if (field === 'noNeed' && val === true) {
        updatedBake = { ...updatedBake, need: false, pcbBakeTemp: '', pcbBakeTol: '', pcbBakeHr: '', fpcaBakeTemp: '', fpcaBakeHr: '', pcbBakeCond: '', fpcaBakeCond: '' };
      }
      if (['pcbBakeTemp', 'pcbBakeTol', 'pcbBakeHr'].includes(field) || (field === 'need' && val === true)) {
        const tempStr = updatedBake.pcbBakeTemp || '_____';
        const tolStr = updatedBake.pcbBakeTol || '___';
        const hrStr = updatedBake.pcbBakeHr || '___';
        updatedBake.pcbBakeCond = `PCB 烘烤: ${tempStr}  °C ± ${tolStr} °C × ${hrStr} hr（依 PCB 廠建議）`;
      }
      if (['fpcaBakeTemp', 'fpcaBakeHr'].includes(field) || (field === 'need' && val === true)) {
        const tempStr = updatedBake.fpcaBakeTemp || '80';
        const hrStr = updatedBake.fpcaBakeHr || '4';
        updatedBake.fpcaBakeCond = `FPCA 烘烤: 依原物料規格書，若無規格則 _${tempStr}__ °C × _${hrStr}__ hr`;
      }
      const updated = { ...pc, bakeRequired: updatedBake };
      const path = `processControl.bakeRequired.${field}`;
      return updateFieldWithOwner({ ...prev, processControl: updated }, path, val, currentUser?.unit);
    });
  };

  return (
    <div className="section-form animate-fade-in">
      <h2 className="section-title">製程管制</h2>
      <p className="section-subtitle">請回填樣品提供狀態、烘烤確認、焊接順序及測溫點等關鍵生產防呆項目。</p>

      <div className="form-row-grid" data-accent="indigo">
        <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'sampleProvided')}`}>
          <label className="form-label"><span className="card-icon-circle card-icon-xs">{sectionSvg.clipboard}</span> 樣品提供確認 <span className="req">*</span></label>
          <div className="checkbox-flex">
            {['trialBoard', 'tempBoard', 'standardPart'].map(k => (
              <label key={k} className="checkbox-label">
                <input type="checkbox" checked={data.processControl?.sampleProvided?.[k] || false}
                  onChange={(e) => setField(`processControl.sampleProvided.${k}`, e.target.checked)}
                  disabled={isFieldDisabled(data, currentUser, `processControl.sampleProvided.${k}`)} />
                <span>{k === 'trialBoard' ? '試錫板' : k === 'tempBoard' ? '測溫板' : '標準件'}</span>
              </label>
            ))}
          </div>
        </div>
        <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'bakeRequired')}`}>
          <label className="form-label"><span className="card-icon-circle card-icon-xs">{sectionSvg.thermometer}</span> PCB / FPCA 烘烤需求 <span className="req">*</span></label>
          <div className="radio-group">
            <label className="radio-label">
              <input type="radio" name="bakeRequired" checked={data.processControl?.bakeRequired?.need || false}
                onChange={() => handleBakeChange('need', true)}
                disabled={isFieldDisabled(data, currentUser, 'processControl.bakeRequired.need')} />
              <span>需要烘烤</span>
            </label>
            <label className="radio-label">
              <input type="radio" name="bakeRequired" checked={data.processControl?.bakeRequired?.noNeed || false}
                onChange={() => handleBakeChange('noNeed', true)}
                disabled={isFieldDisabled(data, currentUser, 'processControl.bakeRequired.noNeed')} />
              <span>不需要</span>
            </label>
          </div>
        </div>
      </div>

      {data.processControl?.bakeRequired?.need && (
        <div className="bake-cond-box animate-fade-in">
          <div className="form-row-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'bakeRequired')}`}>
              <label className="form-label">PCB 烘烤條件 <span className="req">*</span></label>
              <div className="inline-bake-inputs edit-active">
                <span>PCB 烘烤: </span>
                <input type="text" className="inline-num-input" placeholder="120" name="processControl.bakeRequired.pcbBakeTemp" value={data.processControl?.bakeRequired?.pcbBakeTemp || ''}
                  onChange={(e) => handleBakeChange('pcbBakeTemp', e.target.value)} disabled={isFieldDisabled(data, currentUser, 'processControl.bakeRequired.pcbBakeTemp')} />
                <span> °C ± </span>
                <input type="text" className="inline-num-input inline-num-small" placeholder="5" name="processControl.bakeRequired.pcbBakeTol" value={data.processControl?.bakeRequired?.pcbBakeTol || ''}
                  onChange={(e) => handleBakeChange('pcbBakeTol', e.target.value)} disabled={isFieldDisabled(data, currentUser, 'processControl.bakeRequired.pcbBakeTol')} />
                <span> °C × </span>
                <input type="text" className="inline-num-input inline-num-small" placeholder="2" name="processControl.bakeRequired.pcbBakeHr" value={data.processControl?.bakeRequired?.pcbBakeHr || ''}
                  onChange={(e) => handleBakeChange('pcbBakeHr', e.target.value)} disabled={isFieldDisabled(data, currentUser, 'processControl.bakeRequired.pcbBakeHr')} />
                <span> hr（依 PCB 廠建議）</span>
              </div>
              {((data.processControl?.bakeRequired?.pcbBakeTemp && (Number(data.processControl.bakeRequired.pcbBakeTemp) < 90 || Number(data.processControl.bakeRequired.pcbBakeTemp) > 150)) ||
                (data.processControl?.bakeRequired?.pcbBakeHr && (Number(data.processControl.bakeRequired.pcbBakeHr) < 1 || Number(data.processControl.bakeRequired.pcbBakeHr) > 12))) && (
                <div className="inline-input-warning animate-fade-in">⚠️ 警告：PCB 烘烤建議溫度為 100°C~140°C，時間為 2~6 hr。請確認填寫數值是否正確。</div>
              )}
            </div>
            <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'bakeRequired')}`}>
              <label className="form-label">FPCA 烘烤條件 <span className="req">*</span></label>
              <div className="inline-bake-inputs edit-active">
                <span>FPCA 烘烤: 依原物料規格書，若無規格則 </span>
                <input type="text" className="inline-num-input" placeholder="80" name="processControl.bakeRequired.fpcaBakeTemp" value={data.processControl?.bakeRequired?.fpcaBakeTemp || ''}
                  onChange={(e) => handleBakeChange('fpcaBakeTemp', e.target.value)} disabled={isFieldDisabled(data, currentUser, 'processControl.bakeRequired.fpcaBakeTemp')} />
                <span> °C × </span>
                <input type="text" className="inline-num-input inline-num-small" placeholder="4" name="processControl.bakeRequired.fpcaBakeHr" value={data.processControl?.bakeRequired?.fpcaBakeHr || ''}
                  onChange={(e) => handleBakeChange('fpcaBakeHr', e.target.value)} disabled={isFieldDisabled(data, currentUser, 'processControl.bakeRequired.fpcaBakeHr')} />
                <span> hr</span>
              </div>
              {((data.processControl?.bakeRequired?.fpcaBakeTemp && (Number(data.processControl.bakeRequired.fpcaBakeTemp) < 50 || Number(data.processControl.bakeRequired.fpcaBakeTemp) > 110)) ||
                (data.processControl?.bakeRequired?.fpcaBakeHr && (Number(data.processControl.bakeRequired.fpcaBakeHr) < 1 || Number(data.processControl.bakeRequired.fpcaBakeHr) > 12))) && (
                <div className="inline-input-warning animate-fade-in">⚠️ 警告：FPCA 烘烤建議溫度為 60°C~100°C，時間為 2~8 hr。請確認填寫數值是否正確。</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="divider"></div>

      <h3 className="sub-section-title"><span className="card-icon-circle card-icon-sm">{sectionSvg.thermometer}</span>測溫點配置與 Reflow 參數 (關鍵零件要求)</h3>
      <div className={`form-group ${getFieldHighlightClass(highlightField, 'tempPoints')}`}>
        <label className="form-label">關鍵零件狀態</label>
        <div className="radio-group">
          <label className="radio-label">
            <input type="radio" name="keyParts" checked={data.processControl?.keyParts?.has || false}
              onChange={() => setField('processControl.keyParts', { has: true, none: false })}
              disabled={isFieldDisabled(data, currentUser, 'processControl.keyParts.has')} />
            <span>有關鍵零件 (需配置至少 6 點測溫)</span>
          </label>
          <label className="radio-label">
            <input type="radio" name="keyParts" checked={data.processControl?.keyParts?.none || false}
              onChange={() => setField('processControl.keyParts', { has: false, none: true })}
              disabled={isFieldDisabled(data, currentUser, 'processControl.keyParts.none')} />
            <span>無關鍵零件</span>
          </label>
        </div>
      </div>

      {data.processControl?.keyParts?.has && (
        <div className={`temp-points-table-wrapper animate-fade-in ${getFieldHighlightClass(highlightField, 'tempPoints')}`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
            {[0, 1, 2].map((idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#000000' }}>#{idx + 1}</label>
                <input type="text" className="form-input edit-active" placeholder="例如: U12, Q5" name={`processControl.tempPoints.${idx}.pos`} value={data.processControl.tempPoints?.[idx]?.pos || ''}
                  onChange={(e) => setField(`processControl.tempPoints.${idx}.pos`, e.target.value)}
                  disabled={isFieldDisabled(data, currentUser, `processControl.tempPoints.${idx}.pos`)} style={{ fontSize: '0.9rem' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[3, 4, 5].map((idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#000000' }}>#{idx + 1}</label>
                <input type="text" className="form-input edit-active" placeholder="例如: U12, Q5" name={`processControl.tempPoints.${idx}.pos`} value={data.processControl.tempPoints?.[idx]?.pos || ''}
                  onChange={(e) => setField(`processControl.tempPoints.${idx}.pos`, e.target.value)}
                  disabled={isFieldDisabled(data, currentUser, `processControl.tempPoints.${idx}.pos`)} style={{ fontSize: '0.9rem' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-row-grid" data-accent="cyan">
        <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'smtFirstPiece')}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
          <label className="form-label"><span className="card-icon-circle card-icon-xs">{sectionSvg.layers}</span> SMT 首件檢查項目 <span className="req">*</span>
            {!data.basicInfo.processItems?.smt && <span style={{ marginLeft: '8px', color: '#ef4444', fontSize: '0.82rem', fontWeight: 'bold' }}>(不適用，請至基本資料勾選加工項目 SMT)</span>}
          </label>
          <div className={`checkbox-flex ${!data.basicInfo.processItems?.smt ? 'readonly-flex' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px' }}>
              {[['polarity', '極性方向檢查'], ['measureLcr', '量測 LCR'], ['spi', 'SPI 錫膏厚度'], ['steelTension', '鋼板張力量測'], ['pcbReflow', 'PCB外觀檢查'], ['solderability', '濕潤性檢查']].map(([key, label]) => (
                <label key={key} className="checkbox-label" style={{ fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={data.processControl?.smtFirstPiece?.[key] || false}
                    onChange={(e) => setField('processControl.smtFirstPiece', { ...(data.processControl?.smtFirstPiece || {}), [key]: e.target.checked })}
                    disabled={isFieldDisabled(data, currentUser, `processControl.smtFirstPiece.${key}`) || !data.basicInfo.processItems?.smt} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div className={getFieldHighlightClass(highlightField, 'ledTest')} style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 550, whiteSpace: 'nowrap' }}>LED點亮測試:</span>
              <div className="radio-group" style={{ display: 'inline-flex', gap: '10px' }}>
                <label className="radio-label" style={{ fontSize: '0.8rem' }}>
                  <input type="radio" name="ledTest" checked={data.processControl?.smtFirstPiece?.ledTest === 'yes'}
                    onChange={() => setField('processControl.smtFirstPiece', { ...(data.processControl?.smtFirstPiece || {}), ledTest: 'yes' })}
                    disabled={isFieldDisabled(data, currentUser, 'processControl.smtFirstPiece.ledTest') || !data.basicInfo.processItems?.smt} />
                  <span>有</span>
                </label>
                <label className="radio-label" style={{ fontSize: '0.8rem' }}>
                  <input type="radio" name="ledTest" checked={data.processControl?.smtFirstPiece?.ledTest === 'no'}
                    onChange={() => setField('processControl.smtFirstPiece', { ...(data.processControl?.smtFirstPiece || {}), ledTest: 'no' })}
                    disabled={isFieldDisabled(data, currentUser, 'processControl.smtFirstPiece.ledTest') || !data.basicInfo.processItems?.smt} />
                  <span>無</span>
                </label>
              </div>
            </div>
          </div>
          <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'smtOrder')}`} style={{ marginTop: '12px', marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>SMT 焊接順序 <span className="req">*</span></label>
            <div className="radio-group" style={{ padding: '2px 0' }}>
              <label className="radio-label">
                <input type="radio" name="smtOrder" checked={data.processControl?.smtOrder?.bToT || false}
                  onChange={() => setField('processControl.smtOrder', { bToT: true, tToB: false })}
                  disabled={isFieldDisabled(data, currentUser, 'processControl.smtOrder.bToT') || !data.basicInfo.processItems?.smt} />
                <span>先焊底面 (B→T)</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="smtOrder" checked={data.processControl?.smtOrder?.tToB || false}
                  onChange={() => setField('processControl.smtOrder', { bToT: false, tToB: true })}
                  disabled={isFieldDisabled(data, currentUser, 'processControl.smtOrder.tToB') || !data.basicInfo.processItems?.smt} />
                <span>先焊頂面 (T→B)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
          <label className="form-label"><span className="card-icon-circle card-icon-xs">{sectionSvg.microscope}</span> DIP 首件檢查項目 <span className="req">*</span>
            {!data.basicInfo.processItems?.dip && <span style={{ marginLeft: '8px', color: '#ef4444', fontSize: '0.82rem', fontWeight: 'bold' }}>(不適用，請至基本資料勾選加工項目 DIP)</span>}
          </label>
          <div className={`checkbox-flex ${!data.basicInfo.processItems?.dip ? 'readonly-flex' : ''}`} style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label className="checkbox-label" style={{ fontSize: '0.85rem' }}>
              <input type="checkbox" checked={data.processControl?.dipFirstPiece?.cutLead || false}
                onChange={(e) => setField('processControl.dipFirstPiece', { ...(data.processControl?.dipFirstPiece || {}), cutLead: e.target.checked })}
                disabled={isFieldDisabled(data, currentUser, 'processControl.dipFirstPiece.cutLead') || !data.basicInfo.processItems?.dip} />
              <span>剪腳前置作業 (切腳、折腳、預成型)</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 550 }}>DIP 注意事項 (限 50 字):</span>
              <textarea className="form-input edit-active compact" placeholder={data.basicInfo.processItems?.dip ? "請輸入 DIP 注意事項..." : "不適用"} name="processControl.dipFirstPiece.memo" maxLength={50}
                value={data.processControl?.dipFirstPiece?.memo || ''}
                onChange={(e) => setField('processControl.dipFirstPiece', { ...(data.processControl?.dipFirstPiece || {}), memo: e.target.value })}
                disabled={isFieldDisabled(data, currentUser, 'processControl.dipFirstPiece.memo') || !data.basicInfo.processItems?.dip}
                style={{ padding: '6px 8px', fontSize: '0.82rem', height: '70px', resize: 'none' }} />
            </div>
          </div>
          <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'dipOrder')}`} style={{ marginTop: '12px', marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>DIP 焊接順序 <span className="req">*</span></label>
            <div className="radio-group" style={{ padding: '2px 0' }}>
              <label className="radio-label">
                <input type="radio" name="dipOrder" checked={data.processControl?.dipOrder?.bToT || false}
                  onChange={() => setField('processControl.dipOrder', { bToT: true, tToB: false })}
                  disabled={isFieldDisabled(data, currentUser, 'processControl.dipOrder.bToT') || !data.basicInfo.processItems?.dip} />
                <span>先焊底面 (B→T)</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="dipOrder" checked={data.processControl?.dipOrder?.tToB || false}
                  onChange={() => setField('processControl.dipOrder', { bToT: false, tToB: true })}
                  disabled={isFieldDisabled(data, currentUser, 'processControl.dipOrder.tToB') || !data.basicInfo.processItems?.dip} />
                <span>先焊頂面 (T→B)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <div className="form-row-grid">
        <div className="form-group">
          <label className="form-label">Underfill 後烘烤</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="text" className="form-input edit-active compact" placeholder="溫度" name="processControl.underfill.bakeTemp" value={data.processControl?.underfill?.bakeTemp || ''}
              onChange={(e) => setField('processControl.underfill', { ...(data.processControl.underfill || {}), bakeTemp: e.target.value })}
              disabled={isFieldDisabled(data, currentUser, 'processControl.underfill.bakeTemp')} style={{ width: '80px' }} />
            <span style={{ color: '#6b7280' }}>°C x</span>
            <input type="text" className="form-input edit-active compact" placeholder="時間" name="processControl.underfill.bakeTime" value={data.processControl?.underfill?.bakeTime || ''}
              onChange={(e) => setField('processControl.underfill', { ...(data.processControl.underfill || {}), bakeTime: e.target.value })}
              disabled={isFieldDisabled(data, currentUser, 'processControl.underfill.bakeTime')} style={{ width: '80px' }} />
            <span style={{ color: '#6b7280' }}>min</span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">膠材型號</label>
          <input type="text" className="form-input edit-active" placeholder="例如: Loctite 3513" name="processControl.underfill.glueModel" value={data.processControl?.underfill?.glueModel || ''}
            onChange={(e) => setField('processControl.underfill', { ...(data.processControl.underfill || {}), glueModel: e.target.value })}
            disabled={isFieldDisabled(data, currentUser, 'processControl.underfill.glueModel')} />
        </div>
      </div>

      <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'pcbaPackaging')}`} data-accent="violet">
        <label className="form-label"><span className="card-icon-circle card-icon-xs">{sectionSvg.box}</span> PCBA 包材種類 <span className="req">*</span></label>
        <div className="checkbox-flex" style={{ flexWrap: 'wrap', gap: '12px' }}>
          {[['staticBag', '靜電袋'], ['honeycomb', '蜂巢式抗靜電隔板'], ['tray', 'Tray 抗靜電脆盤'], ['sensorCover', 'Sensor 保護貼'], ['cameraCover', 'Camera 保護貼']].map(([key, label]) => (
            <label key={key} className="checkbox-label">
              <input type="checkbox" checked={data.processControl?.pcbaPackaging?.[key] || false}
                onChange={(e) => setField('processControl.pcbaPackaging', { ...(data.processControl.pcbaPackaging || {}), [key]: e.target.checked })}
                disabled={isFieldDisabled(data, currentUser, `processControl.pcbaPackaging.${key}`)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'fpcaPackaging')}`} style={{ marginTop: '12px' }} data-accent="violet">
        <label className="form-label"><span className="card-icon-circle card-icon-xs">{sectionSvg.box}</span> FPCA 包材種類 <span className="req">*</span></label>
        <div className="checkbox-flex" style={{ flexWrap: 'wrap', gap: '12px' }}>
          {[['staticBag', '靜電袋'], ['honeycomb', '蜂巢式抗靜電隔板'], ['tray', 'Tray 抗靜電脆盤'], ['sensorCover', 'Sensor 保護貼'], ['cameraCover', 'Camera 保護貼']].map(([key, label]) => (
            <label key={key} className="checkbox-label">
              <input type="checkbox" checked={data.processControl?.fpcaPackaging?.[key] || false}
                onChange={(e) => setField('processControl.fpcaPackaging', { ...(data.processControl.fpcaPackaging || {}), [key]: e.target.checked })}
                disabled={isFieldDisabled(data, currentUser, `processControl.fpcaPackaging.${key}`)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">特殊製程備註 (研發/工程)</label>
        <textarea className="form-textarea edit-active" rows={3} placeholder="如有特殊焊接、清洗、塗覆要求，請在此填寫..." name="processControl.specialProcessMemo"
          value={data.processControl?.specialProcessMemo || ''}
          onChange={(e) => setField('processControl.specialProcessMemo', e.target.value)}
          disabled={isFieldDisabled(data, currentUser, 'processControl.specialProcessMemo')} />
      </div>

      <div className="action-row">
        <button type="button" className="btn btn-primary" onClick={onNext}>下一步：試產報告要求</button>
      </div>
    </div>
  );
}



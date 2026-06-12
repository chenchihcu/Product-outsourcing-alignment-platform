import React from 'react';
import { useFieldOwner } from '../hooks/useFieldOwner';
import { isFieldDisabled, getFieldHighlightClass } from '../utils/fieldUtils';
import { sectionSvg } from '../utils/svgIcons';
import './FormSections.css';

export default function ProcessControlSection({ data, onChange, currentUser, highlightField, onNext }) {
  const { setField } = useFieldOwner(onChange, currentUser);

  return (
    <div className="section-form animate-fade-in">
      <h2 className="section-title">製程管制</h2>
      <p className="section-subtitle">請確認焊接順序、首件檢查項目及測溫點配置等關鍵生產防呆項目。</p>

      <h3 className="sub-section-title"><span className="card-icon-circle card-icon-sm">{sectionSvg.thermometer}</span>測溫點配置與 Reflow 參數 (關鍵零件要求)</h3>
      <div className={`form-group ${getFieldHighlightClass(highlightField, 'tempPoints')}`}>
        <label className="form-label">關鍵零件狀態</label>
        <div className="radio-group">
          <label className="radio-label">
            <input type="radio" name="keyParts" checked={data.processControl?.keyParts?.has || false}
              onChange={() => setField('processControl.keyParts', { has: true, none: false })}
              disabled={isFieldDisabled(data, currentUser, 'processControl.keyParts.has')} />
            <span>有關鍵零件</span>
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
          <label className="form-label"><span className="card-icon-circle card-icon-xs">{sectionSvg.layers}</span> SMT 首件檢查項目 <span className="req">*</span></label>
          <div className="checkbox-flex" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px' }}>
              {[['polarity', '極性方向檢查'], ['measureLcr', '量測 LCR'], ['spi', 'SPI 錫膏厚度'], ['steelTension', '鋼板張力量測'], ['pcbReflow', 'PCB外觀檢查'], ['solderability', '濕潤性檢查']].map(([key, label]) => (
                <label key={key} className="checkbox-label" style={{ fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={data.processControl?.smtFirstPiece?.[key] || false}
                    onChange={(e) => setField('processControl.smtFirstPiece', { ...(data.processControl?.smtFirstPiece || {}), [key]: e.target.checked })}
                    disabled={isFieldDisabled(data, currentUser, `processControl.smtFirstPiece.${key}`)} />
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
                    disabled={isFieldDisabled(data, currentUser, 'processControl.smtFirstPiece.ledTest')} />
                  <span>有</span>
                </label>
                <label className="radio-label" style={{ fontSize: '0.8rem' }}>
                  <input type="radio" name="ledTest" checked={data.processControl?.smtFirstPiece?.ledTest === 'no'}
                    onChange={() => setField('processControl.smtFirstPiece', { ...(data.processControl?.smtFirstPiece || {}), ledTest: 'no' })}
                    disabled={isFieldDisabled(data, currentUser, 'processControl.smtFirstPiece.ledTest')} />
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
                  disabled={isFieldDisabled(data, currentUser, 'processControl.smtOrder.bToT')} />
                <span>先焊底面 (B→T)</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="smtOrder" checked={data.processControl?.smtOrder?.tToB || false}
                  onChange={() => setField('processControl.smtOrder', { bToT: false, tToB: true })}
                  disabled={isFieldDisabled(data, currentUser, 'processControl.smtOrder.tToB')} />
                <span>先焊頂面 (T→B)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
          <label className="form-label"><span className="card-icon-circle card-icon-xs">{sectionSvg.microscope}</span> DIP 首件檢查項目 <span className="req">*</span></label>
          <div className="checkbox-flex" style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label className="checkbox-label" style={{ fontSize: '0.85rem' }}>
              <input type="checkbox" checked={data.processControl?.dipFirstPiece?.cutLead || false}
                onChange={(e) => setField('processControl.dipFirstPiece', { ...(data.processControl?.dipFirstPiece || {}), cutLead: e.target.checked })}
                disabled={isFieldDisabled(data, currentUser, 'processControl.dipFirstPiece.cutLead')} />
              <span>剪腳前置作業 (切腳、折腳、預成型)</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 550 }}>DIP 注意事項 (限 50 字):</span>
              <textarea className="form-input edit-active compact" placeholder="請輸入 DIP 注意事項..." name="processControl.dipFirstPiece.memo" maxLength={50}
                value={data.processControl?.dipFirstPiece?.memo || ''}
                onChange={(e) => setField('processControl.dipFirstPiece', { ...(data.processControl?.dipFirstPiece || {}), memo: e.target.value })}
                disabled={isFieldDisabled(data, currentUser, 'processControl.dipFirstPiece.memo')}
                style={{ padding: '6px 8px', fontSize: '0.82rem', height: '70px', resize: 'none' }} />
            </div>
          </div>
          <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'dipOrder')}`} style={{ marginTop: '12px', marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>DIP 焊接順序 <span className="req">*</span></label>
            <div className="radio-group" style={{ padding: '2px 0' }}>
              <label className="radio-label">
                <input type="radio" name="dipOrder" checked={data.processControl?.dipOrder?.bToT || false}
                  onChange={() => setField('processControl.dipOrder', { bToT: true, tToB: false })}
                  disabled={isFieldDisabled(data, currentUser, 'processControl.dipOrder.bToT')} />
                <span>先焊底面 (B→T)</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="dipOrder" checked={data.processControl?.dipOrder?.tToB || false}
                  onChange={() => setField('processControl.dipOrder', { bToT: false, tToB: true })}
                  disabled={isFieldDisabled(data, currentUser, 'processControl.dipOrder.tToB')} />
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



import { useFieldOwner } from '../hooks/useFieldOwner';
import { isFieldDisabled, getFieldHighlightClass } from '../utils/fieldUtils';
import { sectionSvg } from '../utils/svgIcons';
import './FormSections.css';

export default function BasicInfoSection({ data, onChange, currentUser, factories, highlightField, onNext }) {
  const { setField } = useFieldOwner(onChange, currentUser);

  return (
    <div className="section-form animate-fade-in">
      <h2 className="section-title">基本資料</h2>
      <p className="section-subtitle">請核對發包方資訊，並由加工廠確實填寫廠區及治工具資訊。</p>

      <div className="form-section-card glass-card" data-accent="indigo">
        <div className="card-header"><span className="card-icon-circle">{sectionSvg.chip}</span>機種基本資訊</div>
        <div className="card-body">
          <div className="form-row-grid-3">
            <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'factory')}`}>
              <label className="form-label">委外加工廠 <span className="req">*</span></label>
              <select className="form-input edit-active" value={data.basicInfo.factory || ''}
                onChange={(e) => setField('basicInfo.factory', e.target.value)}
                disabled={isFieldDisabled(data, currentUser, 'basicInfo.factory')}>
                <option value="">-- 請選擇委外加工廠 --</option>
                {(() => {
                  const currentFac = data.basicInfo.factory;
                  const list = [...factories];
                  if (currentFac && !list.includes(currentFac)) list.unshift(currentFac);
                  return list.map(fac => <option key={fac} value={fac}>{fac}</option>);
                })()}
              </select>
            </div>
            <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'productNo')}`}>
              <label className="form-label">產品料號 <span className="req">*</span></label>
              <input type="text" className="form-input edit-active" placeholder="請輸入產品料號" name="basicInfo.productNo" value={data.basicInfo.productNo || ''}
                onChange={(e) => setField('basicInfo.productNo', e.target.value)}
                disabled={isFieldDisabled(data, currentUser, 'basicInfo.productNo')} />
            </div>
            <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'productDesc')}`}>
              <label className="form-label">產品名稱 / 描述 <span className="req">*</span></label>
              <input type="text" className="form-input edit-active" placeholder="請輸入產品名稱 / 描述" name="basicInfo.productDesc" value={data.basicInfo.productDesc || ''}
                onChange={(e) => setField('basicInfo.productDesc', e.target.value)}
                disabled={isFieldDisabled(data, currentUser, 'basicInfo.productDesc')} />
            </div>
          </div>
          <div className="form-row-grid-2">
            <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'stage')}`}>
              <label className="form-label">產品階段 <span className="req">*</span></label>
              <div className="checkbox-flex">
                {Object.keys(data.basicInfo.stage || {}).filter(k => k !== 'ecn').map(k => (
                  <label key={k} className="checkbox-label">
                    <input type="checkbox" checked={data.basicInfo.stage[k] || false}
                      onChange={(e) => setField(`basicInfo.stage.${k}`, e.target.checked)}
                      disabled={isFieldDisabled(data, currentUser, `basicInfo.stage.${k}`)} />
                    <span>{k === 'politRun' ? 'Pilot-run' : k === 'mp' ? 'MP' : k.toUpperCase()}</span>
                  </label>
                ))}
                {!Object.keys(data.basicInfo.stage || {}).includes('mp') && (
                  <label key="mp" className="checkbox-label">
                    <input type="checkbox" checked={data.basicInfo.stage?.mp || false}
                      onChange={(e) => setField('basicInfo.stage.mp', e.target.checked)}
                      disabled={isFieldDisabled(data, currentUser, 'basicInfo.stage.mp')} />
                    <span>MP</span>
                  </label>
                )}
              </div>
            </div>
            <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'ecnChange')}`}>
              <label className="form-label">工程變更 <span className="req">*</span></label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="ecnChange" checked={data.basicInfo.ecnChange?.has || false}
                    onChange={() => setField('basicInfo.ecnChange', { ...(data.basicInfo.ecnChange || {}), has: true, no: false })}
                    disabled={isFieldDisabled(data, currentUser, 'basicInfo.ecnChange.has')} />
                  <span>有</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="ecnChange" checked={data.basicInfo.ecnChange?.no || false}
                    onChange={() => setField('basicInfo.ecnChange', { has: false, no: true, verificationItem: '' })}
                    disabled={isFieldDisabled(data, currentUser, 'basicInfo.ecnChange.no')} />
                  <span>沒有</span>
                </label>
              </div>
              {data.basicInfo.ecnChange?.has && (
                <input type="text" className="form-input edit-active animate-fade-in" placeholder="請填寫驗證項目" name="basicInfo.ecnChange.verificationItem" value={data.basicInfo.ecnChange?.verificationItem || ''}
                  onChange={(e) => setField('basicInfo.ecnChange.verificationItem', e.target.value)}
                  disabled={isFieldDisabled(data, currentUser, 'basicInfo.ecnChange.verificationItem')}
                  style={{ marginTop: '10px' }} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="form-section-card glass-card" data-accent="emerald">
        <div className="card-header"><span className="card-icon-circle">{sectionSvg.shield}</span>品質與驗收標準</div>
        <div className="card-body">
          <div className="form-row-grid-2">
            <div className="form-group">
              <label className="form-label">品質水準要求</label>
              <div className="checkbox-flex">
                <label className="checkbox-label">
                  <input type="checkbox" checked={data.basicInfo.qualityLevel?.class2 || false}
                    onChange={(e) => setField('basicInfo.qualityLevel', { ...(data.basicInfo.qualityLevel || {}), class2: e.target.checked })}
                    disabled={isFieldDisabled(data, currentUser, 'basicInfo.qualityLevel.class2')} />
                  <span>Class 2</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={data.basicInfo.qualityLevel?.class3 || false}
                    onChange={(e) => setField('basicInfo.qualityLevel', { ...(data.basicInfo.qualityLevel || {}), class3: e.target.checked })}
                    disabled={isFieldDisabled(data, currentUser, 'basicInfo.qualityLevel.class3')} />
                  <span>Class 3</span>
                </label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">IPC 驗收標準</label>
              <div className="checkbox-flex">
                <label className="checkbox-label">
                  <input type="checkbox" checked={data.basicInfo.ipcStandard?.ipcA610 || false}
                    onChange={(e) => setField('basicInfo.ipcStandard', { ...(data.basicInfo.ipcStandard || {}), ipcA610: e.target.checked })}
                    disabled={isFieldDisabled(data, currentUser, 'basicInfo.ipcStandard.ipcA610')} />
                  <span>IPC-A-610</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={data.basicInfo.ipcStandard?.jStd001 || false}
                    onChange={(e) => setField('basicInfo.ipcStandard', { ...(data.basicInfo.ipcStandard || {}), jStd001: e.target.checked })}
                    disabled={isFieldDisabled(data, currentUser, 'basicInfo.ipcStandard.jStd001')} />
                  <span>J-STD-001</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section-card glass-card" data-accent="amber">
        <div className="card-header"><span className="card-icon-circle">{sectionSvg.gear}</span>加工製程與管制需求</div>
        <div className="card-body">
          <div className="form-row-grid-3">
            <div className="form-group">
              <label className="form-label">點膠工藝</label>
              <div className="checkbox-flex"><label className="checkbox-label">
                <input type="checkbox" checked={data.basicInfo.glue || false} onChange={(e) => setField('basicInfo.glue', e.target.checked)}
                  disabled={isFieldDisabled(data, currentUser, 'basicInfo.glue')} /><span>需要點膠</span></label></div>
            </div>
            <div className="form-group">
              <label className="form-label">QR Code 掃描需求</label>
              <div className="radio-group radio-group-compact">
                <label className="radio-label"><input type="radio" name="qrCodeScan" checked={data.basicInfo.qrCode?.need || false}
                  onChange={() => setField('basicInfo.qrCode', { need: true, noNeed: false })}
                  disabled={isFieldDisabled(data, currentUser, 'basicInfo.qrCode.need')} /><span>需要</span></label>
                <label className="radio-label"><input type="radio" name="qrCodeScan" checked={data.basicInfo.qrCode?.noNeed || false}
                  onChange={() => setField('basicInfo.qrCode', { need: false, noNeed: true })}
                  disabled={isFieldDisabled(data, currentUser, 'basicInfo.qrCode.noNeed')} /><span>不需要</span></label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">序號管控需求</label>
              <div className="radio-group radio-group-compact">
                <label className="radio-label"><input type="radio" name="snControlReq" checked={data.basicInfo.snControl?.need || false}
                  onChange={() => setField('basicInfo.snControl', { need: true, noNeed: false })}
                  disabled={isFieldDisabled(data, currentUser, 'basicInfo.snControl.need')} /><span>需要</span></label>
                <label className="radio-label"><input type="radio" name="snControlReq" checked={data.basicInfo.snControl?.noNeed || false}
                  onChange={() => setField('basicInfo.snControl', { need: false, noNeed: true })}
                  disabled={isFieldDisabled(data, currentUser, 'basicInfo.snControl.noNeed')} /><span>不需要</span></label>
              </div>
            </div>
            <div className={`form-group ${getFieldHighlightClass(highlightField, 'aoi')}`}>
              <label className="form-label">AOI 檢驗面</label>
              <div className="checkbox-flex">
                <label className="checkbox-label"><input type="checkbox" checked={data.basicInfo.aoi?.top || false}
                  onChange={(e) => setField('basicInfo.aoi', { ...(data.basicInfo.aoi || {}), top: e.target.checked })}
                  disabled={isFieldDisabled(data, currentUser, 'basicInfo.aoi.top')} /><span>Top (頂面)</span></label>
                <label className="checkbox-label"><input type="checkbox" checked={data.basicInfo.aoi?.bottom || false}
                  onChange={(e) => setField('basicInfo.aoi', { ...(data.basicInfo.aoi || {}), bottom: e.target.checked })}
                  disabled={isFieldDisabled(data, currentUser, 'basicInfo.aoi.bottom')} /><span>Bottom (底面)</span></label>
              </div>
            </div>
          </div>
          <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'processItems')}`}>
            <label className="form-label">主要加工項目 <span className="req">*</span></label>
            <div className="checkbox-flex" style={{ flexWrap: 'wrap', gap: '12px 18px', alignItems: 'center' }}>
              {[['smt', 'SMT'], ['dip', 'DIP'], ['ict', 'In-Circuit Test'], ['assembly', '組裝'], ['coating', '三防膠塗覆'], ['packing', '包裝'], ['fct', 'FCT 功能測試'], ['flyingProbe', '飛針測試'], ['underfillGlue', 'Underfill 塗膠'], ['semiFinishedTest', '半成品測試'], ['finalTest', '成品測試']].map(([key, label]) => (
                <label key={key} className="checkbox-label">
                  <input type="checkbox" checked={data.basicInfo.processItems?.[key] || false}
                    onChange={(e) => setField(`basicInfo.processItems.${key}`, e.target.checked)}
                    disabled={isFieldDisabled(data, currentUser, `basicInfo.processItems.${key}`)} />
                  <span>{label}</span>
                </label>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label className="checkbox-label" style={{ margin: 0 }}>
                  <input type="checkbox" checked={data.basicInfo.processItems?.otherProcess || false}
                    onChange={(e) => {
                      setField('basicInfo.processItems.otherProcess', e.target.checked);
                      if (!e.target.checked) setField('basicInfo.processItems.otherProcessText', '');
                    }}
                    disabled={isFieldDisabled(data, currentUser, 'basicInfo.processItems.otherProcess')} />
                  <span>其他:</span>
                </label>
                <input type="text" className="form-input edit-active compact" placeholder="請說明其他加工項目" name="basicInfo.processItems.otherProcessText"
                  value={data.basicInfo.processItems?.otherProcessText || ''}
                  onChange={(e) => setField('basicInfo.processItems.otherProcessText', e.target.value)}
                  disabled={!data.basicInfo.processItems?.otherProcess || isFieldDisabled(data, currentUser, 'basicInfo.processItems.otherProcessText')}
                  style={{ width: '160px', maxWidth: '100%', padding: '4px 8px', fontSize: '0.82rem' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section-card glass-card" data-accent="slate">
        <div className="card-header"><span className="card-icon-circle">{sectionSvg.wrench}</span>鋼板與治工具一覽表</div>
        <div className="card-body">
          {data.basicInfo.processItems?.smt && (
            <div className={`tooling-box ${getFieldHighlightClass(highlightField, 'stencil')}`}>
              <span className="tooling-badge">SMT 鋼板</span>
              <div className="form-row-grid-2 animate-fade-in" style={{ marginTop: '8px' }}>
                <div className={`form-group required-highlight ${getFieldHighlightClass(highlightField, 'stencil')}`}>
                  <label className="form-label">鋼板厚度 (mm) <span className="req">*</span></label>
                  <input type="text" className="form-input edit-active" placeholder="例如: 0.12" name="basicInfo.tooling.stencil.thickness" value={data.basicInfo.tooling?.stencil?.thickness || ''}
                    onChange={(e) => setField('basicInfo.tooling.stencil.thickness', e.target.value)}
                    disabled={isFieldDisabled(data, currentUser, 'basicInfo.tooling.stencil.thickness')} />
                </div>
                <div className="form-group required-highlight">
                  <label className="form-label">鋼板樣式選擇 <span className="req">*</span></label>
                  <div className="checkbox-flex" style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <label className="radio-label" style={{ padding: 0 }}>
                        <input type="radio" name="stencilStyle" checked={(data.basicInfo.tooling?.stencil?.style || 'general') === 'general'}
                          onChange={() => setField('basicInfo.tooling.stencil.style', 'general')}
                          disabled={isFieldDisabled(data, currentUser, 'basicInfo.tooling.stencil.style')} />
                        <span>一般鋼板</span>
                      </label>
                      <label className="radio-label" style={{ padding: 0 }}>
                        <input type="radio" name="stencilStyle" checked={data.basicInfo.tooling?.stencil?.style === 'step'}
                          onChange={() => setField('basicInfo.tooling.stencil.style', 'step')}
                          disabled={isFieldDisabled(data, currentUser, 'basicInfo.tooling.stencil.style')} />
                        <span>階梯鋼板</span>
                      </label>
                    </div>
                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '6px', marginTop: '2px' }}>
                      <label className="checkbox-label" style={{ padding: 0, margin: 0 }}>
                        <input type="checkbox" checked={data.basicInfo.tooling?.stencil?.nanoCoating || false}
                          onChange={(e) => setField('basicInfo.tooling.stencil.nanoCoating', e.target.checked)}
                          disabled={isFieldDisabled(data, currentUser, 'basicInfo.tooling.stencil.nanoCoating')} />
                        <span style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: '600' }}>表面奈米塗層 (可複選)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="tooling-grid">
            {['routingFixture', 'glueFixture', 'testFixture', 'assemblyFixture'].map((key) => {
              const labelMap = { routingFixture: 'Routing 治具', glueFixture: '塗膠治具', testFixture: '測試治具', assemblyFixture: '組裝治具' };
              const item = data.basicInfo.tooling?.[key] || {};
              return (
                <div key={key} className={`tooling-row-align required-highlight ${getFieldHighlightClass(highlightField, key)} m-0`}>
                  <span className="tool-name tool-name-sm">{labelMap[key]}</span>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input type="radio" name={key} checked={item.need || false}
                        onChange={() => { setField(`basicInfo.tooling.${key}.need`, true); setField(`basicInfo.tooling.${key}.noNeed`, false); }}
                        disabled={isFieldDisabled(data, currentUser, `basicInfo.tooling.${key}.need`)} />
                      <span>Offset / 需要</span>
                    </label>
                    <label className="radio-label">
                      <input type="radio" name={key} checked={item.noNeed || false}
                        onChange={() => { setField(`basicInfo.tooling.${key}.need`, false); setField(`basicInfo.tooling.${key}.noNeed`, true); setField(`basicInfo.tooling.${key}.qty`, ''); }}
                        disabled={isFieldDisabled(data, currentUser, `basicInfo.tooling.${key}.noNeed`)} />
                      <span>不需要</span>
                    </label>
                  </div>
                  {item.need && (
                    <div className="fixture-qty-input animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '140px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#6b7280', whiteSpace: 'nowrap' }}>數量:</span>
                      <input type="text" className="form-input edit-active compact" placeholder="例: 2 SETs" name={`basicInfo.tooling.${key}.qty`} value={item.qty || ''}
                        onChange={(e) => setField(`basicInfo.tooling.${key}.qty`, e.target.value)}
                        disabled={isFieldDisabled(data, currentUser, `basicInfo.tooling.${key}.qty`)} style={{ padding: '4px 6px', fontSize: '0.8rem' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="tooling-grid">
            <div className={`tooling-row-align required-highlight ${getFieldHighlightClass(highlightField, 'smtCarrier')} m-0`}>
              <span className="tool-name tool-name-sm">SMT刷錫載具</span>
              <div className="radio-group">
                <label className="radio-label"><input type="radio" name="smtCarrierNeed" checked={data.basicInfo.tooling?.smtCarrier?.need || false}
                  onChange={() => { setField('basicInfo.tooling.smtCarrier.need', true); setField('basicInfo.tooling.smtCarrier.noNeed', false); }}
                  disabled={isFieldDisabled(data, currentUser, 'basicInfo.tooling.smtCarrier.need')} /><span>需要</span></label>
                <label className="radio-label"><input type="radio" name="smtCarrierNeed" checked={data.basicInfo.tooling?.smtCarrier?.noNeed || false}
                  onChange={() => { setField('basicInfo.tooling.smtCarrier.need', false); setField('basicInfo.tooling.smtCarrier.noNeed', true); setField('basicInfo.tooling.smtCarrier.upper', false); setField('basicInfo.tooling.smtCarrier.lower', false); }}
                  disabled={isFieldDisabled(data, currentUser, 'basicInfo.tooling.smtCarrier.noNeed')} /><span>不需要</span></label>
              </div>
              {data.basicInfo.tooling?.smtCarrier?.need && (
                <div className="fixture-qty-input animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '160px' }}>
                  <label className="checkbox-label" style={{ margin: 0, padding: 0 }}>
                    <input type="checkbox" checked={data.basicInfo.tooling?.smtCarrier?.upper || false}
                      onChange={(e) => setField('basicInfo.tooling.smtCarrier.upper', e.target.checked)}
                      disabled={isFieldDisabled(data, currentUser, 'basicInfo.tooling.smtCarrier.upper')} />
                    <span style={{ fontSize: '0.8rem' }}>上載板</span>
                  </label>
                  <label className="checkbox-label" style={{ margin: 0, padding: 0 }}>
                    <input type="checkbox" checked={data.basicInfo.tooling?.smtCarrier?.lower || false}
                      onChange={(e) => setField('basicInfo.tooling.smtCarrier.lower', e.target.checked)}
                      disabled={isFieldDisabled(data, currentUser, 'basicInfo.tooling.smtCarrier.lower')} />
                    <span style={{ fontSize: '0.8rem' }}>下載板</span>
                  </label>
                </div>
              )}
            </div>
            <div className={`tooling-row-align required-highlight ${getFieldHighlightClass(highlightField, 'otherFixture')} m-0`}>
              <span className="tool-name tool-name-sm">其他治具</span>
              <div className="radio-group">
                <label className="radio-label"><input type="radio" name="otherFixtureNeed" checked={data.basicInfo.tooling?.otherFixture?.need || false}
                  onChange={() => { setField('basicInfo.tooling.otherFixture.need', true); setField('basicInfo.tooling.otherFixture.noNeed', false); }}
                  disabled={isFieldDisabled(data, currentUser, 'basicInfo.tooling.otherFixture.need')} /><span>需要</span></label>
                <label className="radio-label"><input type="radio" name="otherFixtureNeed" checked={data.basicInfo.tooling?.otherFixture?.noNeed || false}
                  onChange={() => { setField('basicInfo.tooling.otherFixture.need', false); setField('basicInfo.tooling.otherFixture.noNeed', true); setField('basicInfo.tooling.otherFixture.name', ''); setField('basicInfo.tooling.otherFixture.qty', ''); }}
                  disabled={isFieldDisabled(data, currentUser, 'basicInfo.tooling.otherFixture.noNeed')} /><span>不需要</span></label>
              </div>
              {data.basicInfo.tooling?.otherFixture?.need && (
                <div className="fixture-qty-input animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, maxWidth: '200px' }}>
                  <input type="text" className="form-input edit-active compact" placeholder="治具名稱" name="basicInfo.tooling.otherFixture.name" value={data.basicInfo.tooling?.otherFixture?.name || ''}
                    onChange={(e) => setField('basicInfo.tooling.otherFixture.name', e.target.value)}
                    disabled={isFieldDisabled(data, currentUser, 'basicInfo.tooling.otherFixture.name')} style={{ flex: 2, padding: '4px 6px', fontSize: '0.8rem' }} />
                  <input type="text" className="form-input edit-active compact" placeholder="數量" name="basicInfo.tooling.otherFixture.qty" value={data.basicInfo.tooling?.otherFixture?.qty || ''}
                    onChange={(e) => setField('basicInfo.tooling.otherFixture.qty', e.target.value)}
                    disabled={isFieldDisabled(data, currentUser, 'basicInfo.tooling.otherFixture.qty')} style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="action-row">
        <button type="button" className="btn btn-primary" onClick={onNext}>下一步：製程管制與前置作業</button>
      </div>
    </div>
  );
}




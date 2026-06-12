import React from 'react';
import './PrintReport.css';

function cleanXrayPart(part) {
  const value = String(part || '').trim();
  return /_{2,}/.test(value) ? '' : value;
}

export default function PrintReport({ data }) {
  if (!data) return null;

  const bi = data.basicInfo || {};
  const pc = data.processControl || {};
  const tr = data.trialReport || {};
  const tooling = bi.tooling || {};
  const sign = bi.signOff || {};

  // 輔助函數：精緻化 Checkbox 狀態元件
  const renderCheck = (checked, label = "") => (
    <span className={`print-checkbox-item ${checked ? 'is-checked' : 'is-unchecked'}`}>
      <span className="checkbox-square">{checked ? '✓' : ''}</span>
      {label && <span className="checkbox-label">{label}</span>}
    </span>
  );

  return (
    <div className="print-report-container">
      {/* 標題與基本資料 */}
      <div className="print-header">
        <h1 className="print-title">新機種委外加工對齊需求一覽表</h1>
        <p className="print-subtitle">雙向資訊同步與製程防呆管制報告 (對齊簽核版)</p>
      </div>

      <table className="print-table">
        <tbody>
          <tr>
            <td className="cell-label" style={{ width: '15%' }}>委外加工廠</td>
            <td className="cell-value" style={{ width: '35%' }}>{bi.factory || '(未填寫)'}</td>
            <td className="cell-label" style={{ width: '15%' }}>產品料號</td>
            <td className="cell-value" style={{ width: '35%' }}>{bi.productNo || '(未填寫)'}</td>
          </tr>

          <tr>
            <td className="cell-label">產品名稱/描述</td>
            <td className="cell-value">{bi.productDesc || '(未填寫)'}</td>
            <td className="cell-label">產品階段</td>
            <td className="cell-value">
              {renderCheck(bi.stage?.evt, 'EVT')}
              {renderCheck(bi.stage?.dvt, 'DVT')}
              {renderCheck(bi.stage?.pvt, 'PVT')}
              {renderCheck(bi.stage?.politRun, 'Pilot-run')}
              {renderCheck(bi.stage?.ecn, 'ECN')}
            </td>
          </tr>
        </tbody>
      </table>

      {/* A. 鋼板與治工具一覽表 */}
      <h2 className="print-section-title">A. 鋼板與治工具需求一覽表</h2>
      <table className="print-table">
        <thead>
          <tr>
            <th style={{ width: '30%' }}>治工具名稱</th>
            <th style={{ width: '40%' }}>規格描述 / 加工廠確認</th>
            <th style={{ width: '30%' }}>提供數量</th>
          </tr>
        </thead>
        <tbody>
          {/* SMT 鋼板 */}
          {bi.processItems?.smt && (
            <tr>
              <td className="cell-bold">SMT 鋼板</td>
              <td>
                <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                  {renderCheck(true, '鋼板規格 (100% 需要)')}
                </div>
                <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#475569' }}>
                  厚度: <strong style={{ color: '#0f172a' }}>{tooling.stencil?.thickness || '—'}</strong> mm | 
                  開口比例: <strong style={{ color: '#0f172a' }}>{tooling.stencil?.apertureRatio || '—'}</strong> % | 
                  樣式: <strong style={{ color: '#0f172a' }}>{(tooling.stencil?.style === 'step' ? '階梯鋼板' : '一般鋼板')}</strong>
                  {tooling.stencil?.nanoCoating && <span className="nano-coating-badge">(表面奈米塗層)</span>}
                </div>
              </td>
              <td>—</td>
            </tr>
          )}
          {/* Routing 治具 */}
          <tr>
            <td className="cell-bold">Routing 治具</td>
            <td>
              {renderCheck(tooling.routingFixture?.need, '需要')}
              <span style={{ marginLeft: '16px' }}>{renderCheck(tooling.routingFixture?.noNeed, '不需要')}</span>
            </td>
            <td>{tooling.routingFixture?.need ? (tooling.routingFixture?.qty || '—') : '—'}</td>
          </tr>
          {/* 塗膠治具 */}
          <tr>
            <td className="cell-bold">塗膠治具</td>
            <td>
              {renderCheck(tooling.glueFixture?.need, '需要')}
              <span style={{ marginLeft: '16px' }}>{renderCheck(tooling.glueFixture?.noNeed, '不需要')}</span>
            </td>
            <td>{tooling.glueFixture?.need ? (tooling.glueFixture?.qty || '—') : '—'}</td>
          </tr>
          {/* 測試治具 */}
          <tr>
            <td className="cell-bold">測試治具</td>
            <td>
              {renderCheck(tooling.testFixture?.need, '需要')}
              <span style={{ marginLeft: '16px' }}>{renderCheck(tooling.testFixture?.noNeed, '不需要')}</span>
            </td>
            <td>{tooling.testFixture?.need ? (tooling.testFixture?.qty || '—') : '—'}</td>
          </tr>
          {/* 組裝治具 */}
          <tr>
            <td className="cell-bold">組裝治具</td>
            <td>
              {renderCheck(tooling.assemblyFixture?.need, '需要')}
              <span style={{ marginLeft: '16px' }}>{renderCheck(tooling.assemblyFixture?.noNeed, '不需要')}</span>
            </td>
            <td>{tooling.assemblyFixture?.need ? (tooling.assemblyFixture?.qty || '—') : '—'}</td>
          </tr>
          {/* SMT刷錫載具 */}
          <tr>
            <td className="cell-bold">SMT刷錫載具</td>
            <td>
              {renderCheck(tooling.smtCarrier?.need, '需要')}
              <span style={{ marginLeft: '16px' }}>{renderCheck(tooling.smtCarrier?.noNeed, '不需要')}</span>
              {tooling.smtCarrier?.need && (
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#475569' }}>選項:</span>
                  {renderCheck(tooling.smtCarrier?.upper, '上載板')}
                  {renderCheck(tooling.smtCarrier?.lower, '下載板')}
                </div>
              )}
            </td>
            <td>—</td>
          </tr>
          {/* 其他治具 */}
          <tr>
            <td className="cell-bold">其他治具</td>
            <td>
              {renderCheck(tooling.otherFixture?.need, '需要')}
              <span style={{ marginLeft: '16px' }}>{renderCheck(tooling.otherFixture?.noNeed, '不需要')}</span>
              {tooling.otherFixture?.need && (
                <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#475569' }}>
                  名稱: <strong style={{ color: '#0f172a' }}>{tooling.otherFixture?.name || '—'}</strong>
                </div>
              )}
            </td>
            <td>{tooling.otherFixture?.need ? (tooling.otherFixture?.qty || '—') : '—'}</td>
          </tr>
        </tbody>
      </table>

      {/* B. 製程管制與前置作業 */}
      <h2 className="print-section-title">B. 製程管制與前置作業</h2>
      <table className="print-table">
        <colgroup>
          <col style={{ width: '20%' }} />
          <col style={{ width: '45%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <tbody>
          <tr>
            <td className="cell-label">樣品提供確認</td>
            <td className="cell-value" colSpan={3}>
              {renderCheck(pc.sampleProvided?.trialBoard, '試錫板')}
              {renderCheck(pc.sampleProvided?.tempBoard, '測溫板')}
              {renderCheck(pc.sampleProvided?.standardPart, '標準件')}
            </td>
          </tr>
          <tr>
            <td className="cell-label">PCB / FPCA 烘烤需求</td>
            <td className="cell-value" colSpan={3}>
              {renderCheck(pc.bakeRequired?.need, '需要烘烤')}
              <span style={{ marginLeft: '20px' }}>{renderCheck(pc.bakeRequired?.noNeed, '不需要')}</span>
              {pc.bakeRequired?.need && (
                <div style={{ marginTop: '6px', fontSize: '0.9rem', color: '#111', fontWeight: 550 }}>
                  PCB 烘烤條件: {pc.bakeRequired?.pcbBakeCond || '—'} <br />
                  FPCA 烘烤條件: {pc.bakeRequired?.fpcaBakeCond || '—'}
                </div>
              )}
            </td>
          </tr>
          <tr>
            <td className="cell-label">SMT 首件檢查項目</td>
            <td className="cell-value">
              <div className="print-checkbox-grid">
                {renderCheck(pc.smtFirstPiece?.polarity, '極性方向檢查')}
                {renderCheck(pc.smtFirstPiece?.measureLcr, '量測 LCR (電容/電阻/電感)')}
                {renderCheck(pc.smtFirstPiece?.spi, 'SPI 錫膏厚度測試')}
                {renderCheck(pc.smtFirstPiece?.steelTension, '鋼板張力量測')}
                {renderCheck(pc.smtFirstPiece?.ledTest === 'yes', 'LED點亮測試: 有')}
                {renderCheck(pc.smtFirstPiece?.ledTest === 'no', '無 (不適用)')}
                {renderCheck(pc.smtFirstPiece?.pcbReflow, 'PCB外觀檢查 (reflow)')}
                {renderCheck(pc.smtFirstPiece?.solderability, '濕潤性檢查 (試錫板)')}
              </div>
            </td>
            <td className="cell-label">SMT 焊接順序</td>
            <td className="cell-value">
              <div className="print-checkbox-vertical">
                {renderCheck(pc.smtOrder?.bToT, '先焊底面 (B→T)')}
                {renderCheck(pc.smtOrder?.tToB, '先焊頂面 (T→B)')}
              </div>
            </td>
          </tr>
          {bi.processItems?.dip && (
            <>
              <tr>
                <td className="cell-label">DIP 首件檢查項目</td>
                <td className="cell-value">
                  {renderCheck(pc.dipFirstPiece?.cutLead, '剪腳前置作業')}
                </td>
                <td className="cell-label">DIP 焊接順序</td>
                <td className="cell-value">
                  <div className="print-checkbox-vertical">
                    {renderCheck(pc.dipOrder?.bToT, '先焊底面 (B→T)')}
                    {renderCheck(pc.dipOrder?.tToB, '先焊頂面 (T→B)')}
                  </div>
                </td>
              </tr>
              {pc.dipFirstPiece?.memo && (
                <tr>
                  <td className="cell-label">DIP 注意事項</td>
                  <td className="cell-value" colSpan={3}>
                    {pc.dipFirstPiece.memo}
                  </td>
                </tr>
              )}
            </>
          )}
          {/* Underfill 與膠材 */}
          <tr>
            <td className="cell-label">Underfill 後烘烤</td>
            <td className="cell-value">
              {(pc.underfill?.bakeTemp && pc.underfill?.bakeTime) 
                ? `${pc.underfill?.bakeTemp} °C x ${pc.underfill?.bakeTime} min` 
                : '—'}
            </td>
            <td className="cell-label">膠材型號</td>
            <td className="cell-value">
              {pc.underfill?.glueModel || '—'}
            </td>
          </tr>
          {/* PCBA/FPCA 包材 */}
          <tr>
            <td className="cell-label">PCBA 包材種類</td>
            <td className="cell-value" colSpan={3}>
              <div className="print-checkbox-grid">
                {renderCheck(pc.pcbaPackaging?.staticBag, '靜電袋')}
                {renderCheck(pc.pcbaPackaging?.honeycomb, '蜂巢式抗靜電隔板')}
                {renderCheck(pc.pcbaPackaging?.tray, 'Tray 抗靜電脆盤')}
                {renderCheck(pc.pcbaPackaging?.sensorCover, 'Sensor 保護貼')}
                {renderCheck(pc.pcbaPackaging?.cameraCover, 'Camera 保護貼')}
              </div>
            </td>
          </tr>
          <tr>
            <td className="cell-label">FPCA 包材種類</td>
            <td className="cell-value" colSpan={3}>
              <div className="print-checkbox-grid">
                {renderCheck(pc.fpcaPackaging?.staticBag, '靜電袋')}
                {renderCheck(pc.fpcaPackaging?.honeycomb, '蜂巢式抗靜電隔板')}
                {renderCheck(pc.fpcaPackaging?.tray, 'Tray 抗靜電脆盤')}
                {renderCheck(pc.fpcaPackaging?.sensorCover, 'Sensor 保護貼')}
                {renderCheck(pc.fpcaPackaging?.cameraCover, 'Camera 保護貼')}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 測溫點配置 */}
      {pc.keyParts?.has && (
        <div style={{ marginTop: '12px' }}>
          <h3 className="print-sub-section-title">🌡️ 測溫點配置 (關鍵零件要求)</h3>
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>#</th>
                <th style={{ width: '40%' }}>位置 / 位號</th>
              </tr>
            </thead>
            <tbody>
              {pc.tempPoints?.map((pt, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{pt.pos || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 特殊製程備註 */}
      {pc.specialProcessMemo && (
        <div style={{ marginTop: '12px' }}>
          <h3 className="print-sub-section-title">特殊製程備註</h3>
          <div className="print-memo-box">
            {pc.specialProcessMemo}
          </div>
        </div>
      )}

      <div className="page-break"></div>

      {/* C. 試產報告與對齊確認 */}
      <h2 className="print-section-title">C. 試產報告與對齊確認</h2>
      <table className="print-table">
        <thead>
          <tr>
            <th style={{ width: '70%' }}>交付項目 / 檢驗紀錄 / 照片清單</th>
            <th style={{ width: '30%' }}>對齊狀態</th>
          </tr>
        </thead>
        <tbody>
          {/* A. 印刷品質 */}
          <tr>
            <td className="cell-bold" colSpan={2} style={{ background: '#f9fafb' }}>🖨️ A. 印刷品質 / 迴焊紀錄</td>
          </tr>
          {tr.printRecords?.map((rec) => (
            <tr key={rec.id}>
              <td style={{ paddingLeft: '20px' }}>{rec.name}</td>
              <td className="text-center">
                {rec.checked ? (
                  <span className="badge badge-success">已對齊 ✓</span>
                ) : (
                  <span className="badge badge-danger">未完成 —</span>
                )}
              </td>
            </tr>
          ))}
          {/* B. 檢驗紀錄 */}
          <tr>
            <td className="cell-bold" colSpan={2} style={{ background: '#f9fafb' }}>🔍 B. 檢驗紀錄</td>
          </tr>
          {tr.inspectRecords?.map((rec) => (
            <tr key={rec.id}>
              <td style={{ paddingLeft: '20px' }}>{rec.name}</td>
              <td className="text-center">
                {rec.checked ? (
                  <span className="badge badge-success">已對齊 ✓</span>
                ) : (
                  <span className="badge badge-danger">未完成 —</span>
                )}
              </td>
            </tr>
          ))}
          {/* D. 照片提供 */}
          <tr>
            <td className="cell-bold" colSpan={2} style={{ background: '#f9fafb' }}>📸 D. 照片提供</td>
          </tr>
          {tr.photoRecords?.map((rec) => {
            let displayName = rec.name;
          if (rec.isXray && rec.parts) {
            const partsStr = rec.parts.map(cleanXrayPart).filter(Boolean).join(', ');
            const hasKeyword = String(rec.name).includes('指定零件');
            const baseName = hasKeyword
              ? String(rec.name).split(/指定零件/)[0] + '指定零件:'
              : String(rec.name) + '指定零件:';
            displayName = partsStr ? `${baseName} ${partsStr}` : baseName;
          }
            return (
              <tr key={rec.id}>
                <td style={{ paddingLeft: '20px' }}>{displayName}</td>
                <td className="text-center">
                  {rec.checked ? (
                    <span className="badge badge-success">已對齊 ✓</span>
                  ) : (
                    <span className="badge badge-danger">未完成 —</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* D. 雙向線上簽核區 */}
      <h2 className="print-section-title" style={{ marginTop: '24px' }}>D. 雙向線上簽核記錄</h2>
      <div className="print-sign-grid">
        <div className={`print-sign-box role-rd ${sign.rdSignature ? 'is-signed' : 'is-unsigned'}`}>
          <div className="print-sign-header">研發確認簽核 (RD)</div>
          <div className="print-sign-body" style={{ display: 'flex', flexDirection: 'column', minHeight: '110px' }}>
            <div className="print-sign-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              {sign.rdSignature ? (
                <img src={sign.rdSignature} alt="RD Signature" style={{ height: '36px', objectFit: 'contain' }} />
              ) : (
                <span className="sign-text text-danger">⚠️ 待研發確認簽章</span>
              )}
            </div>
            <div className="print-sign-terms">確認產品基本資料與風險零件已填寫完整，並經研發部門核准。</div>
          </div>
        </div>

        <div className={`print-sign-box role-pe ${sign.engineeringReviewSignature ? 'is-signed' : 'is-unsigned'}`}>
          <div className="print-sign-header">工程審核簽核 (PE)</div>
          <div className="print-sign-body" style={{ display: 'flex', flexDirection: 'column', minHeight: '110px' }}>
            <div className="print-sign-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              {sign.engineeringReviewSignature ? (
                <img src={sign.engineeringReviewSignature} alt="PE Signature" style={{ height: '36px', objectFit: 'contain' }} />
              ) : (
                <span className="sign-text text-danger">⚠️ 待工程審核簽章</span>
              )}
            </div>
            <div className="print-sign-terms">確認生產治工具規格、鋼板開口以及製程工程參數已審查通過。</div>
          </div>
        </div>

        <div className={`print-sign-box role-qa ${sign.qaSignature ? 'is-signed' : 'is-unsigned'}`}>
          <div className="print-sign-header">品保處最後審核 (QA)</div>
          <div className="print-sign-body" style={{ display: 'flex', flexDirection: 'column', minHeight: '110px' }}>
            <div className="print-sign-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              {sign.qaSignature ? (
                <img src={sign.qaSignature} alt="QA Signature" style={{ height: '36px', objectFit: 'contain' }} />
              ) : (
                <span className="sign-text text-danger">⚠️ 待品保處審核簽章</span>
              )}
            </div>
            <div className="print-sign-terms">確認兩端資訊與防呆管制點皆已完成填寫與覆核，符合試產要求。</div>
          </div>
        </div>
      </div>

      <div className="print-footer">
        <p>報告生成時間: {new Date().toLocaleString()} | 醫電鼎眾股份有限公司</p>
        <p>此文件為委外加工雙向對齊之線上簽核正本，符合廠務管理規範。</p>
      </div>
    </div>
  );
}



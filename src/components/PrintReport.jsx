import React from 'react';
import './PrintReport.css';

export default function PrintReport({ data }) {
  if (!data) return null;

  const bi = data.basicInfo || {};
  const pc = data.processControl || {};
  const tr = data.trialReport || {};
  const tooling = bi.tooling || {};
  const sign = bi.signOff || {};

  // 輔助函數：Checkbox 狀態符號
  const renderCheck = (checked) => (checked ? '☑' : '☐');

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
              <span className="print-checkbox">{renderCheck(bi.stage?.evt)} EVT</span>
              <span className="print-checkbox">{renderCheck(bi.stage?.dvt)} DVT</span>
              <span className="print-checkbox">{renderCheck(bi.stage?.pvt)} PVT</span>
              <span className="print-checkbox">{renderCheck(bi.stage?.politRun)} Polit-run</span>
              <span className="print-checkbox">{renderCheck(bi.stage?.ecn)} ECN</span>
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
                {renderCheck(tooling.stencil?.need)} 需要
                <span style={{ marginLeft: '16px' }}>{renderCheck(tooling.stencil?.noNeed)} 不需要</span>
                {tooling.stencil?.need && (
                  <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                    厚度: {tooling.stencil?.thickness || '—'} mm | 
                    開口比例: {tooling.stencil?.apertureRatio || '—'} % | 
                    類型: {tooling.stencil?.stencilType || '—'}
                  </div>
                )}
              </td>
              <td>—</td>
            </tr>
          )}
          {/* Routing 治具 */}
          <tr>
            <td className="cell-bold">Routing 治具</td>
            <td>
              {renderCheck(tooling.routingFixture?.need)} 需要
              <span style={{ marginLeft: '16px' }}>{renderCheck(tooling.routingFixture?.noNeed)} 不需要</span>
            </td>
            <td>{tooling.routingFixture?.need ? (tooling.routingFixture?.qty || '—') : '—'}</td>
          </tr>
          {/* 塗膠治具 */}
          <tr>
            <td className="cell-bold">塗膠治具</td>
            <td>
              {renderCheck(tooling.glueFixture?.need)} 需要
              <span style={{ marginLeft: '16px' }}>{renderCheck(tooling.glueFixture?.noNeed)} 不需要</span>
            </td>
            <td>{tooling.glueFixture?.need ? (tooling.glueFixture?.qty || '—') : '—'}</td>
          </tr>
          {/* 測試治具 */}
          <tr>
            <td className="cell-bold">測試治具</td>
            <td>
              {renderCheck(tooling.testFixture?.need)} 需要
              <span style={{ marginLeft: '16px' }}>{renderCheck(tooling.testFixture?.noNeed)} 不需要</span>
            </td>
            <td>{tooling.testFixture?.need ? (tooling.testFixture?.qty || '—') : '—'}</td>
          </tr>
          {/* 組裝治具 */}
          <tr>
            <td className="cell-bold">組裝治具</td>
            <td>
              {renderCheck(tooling.assemblyFixture?.need)} 需要
              <span style={{ marginLeft: '16px' }}>{renderCheck(tooling.assemblyFixture?.noNeed)} 不需要</span>
            </td>
            <td>{tooling.assemblyFixture?.need ? (tooling.assemblyFixture?.qty || '—') : '—'}</td>
          </tr>
          {/* SMT刷錫載具 */}
          <tr>
            <td className="cell-bold">SMT刷錫載具</td>
            <td>
              {renderCheck(tooling.smtCarrier?.need)} 需要
              <span style={{ marginLeft: '16px' }}>{renderCheck(tooling.smtCarrier?.noNeed)} 不需要</span>
              {tooling.smtCarrier?.need && (
                <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                  選項: {renderCheck(tooling.smtCarrier?.upper)} 上載板 | {renderCheck(tooling.smtCarrier?.lower)} 下載板
                </div>
              )}
            </td>
            <td>—</td>
          </tr>
          {/* 其他治具 */}
          <tr>
            <td className="cell-bold">其他治具</td>
            <td>
              {renderCheck(tooling.otherFixture?.need)} 需要
              <span style={{ marginLeft: '16px' }}>{renderCheck(tooling.otherFixture?.noNeed)} 不需要</span>
              {tooling.otherFixture?.need && (
                <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                  名稱: {tooling.otherFixture?.name || '—'}
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
        <tbody>
          <tr>
            <td className="cell-label" style={{ width: '25%' }}>樣品提供確認</td>
            <td className="cell-value" style={{ width: '75%' }} colSpan={3}>
              <span className="print-checkbox">{renderCheck(pc.sampleProvided?.trialBoard)} 試錫板</span>
              <span className="print-checkbox">{renderCheck(pc.sampleProvided?.tempBoard)} 測溫板</span>
              <span className="print-checkbox">{renderCheck(pc.sampleProvided?.standardPart)} 標準件</span>
            </td>
          </tr>
          <tr>
            <td className="cell-label">PCB / FPC 烘烤需求</td>
            <td className="cell-value" colSpan={3}>
              {renderCheck(pc.bakeRequired?.need)} 需要烘烤
              <span style={{ marginLeft: '20px' }}>{renderCheck(pc.bakeRequired?.noNeed)} 不需要</span>
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
            <td className="cell-value" style={{ width: '45%' }}>
              <span className="print-checkbox">{renderCheck(pc.smtFirstPiece?.polarity)} 極性方向檢查</span> <br />
              <span className="print-checkbox">{renderCheck(pc.smtFirstPiece?.measureLcr)} 量測 LCR (電容/電阻/電感)</span> <br />
              <span className="print-checkbox">{renderCheck(pc.smtFirstPiece?.spi)} SPI 錫膏厚度測試</span> <br />
              <span className="print-checkbox">{renderCheck(pc.smtFirstPiece?.steelTension)} 鋼板張力量測</span> <br />
              <span className="print-checkbox">{renderCheck(pc.smtFirstPiece?.ledTest === 'yes')} LED點亮測試: 有</span> 
              <span className="print-checkbox" style={{ marginLeft: '10px' }}>{renderCheck(pc.smtFirstPiece?.ledTest === 'no')} 無 (不適用)</span> <br />
              <span className="print-checkbox">{renderCheck(pc.smtFirstPiece?.pcbReflow)} PCB外觀檢查(reflow)</span> <br />
              <span className="print-checkbox">{renderCheck(pc.smtFirstPiece?.solderability)} 濕潤性檢查 (試錫板)</span>
            </td>
            <td className="cell-label" style={{ width: '15%' }}>SMT 焊接順序</td>
            <td className="cell-value" style={{ width: '25%' }}>
              {renderCheck(pc.smtOrder?.bToT)} 先焊底面 (B→T) <br />
              {renderCheck(pc.smtOrder?.tToB)} 先焊頂面 (T→B)
            </td>
          </tr>
          {bi.processItems?.dip && (
            <>
              <tr>
                <td className="cell-label">DIP 首件檢查項目</td>
                <td className="cell-value">
                  <span className="print-checkbox">{renderCheck(pc.dipFirstPiece?.cutLead)} 剪腳前置作業</span>
                </td>
                <td className="cell-label">DIP 焊接順序</td>
                <td className="cell-value">
                  {renderCheck(pc.dipOrder?.bToT)} 先焊底面 (B→T) <br />
                  {renderCheck(pc.dipOrder?.tToB)} 先焊頂面 (T→B)
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
              <span className="print-checkbox">{renderCheck(pc.pcbaPackaging?.staticBag)} 靜電袋</span>
              <span className="print-checkbox">{renderCheck(pc.pcbaPackaging?.honeycomb)} 蜂巢式抗靜電隔板</span>
              <span className="print-checkbox">{renderCheck(pc.pcbaPackaging?.tray)} Tray 抗靜電脆盤</span>
              <span className="print-checkbox">{renderCheck(pc.pcbaPackaging?.sensorCover)} Sensor 保護貼</span>
              <span className="print-checkbox">{renderCheck(pc.pcbaPackaging?.cameraCover)} Camera 保護貼</span>
            </td>
          </tr>
          <tr>
            <td className="cell-label">FPCA 包材種類</td>
            <td className="cell-value" colSpan={3}>
              <span className="print-checkbox">{renderCheck(pc.fpcaPackaging?.staticBag)} 靜電袋</span>
              <span className="print-checkbox">{renderCheck(pc.fpcaPackaging?.honeycomb)} 蜂巢式抗靜電隔板</span>
              <span className="print-checkbox">{renderCheck(pc.fpcaPackaging?.tray)} Tray 抗靜電脆盤</span>
              <span className="print-checkbox">{renderCheck(pc.fpcaPackaging?.sensorCover)} Sensor 保護貼</span>
              <span className="print-checkbox">{renderCheck(pc.fpcaPackaging?.cameraCover)} Camera 保護貼</span>
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
                <th style={{ width: '30%' }}>位置 / 位號</th>
                <th style={{ width: '40%' }}>零件描述</th>
                <th style={{ width: '20%' }}>備註</th>
              </tr>
            </thead>
            <tbody>
              {pc.tempPoints?.map((pt, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{pt.pos || '—'}</td>
                  <td>{pt.desc || '—'}</td>
                  <td>{pt.memo || '—'}</td>
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
              <td className="text-center">{rec.checked ? '已對齊 ✓' : '未完成 —'}</td>
            </tr>
          ))}
          {/* B. 檢驗紀錄 */}
          <tr>
            <td className="cell-bold" colSpan={2} style={{ background: '#f9fafb' }}>🔍 B. 檢驗紀錄</td>
          </tr>
          {tr.inspectRecords?.map((rec) => (
            <tr key={rec.id}>
              <td style={{ paddingLeft: '20px' }}>{rec.name}</td>
              <td className="text-center">{rec.checked ? '已對齊 ✓' : '未完成 —'}</td>
            </tr>
          ))}
          {/* D. 照片提供 */}
          <tr>
            <td className="cell-bold" colSpan={2} style={{ background: '#f9fafb' }}>📸 D. 照片提供</td>
          </tr>
          {tr.photoRecords?.map((rec) => {
            let displayName = rec.name;
            if (rec.isXray && rec.parts) {
              const partsStr = rec.parts.filter(Boolean).join(', ');
              const baseName = String(rec.name).split(/指定零件/)[0] + '指定零件:';
              displayName = partsStr ? `${baseName} ${partsStr}` : baseName;
            }
            return (
              <tr key={rec.id}>
                <td style={{ paddingLeft: '20px' }}>{displayName}</td>
                <td className="text-center">{rec.checked ? '已對齊 ✓' : '未完成 —'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* D. 雙向線上簽核區 */}
      <h2 className="print-section-title" style={{ marginTop: '24px' }}>D. 雙向線上簽核記錄</h2>
      <div className="print-sign-grid">
        <div className="print-sign-box">
          <div className="print-sign-header">研發確認簽核 (RD)</div>
          <div className="print-sign-body">
            <div className="print-sign-name">姓名: <span className="sign-text">{sign.rdConfirm || '(未簽章)'}</span></div>
            <div className="print-sign-terms">確認產品基本資料與風險零件已填寫完整，並經研發部門核准。</div>
          </div>
        </div>

        <div className="print-sign-box">
          <div className="print-sign-header">工程審核簽核 (PE)</div>
          <div className="print-sign-body">
            <div className="print-sign-name">姓名: <span className="sign-text">{sign.engineeringReview || '(未簽章)'}</span></div>
            <div className="print-sign-terms">確認生產治工具規格、鋼板開口以及製程工程參數已審查通過。</div>
          </div>
        </div>

        <div className="print-sign-box">
          <div className="print-sign-header">品保處最後審核 (QA)</div>
          <div className="print-sign-body">
            <div className="print-sign-name">姓名: <span className="sign-text">{sign.qaConfirm || '(未簽章)'}</span></div>
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

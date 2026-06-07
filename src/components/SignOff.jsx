import React, { useState } from 'react';
import { validateAlignment } from '../utils/validator';
import { exportRequirementExcel } from '../utils/excelExporter';
import './SignOff.css';

export default function SignOff({ data, originalWb, onChange, onExportComplete }) {
  const report = validateAlignment(data);
  const { alignmentRate, warnings } = report;
  const [exportLoading, setExportLoading] = useState(false);

  const handleSignChange = (field, val) => {
    const updatedSign = { ...data.basicInfo.signOff, [field]: val };
    const updatedBasic = { ...data.basicInfo, signOff: updatedSign };
    onChange({ ...data, basicInfo: updatedBasic });
  };

  const handleExport = () => {
    setExportLoading(true);
    setTimeout(() => {
      try {
        const outArray = exportRequirementExcel(originalWb, data);
        
        // 建立下載 Blob
        const blob = new Blob([outArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const originalName = window.uploadedFileName || '新機種製作需求一覽表2026';
        const baseName = originalName.endsWith('.xlsx') ? originalName.slice(0, -5) : originalName;
        a.href = url;
        a.download = `${baseName}_對齊簽核版.xlsx`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        onExportComplete();
      } catch (err) {
        console.error(err);
        alert('匯出 Excel 檔案出錯！');
      } finally {
        setExportLoading(false);
      }
    }, 1000);
  };

  const hasMissingCritical = warnings.some(w => w.type === 'error');

  return (
    <div className="signoff-container glass-card animate-fade-in">
      <h2 className="section-title">D. 雙向線上簽核與 Excel 匯出</h2>
      <p className="section-subtitle">兩端資訊對齊無誤後，請於下方進行線上簽章並下載匯出檔案。</p>

      {/* 資訊對齊狀態 */}
      <div className="status-banner">
        <div className="status-progress-bar-wrapper">
          <div className="status-progress-info">
            <span className="status-label">當前對齊率</span>
            <span className="status-percentage">{alignmentRate}%</span>
          </div>
          <div className="status-bar-bg">
            <div 
              className="status-bar-fg" 
              style={{ 
                width: `${alignmentRate}%`,
                background: alignmentRate === 100 ? 'var(--success-color)' : 'var(--accent-gradient)'
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* 簽核區塊 */}
      <div className="sign-grid">
        {/* 發包方研發 */}
        <div className="sign-box">
          <div className="sign-header bg-rd">
            <span>研發確認簽章</span>
            <span className="badge-role">研發 (RD)</span>
          </div>
          <div className="sign-body">
            <div className="form-group">
              <label className="form-label">簽名人姓名</label>
              <input 
                type="text" 
                className="form-input edit-active" 
                placeholder="請輸入研發姓名" 
                value={data.basicInfo.signOff?.rdConfirm || ''}
                onChange={(e) => handleSignChange('rdConfirm', e.target.value)}
              />
            </div>
            <p className="sign-terms">本簽章確認：產品基本資料與風險零件已填寫完整，並經研發部門確認。</p>
          </div>
        </div>

        {/* 發包方工程 */}
        <div className="sign-box">
          <div className="sign-header bg-pe">
            <span>工程審核簽章</span>
            <span className="badge-role">工程 (PE)</span>
          </div>
          <div className="sign-body">
            <div className="form-group">
              <label className="form-label">簽名人姓名</label>
              <input 
                type="text" 
                className="form-input edit-active" 
                placeholder="請輸入工程姓名" 
                value={data.basicInfo.signOff?.engineeringReview || ''}
                onChange={(e) => handleSignChange('engineeringReview', e.target.value)}
              />
            </div>
            <p className="sign-terms">本簽章確認：生產治工具規格、鋼板開口以及製程工程參數已審查通過。</p>
          </div>
        </div>

        {/* 品保處審核 */}
        <div className="sign-box">
          <div className="sign-header bg-vendor" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
            <span>品保處最後審核</span>
            <span className="badge-role">品保處 (QA)</span>
          </div>
          <div className="sign-body">
            <div className="form-group">
              <label className="form-label">簽名人姓名</label>
              <input 
                type="text" 
                className="form-input edit-active" 
                placeholder={(!data.basicInfo.signOff?.rdConfirm || !data.basicInfo.signOff?.engineeringReview) ? "待研發與工程完成簽核" : "請輸入品保處姓名"} 
                value={data.basicInfo.signOff?.qaConfirm || ''}
                onChange={(e) => handleSignChange('qaConfirm', e.target.value)}
                disabled={!data.basicInfo.signOff?.rdConfirm || !data.basicInfo.signOff?.engineeringReview}
              />
            </div>
            {(!data.basicInfo.signOff?.rdConfirm || !data.basicInfo.signOff?.engineeringReview) ? (
              <p className="sign-terms" style={{ color: '#ef4444', fontWeight: 'bold' }}>
                ⚠️ 需等研發與工程確認人皆完成簽章後，方可由品保處進行最後審核。
              </p>
            ) : (
              <p className="sign-terms">本簽章確認：兩端資訊與防呆管制點皆已完成填寫與覆核，符合量產試產要求。</p>
            )}
          </div>
        </div>
      </div>

      {/* 匯出警示防呆 */}
      {hasMissingCritical ? (
        <div className="export-warning">
          <span className="warning-emoji">⚠️</span>
          <div className="warning-desc">
            <p className="warning-title">注意：尚有必填的防呆檢查未完成！</p>
            <p className="warning-detail">為了避免委外加工廠遺漏正確訊息，建議先前往前述分頁完成對齊。如果您仍要強行簽章並匯出文件，請點擊下方按鈕。</p>
          </div>
        </div>
      ) : (
        <div className="export-success">
          <span className="success-emoji">🎉</span>
          <div className="success-desc">
            <p className="success-title">完美！兩端資訊已完全同步！</p>
            <p className="success-detail">恭喜！所有必填與關鍵管制點皆已完成填寫與對齊。點擊下方按鈕即可匯出最終簽章版文件。</p>
          </div>
        </div>
      )}

      {/* 匯出動作按鈕 */}
      <div className="export-action-row" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
        <button 
          className="btn btn-primary btn-large"
          onClick={() => window.print()}
          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)' }}
        >
          <svg className="download-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px', marginRight: '8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>匯出並下載 PDF 報告 (A4直式)</span>
        </button>

        <button 
          className="btn btn-secondary btn-large"
          onClick={handleExport}
          disabled={exportLoading}
        >
          {exportLoading ? (
            <>
              <span className="spinner"></span>
              <span>正在回寫資料並重建活頁簿...</span>
            </>
          ) : (
            <>
              <svg className="download-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px', marginRight: '8px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>匯出並下載 Excel 文件</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}

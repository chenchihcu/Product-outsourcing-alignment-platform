import React, { useState } from 'react';
import { validateAlignment } from '../utils/validator';
import { exportRequirementExcel } from '../utils/excelExporter';
import { compressImage } from '../utils/imageCompressor';
import './SignOff.css';

export default function SignOff({ data, originalWb, onChange, onExportComplete, currentUser, onUpdateAccountSignature }) {
  const report = validateAlignment(data);
  const { alignmentRate, warnings } = report;
  const [exportLoading, setExportLoading] = useState(false);

  const handleSignChange = (field, val) => {
    const updatedSign = { ...data.basicInfo.signOff, [field]: val };
    const updatedBasic = { ...data.basicInfo, signOff: updatedSign };
    const path = `basicInfo.signOff.${field}`;
    const owners = { ...(data._owners || {}) };
    if (val !== '') {
      owners[path] = currentUser.unit;
    } else {
      delete owners[path];
    }
    onChange({ ...data, basicInfo: updatedBasic, _owners: owners });
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
          <div className="sign-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">簽名人姓名</label>
              <input 
                type="text" 
                className="form-input edit-active" 
                placeholder={currentUser.role !== 'rd' && currentUser.role !== 'admin' ? "僅限研發單位填寫" : "請輸入研發姓名"} 
                value={data.basicInfo.signOff?.rdConfirm || ''}
                onChange={(e) => handleSignChange('rdConfirm', e.target.value)}
                disabled={currentUser.role !== 'rd' && currentUser.role !== 'admin'}
              />
            </div>

            {/* 電子簽章預覽及上傳 */}
            <div className="signature-preview-area" style={{ marginTop: '4px' }}>
              <label className="form-label">電子簽章</label>
              <div 
                style={{ 
                  height: '60px', 
                  border: '1px dashed var(--border-color)', 
                  borderRadius: '6px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: 'rgba(0,0,0,0.15)',
                  overflow: 'hidden'
                }}
              >
                {data.basicInfo.signOff?.rdSignature ? (
                  <img src={data.basicInfo.signOff.rdSignature} alt="RD Signature" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>尚未設定電子簽章</span>
                )}
              </div>
              
              {(currentUser.role === 'rd' || currentUser.role === 'admin') && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {currentUser.signature && (
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-xs"
                      onClick={() => {
                        handleSignChange('rdSignature', currentUser.signature);
                        if (!data.basicInfo.signOff?.rdConfirm) {
                          handleSignChange('rdConfirm', currentUser.name);
                        }
                      }}
                    >
                      🖋️ 套用我的簽章
                    </button>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="rd-sig-upload" 
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                          const compressed = await compressImage(event.target.result);
                          handleSignChange('rdSignature', compressed);
                          if (!data.basicInfo.signOff?.rdConfirm) {
                            handleSignChange('rdConfirm', currentUser.name);
                          }
                          onUpdateAccountSignature(currentUser.username, compressed);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="btn btn-primary btn-xs"
                    onClick={() => document.getElementById('rd-sig-upload').click()}
                  >
                    📤 上傳簽章
                  </button>
                  {data.basicInfo.signOff?.rdSignature && (
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-xs" 
                      onClick={() => handleSignChange('rdSignature', '')}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
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
          <div className="sign-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">簽名人姓名</label>
              <input 
                type="text" 
                className="form-input edit-active" 
                placeholder={currentUser.role !== 'eng' && currentUser.role !== 'admin' ? "僅限工程單位填寫" : "請輸入工程姓名"} 
                value={data.basicInfo.signOff?.engineeringReview || ''}
                onChange={(e) => handleSignChange('engineeringReview', e.target.value)}
                disabled={currentUser.role !== 'eng' && currentUser.role !== 'admin'}
              />
            </div>

            {/* 電子簽章預覽及上傳 */}
            <div className="signature-preview-area" style={{ marginTop: '4px' }}>
              <label className="form-label">電子簽章</label>
              <div 
                style={{ 
                  height: '60px', 
                  border: '1px dashed var(--border-color)', 
                  borderRadius: '6px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: 'rgba(0,0,0,0.15)',
                  overflow: 'hidden'
                }}
              >
                {data.basicInfo.signOff?.engineeringReviewSignature ? (
                  <img src={data.basicInfo.signOff.engineeringReviewSignature} alt="PE Signature" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>尚未設定電子簽章</span>
                )}
              </div>
              
              {(currentUser.role === 'eng' || currentUser.role === 'admin') && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {currentUser.signature && (
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-xs"
                      onClick={() => {
                        handleSignChange('engineeringReviewSignature', currentUser.signature);
                        if (!data.basicInfo.signOff?.engineeringReview) {
                          handleSignChange('engineeringReview', currentUser.name);
                        }
                      }}
                    >
                      🖋️ 套用我的簽章
                    </button>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="pe-sig-upload" 
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                          const compressed = await compressImage(event.target.result);
                          handleSignChange('engineeringReviewSignature', compressed);
                          if (!data.basicInfo.signOff?.engineeringReview) {
                            handleSignChange('engineeringReview', currentUser.name);
                          }
                          onUpdateAccountSignature(currentUser.username, compressed);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="btn btn-primary btn-xs"
                    onClick={() => document.getElementById('pe-sig-upload').click()}
                  >
                    📤 上傳簽章
                  </button>
                  {data.basicInfo.signOff?.engineeringReviewSignature && (
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-xs" 
                      onClick={() => handleSignChange('engineeringReviewSignature', '')}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
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
          <div className="sign-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">簽名人姓名</label>
              <input 
                type="text" 
                className="form-input edit-active" 
                placeholder={
                  (!data.basicInfo.signOff?.rdConfirm || !data.basicInfo.signOff?.engineeringReview) 
                    ? "待研發與工程完成簽核" 
                    : (currentUser.role !== 'qa' && currentUser.role !== 'admin')
                    ? "僅品保處審核員可填寫"
                    : "請輸入品保處姓名"
                } 
                value={data.basicInfo.signOff?.qaConfirm || ''}
                onChange={(e) => handleSignChange('qaConfirm', e.target.value)}
                disabled={(currentUser.role !== 'qa' && currentUser.role !== 'admin') || !data.basicInfo.signOff?.rdConfirm || !data.basicInfo.signOff?.engineeringReview}
              />
            </div>

            {/* 電子簽章預覽及上傳 */}
            <div className="signature-preview-area" style={{ marginTop: '4px' }}>
              <label className="form-label">電子簽章</label>
              <div 
                style={{ 
                  height: '60px', 
                  border: '1px dashed var(--border-color)', 
                  borderRadius: '6px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: 'rgba(0,0,0,0.15)',
                  overflow: 'hidden'
                }}
              >
                {data.basicInfo.signOff?.qaSignature ? (
                  <img src={data.basicInfo.signOff.qaSignature} alt="QA Signature" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>尚未設定電子簽章</span>
                )}
              </div>
              
              {(currentUser.role === 'qa' || currentUser.role === 'admin') && data.basicInfo.signOff?.rdConfirm && data.basicInfo.signOff?.engineeringReview && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {currentUser.signature && (
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-xs"
                      onClick={() => {
                        handleSignChange('qaSignature', currentUser.signature);
                        if (!data.basicInfo.signOff?.qaConfirm) {
                          handleSignChange('qaConfirm', currentUser.name);
                        }
                      }}
                    >
                      🖋️ 套用我的簽章
                    </button>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="qa-sig-upload" 
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                          const compressed = await compressImage(event.target.result);
                          handleSignChange('qaSignature', compressed);
                          if (!data.basicInfo.signOff?.qaConfirm) {
                            handleSignChange('qaConfirm', currentUser.name);
                          }
                          onUpdateAccountSignature(currentUser.username, compressed);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="btn btn-primary btn-xs"
                    onClick={() => document.getElementById('qa-sig-upload').click()}
                  >
                    📤 上傳簽章
                  </button>
                  {data.basicInfo.signOff?.qaSignature && (
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-xs" 
                      onClick={() => handleSignChange('qaSignature', '')}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
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

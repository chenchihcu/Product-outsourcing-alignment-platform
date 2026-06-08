import React from 'react';
import { validateAlignment } from '../utils/validator';
import './Dashboard.css';

export default function Dashboard({ data, onGoToSection }) {
  const report = validateAlignment(data);
  const { warnings } = report;

  const errors = warnings.filter(w => w.type === 'error');
  const warns = warnings.filter(w => w.type === 'warning');

  // 對應警示訊息的導航按鈕
  const handleWarningClick = (msg) => {
    let tab = 'basicInfo';
    if (msg.includes('日期') || msg.includes('料號') || msg.includes('描述') || msg.includes('階段') || msg.includes('類別') || msg.includes('品質') || msg.includes('IPC') || msg.includes('PCBA') || msg.includes('加工') || msg.includes('文件') || msg.includes('鋼板') || msg.includes('治具')) {
      tab = 'basicInfo';
    } else if (msg.includes('烘烤') || msg.includes('首件') || msg.includes('順序') || msg.includes('樣品') || msg.includes('測溫') || msg.includes('Underfill') || msg.includes('包材') || msg.includes('維修記號') || msg.includes('備註')) {
      tab = 'processControl';
    } else if (msg.includes('良率') || msg.includes('板彎') || msg.includes('Cpk') || msg.includes('DFM') || msg.includes('紀錄') || msg.includes('照片')) {
      tab = 'trialReport';
    }
    onGoToSection(tab, msg);
  };

  return (
    <div className="dashboard-grid">
      {/* 防呆警告面板 */}
      <div className="dashboard-card glass-card warning-panel">
        <h3 className="card-title flex-title">
          <span>防呆與漏失提醒</span>
          <span className="badge-wrapper">
            {errors.length > 0 && <span className="badge error">{errors.length} 異常</span>}
            {warns.length > 0 && <span className="badge warning">{warns.length} 警告</span>}
            {warnings.length === 0 && <span className="badge success">已完美對齊</span>}
          </span>
        </h3>

        {warnings.length === 0 ? (
          <div className="all-clear">
            <svg className="clear-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="clear-title">兩端資訊已完全同步！</p>
            <p className="clear-desc">無任何漏失項目，可以進行線上雙向簽章並下載 Excel。</p>
          </div>
        ) : (
          <div className="warning-lists-grid">
            {/* 異常項目 */}
            <div className="warning-column">
              <h4 className="column-subtitle error-title">
                🛑 異常項目 ({errors.length})
              </h4>
              <div className="column-list">
                {errors.length === 0 ? (
                  <div className="column-empty success">✓ 無任何異常項目</div>
                ) : (
                  errors.map((w, idx) => (
                    <div 
                      key={`err-${idx}`} 
                      className="warning-item error"
                      onClick={() => handleWarningClick(w.message)}
                      title="點擊前往該填寫區塊"
                    >
                      <span className="warning-text">{w.message}</span>
                      <span className="go-fill-arrow">→</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 警告項目 */}
            <div className="warning-column">
              <h4 className="column-subtitle warning-title">
                ⚠️ 警告項目 ({warns.length})
              </h4>
              <div className="column-list">
                {warns.length === 0 ? (
                  <div className="column-empty warning">✓ 無任何警告項目</div>
                ) : (
                  warns.map((w, idx) => (
                    <div 
                      key={`warn-${idx}`} 
                      className="warning-item warning"
                      onClick={() => handleWarningClick(w.message)}
                      title="點擊前往該填寫區塊"
                    >
                      <span className="warning-text">{w.message}</span>
                      <span className="go-fill-arrow">→</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

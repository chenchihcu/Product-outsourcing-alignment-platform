import React from 'react';
import { validateAlignment } from '../utils/validator';
import './Dashboard.css';

export default function Dashboard({ data, onGoToSection }) {
  const report = validateAlignment(data);
  const { alignmentRate, passedChecks, totalChecks, warnings } = report;

  // 取得對齊進度條的顏色
  const getProgressColor = (rate) => {
    if (rate >= 95) return 'var(--success-color)';
    if (rate >= 60) return 'var(--warning-color)';
    return 'var(--accent-color)';
  };

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
      {/* 資訊對齊進度卡 */}
      <div className="dashboard-card glass-card progress-card">
        <h3 className="card-title">兩端資訊對齊率</h3>
        <div className="progress-circle-wrapper">
          <svg className="progress-svg" viewBox="0 0 120 120">
            <circle className="circle-bg" cx="60" cy="60" r="50" />
            <circle 
              className="circle-fg" 
              cx="60" 
              cy="60" 
              r="50" 
              style={{
                strokeDasharray: 314,
                strokeDashoffset: 314 - (314 * alignmentRate) / 100,
                stroke: getProgressColor(alignmentRate)
              }}
            />
          </svg>
          <div className="progress-text-wrapper">
            <span className="progress-rate">{alignmentRate}%</span>
            <span className="progress-label">資訊已同步</span>
          </div>
        </div>
        
        <div className="progress-stats">
          <div className="stat-item">
            <span className="stat-val">{passedChecks}</span>
            <span className="stat-label">已確認欄位</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-val">{totalChecks}</span>
            <span className="stat-label">總需檢核項</span>
          </div>
        </div>
      </div>

      {/* 產品概覽卡 */}
      <div className="dashboard-card glass-card summary-card">
        <h3 className="card-title">機種資訊概覽</h3>
        <div className="info-list">
          <div className="info-row">
            <span className="info-label">產品料號</span>
            <span className="info-val">{data.basicInfo.productNo || <span className="placeholder">未填寫</span>}</span>
          </div>
          <div className="info-row">
            <span className="info-label">產品描述</span>
            <span className="info-val">{data.basicInfo.productDesc || <span className="placeholder">未填寫</span>}</span>
          </div>
          <div className="info-row">
            <span className="info-label">委外加工廠</span>
            <span className="info-val">{data.basicInfo.factory || <span className="placeholder">未填寫</span>}</span>
          </div>
          <div className="info-row">
            <span className="info-label">製程階段</span>
            <span className="info-val">
              {Object.keys(data.basicInfo.stage || {})
                .filter(k => data.basicInfo.stage[k])
                .map(k => k.toUpperCase())
                .join(', ') || <span className="placeholder">未勾選</span>}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">主要加工項目</span>
            <span className="info-val">
              {Object.keys(data.basicInfo.processItems || {})
                .filter(k => data.basicInfo.processItems[k])
                .map(k => k.toUpperCase())
                .join(', ') || <span className="placeholder">未勾選</span>}
            </span>
          </div>
        </div>
      </div>

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

import { useMemo, useState } from 'react';
import { validateAlignment } from '../utils/validator';
import './Dashboard.css';

const STEP_KEYS = ['basicInfo', 'preparation', 'processControl', 'trialReport', 'documents', 'signOff'];

/* 責任歸屬:本需求一覽表由「發包方(研發/工程)」填寫全部項目;
   供應商(委外加工廠)不負責填寫任何一項。電子簽章為獨立的簽核階段。 */
const partyOf = (msg) => (msg.includes('電子簽章') ? 'sign' : 'oem');

const PARTY_META = {
  oem: { label: '發包方（研發 / 工程）', icon: '🧪', desc: '需由發包方填寫' },
  sign: { label: '簽章', icon: '✍️', desc: '待上傳電子簽章' },
};

export default function Dashboard({ data, onGoToSection, sectionStatus = {}, currentUser }) {
  const report = useMemo(() => validateAlignment(data), [data]);
  const { warnings, alignmentRate } = report;

  const errors = useMemo(() => warnings.filter((w) => w.type === 'error'), [warnings]);
  const warns = useMemo(() => warnings.filter((w) => w.type === 'warning'), [warnings]);
  const doneSteps = STEP_KEYS.filter((k) => sectionStatus[k]).length;

  const byParty = useMemo(() => {
    const g = { oem: [], sign: [] };
    warnings.forEach((w) => { g[partyOf(w.message)].push(w); });
    return g;
  }, [warnings]);

  // U5 — 「下一步」只顯示目前角色能處理的項目
  // QA 與 Admin 只負責審核，不需被提示填寫欄位；簽章項目對所有角色均可見
  const isQaOrAdmin = currentUser?.role === 'qa' || currentUser?.role === 'admin';
  const actionableWarnings = useMemo(() => {
    if (!isQaOrAdmin) return warnings;
    return warnings.filter((w) => partyOf(w.message) === 'sign');
  }, [warnings, isQaOrAdmin]);
  const nextItem = actionableWarnings.filter(w => w.type === 'error')[0]
    || actionableWarnings.filter(w => w.type === 'warning')[0]
    || null;

  const [showAll, setShowAll] = useState(false);
  const [filterParty, setFilterParty] = useState(null);

  // 對應警示訊息的導航(沿用原關鍵字對應表)
  const handleWarningClick = (msg) => {
    let tab = 'basicInfo';
    if (msg.includes('日期') || msg.includes('料號') || msg.includes('描述') || msg.includes('階段') || msg.includes('類別') || msg.includes('品質') || msg.includes('IPC') || msg.includes('PCBA') || msg.includes('加工') || msg.includes('文件') || msg.includes('鋼板') || msg.includes('治具') || msg.includes('委外加工廠')) {
      tab = 'basicInfo';
    } else if (msg.includes('烘烤') || msg.includes('樣品') || msg.includes('包材') || msg.includes('包裝')) {
      tab = 'preparation';
    } else if (msg.includes('首件') || msg.includes('剪腳') || msg.includes('順序') || msg.includes('焊接') || msg.includes('測溫') || msg.includes('關鍵零件') || msg.includes('Underfill') || msg.includes('維修記號') || msg.includes('備註')) {
      tab = 'processControl';
    } else if (msg.includes('良率') || msg.includes('板彎') || msg.includes('翹曲') || msg.includes('Cpk') || msg.includes('DFM') || msg.includes('紀錄') || msg.includes('照片')) {
      tab = 'trialReport';
    } else if (msg.includes('簽章')) {
      tab = 'signOff';
    }
    onGoToSection(tab, msg);
  };

  const visibleTodos = filterParty
    ? warnings.filter((w) => partyOf(w.message) === filterParty)
    : warnings;

  return (
    <div className="dashboard-v2">
      {/* ===== 進度 Hero ===== */}
      <div className="dash-hero glass-card">
        <div className="hero-rate" data-ok={alignmentRate === 100}>
          <span className="rate-num">{alignmentRate}<small>%</small></span>
          <span className="rate-label">雙向資訊對齊率</span>
        </div>
        <div className="hero-main">
          <div className="hero-bar">
            <div className="hero-bar-fill" data-ok={alignmentRate === 100} style={{ width: `${alignmentRate}%` }} />
          </div>
          <div className="hero-stats">
            <span className="stat"><b>{doneSteps}</b>/6 步驟完成</span>
            {errors.length > 0 && <span className="stat stat-error">● {errors.length} 異常</span>}
            {warns.length > 0 && <span className="stat stat-warn">● {warns.length} 警告</span>}
            {warnings.length === 0 && <span className="stat stat-ok">✓ 已完美對齊</span>}
          </div>
        </div>
      </div>

      {warnings.length === 0 ? (
        <div className="dash-clear glass-card">
          <svg className="clear-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="clear-title">兩端資訊已完全同步！</p>
            <p className="clear-desc">無任何漏失項目，可進行線上雙向簽章並下載 Excel。</p>
          </div>
        </div>
      ) : (
        <>
          {/* ===== 下一步:最優先一件事 ===== */}
          {nextItem && (
            <button type="button" className="dash-next glass-card" onClick={() => handleWarningClick(nextItem.message)}>
              <span className="next-left">
                <span className="next-kicker">
                  <span className={`next-dot ${nextItem.type}`} />下一步 · 最優先
                </span>
                <span className="next-msg">{nextItem.message}</span>
              </span>
              <span className="next-cta">前往填寫 →</span>
            </button>
          )}

          {/* ===== 輪到誰:依責任方分組 ===== */}
          <div className="dash-parties">
            {['oem', 'sign'].map((p) => byParty[p].length > 0 && (
              <button type="button"
                key={p}
                className={`party-card ${filterParty === p ? 'active' : ''}`}
                onClick={() => { setFilterParty(filterParty === p ? null : p); setShowAll(true); }}
                title={`點擊篩選 ${PARTY_META[p].label} 的待辦`}
              >
                <span className="party-icon">{PARTY_META[p].icon}</span>
                <span className="party-text">
                  <span className="party-label">{PARTY_META[p].label}</span>
                  <span className="party-desc">{PARTY_META[p].desc}</span>
                </span>
                <span className="party-count">{byParty[p].length}</span>
              </button>
            ))}
          </div>

          {/* ===== 全部待辦(可收合) ===== */}
          <div className="dash-all glass-card">
            <button type="button" className="all-toggle" onClick={() => setShowAll((s) => !s)}>
              <span>
                全部待辦（{warnings.length}）
                {filterParty && <span className="all-filter">· 篩選：{PARTY_META[filterParty].label}</span>}
              </span>
              <span className="all-chevron">{showAll ? '收合 ▲' : '展開 ▼'}</span>
            </button>
            {filterParty && (
              <button type="button" className="all-clear-filter" onClick={() => setFilterParty(null)}>清除篩選</button>
            )}
            {showAll && (
              <div className="all-list">
                {visibleTodos.map((w, i) => (
                  <div
                    key={`${w.type}-${i}`}
                    className={`todo-row ${w.type}`}
                    onClick={() => handleWarningClick(w.message)}
                    title="點擊前往該填寫區塊"
                  >
                    <span className={`todo-tag ${w.type}`}>{w.type === 'error' ? '異常' : '警告'}</span>
                    <span className="todo-msg">{w.message}</span>
                    <span className="todo-arrow">→</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}




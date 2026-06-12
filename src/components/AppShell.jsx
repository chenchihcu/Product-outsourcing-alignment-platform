import { useState, useEffect, useRef } from 'react';
import './AppShell.css';

/* 對齊流程的五個步驟(順序固定) */
const STEPS = [
  { key: 'basicInfo', label: '基本資料', icon: '📋' },
  { key: 'preparation', label: '前置作業', icon: '🔧' },
  { key: 'processControl', label: '製程管制', icon: '🔰' },
  { key: 'trialReport', label: '試產要求', icon: '🎯' },
  { key: 'documents', label: '工程文件', icon: '📂' },
  { key: 'signOff', label: '簽章匯出', icon: '✍️' },
];

/* 側欄導覽項目(獨立元件,避免於 render 內建立元件) */
function NavItem({ tab, icon, label, badge, status, index, activeTab, collapsed, alignmentRate, onGo }) {
  const active = activeTab === tab;
  return (
    <button
      type="button"
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={() => onGo(tab)}
      title={collapsed ? label : undefined}
    >
      <span className="nav-icon">
        {typeof index === 'number' ? (
          <span className={`nav-step-num ${status === 'done' ? 'done' : ''}`}>
            {status === 'done' ? '✓' : index}
          </span>
        ) : (
          icon
        )}
      </span>
      <span className="nav-label">{label}</span>
      {badge != null && (
        <span className={`nav-badge ${alignmentRate === 100 ? 'ok' : ''}`}>{badge}</span>
      )}
      {status && typeof index !== 'number' && (
        <span className={`nav-dot ${status}`} aria-hidden="true" />
      )}
    </button>
  );
}

/**
 * 自適應導覽外殼。
 * - 桌機/筆電 (≥1024px):固定側欄,可收合成 icon rail。
 * - 平板/手機 (<1024px):側欄收為抽屜(漢堡開啟),並在頂部顯示可橫向捲動的步驟列,
 *   讓「我在流程哪一步 / 完成度 / 下一步」隨時可見。
 * 本元件只負責導覽外殼,不改變任何資料或分頁行為。
 */
export default function AppShell({
  currentUser,
  onLogout,
  inProject,
  projectName,
  onBackToList,
  activeTab,
  onTabChange,
  sectionStatus = {},
  alignmentRate = 0,
  saveState = 'idle',
  savedAt = null,
  onlineCount = 0,
  children,
}) {
  const fmtTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  const saveLabel =
    saveState === 'saving' ? '儲存中…'
    : saveState === 'saved' ? `已儲存 ${fmtTime(savedAt)}`.trimEnd()
    : '自動儲存';
  const [collapsed, setCollapsed] = useState(false); // 桌機:側欄收合成 rail
  const [drawerOpen, setDrawerOpen] = useState(false); // 手機:抽屜開啟
  const railRef = useRef(null);
  const activePillRef = useRef(null);

  // 切換分頁時把作用中的步驟 pill 捲到可視中央(抽屜的關閉由 go() 處理)
  useEffect(() => {
    if (activePillRef.current) {
      activePillRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeTab]);

  const go = (tab) => {
    onTabChange(tab);
    setDrawerOpen(false);
  };

  const completedSteps = STEPS.filter((s) => sectionStatus[s.key]).length;
  const navShared = { activeTab, collapsed, alignmentRate, onGo: go };

  return (
    <div className="shell" data-collapsed={collapsed} data-drawer={drawerOpen}>
      {/* ===== 側欄 / 抽屜 ===== */}
      <aside className="shell-sidebar">
        <div className="shell-brand">
          <span className="brand-mark" aria-hidden="true">M</span>
          <span className="brand-text">
            <span className="brand-title">產品委外加工系統</span>
            <span className="brand-sub">醫電鼎眾 Mitcorp</span>
          </span>
        </div>

        <nav className="shell-nav">
          {inProject ? (
            <>
              <div className="nav-group-label">總覽</div>
              <NavItem {...navShared} tab="dashboard" icon="📈" label="儀表板" badge={`${alignmentRate}%`} />

              <div className="nav-group-label">
                對齊流程
                <span className="nav-group-count">{completedSteps}/{STEPS.length}</span>
              </div>
              {STEPS.map((s, i) => (
                <NavItem
                  {...navShared}
                  key={s.key}
                  tab={s.key}
                  label={s.label}
                  index={i + 1}
                  status={sectionStatus[s.key] ? 'done' : 'pending'}
                />
              ))}

              {currentUser?.role === 'admin' && (
                <div className="nav-group-label">系統</div>
              )}
              {currentUser?.role === 'admin' && (
                <NavItem {...navShared} tab="settings" icon="⚙️" label="系統設定" />
              )}
            </>
          ) : (
            <>
              <div className="nav-group-label">工作區</div>
              <button type="button" className="nav-item active">
                <span className="nav-icon">🗂️</span>
                <span className="nav-label">機種管理中心</span>
              </button>
            </>
          )}
        </nav>

        <div className="shell-user">
          <span className="user-avatar" aria-hidden="true">👤</span>
          <span className="user-meta">
            <span className="user-name">{currentUser?.username}</span>
            <span className="user-role">{currentUser?.unit} · {currentUser?.level}</span>
          </span>
          <button type="button" className="user-logout" onClick={onLogout} title="登出系統" aria-label="登出系統">⎋</button>
        </div>

        <button
          type="button"
          className="rail-collapse"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? '展開側欄' : '收合側欄'}
          aria-label={collapsed ? '展開側欄' : '收合側欄'}
        >
          {collapsed ? '»' : '«'}
        </button>
      </aside>

      {/* ===== 主區 ===== */}
      <div className="shell-body">
        <header className="shell-topbar">
          <button
            type="button"
            className="topbar-burger"
            onClick={() => setDrawerOpen((o) => !o)}
            aria-label="開啟導覽選單"
          >
            ☰
          </button>
          <div className="topbar-title" title={inProject ? projectName : '機種管理中心'}>
            {inProject ? projectName : '機種管理中心'}
          </div>
          <div className="topbar-right">
            {inProject && onlineCount > 1 && (
              <span className="presence-pill" title={`${onlineCount} 人正在檢視此機種`}>
                👥 {onlineCount}
              </span>
            )}
            {inProject && (
              <span className={`save-hint save-${saveState}`} title="變更會自動儲存至本機">
                <span className="save-dot" aria-hidden="true" />{saveLabel}
              </span>
            )}
            {inProject && (
              <button type="button" className="btn btn-secondary topbar-back" onClick={onBackToList}>
                ↩ 回列表
              </button>
            )}
          </div>
        </header>

        {/* 手機/平板:橫向步驟列,隨時看得到全流程 */}
        {inProject && (
          <div className="shell-steprail" ref={railRef}>
            <button type="button"
              ref={activeTab === 'dashboard' ? activePillRef : null}
              className={`step-pill ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => go('dashboard')}
            >
              <span className="pill-icon">📈</span>儀表板
              <span className={`pill-badge ${alignmentRate === 100 ? 'ok' : ''}`}>{alignmentRate}%</span>
            </button>

            {STEPS.map((s, i) => (
              <button type="button"
                key={s.key}
                ref={activeTab === s.key ? activePillRef : null}
                className={`step-pill ${activeTab === s.key ? 'active' : ''} ${sectionStatus[s.key] ? 'done' : ''}`}
                onClick={() => go(s.key)}
              >
                <span className={`pill-num ${sectionStatus[s.key] ? 'done' : ''}`}>
                  {sectionStatus[s.key] ? '✓' : i + 1}
                </span>
                {s.label}
              </button>
            ))}
            {currentUser?.role === 'admin' && (
              <button type="button"
                ref={activeTab === 'settings' ? activePillRef : null}
                className={`step-pill ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => go('settings')}
              >
                <span className="pill-icon">⚙️</span>設定
              </button>
            )}
          </div>
        )}

        <main className="shell-content">{children}</main>
      </div>

      {/* 手機抽屜遮罩 */}
      <button
        type="button"
        className="shell-backdrop"
        aria-label="關閉選單"
        onClick={() => setDrawerOpen(false)}
      />
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import Uploader from './components/Uploader';
import Dashboard from './components/Dashboard';
import FormSections from './components/FormSections';
import SignOff from './components/SignOff';
import PrintReport from './components/PrintReport';
import Settings from './components/Settings';
import LoginModal from './components/LoginModal';
import { validateAlignment } from './utils/validator';
import * as XLSX from 'xlsx';
import './App.css';

export default function App() {
  const [data, setData] = useState(null);
  const [originalWb, setOriginalWb] = useState(null);
  const [fileName, setFileName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [alignmentRate, setAlignmentRate] = useState(0);

  // 登入狀態與使用者管理
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ag_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [factories, setFactories] = useState(() => {
    const saved = localStorage.getItem('ag_factories');
    return saved ? JSON.parse(saved) : ['富士康', '捷普', '醫電鼎眾'];
  });

  const defaultAccounts = [
    { username: 'rd', password: 'rd123', name: '研發處專員', unit: '研發單位', role: 'rd', level: 'Standard' },
    { username: 'eng', password: 'eng123', name: '工程處專員', unit: '工程單位', role: 'eng', level: 'Standard' },
    { username: 'qa', password: 'qa123', name: '品保處審核員', unit: '審核單位(品保處)', role: 'qa', level: 'Standard' },
    { username: 'admin', password: 'admin123', name: '系統管理員', unit: '管理處', role: 'admin', level: 'Administrator' }
  ];

  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('ag_accounts');
    return saved ? JSON.parse(saved) : defaultAccounts;
  });

  // 每次資料更新時，重算對齊率
  useEffect(() => {
    if (data) {
      const report = validateAlignment(data);
      setAlignmentRate(report.alignmentRate);
    }
  }, [data]);

  useEffect(() => {
    localStorage.setItem('ag_factories', JSON.stringify(factories));
  }, [factories]);

  useEffect(() => {
    localStorage.setItem('ag_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ag_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ag_current_user');
    }
  }, [currentUser]);

  const handleAddFactory = (fac) => {
    if (!factories.includes(fac)) {
      setFactories([...factories, fac]);
    }
  };

  const handleRemoveFactory = (fac) => {
    setFactories(factories.filter(f => f !== fac));
  };

  const handleAddAccount = (acc) => {
    setAccounts([...accounts, acc]);
  };

  const handleRemoveAccount = (uname) => {
    setAccounts(accounts.filter(a => a.username !== uname));
  };

  const handleDataLoaded = (parsedData, wb, name) => {
    setData(parsedData);
    setOriginalWb(wb);
    setFileName(name);
    window.uploadedFileName = name; // 存入全域供 Exporter 使用
    setActiveTab('dashboard');
  };

  // 載入預設範本
  const handleLoadTemplate = async () => {
    try {
      const response = await fetch('/新機種製作需求一覽表2026 v2.xlsx');
      if (!response.ok) throw new Error('無法載入範本 Excel 檔案。');
      const ab = await response.arrayBuffer();
      const parsedData = await import('./utils/excelParser').then(m => m.parseRequirementExcel(ab));
      const wb = XLSX.read(ab, { type: 'array' });
      handleDataLoaded(parsedData, wb, '新機種製作需求一覽表2026 v2.xlsx');
    } catch (err) {
      console.error(err);
      alert('載入預設範本失敗，請手動拖放上傳。');
    }
  };

  const handleReset = () => {
    setData(null);
    setOriginalWb(null);
    setFileName('');
    setActiveTab('dashboard');
    setShowSuccessOverlay(false);
  };

  const handleExportComplete = () => {
    setShowSuccessOverlay(true);
  };

  // 渲染分頁
  const renderTabContent = () => {
    if (!data) return null;
    
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={data} onGoToSection={(sec) => setActiveTab(sec)} />;
      case 'basicInfo':
        return (
          <FormSections 
            data={data} 
            activeSection="basicInfo" 
            onChange={setData} 
            onNext={() => setActiveTab('processControl')} 
            currentUser={currentUser}
            factories={factories}
          />
        );
      case 'processControl':
        return (
          <FormSections 
            data={data} 
            activeSection="processControl" 
            onChange={setData} 
            onNext={() => setActiveTab('trialReport')} 
            currentUser={currentUser}
            factories={factories}
          />
        );
      case 'trialReport':
        return (
          <FormSections 
            data={data} 
            activeSection="trialReport" 
            onChange={setData} 
            onNext={() => setActiveTab('signOff')} 
            currentUser={currentUser}
            factories={factories}
          />
        );
      case 'signOff':
        return (
          <SignOff 
            data={data} 
            originalWb={originalWb} 
            onChange={setData} 
            onExportComplete={handleExportComplete} 
            currentUser={currentUser}
          />
        );
      case 'settings':
        return (
          <Settings
            factories={factories}
            onAddFactory={handleAddFactory}
            onRemoveFactory={handleRemoveFactory}
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onRemoveAccount={handleRemoveAccount}
            currentUser={currentUser}
          />
        );
      default:
        return null;
    }
  };

  if (!currentUser) {
    return (
      <LoginModal onLogin={setCurrentUser} defaultAccounts={accounts} />
    );
  }

  return (
    <>
      <PrintReport data={data} />
      <div className="app-container">
      {/* 頂部 Header */}
      <header className="app-header glass-card">
        <div className="header-logo">
          <span className="logo-icon">📊</span>
          <div className="logo-text">
            <h1 className="logo-title">新機種委外加工對齊系統</h1>
            <p className="logo-subtitle">雙向資訊同步與製程防呆管制平台</p>
          </div>
        </div>

        <div className="header-right-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* 使用者資訊 */}
          <div className="user-profile-badge">
            <span className="user-avatar">👤</span>
            <div className="user-info-text">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-role-desc">{currentUser.unit} ({currentUser.level})</span>
            </div>
            <button className="btn-logout" onClick={() => { setCurrentUser(null); setActiveTab('dashboard'); }} title="登出系統">
              🚪 登出
            </button>
          </div>

          {data && (
            <div className="header-file-info animate-fade-in">
              <div className="file-badge">
                <span className="file-badge-icon">📄</span>
                <span className="file-name-text" title={fileName}>{fileName}</span>
              </div>
              <button className="btn btn-secondary compact-btn" onClick={handleReset}>
                重新上傳
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 主畫面排版 */}
      <main className="app-main">
        {!data ? (
          <div className="welcome-layout animate-fade-in">
            <div className="welcome-intro text-center">
              <h2>確保兩邊接收資訊同步對齊</h2>
              <p>避免委外加工廠遺漏正確訊息的製程管制與前置作業確認系統</p>
            </div>
            
            <Uploader onDataLoaded={handleDataLoaded} />
            
            <div className="text-center mt-2">
              <span className="or-text">或是</span>
              <button className="btn btn-secondary template-btn" onClick={handleLoadTemplate}>
                ⚡ 載入本地機種確認表範本進行測試
              </button>
            </div>
          </div>
        ) : (
          <div className="editor-layout animate-fade-in">
            {/* 分頁導覽 */}
            <nav className="tab-navigation glass-card">
              <button 
                className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <span className="tab-icon">📈</span>
                <span className="tab-label">儀表板</span>
                <span className={`tab-indicator ${alignmentRate === 100 ? 'aligned' : ''}`}>
                  {alignmentRate}%
                </span>
              </button>
              <div className="tab-nav-divider"></div>
              
              <button 
                className={`tab-btn ${activeTab === 'basicInfo' ? 'active' : ''}`}
                onClick={() => setActiveTab('basicInfo')}
              >
                <span className="tab-icon">📋</span>
                <span className="tab-label">A. 產品基本資料</span>
              </button>

              <button 
                className={`tab-btn ${activeTab === 'processControl' ? 'active' : ''}`}
                onClick={() => setActiveTab('processControl')}
              >
                <span className="tab-icon">🔰</span>
                <span className="tab-label">B. 製程管制/前置作業</span>
              </button>

              <button 
                className={`tab-btn ${activeTab === 'trialReport' ? 'active' : ''}`}
                onClick={() => setActiveTab('trialReport')}
              >
                <span className="tab-icon">🎯</span>
                <span className="tab-label">C. 試產報告要求</span>
              </button>

              <button 
                className={`tab-btn ${activeTab === 'signOff' ? 'active' : ''}`}
                onClick={() => setActiveTab('signOff')}
              >
                <span className="tab-icon">✍️</span>
                <span className="tab-label">D. 線上簽章匯出</span>
              </button>

              <div className="tab-nav-divider"></div>
              
              <button 
                className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span className="tab-icon">⚙️</span>
                <span className="tab-label">系統設定</span>
              </button>
            </nav>

            {/* 主要內容區 */}
            <div className="tab-content">
              {renderTabContent()}
            </div>
          </div>
        )}
      </main>

      {/* 簽核成功慶祝 Overlay */}
      {showSuccessOverlay && (
        <div className="success-overlay animate-fade-in" onClick={() => setShowSuccessOverlay(false)}>
          <div className="success-card glass-card text-center" onClick={(e) => e.stopPropagation()}>
            <span className="big-check-icon">✓</span>
            <h2>Excel 匯出下載成功！</h2>
            <p>對齊簽核版確認表已成功匯出。雙向資訊與防呆管制點皆已正確填入！</p>
            <div className="success-actions">
              <button className="btn btn-primary" onClick={() => setShowSuccessOverlay(false)}>
                確定
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                開始新機種對齊
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 頁尾 */}
      <footer className="app-footer">
        <p>© 2026 醫電鼎眾股份有限公司. All rights reserved.</p>
        <p className="footer-meta">Vite + React Premium 製程管制平台</p>
      </footer>
      </div>
    </>
  );
}

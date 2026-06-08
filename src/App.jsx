import { useState, useEffect } from 'react';
import ProjectList from './components/ProjectList';
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
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('ag_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [data, setData] = useState(null);
  const [originalWb, setOriginalWb] = useState(null);
  const [fileName, setFileName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [highlightField, setHighlightField] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('ag_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ag_theme', theme);
  }, [theme]);

  const handleGoToSection = (tab, msg) => {
    setActiveTab(tab);
    if (msg) {
      setHighlightField(msg);
      setTimeout(() => {
        setHighlightField('');
      }, 3000);
    }
  };

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

  // 動態計算對齊率，取代原本的 React state
  const currentAlignmentRate = data ? validateAlignment(data).alignmentRate : 0;

  // 1. 初始化與讀取本地機種清單 (若清單為空，非同步下載預設範本)
  useEffect(() => {
    const loadDefaultTemplate = async () => {
      if (projects.length === 0) {
        try {
          const response = await fetch(import.meta.env.BASE_URL + '新機種製作需求一覽表2026 v2.xlsx');
          if (!response.ok) throw new Error('無法載入範本 Excel 檔案。');
          const ab = await response.arrayBuffer();
          const parsedData = await import('./utils/excelParser').then(m => m.parseRequirementExcel(ab));
          
          // 轉為 Base64 以供後續匯出回寫
          const binaryString = new Uint8Array(ab).reduce((data, byte) => data + String.fromCharCode(byte), '');
          const base64 = btoa(binaryString);

          const defaultProj = {
            id: 'default-template',
            name: '新機種製作需求一覽表2026 v2.xlsx (預設範本)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            alignmentRate: 0,
            data: parsedData,
            originalWbBase64: base64
          };

          const newList = [defaultProj];
          localStorage.setItem('ag_projects', JSON.stringify(newList));
          setProjects(newList);
        } catch (err) {
          console.error('載入預設範本失敗:', err);
        }
      }
    };

    if (currentUser) {
      loadDefaultTemplate();
    }
  }, [currentUser, projects.length]);

  // 2. 自動存檔功能 (提供即時與 Debounce 800ms 機制)
  const saveProjectData = (projId, name, projData) => {
    if (!projId || !projData) return;
    const report = validateAlignment(projData);
    setProjects(prev => {
      const updated = prev.map(p => 
        p.id === projId 
          ? { 
              ...p, 
              name: name, 
              data: projData, 
              alignmentRate: report.alignmentRate, 
              updatedAt: new Date().toISOString() 
            } 
          : p
      );
      localStorage.setItem('ag_projects', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (currentProjectId && data) {
      const saveTimeout = setTimeout(() => {
        saveProjectData(currentProjectId, fileName, data);
      }, 800);

      return () => clearTimeout(saveTimeout);
    }
  }, [data, currentProjectId, fileName]);

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

  // 3. 選取機種並載入詳細資料
  const handleSelectProject = (id, currentList = projects) => {
    const project = currentList.find(p => p.id === id);
    if (project) {
      setData(project.data);
      setFileName(project.name);
      window.uploadedFileName = project.name; // 存入全域以供匯出使用

      // 解析原始 Excel 二進位資料為 Workbook 物件
      if (project.originalWbBase64) {
        const binaryString = atob(project.originalWbBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const wb = XLSX.read(bytes.buffer, { type: 'array' });
        setOriginalWb(wb);
      }
      
      setCurrentProjectId(id);
      setActiveTab('dashboard');
    } else {
      alert('找不到該機種資料。');
    }
  };

  // 4. 線上直接新增機種 (複製預設範本)
  const handleCreateProject = async (name) => {
    if (!name || !name.trim()) return;
    const trimmedName = name.trim();
    
    // 防呆設計：防範重複機種名稱
    const isDuplicate = projects.some(p => p.name.toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicate) {
      alert(`已存在名稱為「${trimmedName}」的機種，請使用其他名稱！`);
      return;
    }

    try {
      // 嘗試複製列表中的預設範本，如果沒有則重新拉取 Excel 檔
      let base64 = '';
      let parsedData = null;
      const template = projects.find(p => p.id === 'default-template');
      
      if (template) {
        base64 = template.originalWbBase64;
        parsedData = JSON.parse(JSON.stringify(template.data)); // 深拷貝
      } else {
        const response = await fetch(import.meta.env.BASE_URL + '新機種製作需求一覽表2026 v2.xlsx');
        if (!response.ok) throw new Error('無法載入範本');
        const ab = await response.arrayBuffer();
        parsedData = await import('./utils/excelParser').then(m => m.parseRequirementExcel(ab));
        const binaryString = new Uint8Array(ab).reduce((data, byte) => data + String.fromCharCode(byte), '');
        base64 = btoa(binaryString);
      }

      const newProj = {
        id: 'proj_' + Math.random().toString(36).substr(2, 9),
        name: trimmedName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        alignmentRate: 0,
        data: parsedData,
        originalWbBase64: base64
      };

      const newList = [...projects, newProj];
      localStorage.setItem('ag_projects', JSON.stringify(newList));
      setProjects(newList);
      
      // 直接載入新機種編輯
      handleSelectProject(newProj.id, newList);
    } catch (err) {
      console.error(err);
      alert('建立新機種失敗！');
    }
  };

  // 5. 匯入 Excel 機種
  const handleImportExcel = async (name, fileBase64) => {
    if (!name || !name.trim()) return;
    const trimmedName = name.trim();

    // 防呆設計：防範重複機種名稱
    const isDuplicate = projects.some(p => p.name.toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicate) {
      alert(`已存在名稱為「${trimmedName}」的機種，請更換檔案名稱後重新上傳！`);
      return;
    }

    try {
      // 在前端解析 base64 檔案
      const binaryString = atob(fileBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const { parseRequirementExcel } = await import('./utils/excelParser');
      const parsedData = parseRequirementExcel(bytes.buffer);

      const newProj = {
        id: 'proj_' + Math.random().toString(36).substr(2, 9),
        name: name || `未命名機種_${new Date().toLocaleDateString()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        alignmentRate: 0,
        data: parsedData,
        originalWbBase64: fileBase64
      };

      const newList = [...projects, newProj];
      localStorage.setItem('ag_projects', JSON.stringify(newList));
      setProjects(newList);
      
      // 直接載入新機種編輯
      handleSelectProject(newProj.id, newList);
    } catch (err) {
      console.error(err);
      alert('解析或匯入 Excel 失敗，請確認檔案格式是否正確。');
    }
  };

  // 6. 刪除機種
  const handleDeleteProject = (id) => {
    const newList = projects.filter(p => p.id !== id);
    localStorage.setItem('ag_projects', JSON.stringify(newList));
    setProjects(newList);

    if (currentProjectId === id) {
      handleBackToList();
    }
  };

  const handleBackToList = () => {
    // 強制立即同步儲存最新的變更，防止 Debounce 尚未觸發
    if (currentProjectId && data) {
      saveProjectData(currentProjectId, fileName, data);
    }
    setData(null);
    setOriginalWb(null);
    setFileName('');
    setCurrentProjectId(null);
    setActiveTab('dashboard');
    setShowSuccessOverlay(false);
  };

  const handleExportComplete = () => {
    setShowSuccessOverlay(true);
  };

  const handleUpdateAccountLevel = (uname, newLevel) => {
    setAccounts(prev => {
      const updated = prev.map(a => 
        a.username === uname ? { ...a, level: newLevel } : a
      );
      localStorage.setItem('ag_accounts', JSON.stringify(updated));
      return updated;
    });
  };

  // 渲染分頁
  const renderTabContent = () => {
    if (!data) return null;
    
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={data} onGoToSection={handleGoToSection} />;
      case 'basicInfo':
        return (
          <FormSections 
            data={data} 
            activeSection="basicInfo" 
            onChange={setData} 
            onNext={() => setActiveTab('processControl')} 
            currentUser={currentUser}
            factories={factories}
            highlightField={highlightField}
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
            highlightField={highlightField}
          />
        );
      case 'trialReport':
        return (
          <FormSections 
            data={data} 
            activeSection="trialReport" 
            onChange={setData} 
            onNext={() => setActiveTab('documents')} 
            currentUser={currentUser}
            factories={factories}
            highlightField={highlightField}
          />
        );
      case 'documents':
        return (
          <FormSections 
            data={data} 
            activeSection="documents" 
            onChange={setData} 
            onNext={() => setActiveTab('signOff')} 
            currentUser={currentUser}
            factories={factories}
            highlightField={highlightField}
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
            onUpdateAccountLevel={handleUpdateAccountLevel}
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
        <div className="header-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg className="logo-svg" viewBox="0 0 100 100" style={{ width: '40px', height: '40px', fill: 'none', stroke: 'url(#logoGradient)', strokeWidth: '5' }}>
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" strokeWidth="4" strokeDasharray="6 6" />
            <circle cx="50" cy="50" r="34" strokeWidth="2" opacity="0.6" />
            <path d="M28 65 V35 L50 55 L72 35 V65" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M50 20 V32 M50 68 V80 M20 50 H32 M68 50 H80" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <div className="logo-text">
            <h1 className="logo-title" style={{ fontSize: '1.35rem', fontWeight: '750' }}>產品委外加工資訊系統</h1>
            <p className="logo-subtitle">醫電鼎眾 Mitcorp | 雙向資訊同步與製程防呆管制平台</p>
          </div>
        </div>

        <div className="header-right-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* 網頁負責人資訊 */}
          <div className="sqe-profile-badge" title="網頁負責人: SQE 陳智富">
            <span className="sqe-avatar">🛠️</span>
            <div className="sqe-info-text">
              <span className="sqe-label">網頁負責人</span>
              <span className="sqe-name">SQE 陳智富</span>
            </div>
          </div>

          {/* 主題切換按鈕 */}
          <button 
            className="theme-toggle-btn"
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            title={`切換至 ${theme === 'dark' ? '淺色' : '深色'} 主題`}
            style={{ 
              background: 'rgba(255, 255, 255, 0.08)', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-color)', 
              padding: '6px 12px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              transition: 'all 0.25s ease'
            }}
          >
            {theme === 'dark' ? '☀️ 淺色' : '🌙 深色'}
          </button>

          {/* 使用者資訊 */}
          <div className="user-profile-badge">
            <span className="user-avatar">👤</span>
            <div className="user-info-text">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-role-desc">{currentUser.unit} ({currentUser.level})</span>
            </div>
            <button className="btn-logout" onClick={() => { setCurrentUser(null); handleBackToList(); }} title="登出系統">
              🚪 登出
            </button>
          </div>

          {currentProjectId && (
            <div className="header-file-info animate-fade-in">
              <div className="file-badge" style={{ padding: '4px 8px' }}>
                <span className="file-badge-icon">📄</span>
                <span className="file-name-text" title={fileName} style={{ maxWidth: '140px' }}>{fileName}</span>
              </div>
              <button className="btn btn-secondary compact-btn" onClick={handleBackToList}>
                📁 回列表
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 主畫面排版 */}
      <main className="app-main">
        {!currentProjectId ? (
          <ProjectList 
            projects={projects}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onImportExcel={handleImportExcel}
          />
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
                <span className={`tab-indicator ${currentAlignmentRate === 100 ? 'aligned' : ''}`}>
                  {currentAlignmentRate}%
                </span>
              </button>
              <div className="tab-nav-divider"></div>
              
              <button 
                className={`tab-btn ${activeTab === 'basicInfo' ? 'active' : ''}`}
                onClick={() => setActiveTab('basicInfo')}
              >
                <span className="tab-icon">📋</span>
                <span className="tab-label">基本資料</span>
              </button>
              
              <button 
                className={`tab-btn ${activeTab === 'processControl' ? 'active' : ''}`}
                onClick={() => setActiveTab('processControl')}
              >
                <span className="tab-icon">🔰</span>
                <span className="tab-label">製程管制</span>
              </button>

              <button 
                className={`tab-btn ${activeTab === 'trialReport' ? 'active' : ''}`}
                onClick={() => setActiveTab('trialReport')}
              >
                <span className="tab-icon">🎯</span>
                <span className="tab-label">試產要求</span>
              </button>

              <button 
                className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                <span className="tab-icon">📂</span>
                <span className="tab-label">工程文件</span>
              </button>

              <button 
                className={`tab-btn ${activeTab === 'signOff' ? 'active' : ''}`}
                onClick={() => setActiveTab('signOff')}
              >
                <span className="tab-icon">✍️</span>
                <span className="tab-label">簽章匯出</span>
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
              <button className="btn btn-secondary" onClick={handleBackToList}>
                回到機種列表
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 頁尾 */}
      <footer className="app-footer">
        <p>© 2026 醫電鼎眾股份有限公司. All rights reserved. | 網頁負責人: SQE 陳智富</p>
        <p className="footer-meta">Vite + React Premium 製程管制平台</p>
      </footer>
      </div>
    </>
  );
}

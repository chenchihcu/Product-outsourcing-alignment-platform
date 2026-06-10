import { Component, lazy, Suspense } from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AppShell from './components/AppShell';
import ProjectList from './components/ProjectList';
import Dashboard from './components/Dashboard';
import FormSections from './components/FormSections';
import SignOff from './components/SignOff';
const PrintReport = lazy(() => import('./components/PrintReport'));
import Settings from './components/Settings';
import LoginModal from './components/LoginModal';
import { validateAlignment } from './utils/validator';
import { parseRequirementExcel } from './utils/excelParser';
import { getJSON, setJSON, removeKey } from './utils/storage';
import { isSupabaseEnabled } from './data/supabaseClient';
import { pullProjects, pushProject, deleteProjectRemote, subscribeProjects, subscribePresence } from './data/cloudSync';
import { migrateLocalProjects } from './data/migrateLocal';
import { getCurrentUser, onAuthChange, signOut } from './data/auth';
import * as XLSX from 'xlsx';
import './App.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px', textAlign: 'center' }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '500px' }}>
            <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>系統發生錯誤</h2>
            <p style={{ marginBottom: '24px', color: '#6b7280' }}>請重新整理頁面或回到機種列表重新載入。</p>
            <button className="btn btn-primary" onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}>
              重新整理
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const getProjectsKey = (user) => {
    if (!user) return 'ag_projects';
    if (user.role === 'admin') {
      return 'ag_projects_admin_test'; // 系統管理員最高權限測試資料庫，避免與部門正式數據混淆
    }
    return 'ag_projects';
  };

  const getStorageSuffix = (user) => {
    if (!user) return '';
    if (user.role === 'admin') return '_admin_test';
    return '';
  };

  // 雲端工作區(對應 storage suffix):admin 測試庫與正式庫分離
  const getWorkspace = (user) => (user?.role === 'admin' ? 'admin_test' : 'default');

  const [projects, setProjects] = useState([]);
  const projectsRef = useRef([]);
  useEffect(() => { projectsRef.current = projects; }, [projects]);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const currentProjectIdRef = useRef(null);
  useEffect(() => { currentProjectIdRef.current = currentProjectId; }, [currentProjectId]);
  const [data, setData] = useState(null);
  const [originalWb, setOriginalWb] = useState(null);
  const [fileName, setFileName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [highlightField, setHighlightField] = useState('');

  // 儲存狀態提示(信任訊號):idle | saving | saved
  const [saveState, setSaveState] = useState('idle');
  const [savedAt, setSavedAt] = useState(null);
  const editedSinceLoadRef = useRef(false); // 區分「載入機種」與「使用者編輯」,避免開啟時誤顯示儲存中

  // P3 即時協作:對方更新提示 + 在線使用者
  const [remoteUpdate, setRemoteUpdate] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

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
    return getJSON('current_user', null);
  });
  const currentUserRef = useRef(null);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  const [factories, setFactories] = useState(() => {
    return getJSON('factories' + getStorageSuffix(currentUser), ['富士康', '捷普', '醫電鼎眾']);
  });

  const defaultAccounts = [
    { username: 'guest', password: 'guest123', unit: '測試單位', role: 'admin', level: 'Administrator' }
  ];
  const [accounts, setAccounts] = useState(() => {
    return getJSON('accounts' + getStorageSuffix(currentUser), defaultAccounts);
  });

  const currentAlignmentRate = useMemo(
    () => data ? validateAlignment(data).alignmentRate : 0,
    [data]
  );

  const sectionStatus = useMemo(() => {
    if (!data) return {};
    const bi = data.basicInfo || {};
    const pc = data.processControl || {};
    const tr = data.trialReport || {};
    const sign = bi.signOff || {};
    return {
      basicInfo: !!(bi.factory && bi.productNo && Object.values(bi.stage || {}).some(v => v)),
      processControl: !!((pc.sampleProvided?.trialBoard || pc.sampleProvided?.tempBoard || pc.sampleProvided?.standardPart) &&
        (pc.bakeRequired?.need || pc.bakeRequired?.noNeed) &&
        (pc.smtOrder?.bToT || pc.smtOrder?.tToB)),
      trialReport: !!(tr.printRecords?.some(r => r.checked) || tr.inspectRecords?.some(r => r.checked) || tr.photoRecords?.some(r => r.checked)),
      documents: !!Object.values(bi.documents || {}).some(v => v),
      signOff: !!(sign.rdSignature || sign.engineeringReviewSignature || sign.qaSignature)
    };
  }, [data]);

  // 1. 初始化與讀取本地機種清單 (若清單為空，非同步下載預設範本)
  useEffect(() => {
    const loadDefaultTemplate = async () => {
      const key = getProjectsKey(currentUser);
      const list = getJSON(key.replace('ag_', ''), []);

      if (list.length === 0) {
        try {
          const response = await fetch(import.meta.env.BASE_URL + '新機種製作需求一覽表2026 v2.xlsx');
          if (!response.ok) throw new Error('無法載入範本 Excel 檔案。');
          const ab = await response.arrayBuffer();
          const parsedData = parseRequirementExcel(ab);
          
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
          setJSON(key.replace('ag_', ''), newList);
          setProjects(newList);
        } catch (err) {
          console.error('載入預設範本失敗:', err);
        }
      } else {
        setProjects(list);
      }
    };

    if (currentUser) {
      loadDefaultTemplate();
    }
  }, [currentUser]);

  // 1b. 雲端同步(僅在 Supabase 啟用時):登入後拉取雲端機種;雲端為空則把本機資料遷移上去
  useEffect(() => {
    if (!currentUser || !isSupabaseEnabled) return;
    let cancelled = false;
    (async () => {
      try {
        const ws = getWorkspace(currentUser);
        const localKey = getProjectsKey(currentUser).replace('ag_', '');
        const cloud = await pullProjects(ws);
        if (cancelled || !cloud) return;
        if (cloud.length > 0) {
          setProjects(cloud);
          setJSON(localKey, cloud); // 同時更新本機離線快取
        } else {
          const local = getJSON(localKey, []);
          if (local.length > 0) await migrateLocalProjects(ws, local);
        }
      } catch (e) {
        console.warn('[cloud] 雲端同步失敗,改用本機資料', e);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser]);

  // 3a. 即時同步(P3):訂閱雲端機種變更 → 更新清單;目前開啟中且為「他人」更新則提示,不直接覆蓋
  useEffect(() => {
    if (!currentUser || !isSupabaseEnabled) return;
    const ws = getWorkspace(currentUser);
    const myId = currentUser.id;
    const unsub = subscribeProjects(ws, ({ eventType, new: row, old }) => {
      if (eventType === 'DELETE') {
        if (old?.id) setProjects(prev => prev.filter(p => p.id !== old.id));
        return;
      }
      if (!row || (row.updatedBy && row.updatedBy === myId)) return; // 略過自己造成的回音
      setProjects(prev => (prev.some(p => p.id === row.id)
        ? prev.map(p => (p.id === row.id ? row : p))
        : [...prev, row]));
      if (row.id === currentProjectIdRef.current) setRemoteUpdate(row);
    });
    return unsub;
  }, [currentUser]);

  // 3b. 在線狀態(P3):同一機種有誰正在檢視
  useEffect(() => {
    if (!currentUser || !currentProjectId || !isSupabaseEnabled) return;
    const unsub = subscribePresence(
      `presence:proj:${currentProjectId}`,
      { key: currentUser.id || currentUser.username, username: currentUser.username, unit: currentUser.unit },
      (users) => setOnlineUsers(users),
    );
    return () => { unsub(); setOnlineUsers([]); };
  }, [currentUser, currentProjectId]);

  // 2. 自動存檔功能 (提供即時與 Debounce 800ms 機制)
  const saveProjectData = useCallback((projId, name, projData) => {
    if (!projId || !projData) return;
    const report = validateAlignment(projData);
    const updatedAt = new Date().toISOString();
    setProjects(prev => prev.map(p =>
      p.id === projId
        ? { ...p, name, data: projData, alignmentRate: report.alignmentRate, updatedAt }
        : p
    ));
    // 雲端同步(關閉時 pushProject 為 no-op)
    if (isSupabaseEnabled) {
      const base = projectsRef.current.find(p => p.id === projId);
      if (base) {
        pushProject(getWorkspace(currentUserRef.current), {
          ...base, name, data: projData, alignmentRate: report.alignmentRate, updatedAt,
        }, currentUserRef.current?.id).catch(e => console.warn('[cloud] 上推失敗', e));
      }
    }
  }, []);

  const debounceRef = useRef(null);
  const pendingSaveRef = useRef(null);

  const flushPendingSave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (pendingSaveRef.current) {
      const { projId, name, projData } = pendingSaveRef.current;
      saveProjectData(projId, name, projData);
      pendingSaveRef.current = null;
    }
  }, [saveProjectData]);

  const flushPendingSaveRef = useRef(flushPendingSave);
  useEffect(() => { flushPendingSaveRef.current = flushPendingSave; }, [flushPendingSave]);

  useEffect(() => {
    if (currentProjectId && data) {
      // 機種「載入」時的第一次 data 設定不算編輯,不顯示儲存中
      if (!editedSinceLoadRef.current) {
        editedSinceLoadRef.current = true;
        return;
      }
      setSaveState('saving');
      pendingSaveRef.current = { projId: currentProjectId, name: fileName, projData: data };
      debounceRef.current = setTimeout(() => {
        saveProjectData(currentProjectId, fileName, data);
        pendingSaveRef.current = null;
        setSaveState('saved');
        setSavedAt(Date.now());
      }, 800);

      return () => clearTimeout(debounceRef.current);
    }
  }, [data, currentProjectId, fileName, saveProjectData]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const flush = flushPendingSaveRef.current;
      flush();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    setJSON('factories' + getStorageSuffix(currentUser), factories);
  }, [factories, currentUser]);

  useEffect(() => {
    setJSON('accounts' + getStorageSuffix(currentUser), accounts);
  }, [accounts, currentUser]);

  useEffect(() => {
    if (currentUser) {
      setJSON('current_user', currentUser);
    } else {
      removeKey('current_user');
    }
  }, [currentUser]);

  // Supabase:啟動時以既有 session 還原登入,並監聽登入/登出狀態
  useEffect(() => {
    if (!isSupabaseEnabled) return;
    let cancelled = false;
    getCurrentUser().then((u) => { if (!cancelled && u) setCurrentUser(u); }).catch(() => {});
    const unsub = onAuthChange(async () => {
      const u = await getCurrentUser();
      if (!cancelled) setCurrentUser(u);
    });
    return () => { cancelled = true; unsub(); };
  }, []);

  useEffect(() => {
    if (!currentUser || projects.length === 0) return;
    const key = getProjectsKey(currentUser);
    setJSON(key.replace('ag_', ''), projects);
  }, [projects, currentUser]);

  // 自動恢復上次編輯的機種
  const lastIdRef = useRef(null);
  useEffect(() => {
    if (!currentUser || currentProjectId || projects.length === 0) return;
    const lastId = getJSON('last_project_id', null);
    if (lastId && lastId !== lastIdRef.current && projects.some(p => p.id === lastId)) {
      lastIdRef.current = lastId;
      const project = projects.find(p => p.id === lastId);
      if (project) {
        editedSinceLoadRef.current = false;
        setSaveState('saved');
        setSavedAt(project.updatedAt ? Date.parse(project.updatedAt) : Date.now());
        setData(project.data);
        setFileName(project.name);
        if (project.originalWbBase64) {
          const binaryString = atob(project.originalWbBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
          setOriginalWb(XLSX.read(bytes.buffer, { type: 'array' }));
        }
        setCurrentProjectId(lastId);
        setActiveTab('dashboard');
      }
    }
  }, [currentUser, projects, currentProjectId]);

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
      editedSinceLoadRef.current = false;
      setRemoteUpdate(null);
      setSaveState('saved');
      setSavedAt(project.updatedAt ? Date.parse(project.updatedAt) : Date.now());
      setData(project.data);
      setFileName(project.name);

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
      } else {
        // 若無 base64 備份，先設為 null，由 SignOff 處理
        setOriginalWb(null);
      }
      
      setCurrentProjectId(id);
      setActiveTab('dashboard');
      setJSON('last_project_id', id);
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
        parsedData = parseRequirementExcel(ab);
        const binaryString = new Uint8Array(ab).reduce((data, byte) => data + String.fromCharCode(byte), '');
        base64 = btoa(binaryString);
      }

      const newProj = {
        id: 'proj_' + crypto.randomUUID(),
        name: trimmedName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        alignmentRate: 0,
        data: parsedData,
        originalWbBase64: base64
      };

      const newList = [...projects, newProj];
      setJSON(getProjectsKey(currentUser).replace('ag_', ''), newList);
      setProjects(newList);
      if (isSupabaseEnabled) pushProject(getWorkspace(currentUser), newProj, currentUser?.id).catch(e => console.warn('[cloud] 新增上推失敗', e));

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
      
      const parsedData = parseRequirementExcel(bytes.buffer);

      const newProj = {
        id: 'proj_' + crypto.randomUUID(),
        name: name || `未命名機種_${new Date().toLocaleDateString()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        alignmentRate: 0,
        data: parsedData,
        originalWbBase64: fileBase64
      };

      const newList = [...projects, newProj];
      setJSON(getProjectsKey(currentUser).replace('ag_', ''), newList);
      setProjects(newList);
      if (isSupabaseEnabled) pushProject(getWorkspace(currentUser), newProj, currentUser?.id).catch(e => console.warn('[cloud] 匯入上推失敗', e));

      handleSelectProject(newProj.id, newList);
    } catch (err) {
      console.error(err);
      alert('解析或匯入 Excel 失敗，請確認檔案格式是否正確。');
    }
  };

  // 6. 刪除機種
  const handleDeleteProject = (id) => {
    const newList = projects.filter(p => p.id !== id);
    setJSON(getProjectsKey(currentUser).replace('ag_', ''), newList);
    setProjects(newList);
    if (isSupabaseEnabled) deleteProjectRemote(id).catch(e => console.warn('[cloud] 刪除失敗', e));

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
    setRemoteUpdate(null);
  };

  // P3:把對方的最新版本載入編輯器(使用者主動確認,避免靜默覆蓋編輯中內容)
  const handleLoadRemote = () => {
    if (!remoteUpdate) return;
    editedSinceLoadRef.current = false;
    setData(remoteUpdate.data);
    setFileName(remoteUpdate.name);
    if (remoteUpdate.originalWbBase64) {
      try {
        const bin = atob(remoteUpdate.originalWbBase64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        setOriginalWb(XLSX.read(bytes.buffer, { type: 'array' }));
      } catch { /* 還原失敗忽略 */ }
    }
    setSaveState('saved');
    setSavedAt(remoteUpdate.updatedAt ? Date.parse(remoteUpdate.updatedAt) : Date.now());
    setRemoteUpdate(null);
  };

  const handleExportComplete = () => {
    setShowSuccessOverlay(true);
  };

  const handleUpdateAccountLevel = (uname, newLevel) => {
    setAccounts(prev => prev.map(a =>
      a.username === uname ? { ...a, level: newLevel } : a
    ));
  };

  const handleUpdateAccountSignature = (uname, signature) => {
    setAccounts(prev => prev.map(a =>
      a.username === uname ? { ...a, signature } : a
    ));
    if (currentUser && currentUser.username === uname) {
      setCurrentUser(prev => ({ ...prev, signature }));
    }
  };

  // 渲染分頁
  const renderTabContent = () => {
    if (!data) return null;
    
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={data} onGoToSection={handleGoToSection} sectionStatus={sectionStatus} />;
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
            fileName={fileName}
            onChange={setData} 
            onExportComplete={handleExportComplete} 
            currentUser={currentUser}
            onUpdateAccountSignature={handleUpdateAccountSignature}
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
            onUpdateAccountSignature={handleUpdateAccountSignature}
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
      <ErrorBoundary>
      {data && (
        <Suspense fallback={null}>
          <PrintReport data={data} />
        </Suspense>
      )}
      <AppShell
        currentUser={currentUser}
        onLogout={() => { signOut(); setCurrentUser(null); handleBackToList(); }}
        inProject={!!currentProjectId}
        projectName={fileName}
        onBackToList={handleBackToList}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sectionStatus={sectionStatus}
        alignmentRate={currentAlignmentRate}
        saveState={saveState}
        savedAt={savedAt}
        onlineCount={onlineUsers.length}
      >
        {!currentProjectId ? (
          <ProjectList
            projects={projects}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onImportExcel={handleImportExcel}
          />
        ) : (
          <>
            {remoteUpdate && (
              <div className="remote-update-banner animate-fade-in">
                <span className="rub-text">☁ 協作者剛更新了此機種的資料</span>
                <span className="rub-actions">
                  <button className="btn btn-primary btn-xs" onClick={handleLoadRemote}>載入最新</button>
                  <button className="rub-dismiss" onClick={() => setRemoteUpdate(null)}>稍後</button>
                </span>
              </div>
            )}
            <div className="tab-content animate-fade-in">
              {renderTabContent()}
            </div>
          </>
        )}

        {/* 頁尾(瘦身,credit 移出黃金區) */}
        <footer className="app-footer">
          <p>© 2026 醫電鼎眾股份有限公司. All rights reserved.</p>
          <p className="footer-meta">網頁負責人:SQE 陳智富 · Vite + React 製程管制平台</p>
        </footer>
      </AppShell>

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
      </ErrorBoundary>
    </>
  );
}

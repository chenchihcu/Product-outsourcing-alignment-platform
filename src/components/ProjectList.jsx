import { useState, useRef, useEffect } from 'react';
import './ProjectList.css';

export default function ProjectList({ projects, onSelectProject, onCreateProject, onDeleteProject, onImportExcel }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  // 一覽表排版與過濾狀態
  const [filterMode, setFilterMode] = useState('in-progress'); // 預設顯示進行中 (進行到一半)
  const [fontSize, setFontSize] = useState('medium'); // 預設中字型
  const [rowSpacing, setRowSpacing] = useState('normal'); // 預設標準行距
  const [currentPage, setCurrentPage] = useState(1);

  // ESC 鍵關閉「建立新機種」Modal
  useEffect(() => {
    if (!showCreateModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowCreateModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showCreateModal]);

  const handleSubmitCreate = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onCreateProject(newProjectName.trim());
    setNewProjectName('');
    setShowCreateModal(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      alert('請選擇有效的 .xlsx 格式檔案！');
      return;
    }

    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          const base64 = btoa(
            new Uint8Array(arrayBuffer)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          await onImportExcel(file.name, base64);
        } catch (err) {
          console.error(err);
          alert('解析或傳送 Excel 檔案失敗，請確認檔案格式是否正確。');
        } finally {
          setIsImporting(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      alert('讀取檔案時出錯！');
      setIsImporting(false);
    }
  };

  // 1. 根據關鍵字搜尋
  const searchedProjects = projects.filter(proj => 
    proj.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. 根據對齊進度過濾
  const filteredProjects = searchedProjects.filter(proj => {
    if (filterMode === 'in-progress') {
      return proj.alignmentRate < 100;
    }
    if (filterMode === 'completed') {
      return proj.alignmentRate === 100;
    }
    return true; // 'all'
  });

  // 3. 分頁計算 (預設每頁 10 筆)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProjects = filteredProjects.slice(
    (validCurrentPage - 1) * itemsPerPage,
    validCurrentPage * itemsPerPage
  );

  return (
    <div className="project-list-container animate-fade-in">
      <div className="project-list-header glass-card">
        <div className="header-info">
          <h2>機種管理中心</h2>
          <p>線上直接管理多個機種對齊進度，免除每次上傳 Excel 檔案的繁瑣流程。</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            ➕ 新增機種
          </button>
          <button 
            className={`btn btn-secondary ${isImporting ? 'loading' : ''}`} 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            📥 匯入 Excel 機種
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".xlsx" 
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* 搜尋篩選器 */}
      {projects.length > 0 && (
        <div className="project-search-container glass-card">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="搜尋機種名稱..." 
            value={searchTerm} 
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
          />
          {searchTerm && (
            <button 
              className="search-clear-btn" 
              onClick={() => { setSearchTerm(''); setCurrentPage(1); }} 
              title="清除搜尋內容"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* 工具列與檢視模式設定 */}
      <div className="project-list-toolbar glass-card">
        {/* 左側過濾頁籤 */}
        <div className="toolbar-tabs">
          <button 
            className={`tab-filter-btn ${filterMode === 'in-progress' ? 'active' : ''}`}
            onClick={() => { setFilterMode('in-progress'); setCurrentPage(1); }}
          >
            ⏳ 進行中 ({searchedProjects.filter(p => p.alignmentRate < 100).length})
          </button>
          <button 
            className={`tab-filter-btn ${filterMode === 'completed' ? 'active' : ''}`}
            onClick={() => { setFilterMode('completed'); setCurrentPage(1); }}
          >
            ✅ 已完成 ({searchedProjects.filter(p => p.alignmentRate === 100).length})
          </button>
          <button 
            className={`tab-filter-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => { setFilterMode('all'); setCurrentPage(1); }}
          >
            📁 全部 ({searchedProjects.length})
          </button>
        </div>

        {/* 右側版面設定 */}
        <div className="toolbar-settings">
          <div className="control-group">
            <span className="control-label">字體大小:</span>
            <div className="btn-toggle-group">
              <button 
                className={`toggle-btn ${fontSize === 'small' ? 'active' : ''}`}
                onClick={() => setFontSize('small')}
                title="12px"
              >
                小
              </button>
              <button 
                className={`toggle-btn ${fontSize === 'medium' ? 'active' : ''}`}
                onClick={() => setFontSize('medium')}
                title="14px"
              >
                中
              </button>
              <button 
                className={`toggle-btn ${fontSize === 'large' ? 'active' : ''}`}
                onClick={() => setFontSize('large')}
                title="16px"
              >
                大
              </button>
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">表格間距:</span>
            <div className="btn-toggle-group">
              <button 
                className={`toggle-btn ${rowSpacing === 'compact' ? 'active' : ''}`}
                onClick={() => setRowSpacing('compact')}
                title="緊湊間距"
              >
                緊湊
              </button>
              <button 
                className={`toggle-btn ${rowSpacing === 'normal' ? 'active' : ''}`}
                onClick={() => setRowSpacing('normal')}
                title="標準間距"
              >
                標準
              </button>
              <button 
                className={`toggle-btn ${rowSpacing === 'relaxed' ? 'active' : ''}`}
                onClick={() => setRowSpacing('relaxed')}
                title="寬鬆間距"
              >
                寬鬆
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 機種一覽表 (表格視圖) */}
      <div className={`project-table-wrapper glass-card size-${fontSize} spacing-${rowSpacing}`}>
        <table className="project-table">
          <thead>
            <tr>
              <th>📁 機種與一覽表名稱</th>
              <th>📊 雙向資訊對齊率</th>
              <th className="hide-on-mobile">🏷️ 對齊狀態</th>
              <th className="hide-on-mobile">🕒 更新時間</th>
              <th className="text-center">⚙️ 動作</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty-state">
                  <span className="empty-icon">📂</span>
                  <h4>無符合此篩選條件的機種</h4>
                  <p>請點選上方「新增機種」或變更篩選狀態。</p>
                </td>
              </tr>
            ) : (
              paginatedProjects.map((proj) => {
                const dateStr = new Date(proj.updatedAt).toLocaleString('zh-TW', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr key={proj.id}>
                    <td className="proj-name-cell">
                      <span className="proj-folder-icon">📂</span>
                      <span className="proj-name-text" title={proj.name}>{proj.name}</span>
                    </td>
                    <td>
                      <div className="table-progress-wrapper">
                        <div className="table-progress-bar-bg">
                          <div 
                            className={`table-progress-bar-fg ${proj.alignmentRate === 100 ? 'completed' : ''}`}
                            style={{ width: `${proj.alignmentRate}%` }}
                          ></div>
                        </div>
                        <span className={`table-progress-rate ${proj.alignmentRate === 100 ? 'aligned' : ''}`}>
                          {proj.alignmentRate}%
                        </span>
                      </div>
                    </td>
                    <td className="hide-on-mobile">
                      <span className={`status-badge ${proj.alignmentRate === 100 ? 'aligned' : 'in-progress'}`}>
                        {proj.alignmentRate === 100 ? '已對齊 ✓' : '進行中 ⏳'}
                      </span>
                    </td>
                    <td className="table-date-cell hide-on-mobile">{dateStr}</td>
                    <td>
                      <div className="table-actions-cell">
                        <button 
                          className="btn btn-primary compact-btn table-action-btn btn-edit"
                          onClick={() => onSelectProject(proj.id)}
                        >
                          ✏️ 進入編輯
                        </button>
                        <button 
                          className="btn btn-danger compact-btn table-action-btn btn-delete"
                          onClick={() => {
                            if (confirm(`確定要刪除「${proj.name}」嗎？此操作無法還原。`)) {
                              onDeleteProject(proj.id);
                            }
                          }}
                        >
                          🗑️ 刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 分頁控制元件 */}
      {filteredProjects.length > itemsPerPage && (
        <div className="table-pagination glass-card">
          <button 
            className="pagination-btn"
            disabled={validCurrentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            title="上一頁"
          >
            ◀
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-number-btn ${validCurrentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button 
            className="pagination-btn"
            disabled={validCurrentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            title="下一頁"
          >
            ▶
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content glass-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>建立新機種</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="projectName">機種與一覽表名稱</label>
                  <input 
                    type="text" 
                    id="projectName" 
                    placeholder="例如：新機種製作需求一覽表2026_機種A" 
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    required
                    autoFocus
                  />
                  <p className="form-help">系統將自動以此名稱複製預設範本，建立包含基本與防呆管制的全新機種表單。</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  建立機種
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

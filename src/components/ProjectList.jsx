import React, { useState, useRef } from 'react';
import './ProjectList.css';

export default function ProjectList({ projects, onSelectProject, onCreateProject, onDeleteProject, onImportExcel }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

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

      <div className="project-grid">
        {projects.length === 0 ? (
          <div className="no-projects glass-card text-center">
            <span className="no-projects-icon">📁</span>
            <h3>目前沒有任何機種資料</h3>
            <p>請點選上方「新增機種」或「匯入 Excel 機種」開始您的對齊流程。</p>
          </div>
        ) : (
          projects.map((proj) => {
            const dateStr = new Date(proj.updatedAt).toLocaleString('zh-TW', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={proj.id} className="project-card glass-card">
                <div className="project-card-header">
                  <div className="project-icon">📂</div>
                  <div className="project-meta">
                    <h3 className="project-title" title={proj.name}>{proj.name}</h3>
                    <span className="project-date">更新於：{dateStr}</span>
                  </div>
                </div>

                <div className="project-card-body">
                  <div className="progress-section">
                    <div className="progress-label">
                      <span>雙向資訊對齊率</span>
                      <span className={`progress-percentage ${proj.alignmentRate === 100 ? 'aligned' : ''}`}>
                        {proj.alignmentRate}%
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className={`progress-bar-fill ${proj.alignmentRate === 100 ? 'completed' : ''}`}
                        style={{ width: `${proj.alignmentRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="project-card-footer">
                  <button 
                    className="btn btn-primary compact-btn"
                    onClick={() => onSelectProject(proj.id)}
                  >
                    ✏️ 進入編輯
                  </button>
                  <button 
                    className="btn btn-danger compact-btn"
                    onClick={() => {
                      if (confirm(`確定要刪除「${proj.name}」嗎？此操作無法還原。`)) {
                        onDeleteProject(proj.id);
                      }
                    }}
                  >
                    🗑️ 刪除
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

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

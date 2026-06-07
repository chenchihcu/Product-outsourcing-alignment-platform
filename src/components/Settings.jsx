import React, { useState } from 'react';
import './Settings.css';

export default function Settings({
  factories,
  onAddFactory,
  onRemoveFactory,
  accounts,
  onAddAccount,
  onRemoveAccount,
  currentUser
}) {
  const [newFactory, setNewFactory] = useState('');
  
  // 新增帳號表單 State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('研發單位');
  const [newRole, setNewRole] = useState('rd');
  const [newLevel, setNewLevel] = useState('Standard');

  const handleAddFactorySubmit = (e) => {
    e.preventDefault();
    if (!newFactory.trim()) return;
    onAddFactory(newFactory.trim());
    setNewFactory('');
  };

  const handleAddAccountSubmit = (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !newName.trim()) {
      alert('請填寫所有必要欄位！');
      return;
    }

    if (accounts.some(a => a.username === newUsername.trim())) {
      alert('該帳號已存在！');
      return;
    }

    const newAcc = {
      username: newUsername.trim(),
      password: newPassword.trim(),
      name: newName.trim(),
      unit: newUnit,
      role: newRole,
      level: newLevel
    };

    onAddAccount(newAcc);
    setNewUsername('');
    setNewPassword('');
    setNewName('');
    alert('使用者帳號新增成功！');
  };

  const handleUnitChange = (val) => {
    setNewUnit(val);
    // 自動對應角色代碼以防呆
    if (val === '研發單位') setNewRole('rd');
    else if (val === '工程單位') setNewRole('eng');
    else if (val === '審核單位(品保處)') setNewRole('qa');
    else setNewRole('admin');
  };

  return (
    <div className="settings-container animate-fade-in">
      <h2 className="section-title">⚙️ 系統資料與權限設定管理</h2>
      <p className="section-subtitle">
        在此管理委外加工廠的基本資料，並設定各單位的登入帳號、密碼與權限等級。
      </p>

      <div className="settings-grid">
        {/* 1. 委外加工廠基本資料管理 */}
        <div className="settings-section-card glass-card">
          <h3>🏭 委外加工廠基本資料管理</h3>
          <p className="card-desc">
            建立委外加工廠名稱後，可在「A. 產品基本資料」的選單中直接選擇，不需人工填寫。
          </p>

          <form onSubmit={handleAddFactorySubmit} className="settings-form-inline">
            <input
              type="text"
              className="form-input edit-active"
              placeholder="輸入新加工廠名稱 (例如: 鴻海)"
              value={newFactory}
              onChange={(e) => setNewFactory(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              新增
            </button>
          </form>

          <div className="factory-list-wrapper">
            {factories.length === 0 ? (
              <p className="no-data-text">目前無加工廠資料，請於上方新增。</p>
            ) : (
              <ul className="settings-list">
                {factories.map((fac, idx) => (
                  <li key={idx} className="settings-list-item">
                    <span>{fac}</span>
                    <button
                      className="btn-delete-item"
                      onClick={() => onRemoveFactory(fac)}
                      title="刪除此加工廠"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 2. 帳號權限設定 */}
        <div className="settings-section-card glass-card">
          <h3>👥 系統使用者與權限等級設定</h3>
          <p className="card-desc">管理各單位的使用者帳號、密碼及對應的填寫審核權限。</p>

          <div className="accounts-layout">
            {/* 新增帳號 */}
            <form onSubmit={handleAddAccountSubmit} className="add-account-form">
              <h4>新增帳號：</h4>
              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label">登入帳號 <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-input edit-active"
                    placeholder="帳號"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">密碼 <span className="req">*</span></label>
                  <input
                    type="password"
                    className="form-input edit-active"
                    placeholder="密碼"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row-grid" style={{ marginTop: '8px' }}>
                <div className="form-group">
                  <label className="form-label">使用者姓名 <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-input edit-active"
                    placeholder="例如: 王小明"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">權限等級</label>
                  <select
                    className="form-input edit-active"
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                  >
                    <option value="Standard">Standard (一般編輯)</option>
                    <option value="Administrator">Administrator (最高權限)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '8px' }}>
                <label className="form-label">所屬單位</label>
                <select
                  className="form-input edit-active"
                  value={newUnit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                >
                  <option value="研發單位">研發單位 (EVT / DVT 負責)</option>
                  <option value="工程單位">工程單位 (PVT / Pilot-run 負責)</option>
                  <option value="審核單位(品保處)">審核單位 (品保處 - 僅審核)</option>
                  <option value="管理處">管理處 (Admin 級別)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-secondary btn-block" style={{ marginTop: '12px' }}>
                ➕ 新增使用者帳號
              </button>
            </form>

            <div className="accounts-list-wrapper">
              <h4>現有使用者帳號清單：</h4>
              <div className="accounts-table-container">
                <table className="settings-table">
                  <thead>
                    <tr>
                      <th>姓名</th>
                      <th>單位</th>
                      <th>帳號</th>
                      <th>密碼</th>
                      <th>權限</th>
                      <th>動作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc) => (
                      <tr key={acc.username} className={currentUser.username === acc.username ? 'current-user-row' : ''}>
                        <td>{acc.name} {currentUser.username === acc.username && '(您)'}</td>
                        <td>{acc.unit}</td>
                        <td><code>{acc.username}</code></td>
                        <td><code>{acc.password}</code></td>
                        <td><span className={`badge-level ${acc.level}`}>{acc.level}</span></td>
                        <td>
                          <button
                            className="btn-delete-account"
                            disabled={currentUser.username === acc.username || ['rd', 'eng', 'qa', 'admin'].includes(acc.username)}
                            onClick={() => onRemoveAccount(acc.username)}
                            title={
                              currentUser.username === acc.username
                                ? '無法刪除目前登入的帳號'
                                : ['rd', 'eng', 'qa', 'admin'].includes(acc.username)
                                ? '系統預設帳號無法刪除'
                                : '刪除此帳號'
                            }
                          >
                            刪除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import './LoginModal.css';

export default function LoginModal({ onLogin, defaultAccounts }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const account = defaultAccounts.find(
      (a) => a.username === username && a.password === password
    );
    if (account) {
      onLogin(account);
      setError('');
    } else {
      setError('帳號或密碼錯誤！');
    }
  };

  const handleQuickLogin = (acc) => {
    setUsername(acc.username);
    setPassword(acc.password);
    onLogin(acc);
  };

  return (
    <div className="login-overlay">
      <div className="login-card glass-card animate-fade-in">
        <div className="login-header">
          <span className="login-logo-icon">🔐</span>
          <h2>系統登入 / 權限驗證</h2>
          <p>新機種委外加工對齊系統防呆平台</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error-msg">{error}</div>}
          
          <div className="form-group">
            <label className="form-label">使用者帳號</label>
            <input
              type="text"
              className="form-input edit-active"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="請輸入帳號"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">密碼</label>
            <input
              type="password"
              className="form-input edit-active"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '16px' }}>
            確認登入
          </button>
        </form>

        <div className="quick-login-section">
          <p className="quick-login-title">⚡ 快速測試登入 (免手動輸入)：</p>
          <div className="quick-login-grid">
            {defaultAccounts.map((acc) => (
              <button
                key={acc.username}
                className={`quick-login-btn role-${acc.role}`}
                onClick={() => handleQuickLogin(acc)}
              >
                <strong>{acc.name}</strong>
                <span>({acc.unit})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

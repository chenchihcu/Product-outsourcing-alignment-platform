import { useState } from 'react';
import './LoginModal.css';
import { isSupabaseEnabled } from '../data/supabaseClient';
import { signIn } from '../data/auth';

export default function LoginModal({ onLogin, defaultAccounts }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const performLocalLogin = (uname, pw) => {
    const account = defaultAccounts.find((a) => a.username === uname && a.password === pw);
    if (account) { onLogin(account); setError(''); return true; }
    setError('帳號或密碼錯誤！');
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSupabaseEnabled) { performLocalLogin(username, password); return; }

    setBusy(true); setError('');
    try {
      const user = await signIn(username, password);
      if (user) onLogin(user);
      else setError('登入失敗，請確認帳號與密碼。');
    } catch (err) {
      setError(err?.message || '操作失敗，請稍後再試。');
    } finally {
      setBusy(false);
    }
  };

  const handleQuickLogin = (acc) => {
    setUsername(acc.username);
    setPassword(acc.password);
    // 先讓 state 更新 flush 到輸入欄位，再執行登入
    setTimeout(() => performLocalLogin(acc.username, acc.password), 0);
  };

  return (
    <div className="login-overlay">
      <div className="login-card glass-card animate-fade-in">
        <div className="login-header">
          <span className="login-logo-icon">🔐</span>
          <h2>系統登入 / 權限驗證</h2>
          <p>醫電鼎眾 Mitcorp | 產品委外加工資訊系統</p>
          <div className="login-mode-tag">
            {isSupabaseEnabled ? '☁ 雲端帳號(跨裝置同步)' : '💾 本機模式(離線)'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error-msg">{error}</div>}

          <div className="form-group">
            <label className="form-label">帳號</label>
            <input
              type="text"
              className="form-input edit-active"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="請輸入帳號(例:pe)" name="username"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
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
              placeholder="請輸入密碼" name="password"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '16px' }} disabled={busy}>
            {busy ? '驗證中…' : '確認登入'}
          </button>

          {isSupabaseEnabled && (
            <p className="login-contact-hint">
              尚無帳號？請聯絡系統管理員開通。
            </p>
          )}
        </form>

        {!isSupabaseEnabled && (
          <div className="quick-login-section">
            <p className="quick-login-title">⚡ 快速測試登入 (免手動輸入)：</p>
            <div className="quick-login-grid">
              {defaultAccounts.map((acc) => (
                <button
                  key={acc.username}
                  className={`quick-login-btn role-${acc.role}`}
                  onClick={() => handleQuickLogin(acc)}
                >
                  <strong>{acc.username}</strong>
                  <span>{acc.unit}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


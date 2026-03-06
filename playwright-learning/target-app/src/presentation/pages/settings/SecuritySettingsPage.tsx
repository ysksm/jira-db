import { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';

export function SecuritySettingsPage() {
  const { settings, loading, saveSettings } = useSettings();
  const [saved, setSaved] = useState(false);

  if (loading || !settings) return <div className="loading" role="status">読み込み中...</div>;

  const sec = settings.security;

  const handleSave = async (updates: Partial<typeof sec>) => {
    const updated = { ...settings, security: { ...sec, ...updates } };
    await saveSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: 16 }}>セキュリティ設定</h2>
      {saved && <div role="status" style={{ color: '#16a34a', marginBottom: 12 }}>設定を保存しました</div>}

      <form aria-label="セキュリティ設定フォーム" onSubmit={(e) => e.preventDefault()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontWeight: 500 }}>二要素認証</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>ログイン時に追加の認証コードを要求します</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={sec.twoFactorEnabled} onChange={() => handleSave({ twoFactorEnabled: !sec.twoFactorEnabled })} aria-label="二要素認証" />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label htmlFor="sessionTimeout">セッションタイムアウト（分）</label>
          <input id="sessionTimeout" type="number" value={sec.sessionTimeout} onChange={(e) => handleSave({ sessionTimeout: Number(e.target.value) })} min={5} max={120} style={{ width: 120 }} />
        </div>

        <div className="form-group">
          <label htmlFor="passwordMinLength">パスワード最小文字数</label>
          <input id="passwordMinLength" type="number" value={sec.passwordMinLength} onChange={(e) => handleSave({ passwordMinLength: Number(e.target.value) })} min={6} max={32} style={{ width: 120 }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontWeight: 500 }}>特殊文字必須</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>パスワードに特殊文字を必須にします</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={sec.requireSpecialChars} onChange={() => handleSave({ requireSpecialChars: !sec.requireSpecialChars })} aria-label="特殊文字必須" />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </form>
    </div>
  );
}

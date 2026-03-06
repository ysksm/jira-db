import { useState } from 'react';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useSettings } from '../../hooks/useSettings';

export function GeneralSettingsPage() {
  const { settings, loading, saveSettings } = useSettings();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<{ siteName: string; language: 'ja' | 'en'; timezone: string; dateFormat: string } | null>(null);

  if (loading || !settings) return <div className="loading" role="status">読み込み中...</div>;
  const data = form || settings.general;

  const handleSave = async () => {
    if (form) {
      await saveSettings({ ...settings, general: form });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: 16 }}>一般設定</h2>
        <form aria-label="一般設定フォーム" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="form-group">
            <label htmlFor="siteName">サイト名</label>
            <input id="siteName" value={data.siteName} onChange={(e) => setForm({ ...data, siteName: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="language">言語</label>
            <select id="language" value={data.language} onChange={(e) => setForm({ ...data, language: e.target.value as 'ja' | 'en' })}>
              <option value="ja">日本語</option><option value="en">English</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="timezone">タイムゾーン</label>
            <input id="timezone" value={data.timezone} onChange={(e) => setForm({ ...data, timezone: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="dateFormat">日付フォーマット</label>
            <input id="dateFormat" value={data.dateFormat} onChange={(e) => setForm({ ...data, dateFormat: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary">保存</button>
          {saved && <span role="status" style={{ marginLeft: 12, color: '#16a34a' }}>保存しました</span>}
        </form>
      </div>
    </div>
  );
}

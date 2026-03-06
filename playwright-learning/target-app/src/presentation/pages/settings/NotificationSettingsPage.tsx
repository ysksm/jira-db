import { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';

export function NotificationSettingsPage() {
  const { settings, loading, saveSettings } = useSettings();
  const [saved, setSaved] = useState(false);

  if (loading || !settings) return <div className="loading" role="status">読み込み中...</div>;

  const toggleSetting = async (key: keyof typeof settings.notifications) => {
    const updated = { ...settings, notifications: { ...settings.notifications, [key]: !settings.notifications[key] } };
    await saveSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const items = [
    { key: 'emailNotifications' as const, label: 'メール通知', desc: '重要な更新をメールで受け取ります' },
    { key: 'orderAlerts' as const, label: '注文アラート', desc: '新規注文時に通知を受け取ります' },
    { key: 'stockAlerts' as const, label: '在庫アラート', desc: '在庫が少なくなった際に通知を受け取ります' },
    { key: 'newsletterSubscription' as const, label: 'ニュースレター', desc: '最新のニュースやアップデートを受け取ります' },
  ];

  return (
    <div className="card">
      <h2 style={{ marginBottom: 16 }}>通知設定</h2>
      {saved && <div role="status" style={{ color: '#16a34a', marginBottom: 12 }}>設定を保存しました</div>}
      <div role="list" aria-label="通知設定一覧">
        {items.map((item) => (
          <div key={item.key} role="listitem" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{item.desc}</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={settings.notifications[item.key]} onChange={() => toggleSetting(item.key)} aria-label={item.label} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

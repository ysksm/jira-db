import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';

const settingsTabs = [
  { to: '/settings/general', label: '一般設定' },
  { to: '/settings/notifications', label: '通知設定' },
  { to: '/settings/security', label: 'セキュリティ' },
];

export function SettingsPage() {
  const location = useLocation();
  const isRoot = location.pathname === '/settings';

  return (
    <div>
      <Breadcrumb items={[{ label: '設定' }]} />
      <div className="page-header"><h1>設定</h1></div>
      <div className="tabs" role="tablist" aria-label="設定カテゴリ">
        {settingsTabs.map((tab) => (
          <Link key={tab.to} to={tab.to} role="tab" aria-selected={location.pathname === tab.to}
            className={`tab ${location.pathname === tab.to ? 'active' : ''}`} style={{ textDecoration: 'none' }}>
            {tab.label}
          </Link>
        ))}
      </div>
      {isRoot ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
          上のタブから設定カテゴリを選択してください
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
}

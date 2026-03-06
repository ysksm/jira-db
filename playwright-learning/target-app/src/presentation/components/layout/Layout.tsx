import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">メインコンテンツへスキップ</a>
      <Sidebar />
      <main
        id="main-content"
        role="main"
        aria-label="メインコンテンツ"
        style={{
          marginLeft: 'var(--sidebar-width)',
          flex: 1,
          padding: '32px',
          minWidth: 0,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

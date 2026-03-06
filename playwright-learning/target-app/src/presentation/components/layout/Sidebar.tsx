import { NavLink } from 'react-router-dom';

const menuItems = [
  { to: '/dashboard', label: 'ダッシュボード', icon: '📊' },
  { to: '/users', label: 'ユーザー管理', icon: '👥' },
  { to: '/products', label: '商品管理', icon: '📦' },
  { to: '/orders', label: '注文管理', icon: '🛒' },
  { to: '/settings', label: '設定', icon: '⚙️' },
];

export function Sidebar() {
  return (
    <nav aria-label="メインナビゲーション" style={styles.sidebar}>
      <div style={styles.logo} role="banner">
        <h1 style={styles.logoText}>EC管理</h1>
      </div>
      <ul style={styles.menu} role="menubar" aria-label="メインメニュー">
        {menuItems.map((item) => (
          <li key={item.to} role="none">
            <NavLink
              to={item.to}
              role="menuitem"
              aria-label={item.label}
              style={({ isActive }) => ({
                ...styles.menuItem,
                ...(isActive ? styles.menuItemActive : {}),
              })}
            >
              <span aria-hidden="true" style={styles.icon}>{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 'var(--sidebar-width)',
    height: '100vh',
    background: '#1e293b',
    color: 'white',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  logo: { padding: '20px 24px', borderBottom: '1px solid #334155' },
  logoText: { fontSize: '20px', fontWeight: 700 },
  menu: { listStyle: 'none', padding: '12px 0' },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    color: '#94a3b8',
    textDecoration: 'none',
    transition: 'all 0.2s',
    fontSize: '15px',
  },
  menuItemActive: {
    color: 'white',
    background: '#334155',
    borderLeft: '3px solid #3b82f6',
  },
  icon: { fontSize: '18px' },
};

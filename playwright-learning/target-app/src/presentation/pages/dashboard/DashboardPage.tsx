import { Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useUsers } from '../../hooks/useUsers';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';

export function DashboardPage() {
  const { users } = useUsers();
  const { products } = useProducts();
  const { orders } = useOrders();

  const stats = [
    { label: 'ユーザー数', value: users.length, link: '/users' },
    { label: '商品数', value: products.length, link: '/products' },
    { label: '注文数', value: orders.length, link: '/orders' },
    { label: '売上合計', value: `¥${orders.reduce((s, o) => s + o.totalAmount.amount, 0).toLocaleString()}`, link: '/orders' },
  ];

  const recentOrders = [...orders].sort((a, b) => b.orderedAt.getTime() - a.orderedAt.getTime()).slice(0, 5);

  return (
    <div>
      <Breadcrumb items={[{ label: 'ダッシュボード' }]} />
      <div className="page-header">
        <h1>ダッシュボード</h1>
      </div>

      <section aria-label="統計情報">
        <div className="stats-grid">
          {stats.map((s) => (
            <Link to={s.link} key={s.label} className="card stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="stat-value" aria-label={s.label}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="最近の注文">
        <div className="card">
          <h2 style={{ marginBottom: 16 }}>最近の注文</h2>
          <table aria-label="最近の注文一覧">
            <thead>
              <tr>
                <th scope="col">注文ID</th>
                <th scope="col">顧客名</th>
                <th scope="col">金額</th>
                <th scope="col">ステータス</th>
                <th scope="col">詳細</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customerName}</td>
                  <td>¥{o.totalAmount.amount.toLocaleString()}</td>
                  <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                  <td><Link to={`/orders/${o.id}`} aria-label={`注文 ${o.id} の詳細`}>詳細</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-label="アクティビティ" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginBottom: 16 }}>クイックアクション</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/users/new"><button className="btn-primary" type="button">ユーザー追加</button></Link>
            <Link to="/products/new"><button className="btn-primary" type="button">商品追加</button></Link>
            <Link to="/dashboard/reports"><button className="btn-secondary" type="button">レポート表示</button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

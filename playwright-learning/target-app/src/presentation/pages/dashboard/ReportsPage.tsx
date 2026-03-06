import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useOrders } from '../../hooks/useOrders';

export function ReportsPage() {
  const { orders } = useOrders();

  const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const monthlyRevenue = orders.reduce<Record<string, number>>((acc, o) => {
    const key = `${o.orderedAt.getFullYear()}/${String(o.orderedAt.getMonth() + 1).padStart(2, '0')}`;
    acc[key] = (acc[key] || 0) + o.totalAmount.amount;
    return acc;
  }, {});

  return (
    <div>
      <Breadcrumb items={[{ label: 'ダッシュボード', to: '/dashboard' }, { label: 'レポート' }]} />
      <div className="page-header"><h1>レポート</h1></div>

      <section aria-label="注文ステータス別集計">
        <div className="card">
          <h2 style={{ marginBottom: 16 }}>注文ステータス別</h2>
          <table aria-label="ステータス別注文数">
            <thead><tr><th scope="col">ステータス</th><th scope="col">件数</th></tr></thead>
            <tbody>
              {Object.entries(byStatus).map(([status, count]) => (
                <tr key={status}><td><span className={`badge badge-${status}`}>{status}</span></td><td>{count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-label="月別売上" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginBottom: 16 }}>月別売上</h2>
          <table aria-label="月別売上一覧">
            <thead><tr><th scope="col">月</th><th scope="col">売上</th></tr></thead>
            <tbody>
              {Object.entries(monthlyRevenue).sort().map(([month, rev]) => (
                <tr key={month}><td>{month}</td><td>¥{rev.toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

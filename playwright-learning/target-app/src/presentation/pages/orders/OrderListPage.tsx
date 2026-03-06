import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useOrders } from '../../hooks/useOrders';
import { OrderStatus } from '../../../domain/entities/Order';
import { formatMoney } from '../../../domain/valueObjects/Money';

const statusLabels: Record<OrderStatus, string> = {
  pending: '保留中', confirmed: '確認済', shipped: '発送済', delivered: '配達済', cancelled: 'キャンセル',
};

export function OrderListPage() {
  const { orders, loading } = useOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  const tabFiltered = orders.filter((o) => {
    if (activeTab === 'active') return ['pending', 'confirmed', 'shipped'].includes(o.status);
    if (activeTab === 'completed') return ['delivered', 'cancelled'].includes(o.status);
    return true;
  });
  const filtered = tabFiltered.filter((o) => !statusFilter || o.status === statusFilter);

  if (loading) return <div className="loading" role="status">読み込み中...</div>;

  return (
    <div>
      <Breadcrumb items={[{ label: '注文管理' }]} />
      <div className="page-header"><h1>注文管理</h1></div>

      <div className="tabs" role="tablist" aria-label="注文フィルター">
        {(['all', 'active', 'completed'] as const).map((tab) => (
          <button key={tab} role="tab" aria-selected={activeTab === tab} className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}>
            {{ all: 'すべて', active: '進行中', completed: '完了' }[tab]}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="search-bar">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')} aria-label="ステータスフィルター" style={{ width: 180 }}>
            <option value="">すべてのステータス</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <table aria-label="注文一覧">
          <thead>
            <tr>
              <th scope="col">注文ID</th><th scope="col">顧客名</th><th scope="col">商品数</th>
              <th scope="col">合計金額</th><th scope="col">ステータス</th><th scope="col">注文日</th><th scope="col">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} data-testid={`order-row-${o.id}`}>
                <td><Link to={`/orders/${o.id}`}>{o.id}</Link></td>
                <td>{o.customerName}</td>
                <td>{o.items.length}点</td>
                <td>{formatMoney(o.totalAmount)}</td>
                <td><span className={`badge badge-${o.status}`}>{statusLabels[o.status]}</span></td>
                <td>{o.orderedAt.toLocaleDateString('ja-JP')}</td>
                <td><Link to={`/orders/${o.id}`}><button className="btn-secondary" type="button">詳細</button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div role="status" aria-live="polite" style={{ marginTop: 12, fontSize: 14, color: '#64748b' }}>{filtered.length}件の注文</div>
      </div>
    </div>
  );
}

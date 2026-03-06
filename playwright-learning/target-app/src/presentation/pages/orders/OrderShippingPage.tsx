import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Order } from '../../../domain/entities/Order';
import { useContainer } from '../../../di/ContainerContext';

export function OrderShippingPage() {
  const { orderId } = useParams();
  const { orderRepository } = useContainer();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) orderRepository.findById(orderId).then(setOrder);
  }, [orderId, orderRepository]);

  if (!order) return <div className="loading" role="status">読み込み中...</div>;

  const addr = order.shippingAddress;

  const trackingSteps = [
    { label: '注文受付', done: true, date: order.orderedAt.toLocaleDateString('ja-JP') },
    { label: '出荷準備', done: ['confirmed', 'shipped', 'delivered'].includes(order.status), date: '' },
    { label: '発送済', done: ['shipped', 'delivered'].includes(order.status), date: order.shippedAt?.toLocaleDateString('ja-JP') || '' },
    { label: '配達完了', done: order.status === 'delivered', date: order.deliveredAt?.toLocaleDateString('ja-JP') || '' },
  ];

  return (
    <div>
      <Breadcrumb items={[
        { label: '注文管理', to: '/orders' },
        { label: order.id, to: `/orders/${orderId}` },
        { label: '配送情報' },
      ]} />
      <div className="page-header"><h1>配送情報 - {order.id}</h1></div>

      <div className="card">
        <h2 style={{ marginBottom: 16 }}>配送先住所</h2>
        <div className="detail-grid">
          <div className="detail-item"><label>郵便番号</label><span>〒{addr.postalCode}</span></div>
          <div className="detail-item"><label>都道府県</label><span>{addr.prefecture}</span></div>
          <div className="detail-item"><label>市区町村</label><span>{addr.city}</span></div>
          <div className="detail-item"><label>住所</label><span>{addr.line1}{addr.line2 ? ` ${addr.line2}` : ''}</span></div>
        </div>
      </div>

      <section aria-label="配送トラッキング" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginBottom: 16 }}>配送ステータス</h2>
          <ol aria-label="配送進捗" style={{ listStyle: 'none', padding: 0 }}>
            {trackingSteps.map((step, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step.done ? '#16a34a' : '#e2e8f0', color: step.done ? 'white' : '#94a3b8', fontWeight: 600,
                }} aria-hidden="true">{i + 1}</span>
                <span style={{ fontWeight: step.done ? 600 : 400, color: step.done ? '#1e293b' : '#94a3b8' }}>{step.label}</span>
                {step.date && <span style={{ fontSize: 13, color: '#64748b', marginLeft: 'auto' }}>{step.date}</span>}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

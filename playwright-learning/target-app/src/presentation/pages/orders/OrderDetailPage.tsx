import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Order, OrderStatus } from '../../../domain/entities/Order';
import { useContainer } from '../../../di/ContainerContext';
import { formatMoney } from '../../../domain/valueObjects/Money';

const statusLabels: Record<OrderStatus, string> = {
  pending: '保留中', confirmed: '確認済', shipped: '発送済', delivered: '配達済', cancelled: 'キャンセル',
};

export function OrderDetailPage() {
  const { orderId } = useParams();
  const { orderRepository } = useContainer();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) orderRepository.findById(orderId).then(setOrder);
  }, [orderId, orderRepository]);

  const handleStatusChange = async (status: OrderStatus) => {
    if (orderId) {
      const updated = await orderRepository.updateStatus(orderId, status);
      setOrder(updated);
    }
  };

  if (!order) return <div className="loading" role="status">読み込み中...</div>;

  return (
    <div>
      <Breadcrumb items={[{ label: '注文管理', to: '/orders' }, { label: order.id }]} />
      <div className="page-header">
        <h1>注文 {order.id}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {order.status === 'pending' && <button className="btn-primary" onClick={() => handleStatusChange('confirmed')}>確認</button>}
          {order.status === 'confirmed' && <button className="btn-primary" onClick={() => handleStatusChange('shipped')}>発送</button>}
          {order.status === 'shipped' && <button className="btn-success" onClick={() => handleStatusChange('delivered')}>配達完了</button>}
          {!['delivered', 'cancelled'].includes(order.status) && (
            <button className="btn-danger" onClick={() => handleStatusChange('cancelled')}>キャンセル</button>
          )}
          <Link to={`/orders/${order.id}/shipping`}><button className="btn-secondary" type="button">配送情報</button></Link>
        </div>
      </div>

      <div className="card">
        <div className="detail-grid">
          <div className="detail-item"><label>顧客名</label><span>{order.customerName}</span></div>
          <div className="detail-item"><label>ステータス</label><span className={`badge badge-${order.status}`}>{statusLabels[order.status]}</span></div>
          <div className="detail-item"><label>注文日</label><span>{order.orderedAt.toLocaleDateString('ja-JP')}</span></div>
          <div className="detail-item"><label>合計金額</label><span>{formatMoney(order.totalAmount)}</span></div>
        </div>
      </div>

      <section aria-label="注文商品" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginBottom: 16 }}>注文商品</h2>
          <table aria-label="注文商品一覧">
            <thead>
              <tr><th scope="col">商品名</th><th scope="col">バリエーション</th><th scope="col">数量</th><th scope="col">単価</th><th scope="col">小計</th></tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.productName}</td><td>{item.variantName}</td><td>{item.quantity}</td>
                  <td>{formatMoney(item.unitPrice)}</td><td>¥{(item.unitPrice.amount * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

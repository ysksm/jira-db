import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Product } from '../../../domain/entities/Product';
import { useContainer } from '../../../di/ContainerContext';
import { formatMoney } from '../../../domain/valueObjects/Money';

export function ProductDetailPage() {
  const { productId } = useParams();
  const { productRepository } = useContainer();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (productId) productRepository.findById(productId).then(setProduct);
  }, [productId, productRepository]);

  if (!product) return <div className="loading" role="status">読み込み中...</div>;

  return (
    <div>
      <Breadcrumb items={[{ label: '商品管理', to: '/products' }, { label: product.name }]} />
      <div className="page-header">
        <h1>{product.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/products/${product.id}/edit`}><button className="btn-primary" type="button">編集</button></Link>
          <Link to={`/products/${product.id}/variants`}><button className="btn-secondary" type="button">バリエーション管理</button></Link>
        </div>
      </div>
      <div className="card">
        <div className="detail-grid">
          <div className="detail-item"><label>カテゴリ</label><span>{product.category}</span></div>
          <div className="detail-item"><label>ステータス</label><span className={`badge badge-${product.status === 'active' ? 'active' : 'draft'}`}>{product.status}</span></div>
          <div className="detail-item"><label>基本価格</label><span>{formatMoney(product.basePrice)}</span></div>
          <div className="detail-item"><label>タグ</label><span>{product.tags.join(', ')}</span></div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={{ fontWeight: 600 }}>説明</label>
          <p>{product.description}</p>
        </div>
      </div>

      <section aria-label="バリエーション一覧" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginBottom: 16 }}>バリエーション</h2>
          <table aria-label="バリエーション一覧">
            <thead>
              <tr><th scope="col">名前</th><th scope="col">SKU</th><th scope="col">価格</th><th scope="col">在庫</th><th scope="col">詳細</th></tr>
            </thead>
            <tbody>
              {product.variants.map((v) => (
                <tr key={v.id}>
                  <td>{v.name}</td><td>{v.sku}</td><td>{formatMoney(v.price)}</td><td>{v.stock}</td>
                  <td><Link to={`/products/${product.id}/variants/${v.id}`} aria-label={`${v.name}の詳細`}>詳細</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Product } from '../../../domain/entities/Product';
import { useContainer } from '../../../di/ContainerContext';
import { formatMoney } from '../../../domain/valueObjects/Money';

export function VariantListPage() {
  const { productId } = useParams();
  const { productRepository } = useContainer();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (productId) productRepository.findById(productId).then(setProduct);
  }, [productId, productRepository]);

  if (!product) return <div className="loading" role="status">読み込み中...</div>;

  return (
    <div>
      <Breadcrumb items={[
        { label: '商品管理', to: '/products' },
        { label: product.name, to: `/products/${productId}` },
        { label: 'バリエーション' },
      ]} />
      <div className="page-header">
        <h1>{product.name} - バリエーション管理</h1>
        <button className="btn-primary" type="button">新規バリエーション追加</button>
      </div>
      <div className="card">
        <table aria-label="バリエーション管理">
          <thead>
            <tr>
              <th scope="col">名前</th><th scope="col">SKU</th><th scope="col">価格</th>
              <th scope="col">在庫</th><th scope="col">操作</th>
            </tr>
          </thead>
          <tbody>
            {product.variants.map((v) => (
              <tr key={v.id}>
                <td><Link to={`/products/${productId}/variants/${v.id}`}>{v.name}</Link></td>
                <td>{v.sku}</td><td>{formatMoney(v.price)}</td><td>{v.stock}</td>
                <td>
                  <Link to={`/products/${productId}/variants/${v.id}/edit`}>
                    <button className="btn-secondary" type="button">編集</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

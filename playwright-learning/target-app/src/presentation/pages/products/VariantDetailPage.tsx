import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Product, ProductVariant } from '../../../domain/entities/Product';
import { useContainer } from '../../../di/ContainerContext';
import { formatMoney } from '../../../domain/valueObjects/Money';

export function VariantDetailPage() {
  const { productId, variantId } = useParams();
  const { productRepository } = useContainer();
  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (productId) {
      productRepository.findById(productId).then((p) => {
        if (p) {
          setProduct(p);
          setVariant(p.variants.find((v) => v.id === variantId) ?? null);
        }
      });
    }
  }, [productId, variantId, productRepository]);

  if (!product || !variant) return <div className="loading" role="status">読み込み中...</div>;

  return (
    <div>
      <Breadcrumb items={[
        { label: '商品管理', to: '/products' },
        { label: product.name, to: `/products/${productId}` },
        { label: 'バリエーション', to: `/products/${productId}/variants` },
        { label: variant.name },
      ]} />
      <div className="page-header">
        <h1>{variant.name}</h1>
        <Link to={`/products/${productId}/variants/${variantId}/edit`}>
          <button className="btn-primary" type="button">編集</button>
        </Link>
      </div>
      <div className="card">
        <div className="detail-grid">
          <div className="detail-item"><label>SKU</label><span>{variant.sku}</span></div>
          <div className="detail-item"><label>価格</label><span>{formatMoney(variant.price)}</span></div>
          <div className="detail-item"><label>在庫数</label><span>{variant.stock}</span></div>
          <div className="detail-item"><label>親商品</label><span>{product.name}</span></div>
        </div>
      </div>
    </div>
  );
}

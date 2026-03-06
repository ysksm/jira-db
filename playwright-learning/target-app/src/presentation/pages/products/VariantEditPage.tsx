import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Product } from '../../../domain/entities/Product';
import { useContainer } from '../../../di/ContainerContext';

export function VariantEditPage() {
  const { productId, variantId } = useParams();
  const navigate = useNavigate();
  const { productRepository } = useContainer();
  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', sku: '', price: 0, stock: 0 });

  useEffect(() => {
    if (productId) {
      productRepository.findById(productId).then((p) => {
        if (p) {
          setProduct(p);
          const v = p.variants.find((v) => v.id === variantId);
          if (v) setForm({ name: v.name, sku: v.sku, price: v.price.amount, stock: v.stock });
        }
      });
    }
  }, [productId, variantId, productRepository]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products/${productId}/variants/${variantId}`);
  };

  if (!product) return <div className="loading" role="status">読み込み中...</div>;

  const variant = product.variants.find((v) => v.id === variantId);

  return (
    <div>
      <Breadcrumb items={[
        { label: '商品管理', to: '/products' },
        { label: product.name, to: `/products/${productId}` },
        { label: 'バリエーション', to: `/products/${productId}/variants` },
        { label: variant?.name || '...', to: `/products/${productId}/variants/${variantId}` },
        { label: '編集' },
      ]} />
      <div className="page-header"><h1>バリエーション編集</h1></div>
      <div className="card">
        <form onSubmit={handleSubmit} aria-label="バリエーションフォーム">
          <div className="form-group">
            <label htmlFor="vname">バリエーション名</label>
            <input id="vname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="vsku">SKU</label>
            <input id="vsku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="vprice">価格（円）</label>
            <input id="vprice" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label htmlFor="vstock">在庫数</label>
            <input id="vstock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
            <button type="submit" className="btn-primary">保存</button>
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>キャンセル</button>
          </div>
        </form>
      </div>
    </div>
  );
}

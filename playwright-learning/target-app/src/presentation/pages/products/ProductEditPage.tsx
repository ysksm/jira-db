import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { ProductCategory, ProductStatus } from '../../../domain/entities/Product';
import { useContainer } from '../../../di/ContainerContext';
import { createProductId } from '../../../domain/valueObjects/ProductId';
import { createMoney } from '../../../domain/valueObjects/Money';

export function ProductEditPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { productRepository } = useContainer();
  const isNew = productId === 'new' || !productId;

  const [form, setForm] = useState({
    name: '', description: '', category: 'other' as ProductCategory, status: 'draft' as ProductStatus, basePrice: 0, tags: '',
  });

  useEffect(() => {
    if (!isNew && productId) {
      productRepository.findById(productId).then((p) => {
        if (p) setForm({ name: p.name, description: p.description, category: p.category, status: p.status, basePrice: p.basePrice.amount, tags: p.tags.join(', ') });
      });
    }
  }, [productId, isNew, productRepository]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await productRepository.save({
      id: isNew ? createProductId(`p${Date.now()}`) : createProductId(productId!),
      name: form.name, description: form.description, category: form.category, status: form.status,
      basePrice: createMoney(form.basePrice), tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      variants: [], createdAt: new Date(),
    });
    navigate(isNew ? '/products' : `/products/${productId}`);
  };

  return (
    <div>
      <Breadcrumb items={[
        { label: '商品管理', to: '/products' },
        ...(isNew ? [{ label: '新規作成' }] : [{ label: form.name || '...', to: `/products/${productId}` }, { label: '編集' }]),
      ]} />
      <div className="page-header"><h1>{isNew ? '新規商品' : '商品編集'}</h1></div>
      <div className="card">
        <form onSubmit={handleSubmit} aria-label="商品フォーム" noValidate>
          <div className="form-group">
            <label htmlFor="pname">商品名</label>
            <input id="pname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-required="true" />
          </div>
          <div className="form-group">
            <label htmlFor="pdesc">説明</label>
            <textarea id="pdesc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label htmlFor="pcat">カテゴリ</label>
            <select id="pcat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}>
              <option value="electronics">電子機器</option><option value="clothing">衣類</option>
              <option value="food">食品</option><option value="books">書籍</option><option value="other">その他</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="pprice">基本価格（円）</label>
            <input id="pprice" type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label htmlFor="ptags">タグ（カンマ区切り）</label>
            <input id="ptags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
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

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useProducts } from '../../hooks/useProducts';
import { ProductCategory } from '../../../domain/entities/Product';
import { formatMoney } from '../../../domain/valueObjects/Money';

export function ProductListPage() {
  const { products, loading, searchProducts, deleteProduct } = useProducts();
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<ProductCategory | ''>('');

  const filtered = products.filter((p) => !catFilter || p.category === catFilter);

  const handleSearch = () => searchProducts(query);

  if (loading) return <div className="loading" role="status">読み込み中...</div>;

  return (
    <div>
      <Breadcrumb items={[{ label: '商品管理' }]} />
      <div className="page-header">
        <h1>商品管理</h1>
        <Link to="/products/new"><button className="btn-primary" type="button">新規商品</button></Link>
      </div>
      <div className="card">
        <div className="search-bar">
          <input type="search" placeholder="商品名・タグで検索..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} aria-label="商品検索" />
          <button className="btn-primary" onClick={handleSearch} type="button">検索</button>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value as ProductCategory | '')} aria-label="カテゴリフィルター" style={{ width: 160 }}>
            <option value="">すべて</option>
            <option value="electronics">電子機器</option>
            <option value="clothing">衣類</option>
            <option value="food">食品</option>
            <option value="books">書籍</option>
            <option value="other">その他</option>
          </select>
        </div>
        <table aria-label="商品一覧">
          <thead>
            <tr>
              <th scope="col">商品名</th>
              <th scope="col">カテゴリ</th>
              <th scope="col">価格</th>
              <th scope="col">ステータス</th>
              <th scope="col">バリエーション</th>
              <th scope="col">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} data-testid={`product-row-${p.id}`}>
                <td><Link to={`/products/${p.id}`}>{p.name}</Link></td>
                <td>{p.category}</td>
                <td>{formatMoney(p.basePrice)}</td>
                <td><span className={`badge badge-${p.status === 'active' ? 'active' : 'draft'}`}>{p.status}</span></td>
                <td>{p.variants.length}種類</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/products/${p.id}/edit`}><button className="btn-secondary" type="button">編集</button></Link>
                    <button className="btn-danger" type="button" onClick={() => deleteProduct(p.id)} aria-label={`${p.name}を削除`}>削除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

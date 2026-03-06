import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useUsers } from '../../hooks/useUsers';
import { UserRole } from '../../../domain/entities/User';

export function UserListPage() {
  const { users, loading, deleteUser } = useUsers();
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = users
    .filter((u) => !roleFilter || u.role === roleFilter)
    .filter((u) => !searchQuery || u.name.includes(searchQuery) || u.email.includes(searchQuery));

  if (loading) return <div className="loading" role="status" aria-label="読み込み中">読み込み中...</div>;

  return (
    <div>
      <Breadcrumb items={[{ label: 'ユーザー管理' }]} />
      <div className="page-header">
        <h1>ユーザー管理</h1>
        <Link to="/users/new"><button className="btn-primary" type="button">新規ユーザー</button></Link>
      </div>

      <div className="card">
        <div className="search-bar">
          <input
            type="search"
            placeholder="名前・メールで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="ユーザー検索"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
            aria-label="ロールでフィルター"
            style={{ width: 160 }}
          >
            <option value="">すべてのロール</option>
            <option value="admin">管理者</option>
            <option value="editor">編集者</option>
            <option value="viewer">閲覧者</option>
          </select>
        </div>

        <table aria-label="ユーザー一覧">
          <thead>
            <tr>
              <th scope="col">名前</th>
              <th scope="col">メール</th>
              <th scope="col">ロール</th>
              <th scope="col">部署</th>
              <th scope="col">状態</th>
              <th scope="col">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} data-testid={`user-row-${user.id}`}>
                <td><Link to={`/users/${user.id}`}>{user.name}</Link></td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.department}</td>
                <td><span className={`badge badge-${user.isActive ? 'active' : 'inactive'}`}>{user.isActive ? '有効' : '無効'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/users/${user.id}/edit`}><button className="btn-secondary" type="button">編集</button></Link>
                    <button className="btn-danger" type="button" onClick={() => deleteUser(user.id)} aria-label={`${user.name}を削除`}>削除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div role="status" aria-live="polite" style={{ marginTop: 12, fontSize: 14, color: '#64748b' }}>
          {filtered.length}件のユーザー
        </div>
      </div>
    </div>
  );
}

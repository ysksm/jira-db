import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { User } from '../../../domain/entities/User';
import { useContainer } from '../../../di/ContainerContext';

export function UserDetailPage() {
  const { userId } = useParams();
  const { userRepository } = useContainer();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (userId) userRepository.findById(userId).then(setUser);
  }, [userId, userRepository]);

  if (!user) return <div className="loading" role="status">読み込み中...</div>;

  return (
    <div>
      <Breadcrumb items={[{ label: 'ユーザー管理', to: '/users' }, { label: user.name }]} />
      <div className="page-header">
        <h1>{user.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/users/${user.id}/edit`}><button className="btn-primary" type="button">編集</button></Link>
          <Link to={`/users/${user.id}/activity`}><button className="btn-secondary" type="button">アクティビティ</button></Link>
        </div>
      </div>
      <div className="card">
        <div className="detail-grid">
          <div className="detail-item"><label>メール</label><span>{user.email}</span></div>
          <div className="detail-item"><label>ロール</label><span>{user.role}</span></div>
          <div className="detail-item"><label>部署</label><span>{user.department}</span></div>
          <div className="detail-item"><label>状態</label><span className={`badge badge-${user.isActive ? 'active' : 'inactive'}`}>{user.isActive ? '有効' : '無効'}</span></div>
          <div className="detail-item"><label>登録日</label><span>{user.createdAt.toLocaleDateString('ja-JP')}</span></div>
        </div>
      </div>
    </div>
  );
}

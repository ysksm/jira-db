import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { User } from '../../../domain/entities/User';
import { useContainer } from '../../../di/ContainerContext';

const mockActivities = [
  { id: '1', action: 'ログイン', timestamp: new Date('2024-07-10T09:00:00'), ip: '192.168.1.1' },
  { id: '2', action: '商品を編集', timestamp: new Date('2024-07-10T10:30:00'), ip: '192.168.1.1' },
  { id: '3', action: '注文を確認', timestamp: new Date('2024-07-10T11:15:00'), ip: '192.168.1.1' },
  { id: '4', action: '設定を変更', timestamp: new Date('2024-07-09T14:00:00'), ip: '192.168.1.2' },
  { id: '5', action: 'ログアウト', timestamp: new Date('2024-07-09T18:00:00'), ip: '192.168.1.2' },
];

export function UserActivityPage() {
  const { userId } = useParams();
  const { userRepository } = useContainer();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (userId) userRepository.findById(userId).then(setUser);
  }, [userId, userRepository]);

  if (!user) return <div className="loading" role="status">読み込み中...</div>;

  return (
    <div>
      <Breadcrumb items={[
        { label: 'ユーザー管理', to: '/users' },
        { label: user.name, to: `/users/${userId}` },
        { label: 'アクティビティ' },
      ]} />
      <div className="page-header"><h1>{user.name} のアクティビティ</h1></div>
      <div className="card">
        <table aria-label="アクティビティ履歴">
          <thead>
            <tr>
              <th scope="col">日時</th>
              <th scope="col">アクション</th>
              <th scope="col">IPアドレス</th>
            </tr>
          </thead>
          <tbody>
            {mockActivities.map((a) => (
              <tr key={a.id}>
                <td>{a.timestamp.toLocaleString('ja-JP')}</td>
                <td>{a.action}</td>
                <td>{a.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

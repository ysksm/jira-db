import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { User, UserRole } from '../../../domain/entities/User';
import { useContainer } from '../../../di/ContainerContext';
import { createUserId } from '../../../domain/valueObjects/UserId';
import { createEmail } from '../../../domain/valueObjects/Email';

export function UserEditPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { userRepository } = useContainer();
  const isNew = userId === 'new' || !userId;

  const [form, setForm] = useState({ name: '', email: '', role: 'viewer' as UserRole, department: '', isActive: true });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isNew && userId) {
      userRepository.findById(userId).then((u) => {
        if (u) setForm({ name: u.name, email: u.email as string, role: u.role, department: u.department, isActive: u.isActive });
      });
    }
  }, [userId, isNew, userRepository]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = '名前は必須です';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = '有効なメールアドレスを入力してください';
    if (!form.department.trim()) errs.department = '部署は必須です';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const user: User = {
      id: isNew ? createUserId(`u${Date.now()}`) : createUserId(userId!),
      name: form.name,
      email: createEmail(form.email),
      role: form.role,
      department: form.department,
      isActive: form.isActive,
      createdAt: new Date(),
    };
    await userRepository.save(user);
    navigate(isNew ? '/users' : `/users/${userId}`);
  };

  const title = isNew ? '新規ユーザー' : 'ユーザー編集';
  const breadcrumbs = isNew
    ? [{ label: 'ユーザー管理', to: '/users' }, { label: '新規作成' }]
    : [{ label: 'ユーザー管理', to: '/users' }, { label: form.name || '...', to: `/users/${userId}` }, { label: '編集' }];

  return (
    <div>
      <Breadcrumb items={breadcrumbs} />
      <div className="page-header"><h1>{title}</h1></div>
      <div className="card">
        <form onSubmit={handleSubmit} aria-label="ユーザーフォーム" noValidate>
          <div className="form-group">
            <label htmlFor="name">名前 <span aria-hidden="true">*</span></label>
            <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-required="true" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
            {errors.name && <div id="name-error" role="alert" style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>{errors.name}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="email">メール <span aria-hidden="true">*</span></label>
            <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-required="true" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
            {errors.email && <div id="email-error" role="alert" style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>{errors.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="role">ロール</label>
            <select id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
              <option value="admin">管理者</option>
              <option value="editor">編集者</option>
              <option value="viewer">閲覧者</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="department">部署 <span aria-hidden="true">*</span></label>
            <input id="department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} aria-required="true" aria-invalid={!!errors.department} aria-describedby={errors.department ? 'dept-error' : undefined} />
            {errors.department && <div id="dept-error" role="alert" style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>{errors.department}</div>}
          </div>
          <div className="form-group">
            <label className="toggle-switch">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} aria-label="アカウント有効" />
              <span className="toggle-slider"></span>
            </label>
            <span style={{ marginLeft: 8 }}>{form.isActive ? '有効' : '無効'}</span>
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

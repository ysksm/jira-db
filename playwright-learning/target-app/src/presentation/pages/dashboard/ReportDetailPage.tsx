import { useParams } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';

export function ReportDetailPage() {
  const { reportType } = useParams();

  const reportData: Record<string, { title: string; description: string }> = {
    sales: { title: '売上レポート', description: '期間別の売上推移とカテゴリ別内訳を表示します。' },
    users: { title: 'ユーザーレポート', description: 'ユーザーの登録推移とアクティブ率を表示します。' },
    products: { title: '商品レポート', description: '商品別の売上とカテゴリ別パフォーマンスを表示します。' },
  };

  const report = reportData[reportType || ''] || { title: '不明なレポート', description: '' };

  return (
    <div>
      <Breadcrumb items={[
        { label: 'ダッシュボード', to: '/dashboard' },
        { label: 'レポート', to: '/dashboard/reports' },
        { label: report.title },
      ]} />
      <div className="page-header"><h1>{report.title}</h1></div>
      <div className="card">
        <p>{report.description}</p>
        <div style={{ marginTop: 24, padding: 40, textAlign: 'center', background: '#f1f5f9', borderRadius: 8 }}>
          <p style={{ color: '#64748b' }}>レポートデータ（デモ）</p>
        </div>
      </div>
    </div>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ContainerProvider } from './di/ContainerContext';
import { Layout } from './presentation/components/layout/Layout';
import { DashboardPage } from './presentation/pages/dashboard/DashboardPage';
import { ReportsPage } from './presentation/pages/dashboard/ReportsPage';
import { ReportDetailPage } from './presentation/pages/dashboard/ReportDetailPage';
import { UserListPage } from './presentation/pages/users/UserListPage';
import { UserDetailPage } from './presentation/pages/users/UserDetailPage';
import { UserEditPage } from './presentation/pages/users/UserEditPage';
import { UserActivityPage } from './presentation/pages/users/UserActivityPage';
import { ProductListPage } from './presentation/pages/products/ProductListPage';
import { ProductDetailPage } from './presentation/pages/products/ProductDetailPage';
import { ProductEditPage } from './presentation/pages/products/ProductEditPage';
import { VariantListPage } from './presentation/pages/products/VariantListPage';
import { VariantDetailPage } from './presentation/pages/products/VariantDetailPage';
import { VariantEditPage } from './presentation/pages/products/VariantEditPage';
import { OrderListPage } from './presentation/pages/orders/OrderListPage';
import { OrderDetailPage } from './presentation/pages/orders/OrderDetailPage';
import { OrderShippingPage } from './presentation/pages/orders/OrderShippingPage';
import { SettingsPage } from './presentation/pages/settings/SettingsPage';
import { GeneralSettingsPage } from './presentation/pages/settings/GeneralSettingsPage';
import { NotificationSettingsPage } from './presentation/pages/settings/NotificationSettingsPage';
import { SecuritySettingsPage } from './presentation/pages/settings/SecuritySettingsPage';

export default function App() {
  return (
    <ContainerProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Dashboard: 3 levels */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/reports" element={<ReportsPage />} />
            <Route path="/dashboard/reports/:reportType" element={<ReportDetailPage />} />

            {/* Users: 4 levels */}
            <Route path="/users" element={<UserListPage />} />
            <Route path="/users/new" element={<UserEditPage />} />
            <Route path="/users/:userId" element={<UserDetailPage />} />
            <Route path="/users/:userId/edit" element={<UserEditPage />} />
            <Route path="/users/:userId/activity" element={<UserActivityPage />} />

            {/* Products: 5 levels */}
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/new" element={<ProductEditPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/products/:productId/edit" element={<ProductEditPage />} />
            <Route path="/products/:productId/variants" element={<VariantListPage />} />
            <Route path="/products/:productId/variants/:variantId" element={<VariantDetailPage />} />
            <Route path="/products/:productId/variants/:variantId/edit" element={<VariantEditPage />} />

            {/* Orders: 4 levels */}
            <Route path="/orders" element={<OrderListPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route path="/orders/:orderId/shipping" element={<OrderShippingPage />} />

            {/* Settings: 3 levels */}
            <Route path="/settings" element={<SettingsPage />}>
              <Route path="general" element={<GeneralSettingsPage />} />
              <Route path="notifications" element={<NotificationSettingsPage />} />
              <Route path="security" element={<SecuritySettingsPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ContainerProvider>
  );
}

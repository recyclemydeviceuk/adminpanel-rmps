import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

/* ── Auth ───────────────────────────────────────────────────── */
import LoginPage from '../pages/auth/LoginPage';

/* ── Dashboard ──────────────────────────────────────────────── */
import DashboardPage from '../pages/dashboard/DashboardPage';

/* ── Orders ─────────────────────────────────────────────────── */
import OrdersPage from '../pages/orders/OrdersPage';
import OrderDetailPage from '../pages/orders/OrderDetailPage';

/* ── Customers ──────────────────────────────────────────────── */
import CustomersPage from '../pages/customers/CustomersPage';
import CustomerDetailPage from '../pages/customers/CustomerDetailPage';

/* ── Catalog ────────────────────────────────────────────────── */
import CatalogPage from '../pages/catalog/CatalogPage';

/* ── Devices ────────────────────────────────────────────────── */
import DevicesPage from '../pages/devices/DevicesPage';
import DeviceFormPage from '../pages/devices/DeviceFormPage';

/* ── Brands ─────────────────────────────────────────────────── */
import BrandsPage from '../pages/brands/BrandsPage';
import BrandFormPage from '../pages/brands/BrandFormPage';

/* ── Series ─────────────────────────────────────────────────── */
import SeriesPage from '../pages/series/SeriesPage';
import SeriesFormPage from '../pages/series/SeriesFormPage';

/* ── Models ─────────────────────────────────────────────────── */
import ModelsPage from '../pages/models/ModelsPage';
import ModelFormPage from '../pages/models/ModelFormPage';

/* ── Repairs ─────────────────────────────────────────────────── */
import RepairsPage from '../pages/repairs/RepairsPage';
import RepairFormPage from '../pages/repairs/RepairFormPage';

/* ── Addons ──────────────────────────────────────────────────── */
import AddonsPage from '../pages/addons/AddonsPage';
import AddonFormPage from '../pages/addons/AddonFormPage';

/* ── Blog ───────────────────────────────────────────────────── */
import BlogsPage from '../pages/blog/BlogsPage';
import BlogFormPage from '../pages/blog/BlogFormPage';

/* ── Forms ──────────────────────────────────────────────────── */
import NewsletterPage from '../pages/forms/NewsletterPage';
import ContactPage    from '../pages/forms/ContactPage';
import WarrantyPage   from '../pages/forms/WarrantyPage';

/* ── Settings ───────────────────────────────────────────────── */
import SettingsPage from '../pages/settings/SettingsPage';

/* ── 404 ────────────────────────────────────────────────────── */
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public: Auth ──────────────────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* ── Protected: Admin panel ────────────────────────── */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Orders */}
        <Route path="/orders"          element={<OrdersPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />

        {/* Customers */}
        <Route path="/customers"             element={<CustomersPage />} />
        <Route path="/customers/:customerId" element={<CustomerDetailPage />} />

        {/* Catalogue Overview */}
        <Route path="/catalog" element={<CatalogPage />} />

        {/* Devices — list + form pages */}
        <Route path="/devices"              element={<DevicesPage />} />
        <Route path="/devices/new"          element={<DeviceFormPage />} />
        <Route path="/devices/:deviceId/edit" element={<DeviceFormPage />} />

        {/* Brands — list + form pages */}
        <Route path="/brands"             element={<BrandsPage />} />
        <Route path="/brands/new"         element={<BrandFormPage />} />
        <Route path="/brands/:brandId/edit" element={<BrandFormPage />} />

        {/* Series — list + form pages */}
        <Route path="/series"              element={<SeriesPage />} />
        <Route path="/series/new"          element={<SeriesFormPage />} />
        <Route path="/series/:seriesId/edit" element={<SeriesFormPage />} />

        {/* Models — list + form pages */}
        <Route path="/models"              element={<ModelsPage />} />
        <Route path="/models/new"          element={<ModelFormPage />} />
        <Route path="/models/:modelId/edit" element={<ModelFormPage />} />

        {/* Legacy redirects */}
        <Route path="/catalog/brands/*" element={<Navigate to="/brands" replace />} />

        {/* Repairs */}
        <Route path="/repairs"                element={<RepairsPage />} />
        <Route path="/repairs/new"            element={<RepairFormPage />} />
        <Route path="/repairs/:repairId/edit" element={<RepairFormPage />} />

        {/* Addons */}
        <Route path="/addons"               element={<AddonsPage />} />
        <Route path="/addons/new"           element={<AddonFormPage />} />
        <Route path="/addons/:addonId/edit" element={<AddonFormPage />} />

        {/* Blog */}
        <Route path="/blog"               element={<BlogsPage />} />
        <Route path="/blog/new"            element={<BlogFormPage />} />
        <Route path="/blog/:postId/edit"   element={<BlogFormPage />} />

        {/* Forms */}
        <Route path="/forms/newsletter" element={<NewsletterPage />} />
        <Route path="/forms/contact"    element={<ContactPage />} />
        <Route path="/forms/warranty"   element={<WarrantyPage />} />

        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* ── 404 ───────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

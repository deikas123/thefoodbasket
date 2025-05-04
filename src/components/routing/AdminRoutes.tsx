
import { Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import LoadingFallback from "@/components/ui/LoadingFallback";

// Lazy load admin page components
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const Products = lazy(() => import("@/pages/admin/Products"));
const DiscountCodes = lazy(() => import("@/pages/admin/DiscountCodes"));
const Categories = lazy(() => import("@/pages/admin/Categories"));
const PayLaterVerification = lazy(() => import("@/pages/admin/PayLaterVerification"));
const DailyOffers = lazy(() => import("@/pages/admin/DailyOffers"));
const AdminNotifications = lazy(() => import("@/pages/admin/Notifications"));
const ContentManagement = lazy(() => import("@/pages/admin/ContentManagement"));

const AdminRoutes = () => {
  return (
    <>
      {/* Admin Login (outside of admin layout) */}
      <Route path="/admin/login" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLogin />
        </Suspense>
      } />
      
      {/* Admin Routes with AdminLayout */}
      <Route path="/admin" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="/admin/products" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <Products />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="/admin/categories" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <Categories />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="/admin/orders" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="/admin/users" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="/admin/deliveries" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="/admin/banners" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="/admin/discount-codes" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <DiscountCodes />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="/admin/daily-offers" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <DailyOffers />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="/admin/pay-later-verification" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <PayLaterVerification />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="/admin/delivery-zones" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="/admin/settings" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="/admin/notifications" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminNotifications />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="/admin/content-management" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <ContentManagement />
          </AdminLayout>
        </Suspense>
      } />
    </>
  );
};

export default AdminRoutes;

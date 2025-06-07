
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import LoadingFallback from "@/components/ui/LoadingFallback";

// Lazy load admin page components
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const Products = lazy(() => import("@/pages/admin/Products"));
const Tags = lazy(() => import("@/pages/admin/Tags"));
const DiscountCodes = lazy(() => import("@/pages/admin/DiscountCodes"));
const Categories = lazy(() => import("@/pages/admin/Categories"));
const PayLaterVerification = lazy(() => import("@/pages/admin/PayLaterVerification"));
const DailyOffers = lazy(() => import("@/pages/admin/DailyOffers"));
const AdminNotifications = lazy(() => import("@/pages/admin/Notifications"));
const ContentManagement = lazy(() => import("@/pages/admin/ContentManagement"));
const DeliveryOptions = lazy(() => import("@/pages/admin/DeliveryOptions"));
const DeliveryZones = lazy(() => import("@/pages/admin/DeliveryZones"));

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Admin Login (outside of admin layout) */}
      <Route path="login" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLogin />
        </Suspense>
      } />
      
      {/* Admin Routes with AdminLayout */}
      <Route path="" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="products" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <Products />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="categories" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <Categories />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="tags" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <Tags />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="orders" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="users" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="delivery-options" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <DeliveryOptions />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="banners" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="discount-codes" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <DiscountCodes />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="daily-offers" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <DailyOffers />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="pay-later-verification" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <PayLaterVerification />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="delivery-zones" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <DeliveryZones />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="settings" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="notifications" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminNotifications />
          </AdminLayout>
        </Suspense>
      } />
      <Route path="content-management" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <ContentManagement />
          </AdminLayout>
        </Suspense>
      } />
    </Routes>
  );
};

export default AdminRoutes;

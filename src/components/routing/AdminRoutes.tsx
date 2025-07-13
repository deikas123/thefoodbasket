import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Users = lazy(() => import("@/pages/admin/Users"));
const Orders = lazy(() => import("@/pages/admin/Orders"));
const Products = lazy(() => import("@/pages/admin/Products"));
const Categories = lazy(() => import("@/pages/admin/Categories"));
const Banners = lazy(() => import("@/pages/admin/Banners"));
const DailyOffers = lazy(() => import("@/pages/admin/DailyOffers"));
const Tags = lazy(() => import("@/pages/admin/Tags"));
const Deliveries = lazy(() => import("@/pages/admin/Deliveries"));
const DeliveryOptions = lazy(() => import("@/pages/admin/DeliveryOptions"));
const DeliveryZones = lazy(() => import("@/pages/admin/DeliveryZones"));
const DiscountCodes = lazy(() => import("@/pages/admin/DiscountCodes"));
const Notifications = lazy(() => import("@/pages/admin/Notifications"));
const ContentManagement = lazy(() => import("@/pages/admin/ContentManagement"));
const PayLaterVerification = lazy(() => import("@/pages/admin/PayLaterVerification"));
const LoyaltyManagement = lazy(() => import("@/pages/admin/LoyaltyManagement"));
const AutoReplenishAdmin = lazy(() => import("@/pages/admin/AutoReplenish"));
const Settings = lazy(() => import("@/pages/admin/Settings"));

const LoadingFallback = () => (
  <div className="p-6 space-y-4">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="banners" element={<Banners />} />
          <Route path="daily-offers" element={<DailyOffers />} />
          <Route path="tags" element={<Tags />} />
          <Route path="deliveries" element={<Deliveries />} />
          <Route path="delivery-options" element={<DeliveryOptions />} />
          <Route path="delivery-zones" element={<DeliveryZones />} />
          <Route path="discount-codes" element={<DiscountCodes />} />
          <Route path="loyalty" element={<LoyaltyManagement />} />
          <Route path="auto-replenish" element={<AutoReplenishAdmin />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="pay-later" element={<PayLaterVerification />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  );
};

export default AdminRoutes;

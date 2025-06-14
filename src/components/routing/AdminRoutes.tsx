
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import LoadingFallback from "@/components/ui/LoadingFallback";

// Lazy load admin page components
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Users = lazy(() => import("@/pages/admin/Users"));
const Products = lazy(() => import("@/pages/admin/Products"));
const Categories = lazy(() => import("@/pages/admin/Categories"));
const Orders = lazy(() => import("@/pages/admin/Orders"));
const Deliveries = lazy(() => import("@/pages/admin/Deliveries"));
const DeliveryOptions = lazy(() => import("@/pages/admin/DeliveryOptions"));
const DeliveryZones = lazy(() => import("@/pages/admin/DeliveryZones"));
const DiscountCodes = lazy(() => import("@/pages/admin/DiscountCodes"));
const Banners = lazy(() => import("@/pages/admin/Banners"));
const DailyOffers = lazy(() => import("@/pages/admin/DailyOffers"));
const Tags = lazy(() => import("@/pages/admin/Tags"));
const Notifications = lazy(() => import("@/pages/admin/Notifications"));
const ContentManagement = lazy(() => import("@/pages/admin/ContentManagement"));
const PayLaterVerification = lazy(() => import("@/pages/admin/PayLaterVerification"));
const LoyaltyManagement = lazy(() => import("@/pages/admin/LoyaltyManagement"));
const Settings = lazy(() => import("@/pages/admin/Settings"));

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/delivery-options" element={<DeliveryOptions />} />
          <Route path="/delivery-zones" element={<DeliveryZones />} />
          <Route path="/discount-codes" element={<DiscountCodes />} />
          <Route path="/banners" element={<Banners />} />
          <Route path="/daily-offers" element={<DailyOffers />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/content" element={<ContentManagement />} />
          <Route path="/pay-later-verification" element={<PayLaterVerification />} />
          <Route path="/loyalty" element={<LoyaltyManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  );
};

export default AdminRoutes;

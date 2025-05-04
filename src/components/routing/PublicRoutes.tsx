
import { Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingFallback from "@/components/ui/LoadingFallback";

// Lazy load public page components
const Shop = lazy(() => import("@/pages/Shop"));
const Category = lazy(() => import("@/pages/Category"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ProductDetails = lazy(() => import("@/pages/ProductDetails"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Profile = lazy(() => import("@/pages/Profile"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderDetails = lazy(() => import("@/pages/OrderDetails"));
const Wishlist = lazy(() => import("@/pages/Wishlist"));
const Wallet = lazy(() => import("@/pages/Wallet"));
const PayLater = lazy(() => import("@/pages/PayLater"));
const Promotions = lazy(() => import("@/pages/Promotions"));
const FoodBaskets = lazy(() => import("@/pages/FoodBaskets"));
const AutoReplenish = lazy(() => import("@/pages/AutoReplenish"));
const Notifications = lazy(() => import("@/pages/Notifications"));

export const PublicRoutes = () => {
  return (
    <>
      <Route path="/shop" element={
        <Suspense fallback={<LoadingFallback />}>
          <Shop />
        </Suspense>
      } />
      <Route path="/categories/:categoryId" element={
        <Suspense fallback={<LoadingFallback />}>
          <Category />
        </Suspense>
      } />
      <Route path="/login" element={
        <Suspense fallback={<LoadingFallback />}>
          <Login />
        </Suspense>
      } />
      <Route path="/register" element={
        <Suspense fallback={<LoadingFallback />}>
          <Register />
        </Suspense>
      } />
      <Route path="/product/:productId" element={
        <Suspense fallback={<LoadingFallback />}>
          <ProductDetails />
        </Suspense>
      } />
      <Route path="/checkout" element={
        <Suspense fallback={<LoadingFallback />}>
          <Checkout />
        </Suspense>
      } />
      <Route path="/profile" element={
        <Suspense fallback={<LoadingFallback />}>
          <Profile />
        </Suspense>
      } />
      <Route path="/orders" element={
        <Suspense fallback={<LoadingFallback />}>
          <Orders />
        </Suspense>
      } />
      <Route path="/orders/:orderId" element={
        <Suspense fallback={<LoadingFallback />}>
          <OrderDetails />
        </Suspense>
      } />
      <Route path="/wishlist" element={
        <Suspense fallback={<LoadingFallback />}>
          <Wishlist />
        </Suspense>
      } />
      <Route path="/wallet" element={
        <Suspense fallback={<LoadingFallback />}>
          <Wallet />
        </Suspense>
      } />
      <Route path="/pay-later" element={
        <Suspense fallback={<LoadingFallback />}>
          <PayLater />
        </Suspense>
      } />
      <Route path="/promotions" element={
        <Suspense fallback={<LoadingFallback />}>
          <Promotions />
        </Suspense>
      } />
      <Route path="/food-baskets" element={
        <Suspense fallback={<LoadingFallback />}>
          <FoodBaskets />
        </Suspense>
      } />
      <Route path="/auto-replenish" element={
        <Suspense fallback={<LoadingFallback />}>
          <AutoReplenish />
        </Suspense>
      } />
      <Route path="/notifications" element={
        <Suspense fallback={<LoadingFallback />}>
          <Notifications />
        </Suspense>
      } />
    </>
  );
};

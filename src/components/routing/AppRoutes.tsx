
import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const Home = lazy(() => import("@/pages/Index"));
const Shop = lazy(() => import("@/pages/Shop"));
const ProductDetails = lazy(() => import("@/pages/ProductDetails"));
const FoodBaskets = lazy(() => import("@/pages/FoodBaskets"));
const AutoReplenish = lazy(() => import("@/pages/AutoReplenish"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Profile = lazy(() => import("@/pages/Profile"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderDetails = lazy(() => import("@/pages/OrderDetails"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Wishlist = lazy(() => import("@/pages/Wishlist"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AdminRoutes = lazy(() => import("./AdminRoutes"));
const DeliveryRoutes = lazy(() => import("./DeliveryRoutes"));

import Timer from "@/pages/Timer";

const LoadingFallback = () => (
  <div className="flex flex-col min-h-screen">
    <div className="h-20 bg-background border-b" />
    <main className="flex-grow pt-8 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </main>
    <div className="h-20 bg-background border-t" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/food-baskets" element={<FoodBaskets />} />
        <Route path="/auto-replenish" element={<AutoReplenish />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/timer" element={<Timer />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* Delivery Routes */}
        <Route path="/delivery/*" element={<DeliveryRoutes />} />
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

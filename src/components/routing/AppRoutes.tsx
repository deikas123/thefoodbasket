import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";

const Home = lazy(() => import("@/pages/Home"));
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
const NotFound = lazy(() => import("@/pages/NotFound"));
const AdminRoutes = lazy(() => import("./AdminRoutes"));
const DeliveryRoutes = lazy(() => import("./DeliveryRoutes"));

import Timer from "@/pages/Timer";

const AppRoutes = () => {
  return (
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
      <Route path="/timer" element={<Timer />} />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      
      {/* Delivery Routes */}
      <Route path="/delivery/*" element={<DeliveryRoutes />} />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

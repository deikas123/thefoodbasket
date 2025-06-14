import { Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Shop from "@/pages/Shop";
import ProductDetails from "@/pages/ProductDetails";
import Category from "@/pages/Category";
import Recipes from "@/pages/Recipes";
import FoodBaskets from "@/pages/FoodBaskets";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import OrderDetails from "@/pages/OrderDetails";
import Wallet from "@/pages/Wallet";
import LoyaltyPoints from "@/pages/LoyaltyPoints";
import Profile from "@/pages/Profile";
import Addresses from "@/pages/Addresses";
import Orders from "@/pages/Orders";
import AdminRoutes from "@/components/routing/AdminRoutes";
import DeliveryRoutes from "@/components/routing/DeliveryRoutes";
import AutoReplenish from "@/pages/AutoReplenish";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/category/:category" element={<Category />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/food-baskets" element={<FoodBaskets />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/order/:id" element={<OrderDetails />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/auto-replenish" element={<AutoReplenish />} />
      <Route path="/loyalty" element={<LoyaltyPoints />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/addresses" element={<Addresses />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/delivery/*" element={<DeliveryRoutes />} />
    </Routes>
  );
};

export default AppRoutes;

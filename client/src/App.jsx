import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AddProduct from "./pages/AddProduct"; // farmer
import AddProducts from "./pages/AddProducts"; // distributor

import AdminDashboard from "./pages/AdminDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import ConsumerDashboard from "./pages/ConsumerDashboard";
import DistributorDashboard from "./pages/DistributorDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import Marketplace from "./pages/Marketplace";
import RetailerMarketplace from "./pages/RetailerMarketplace"; // ✅ ADDED
import Checkout from "./pages/Checkout";

import ProtectedRoute from "./components/ProtectedRoute";
import RetailerAddProduct from "./pages/RetailerAddProduct";
import ConsumerMarketplace from "./pages/ConsumerMarketplace";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* DASHBOARDS */}
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/farmer/dashboard"
          element={<ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>}
        />
        <Route
          path="/consumer/dashboard"
          element={<ProtectedRoute role="consumer"><ConsumerDashboard /></ProtectedRoute>}
        />
        <Route
          path="/distributor/dashboard"
          element={<ProtectedRoute role="distributor"><DistributorDashboard /></ProtectedRoute>}
        />
        <Route
          path="/retailer/dashboard"
          element={<ProtectedRoute role="retailer"><RetailerDashboard /></ProtectedRoute>}
        />

        {/* ADD PRODUCT PAGES */}
        <Route
          path="/farmer/AddProduct"
          element={<ProtectedRoute role="farmer"><AddProduct /></ProtectedRoute>}
        />
        <Route
          path="/add-products"
          element={<ProtectedRoute role="distributor"><AddProducts /></ProtectedRoute>}
        />

        {/* MARKETPLACE */}
        <Route path="/marketplace" element={<Marketplace />} />

        {/* ✅ RETAILER MARKETPLACE (NEW) */}
        <Route
  path="/retailer/marketplace"
  element={<RetailerMarketplace />}
/>
<Route path="/retailer-add-product" element={<RetailerAddProduct />} />
<Route path="/consumer-marketplace" element={<ConsumerMarketplace />} />

        {/* CHECKOUT */}
        <Route
          path="/checkout"
          element={<ProtectedRoute><Checkout /></ProtectedRoute>}
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
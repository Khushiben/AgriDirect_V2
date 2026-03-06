import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AddProduct from "./pages/AddProduct";
import AddProducts from "./pages/AddProducts";
import AdminDashboard from "./pages/AdminDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import ConsumerDashboard from "./pages/ConsumerDashboard";
import DistributorDashboard from "./pages/DistributorDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import Marketplace from "./pages/Marketplace";
import RetailerMarketplace from "./pages/RetailerMarketplace";
import Checkout from "./pages/Checkout";
import ProtectedRoute from "./components/ProtectedRoute";
import RetailerAddProduct from "./pages/RetailerAddProduct";
import ConsumerMarketplace from "./pages/ConsumerMarketplace";
import SetupProfile from "./pages/SetupProfile";

function App() {
  console.log('App component rendering...');
  
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/setup-profile" element={<ProtectedRoute><SetupProfile /></ProtectedRoute>} />
        
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/farmer/dashboard" element={<ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>} />
        <Route path="/consumer/dashboard" element={<ProtectedRoute role="consumer"><ConsumerDashboard /></ProtectedRoute>} />
        <Route path="/distributor/dashboard" element={<ProtectedRoute role="distributor"><DistributorDashboard /></ProtectedRoute>} />
        <Route path="/retailer/dashboard" element={<ProtectedRoute role="retailer"><RetailerDashboard /></ProtectedRoute>} />

        <Route path="/farmer/AddProduct" element={<ProtectedRoute role="farmer"><AddProduct /></ProtectedRoute>} />
        <Route path="/add-products" element={<ProtectedRoute role="distributor"><AddProducts /></ProtectedRoute>} />

        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/retailer/marketplace" element={<RetailerMarketplace />} />
        <Route path="/retailer-add-product" element={<RetailerAddProduct />} />
        <Route path="/consumer-marketplace" element={<ConsumerMarketplace />} />

        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
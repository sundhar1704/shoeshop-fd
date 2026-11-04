import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import { Dashboard, ProductsAdmin, CategoriesAdmin, BannersAdmin, ContentAdmin } from "./admin/AdminPages";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="products" element={<Products />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="*" element={<p className="soon">Coming soon</p>} />
      </Route>
      <Route path="/admin" element={<ProtectedRoute managerOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductsAdmin />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="banners" element={<BannersAdmin />} />
        <Route path="content" element={<ContentAdmin />} />
      </Route>
    </Routes>
  );
}
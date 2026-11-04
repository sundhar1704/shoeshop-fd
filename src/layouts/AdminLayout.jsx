import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../admin/admin.css";

const links = [
  ["/admin", "Dashboard"],
  ["/admin/products", "Products"],
  ["/admin/categories", "Categories"],
  ["/admin/banners", "Banners"],
  ["/admin/content", "Home Content"],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="adm">
      <aside className="adm-side">
        <h3>StepUp Admin</h3>
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === "/admin"} className={({ isActive }) => (isActive ? "active" : "")}>
            {label}
          </NavLink>
        ))}
        <button onClick={() => { logout(); navigate("/login"); }}>Logout ({user?.name})</button>
      </aside>
      <main className="adm-main"><Outlet /></main>
    </div>
  );
}
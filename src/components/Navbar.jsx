// frontend/src/components/Navbar.jsx
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { user, logout, isManager } = useAuth();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const cls = ({ isActive }) => (isActive ? "active" : "");

  // Go to the Products page with the search word.
  // Products.jsx reads the word from "q" in the URL.
  const goSearch = () => {
    const word = q.trim();
    if (word) navigate(`/products?q=${encodeURIComponent(word)}`);
  };

  // Enter key
  const search = (e) => {
    e.preventDefault();
    goSearch();
  };

  return (
    <header className="topbar">
      <Link to="/"><img src={logo} alt="StepUp" /></Link>
      <form className="search" onSubmit={search}>
        <FaSearch onClick={goSearch} style={{ cursor: "pointer" }} />
        <input placeholder="Search here" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>
      <nav className="toplinks">
        <NavLink to="/" end className={cls}>Home</NavLink>
        <NavLink to="/about" className={cls}>About Us</NavLink>
        <NavLink to="/contact" className={cls}>Contact Us</NavLink>
        {isManager && <Link to="/admin">Admin</Link>}
        {user ? <button onClick={logout}>Logout</button> : <NavLink to="/login" className={cls}>Log in</NavLink>}
        <NavLink to="/cart" className={cls}>Cart <FaShoppingCart /></NavLink>
      </nav>
    </header>
  );
}
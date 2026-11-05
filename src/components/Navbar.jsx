// frontend/src/components/Navbar.jsx
// Search bar with live suggestions (Amazon / Flipkart style).
// Suggestions come from the existing API: GET /shop/products/?q=word&page_size=6
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import logo from "../assets/logo.png";

const MIN_CHARS = 2;      // start suggesting after this many letters
const WAIT_MS = 300;      // wait after typing stops
const MAX_ITEMS = 6;      // how many suggestions to show

// Inline styles (so no CSS file is touched)
const box = {
  position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 1000,
  background: "#fff", color: "#000", borderRadius: 14, overflow: "hidden",
  boxShadow: "0 10px 24px rgba(0,0,0,0.25)", textAlign: "left",
};
const rowBase = {
  display: "flex", alignItems: "center", gap: 12, padding: "10px 18px",
  cursor: "pointer", fontSize: 16, color: "#000", textDecoration: "none",
};
const thumb = {
  width: 40, height: 40, objectFit: "cover", borderRadius: 6,
  background: "#eee", flexShrink: 0,
};

// Make the typed letters bold inside the product name
function Highlight({ text, word }) {
  const i = text.toLowerCase().indexOf(word.toLowerCase());
  if (i === -1 || !word) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, i)}
      <strong>{text.slice(i, i + word.length)}</strong>
      {text.slice(i + word.length)}
    </span>
  );
}

export default function Navbar() {
  const { user, logout, isManager } = useAuth();
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(-1);
  const navigate = useNavigate();
  const formRef = useRef(null);
  const lastCall = useRef(0);
  const cls = ({ isActive }) => (isActive ? "active" : "");

  // Go to the Products page with the search word (Products.jsx reads "q")
  const goSearch = (text) => {
    const word = (text ?? q).trim();
    if (!word) return;
    setOpen(false);
    setActive(-1);
    navigate(`/products?q=${encodeURIComponent(word)}`);
  };

  const search = (e) => {
    e.preventDefault();
    if (active >= 0 && items[active]) goSearch(items[active].name);
    else goSearch();
  };

  // Load suggestions while typing
  useEffect(() => {
    const word = q.trim();
    if (word.length < MIN_CHARS) {
      setItems([]);
      setBusy(false);
      return;
    }
    setBusy(true);
    const id = ++lastCall.current;
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get("/shop/products/", {
          params: { q: word, page_size: MAX_ITEMS },
        });
        if (id !== lastCall.current) return; // older answer, ignore it
        const list = (data.results || [])
          .map((p) => ({
            id: p.id,
            name: p.name || p.title || "",
            image: p.image || p.main_image || p.thumbnail || "",
          }))
          .filter((p) => p.name);
        setItems(list);
        setActive(-1);
      } catch {
        if (id === lastCall.current) setItems([]);
      } finally {
        if (id === lastCall.current) setBusy(false);
      }
    }, WAIT_MS);
    return () => clearTimeout(timer);
  }, [q]);

  // Close the list when clicking outside the search bar
  useEffect(() => {
    const away = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  // Arrow keys + Escape
  const onKeyDown = (e) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % items.length); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive((a) => (a <= 0 ? items.length - 1 : a - 1)); }
  };

  const word = q.trim();
  const showBox = open && word.length >= MIN_CHARS;

  return (
    <header className="topbar" style={{ overflow: "visible", position: "relative", zIndex: 50 }}>
      <Link to="/"><img src={logo} alt="StepUp" /></Link>

      <form
        className="search"
        onSubmit={search}
        ref={formRef}
        style={{ position: "relative", overflow: "visible" }}
      >
        <FaSearch onClick={() => goSearch()} style={{ cursor: "pointer" }} />
        <input
          placeholder="Search here"
          value={q}
          autoComplete="off"
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />

        {showBox && (
          <div style={box} role="listbox">
            {items.map((p, i) => (
              <div
                key={p.id}
                role="option"
                aria-selected={i === active}
                style={{ ...rowBase, background: i === active ? "#eef3f2" : "#fff" }}
                onMouseEnter={() => setActive(i)}
                onClick={() => goSearch(p.name)}
              >
                {p.image
                  ? <img src={p.image} alt="" style={thumb} />
                  : <FaSearch style={{ opacity: 0.5 }} />}
                <Highlight text={p.name} word={word} />
              </div>
            ))}

            {!busy && items.length === 0 && (
              <div style={{ ...rowBase, cursor: "default", opacity: 0.7 }}>No products found</div>
            )}
            {busy && items.length === 0 && (
              <div style={{ ...rowBase, cursor: "default", opacity: 0.7 }}>Searching...</div>
            )}

            <div
              style={{ ...rowBase, borderTop: "1px solid #ddd", fontWeight: 700 }}
              onClick={() => goSearch()}
            >
              <FaSearch /> See all results for "{word}"
            </div>
          </div>
        )}
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
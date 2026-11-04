import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import "../styles/megamenu.css";

const CATEGORIES = [
  { slug: "womens", label: "Womens" },
  { slug: "mens", label: "Mens" },
  { slug: "kids", label: "Kids" },
];

export default function MegaMenu() {
  const [menu, setMenu] = useState({ categories: [], brands: [], offers: [] });
  const [open, setOpen] = useState(null);
  const { pathname, search } = useLocation();
  const activeCategory = pathname.startsWith("/products")
    ? new URLSearchParams(search).get("category")
    : null;

  useEffect(() => {
    api.get("/menu/").then((r) => setMenu(r.data)).catch(() => {});
  }, []);

  const close = () => setOpen(null);
  const catData = (slug) => menu.categories.find((c) => c.slug === slug);

  return (
    <nav className="mm-nav" onMouseLeave={close}>
      <ul className="mm-bar">
        {CATEGORIES.map(({ slug, label }) => {
          const cat = catData(slug);
          return (
            <li key={slug} onMouseEnter={() => setOpen(slug)}>
              <Link
                to={`/products?category=${slug}`}
                className={`mm-top ${activeCategory === slug ? "mm-active" : ""}`}
                onClick={close}
              >
                {label}
              </Link>
              {open === slug && cat && cat.styles.length > 0 && (
                <div className="mm-panel mm-styles">
                  {cat.styles.map((s) => {
                    const styleUrl = `/products?category=${slug}&style=${s.id}`;
                    return (
                      <div className="mm-col" key={s.id}>
                        <Link to={styleUrl} className="mm-head" onClick={close}>{s.name}</Link>
                        {s.substyles.map((ss) => (
                          <Link
                            key={ss.id}
                            to={ss.name.toLowerCase() === "view all" ? styleUrl : `${styleUrl}&substyle=${ss.id}`}
                            className="mm-item"
                            onClick={close}
                          >
                            {ss.name}
                          </Link>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}

        <li onMouseEnter={() => setOpen("brands")}>
          <Link to="/brands" className={`mm-top ${pathname.startsWith("/brands") ? "mm-active" : ""}`} onClick={close}>
            Brands
          </Link>
          {open === "brands" && menu.brands.length > 0 && (
            <div className="mm-panel mm-brands">
              {menu.brands.map((g) => (
                <div className="mm-letter" key={g.letter}>
                  <span className="mm-head">{g.letter}</span>
                  {g.brands.map((b) => (
                    <Link key={b.id} to={`/products?brand=${b.slug}`} className="mm-item" onClick={close}>
                      {b.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </li>

        <li onMouseEnter={() => setOpen("offers")}>
          <Link to="/offers" className={`mm-top ${pathname.startsWith("/offers") ? "mm-active" : ""}`} onClick={close}>
            Offers
          </Link>
          {open === "offers" && menu.offers.length > 0 && (
            <div className="mm-panel mm-offers">
              {menu.offers.map((o) =>
                o.is_heading || !o.link ? (
                  <span key={o.id} className="mm-head">{o.title}</span>
                ) : (
                  <Link key={o.id} to={o.link} className="mm-item" onClick={close}>{o.title}</Link>
                )
              )}
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
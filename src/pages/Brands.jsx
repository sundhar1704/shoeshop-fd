import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/brands.css";

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get("/filters/")
      .then(({ data }) => setBrands(data.brands || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const map = {};
    [...brands]
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((b) => {
        const letter = b.name.trim().charAt(0).toUpperCase();
        if (!map[letter]) map[letter] = [];
        map[letter].push(b);
      });
    return Object.keys(map)
      .sort()
      .map((letter) => ({ letter, items: map[letter] }));
  }, [brands]);

  if (loading) return <p className="brands-msg">Loading...</p>;
  if (error) return <p className="brands-msg">Could not load brands.</p>;
  if (groups.length === 0) return <p className="brands-msg">No brands yet.</p>;

  return (
    <section className="brands-page">
      <h2 className="brands-title">Brands A-Z</h2>
      <div className="brands-grid">
        {groups.map((g) => (
          <div className="brands-group" key={g.letter}>
            <span className="brands-letter">{g.letter}</span>
            {g.items.map((b) => (
              <Link
                key={b.slug}
                to={`/products?brand=${b.slug}`}
                className="brands-link"
              >
                {b.name}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
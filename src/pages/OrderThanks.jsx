// frontend/src/pages/OrderThanks.jsx
// Route: /order-thanks/:order_number
// Reads: GET /api/orders/<order_number>/thanks/  (text is editable in Django admin -> Order page settings)

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/orderthanks.css";

// Small decorative dots that burst out around the tick.
// Each dot gets a direction (x, y), a size and a small delay.
const DOTS = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2 + (i % 2 ? 0.15 : 0);
  const dist = 78 + ((i * 37) % 50);
  return {
    x: Math.round(Math.cos(angle) * dist),
    y: Math.round(Math.sin(angle) * dist),
    size: [10, 6, 4, 8, 3, 5][i % 6],
    delay: 0.45 + (i % 5) * 0.04,
  };
});

export default function OrderThanks() {
  const { order_number } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data: d } = await api.get(`/orders/${order_number}/thanks/`);
        setData(d);
      } catch (e) {
        setError(e.response?.data?.detail || "Could not load your order. Please try again.");
      }
    })();
  }, [order_number]);

  if (error) return <section className="ty-page"><p className="ty-msg">{error}</p></section>;
  if (!data) return <section className="ty-page"><p className="ty-msg">Loading...</p></section>;

  const message = [data.text, data.ship_days_text].filter(Boolean).join(" ");

  return (
    <section className="ty-page">
      <div className="ty-card">
        {/* ---------- Green circle + animated tick + dots ---------- */}
        <div className="ty-burst" aria-hidden="true">
          {DOTS.map((d, i) => (
            <span
              key={i}
              className="ty-dot"
              style={{ "--x": `${d.x}px`, "--y": `${d.y}px`, width: d.size, height: d.size, animationDelay: `${d.delay}s` }}
            />
          ))}
          <div className="ty-circle">
            <svg className="ty-tick" viewBox="0 0 52 52">
              <path d="M14 27 L23 36 L39 18" />
            </svg>
          </div>
        </div>

        {/* ---------- Text ---------- */}
        <h1 className="ty-title">{data.title || "Thank you for your order"}</h1>
        {message && <p className="ty-text">{message}</p>}
        <p className="ty-text">
          {data.order_number_label || "Your order number is"} <strong>#{data.order_number}</strong>
        </p>

        {/* ---------- Buttons ---------- */}
        <div className="ty-actions">
          <Link className="ty-btn ty-btn-light" to={`/view-order/${data.order_number}`}>
            {data.view_button_text || "View Order"}
          </Link>
          <Link className="ty-btn ty-btn-dark" to={`/track-order/${data.order_number}`}>
            {data.track_button_text || "Track Order"}
          </Link>
        </div>
      </div>
    </section>
  );
}
// frontend/src/pages/OrderThanks.jsx
// Route: /order-thanks/:order_number
// Step 1: show a 5 second loading screen (data loads in the background)
// Step 2: show the Thank You card with animation
// Reads: GET /api/orders/<order_number>/thanks/  (text is editable in Django admin -> Order page settings)

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/orderthanks.css";

// How long the loading screen stays (milliseconds). 5000 = 5 seconds.
const LOAD_MS = 5000;

// Messages shown one by one on the loading screen.
const LOAD_MESSAGES = [
  "Confirming your order...",
  "Packing your shoes...",
  "Almost done...",
];

// Small decorative dots that burst out around the tick.
const DOTS = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2 + (i % 2 ? 0.15 : 0);
  const dist = 78 + ((i * 37) % 50);
  return {
    x: Math.round(Math.cos(angle) * dist),
    y: Math.round(Math.sin(angle) * dist),
    size: [10, 6, 4, 8, 3, 5][i % 6],
    delay: 0.85 + (i % 5) * 0.04,
    twinkle: 1.6 + (i % 4) * 0.35,
  };
});

// Confetti pieces that fall from the top of the card.
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,                 // % from left
  size: 6 + (i % 4) * 3,                // px
  delay: 0.9 + (i % 7) * 0.12,          // seconds
  duration: 2.6 + (i % 5) * 0.45,       // seconds
  drift: ((i % 2 ? 1 : -1) * (10 + (i % 5) * 8)), // sideways px
  shade: i % 3,                         // 0, 1, 2 = colour choice
  round: i % 2 === 0,
}));

export default function OrderThanks() {
  const { order_number } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);   // true after 5 seconds
  const [msgIndex, setMsgIndex] = useState(0); // which loading message

  // 1) Load the order data in the background
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

  // 2) 5 second timer + changing loading message
  useEffect(() => {
    const done = setTimeout(() => setReady(true), LOAD_MS);
    const swap = setInterval(
      () => setMsgIndex((n) => Math.min(n + 1, LOAD_MESSAGES.length - 1)),
      LOAD_MS / LOAD_MESSAGES.length
    );
    return () => {
      clearTimeout(done);
      clearInterval(swap);
    };
  }, []);

  // Error: show it straight away
  if (error) {
    return (
      <section className="ty-page">
        <p className="ty-msg">{error}</p>
      </section>
    );
  }

  // Loading screen: until 5 seconds are over AND the data has arrived
  if (!ready || !data) {
    return (
      <section className="ty-page ty-page-loading">
        <div className="ty-loader">
          <div className="ty-spinner">
            <span className="ty-spinner-ring" />
            <span className="ty-spinner-core" />
          </div>
          <h2 className="ty-load-title" key={msgIndex}>
            {LOAD_MESSAGES[msgIndex]}
          </h2>
          <p className="ty-load-sub">Please wait, do not close this page.</p>
          <div className="ty-bar">
            <span style={{ animationDuration: `${LOAD_MS}ms` }} />
          </div>
        </div>
      </section>
    );
  }

  const message = [data.text, data.ship_days_text].filter(Boolean).join(" ");

  return (
    <section className="ty-page">
      <div className="ty-card">
        {/* ---------- Falling confetti ---------- */}
        <div className="ty-confetti" aria-hidden="true">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className={`ty-conf ty-conf-${c.shade}${c.round ? " ty-conf-round" : ""}`}
              style={{
                left: `${c.left}%`,
                width: c.size,
                height: c.round ? c.size : c.size * 0.6,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                "--drift": `${c.drift}px`,
              }}
            />
          ))}
        </div>

        {/* ---------- Green circle + animated tick + dots ---------- */}
        <div className="ty-burst" aria-hidden="true">
          <span className="ty-ring" />
          <span className="ty-ring ty-ring-2" />
          {DOTS.map((d, i) => (
            <span
              key={i}
              className="ty-dot"
              style={{
                "--x": `${d.x}px`,
                "--y": `${d.y}px`,
                width: d.size,
                height: d.size,
                animationDelay: `${d.delay}s, ${d.delay + 0.9}s`,
                animationDuration: `0.7s, ${d.twinkle}s`,
              }}
            />
          ))}
          <div className="ty-circle">
            <svg className="ty-tick" viewBox="0 0 52 52">
              <path d="M14 27 L23 36 L39 18" />
            </svg>
          </div>
        </div>

        {/* ---------- Text ---------- */}
        <h1 className="ty-title ty-rise ty-d1">{data.title || "Thank you for your order"}</h1>
        {message && <p className="ty-text ty-rise ty-d2">{message}</p>}
        <p className="ty-text ty-rise ty-d3">
          {data.order_number_label || "Your order number is"} <strong>#{data.order_number}</strong>
        </p>

        {/* ---------- Buttons ---------- */}
        <div className="ty-actions ty-rise ty-d4">
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
// frontend/src/pages/TrackOrder.jsx
// Route: /track-order/:order_number
// Reads: GET /api/orders/<order_number>/track/
// The 4 steps, dates and Cancelled/Returned state all come from the backend (admin status).
// Nothing about the status is stored or guessed here.

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaChevronLeft, FaShoppingCart, FaHome, FaTruck, FaRegThumbsUp } from "react-icons/fa";
import api from "../services/api";
import "../styles/trackorder.css";

const money = (v) => `₹ ${Number(v).toLocaleString("en-IN")}`;

// The backend sends an icon key for each step. This maps it to an icon.
const ICONS = {
  cart: <FaShoppingCart />,
  home: <FaHome />,
  truck: <FaTruck />,
  thumbs_up: <FaRegThumbsUp />,
};

export default function TrackOrder() {
  const { order_number } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { data: d } = await api.get(`/orders/${order_number}/track/`);
      setData(d);
    } catch (e) {
      setError(e.response?.data?.detail || "Could not load your order. Please try again.");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order_number]);

  const cancelOrder = async () => {
    if (busy || !window.confirm("Do you want to cancel this order?")) return;
    setBusy(true);
    try {
      const { data: res } = await api.post(`/orders/${order_number}/cancel/`);
      toast.success(res.message || "Your order has been cancelled.");
      await load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Could not cancel the order.");
    } finally {
      setBusy(false);
    }
  };

  if (error) return <section className="tr-page"><p className="tr-msg">{error}</p></section>;
  if (!data) return <section className="tr-page"><p className="tr-msg">Loading...</p></section>;

  const { items, steps, updates, ended } = data;

  return (
    <section className="tr-page">
      <div className="tr-card">
        {/* ---------- Header ---------- */}
        <div className="tr-head">
          <button type="button" className="tr-back" onClick={() => navigate(-1)} aria-label="Go back">
            <FaChevronLeft />
          </button>
          <h1 className="tr-title">{data.title || "Your Order"}</h1>
        </div>

        {/* ---------- Products ---------- */}
        {items.map((it, i) => (
          <div className="tr-item" key={`${it.product_name}-${it.size}-${it.color}-${i}`}>
            <div className="tr-img">{it.image && <img src={it.image} alt={it.product_name} />}</div>
            <div className="tr-info">
              {i === 0 && (
                <div className="tr-meta">
                  <span>Order no #{data.order_number}</span>
                  <span>{data.payment_label} {money(data.total)}</span>
                </div>
              )}
              <h2 className="tr-brand">{it.brand_name}</h2>
              <p className="tr-name">{it.product_name}</p>
              <p className="tr-sub">Size {it.size} | Qty {it.quantity}</p>
              {i === 0 && data.expected_text && <p className="tr-exp">{data.expected_text}</p>}
            </div>
          </div>
        ))}

        {/* ---------- Cancelled / Returned banner ---------- */}
        {ended && (
          <div className="tr-ended" role="status">
            <strong>{ended.label}</strong>
            {ended.time_text && <span> | {ended.time_text}</span>}
          </div>
        )}

        {/* ---------- Timeline ---------- */}
        <div className="tr-panel">
          <ol className="tr-steps">
            {steps.map((s, i) => {
              const nextDone = steps[i + 1]?.done;
              return (
                <li
                  key={s.key}
                  className={`tr-step ${s.done ? "done" : "todo"} ${s.current ? "current" : ""} ${
                    nextDone ? "link-solid" : "link-dash"
                  }`}
                >
                  <span className="tr-icon">{ICONS[s.icon]}</span>
                  <div className="tr-text">
                    <h3>{s.label}</h3>
                    <p>{s.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ---------- Notes added by admin ---------- */}
        {updates?.length > 0 && (
          <div className="tr-updates">
            <h2>Updates</h2>
            {updates.map((u, i) => (
              <p key={i}>
                <strong>{u.status_label}</strong> | {u.time_text}
                <br />
                {u.note}
              </p>
            ))}
          </div>
        )}

        {/* ---------- Buttons ---------- */}
        <div className="tr-actions">
          <Link className="tr-btn tr-btn-light" to={`/view-order/${data.order_number}`}>
            View Order
          </Link>
          {data.can_cancel && (
            <button type="button" className="tr-btn tr-btn-dark" onClick={cancelOrder} disabled={busy}>
              {busy ? "Cancelling..." : data.cancel_button_text || "Cancel Order"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
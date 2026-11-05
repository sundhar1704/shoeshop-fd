// frontend/src/pages/ViewOrder.jsx
// Route: /view-order/:order_number
// Reads: GET /api/orders/<order_number>/view/
// Cancel: POST /api/orders/<order_number>/cancel/  (only shown when the backend says can_cancel)

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaChevronLeft } from "react-icons/fa";
import api from "../services/api";
import "../styles/vieworder.css";

const money = (v) => `₹ ${Number(v).toLocaleString("en-IN")}`;

export default function ViewOrder() {
  const { order_number } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { data: d } = await api.get(`/orders/${order_number}/view/`);
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

  if (error) return <section className="vo-page"><p className="vo-msg">{error}</p></section>;
  if (!data) return <section className="vo-page"><p className="vo-msg">Loading...</p></section>;

  const { items, amount, address } = data;

  return (
    <section className="vo-page">
      <div className="vo-card">
        {/* ---------- Header ---------- */}
        <div className="vo-head">
          <button type="button" className="vo-back" onClick={() => navigate(-1)} aria-label="Go back">
            <FaChevronLeft />
          </button>
          <h1 className="vo-title">{data.title || "Your Order"}</h1>
        </div>

        <div className="vo-meta">
          <span>Order no #{data.order_number}</span>
          <span>{data.payment_label}</span>
        </div>
        <div className="vo-meta vo-meta-sub">
          <span>Placed on {data.placed_text}</span>
          <span className={`vo-status vo-status-${data.status}`}>{data.status_label}</span>
        </div>

        {/* ---------- Products ---------- */}
        <h2 className="vo-h2">Items ({data.total_quantity})</h2>
        {items.map((it, i) => (
          <div className="vo-item" key={`${it.product_name}-${it.size}-${it.color}-${i}`}>
            <div className="vo-img">{it.image && <img src={it.image} alt={it.product_name} />}</div>
            <div className="vo-info">
              <h3>{it.brand_name}</h3>
              <p className="vo-name">{it.product_name}</p>
              <p className="vo-line">Size: {it.size}</p>
              {it.color && <p className="vo-line">Colour: {it.color}</p>}
              <p className="vo-line">Quantity: {it.quantity}</p>
              <p className="vo-line">Price: {money(it.unit_price)}</p>
              <p className="vo-line vo-strong">Item total: {money(it.line_total)}</p>
            </div>
          </div>
        ))}

        {/* ---------- Amount details ---------- */}
        <div className="vo-panel">
          <h2 className="vo-h2">Amount details</h2>
          <div className="vo-row"><span>Amount</span><span>{money(amount.subtotal)}</span></div>
          <div className="vo-row">
            <span>Delivery fees</span>
            <span>{amount.delivery_text || money(amount.delivery_fee)}</span>
          </div>
          <div className="vo-row vo-total"><span>Total</span><span>{money(amount.total)}</span></div>
          <div className="vo-row"><span>Payment</span><span>{data.payment_label}</span></div>
        </div>

        {/* ---------- Shipping details ---------- */}
        <div className="vo-panel">
          <h2 className="vo-h2">Shipping address</h2>
          <p className="vo-addr vo-strong">{address.name}</p>
          <p className="vo-addr">{address.text}</p>
          <p className="vo-addr">Phone: {address.phone}</p>
          <p className="vo-addr">Email: {address.email}</p>
        </div>

        {/* ---------- Buttons ---------- */}
        <div className="vo-actions">
          {data.can_cancel && (
            <button type="button" className="vo-btn vo-btn-light" onClick={cancelOrder} disabled={busy}>
              {busy ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
          <Link className="vo-btn vo-btn-dark" to={`/track-order/${data.order_number}`}>
            Track Order
          </Link>
        </div>
      </div>
    </section>
  );
}
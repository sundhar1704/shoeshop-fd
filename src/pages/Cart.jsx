import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiLock } from "react-icons/fi";
import { FaTrashAlt } from "react-icons/fa";
import { MdOutlineLocalShipping } from "react-icons/md";
import api from "../services/api";
import "../styles/cart.css";

const money = (v) => `₹ ${Number(v).toLocaleString("en-IN")}`;
const tellNavbar = () => window.dispatchEvent(new Event("cart-updated")); // navbar badge listens later

function countdownText(total) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h} hours,${m} minutes,${s} seconds`;
}

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [seconds, setSeconds] = useState(0);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/cart/");
      setCart(data);
      setSeconds(data.delivery.seconds_left);
    } catch {
      setError("Could not load your cart. Please try again.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const apply = (data) => {
    setCart(data);
    tellNavbar();
  };

  const change = async (item, body) => {
    setBusyId(item.id);
    try {
      const { data } = await api.patch(`/cart/items/${item.id}/`, body);
      apply(data);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Could not update the cart.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item) => {
    setBusyId(item.id);
    try {
      const { data } = await api.delete(`/cart/items/${item.id}/`);
      apply(data);
      toast.success("Item removed.");
    } catch {
      toast.error("Could not remove the item.");
    } finally {
      setBusyId(null);
    }
  };

  if (error) return <section className="cart-page"><p className="cart-msg">{error}</p></section>;
  if (!cart) return <section className="cart-page"><p className="cart-msg">Loading...</p></section>;

  const { page, totals, items, delivery } = cart;

  if (items.length === 0) {
    return (
      <section className="cart-page">
        <h1 className="cart-title">Your Cart</h1>
        <p className="cart-msg">{page.empty_cart_text}</p>
        <Link to="/" className="cart-shop-btn">Shop Now</Link>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <h1 className="cart-title">Your Cart</h1>

      <div className="cart-banner">
        <b>{page.arrival_text} {delivery.arrive_by}</b>
        <span>{page.countdown_text} {countdownText(seconds)}</span>
      </div>

      <div className="cart-items">
        {items.map((item) => {
          const maxQty = Math.max(item.max_quantity, item.quantity);
          const disabled = busyId === item.id;
          return (
            <div className="cart-item" key={item.id}>
              <Link to={`/products/${item.slug}`} className="cart-img">
                {item.image && <img src={item.image} alt={item.name} />}
              </Link>

              <div className="cart-info">
                <h2 className="cart-brand">{item.brand_name}</h2>
                <p className="cart-name">{item.name}</p>
                <p className="cart-mrp">
                  MRP{money(item.unit_price)}
                  {Number(item.mrp) > Number(item.unit_price) && (
                    <s className="cart-old">{money(item.mrp)}</s>
                  )}
                </p>
                {!item.in_stock && (
                  <p className="cart-warn">
                    {item.stock > 0 ? `Only ${item.stock} left in this size.` : "This size is out of stock."}
                  </p>
                )}
              </div>

              <div className="cart-selects">
                <select
                  className="cart-select"
                  value={item.size}
                  disabled={disabled}
                  onChange={(e) => change(item, { size: e.target.value })}
                  aria-label="Size"
                >
                  {item.sizes.map((s) => (
                    <option key={s} value={s}>Size ({s})</option>
                  ))}
                </select>
                <select
                  className="cart-select"
                  value={item.quantity}
                  disabled={disabled}
                  onChange={(e) => change(item, { quantity: Number(e.target.value) })}
                  aria-label="Quantity"
                >
                  {Array.from({ length: maxQty }, (_, i) => i + 1).map((q) => (
                    <option key={q} value={q}>Quantity ({q})</option>
                  ))}
                </select>
              </div>

              <button className="cart-remove" disabled={disabled} onClick={() => remove(item)}>
                Remove <FaTrashAlt />
              </button>
            </div>
          );
        })}
      </div>

      <div className="cart-summary">
        <h3>{page.summary_title}</h3>
        <div className="cart-row"><span>{page.total_label}</span><span>{money(totals.subtotal)}</span></div>
        <div className="cart-row">
          <span>{page.delivery_label}</span>
          <span>{totals.delivery_is_free ? page.free_label : money(totals.delivery_fee)}</span>
        </div>
        {!totals.delivery_is_free && (
          <div className="cart-row cart-row-total"><span>Order total</span><span>{money(totals.total)}</span></div>
        )}
        {page.delivery_info_link ? (
          <Link to={page.delivery_info_link} className="cart-info-link">
            {page.delivery_info_text} <MdOutlineLocalShipping />
          </Link>
        ) : (
          <span className="cart-info-link">{page.delivery_info_text} <MdOutlineLocalShipping /></span>
        )}
      </div>

      <div className="cart-checkout">
        <button className="cart-checkout-btn" onClick={() => navigate("/checkout?source=cart")}>
          <FiLock /> {page.checkout_button_text}
        </button>

        {page.express.length > 0 && (
          <>
            <h3 className="cart-express-title">{page.express_title}</h3>
            {page.express.map((o) => (
              <button
                key={o.name}
                className="cart-express-btn"
                onClick={() => (o.link ? window.open(o.link, "_blank", "noopener") : toast("Coming soon"))}
              >
                {o.image ? <img src={o.image} alt={o.name} /> : o.name}
              </button>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaRegCircle, FaDotCircle } from "react-icons/fa";
import api from "../services/api";
import "../styles/checkout.css";

const money = (v) => `₹ ${Number(v).toLocaleString("en-IN")}`;

const TEXT = {
  title: "Checkout",
  summary_title: "Order Summary",
  complete_title: "Complete Your Order",
  personal_title: "Personal Details",
  payment_title: "Payment Details",
  cod_label: "Cash on Delivery",
  shipping_title: "Shipping Address",
  cancel_text: "Cancel",
  order_button_text: "Order Now",
};

const EMPTY = {
  first_name: "", last_name: "", email: "", phone: "",
  card_holder_name: "", card_number: "", cvv: "", expiry: "",
  address_line1: "", city: "", state: "", landmark: "", pincode: "",
};

const REQUIRED = ["first_name", "last_name", "email", "phone", "address_line1", "city", "state", "pincode"];
const CARD_REQUIRED = ["card_holder_name", "card_number", "cvv", "expiry"];

function Field({ label, name, value, onChange, error, placeholder, wide, ...rest }) {
  return (
    <label className={`co-field ${wide ? "co-wide" : ""}`}>
      <span className="co-label">{label}</span>
      <input
        className={`co-input ${error ? "bad" : ""}`}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        {...rest}
      />
      {error && <small className="co-error">{error}</small>}
    </label>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const source = params.get("source") === "buy_now" ? "buy_now" : "cart";

  // Buy Now sends the one product in the address. Cart sends nothing extra.
  const selection = useMemo(
    () =>
      source === "buy_now"
        ? {
            product_id: params.get("product_id"),
            size: params.get("size"),
            color: params.get("color") || "",
            quantity: params.get("quantity") || 1,
          }
        : {},
    [params, source]
  );

  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [method, setMethod] = useState("ONLINE"); // ONLINE = card, COD = cash on delivery
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: d } = await api.get("/orders/summary/", { params: { source, ...selection } });
        setData(d);
        const p = d.prefill || {};
        setForm((f) => ({
          ...f,
          first_name: p.first_name || "",
          last_name: p.last_name || "",
          email: p.email || "",
          phone: p.phone || "",
        }));
      } catch (e) {
        setLoadError(e.response?.data?.detail || "Could not load your order. Please try again.");
      }
    })();
  }, [source, selection]);

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const onCard = (name, v) => set(name, v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim());
  const onCvv = (name, v) => set(name, v.replace(/\D/g, "").slice(0, 4));
  const onExpiry = (name, v) => {
    let d = v.replace(/\D/g, "").slice(0, 4);
    if (d.length > 2) d = `${d.slice(0, 2)}/${d.slice(2)}`;
    set(name, d);
  };
  const onPincode = (name, v) => set(name, v.replace(/\D/g, "").slice(0, 6));

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;

    const missing = {};
    const must = method === "ONLINE" ? [...REQUIRED, ...CARD_REQUIRED] : REQUIRED;
    must.forEach((k) => {
      if (!form[k].trim()) missing[k] = "This field is required.";
    });
    if (Object.keys(missing).length) {
      setErrors(missing);
      toast.error("Please fill the highlighted fields.");
      return;
    }

    const body = { source, ...selection, payment_method: method };
    [...REQUIRED, "landmark"].forEach((k) => (body[k] = form[k].trim()));
    if (method === "ONLINE") CARD_REQUIRED.forEach((k) => (body[k] = form[k].trim()));

    setBusy(true);
    try {
      const { data: res } = await api.post("/orders/checkout/", body);
      window.dispatchEvent(new Event("cart-updated"));
      toast.success(res.message || "Your order has been placed.");
      navigate(`/order-thanks/${res.order_number}`, { replace: true });
    } catch (err) {
      const d = err.response?.data;
      if (d && !d.detail && typeof d === "object") {
        const next = {};
        Object.entries(d).forEach(([k, v]) => (next[k] = Array.isArray(v) ? v[0] : String(v)));
        setErrors(next);
        toast.error("Please check the highlighted fields.");
      } else {
        toast.error(d?.detail || "Could not place your order. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  if (loadError) return <section className="co-page"><p className="co-msg">{loadError}</p></section>;
  if (!data) return <section className="co-page"><p className="co-msg">Loading...</p></section>;

  const t = { ...TEXT, ...(data.checkout || {}) };
  const { items, totals, page } = data;
  const logos = (page?.express || []).filter((o) => o.image);
  const card = method === "ONLINE";

  return (
    <section className="co-page">
      <h1 className="co-title">{t.title}</h1>

      <form className="co-card" onSubmit={submit} noValidate>
        {/* ---------- Left: Order Summary ---------- */}
        <aside className="co-summary">
          <h2 className="co-sum-title">{t.summary_title}</h2>

          {items.map((it) => (
            <div className="co-item" key={`${it.product_id}-${it.size}-${it.color}`}>
              <div className="co-item-img">{it.image && <img src={it.image} alt={it.name} />}</div>
              <div className="co-item-info">
                <h3>{it.brand_name}</h3>
                <p className="co-item-name">{it.name}</p>
                <div className="co-line"><span>Size</span><span>{it.size}</span></div>
                <div className="co-line"><span>Quantity</span><span>{it.quantity}</span></div>
                <div className="co-line"><span>MRP</span><span>{money(it.line_total)}</span></div>
              </div>
            </div>
          ))}

          <div className="co-totals">
            <div className="co-line"><span>Amount</span><span>{money(totals.subtotal)}</span></div>
            <div className="co-line">
              <span>Delivery fees</span>
              <span>{totals.delivery_is_free ? page.free_label : money(totals.delivery_fee)}</span>
            </div>
          </div>
          <div className="co-grand"><span>Total</span><span>{money(totals.total)}</span></div>
        </aside>

        {/* ---------- Right: Form ---------- */}
        <div className="co-form">
          <h2 className="co-h2">{t.complete_title}</h2>

          <h3 className="co-h3">{t.personal_title}</h3>
          <div className="co-grid">
            <Field label="First Name" name="first_name" value={form.first_name} onChange={set}
              error={errors.first_name} placeholder="Enter your first name" autoComplete="given-name" />
            <Field label="Last Name" name="last_name" value={form.last_name} onChange={set}
              error={errors.last_name} placeholder="Enter your last name" autoComplete="family-name" />
            <Field label="Email id" name="email" type="email" value={form.email} onChange={set}
              error={errors.email} placeholder="Enter your email" autoComplete="email" />
            <Field label="Phone Number" name="phone" type="tel" value={form.phone} onChange={set}
              error={errors.phone} placeholder="Enter your phone no" autoComplete="tel" maxLength={13} />
          </div>

          <h3 className="co-h3 co-gap">{t.payment_title}</h3>
          {logos.length > 0 && (
            <div className="co-logos">
              {logos.map((o) => <img key={o.name} src={o.image} alt={o.name} />)}
            </div>
          )}

          <div className={`co-grid ${card ? "" : "co-off"}`}>
            <Field label="Card Holder Name" name="card_holder_name" value={form.card_holder_name} onChange={set}
              error={errors.card_holder_name} placeholder="Enter name" disabled={!card} autoComplete="cc-name" />
            <Field label="Card Number" name="card_number" inputMode="numeric" value={form.card_number}
              onChange={onCard} error={errors.card_number} placeholder="Enter card number"
              disabled={!card} autoComplete="cc-number" />
            <Field label="CVV" name="cvv" inputMode="numeric" type="password" value={form.cvv}
              onChange={onCvv} error={errors.cvv} placeholder="Example:4339" disabled={!card}
              autoComplete="cc-csc" />
            <Field label="Expiration Date" name="expiry" inputMode="numeric" value={form.expiry}
              onChange={onExpiry} error={errors.expiry} placeholder="MM/YY" disabled={!card}
              autoComplete="cc-exp" />
          </div>

          <button
            type="button"
            className="co-cod"
            role="radio"
            aria-checked={!card}
            onClick={() => setMethod(card ? "COD" : "ONLINE")}
          >
            <span>{t.cod_label}</span>
            {card ? <FaRegCircle /> : <FaDotCircle />}
          </button>

          <h3 className="co-h3 co-gap">{t.shipping_title}</h3>
          <div className="co-grid">
            <Field wide label="Address Line 1" name="address_line1" value={form.address_line1} onChange={set}
              error={errors.address_line1} placeholder="Enter your address" autoComplete="address-line1" />
            <Field label="City" name="city" value={form.city} onChange={set} error={errors.city}
              placeholder="Your city" autoComplete="address-level2" />
            <Field label="State" name="state" value={form.state} onChange={set} error={errors.state}
              placeholder="Your state" autoComplete="address-level1" />
            <Field label="Landmark" name="landmark" value={form.landmark} onChange={set}
              error={errors.landmark} placeholder="Any landmark(famous place/mall)" />
            <Field label="Pincode" name="pincode" inputMode="numeric" value={form.pincode}
              onChange={onPincode} error={errors.pincode} placeholder="Code" autoComplete="postal-code" />
          </div>

          <div className="co-actions">
            <button type="button" className="co-cancel" onClick={() => navigate("/cart")}>
              {t.cancel_text}
            </button>
            <button type="submit" className="co-order" disabled={busy}>
              {busy ? "Placing order..." : t.order_button_text}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { FaStar, FaRegStar, FaArrowLeft, FaWhatsapp, FaCheck } from "react-icons/fa";
import "../styles/productdetail.css";

const Stars = ({ n }) => (
  <span className="pd-stars">
    {[1, 2, 3, 4, 5].map((i) => (i <= Math.round(n) ? <FaStar key={i} /> : <FaRegStar key={i} />))}
  </span>
);
const money = (v) => "₹ " + Number(v).toLocaleString("en-IN");

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    api.get(`/shop/products/${slug}/`)
      .then((res) => {
        setP(res.data);
        setColor(res.data.colors?.[0]?.id ?? null);
        const first = (res.data.sizes || []).find((s) => s.stock > 0) || res.data.sizes?.[0];
        setSize(first ? first.size : null);
      })
      .catch(() => toast.error("Failed to load product details."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="pd-msg">Loading...</div>;
  if (!p) return <div className="pd-msg">Product not found.</div>;

  const sizes = Object.values(
    (p.sizes || []).reduce((a, v) => {
      a[v.size] = a[v.size] || { size: v.size, stock: 0 };
      a[v.size].stock += v.stock;
      return a;
    }, {})
  );
  const maxQty = sizes.find((s) => s.size === size)?.stock || 1;
  const colorName = p.colors?.find((c) => c.id === color)?.name || "";
  const pg = {
  secure_title: "Secure Checkout With",
  size_help_text: "Unsure about your size? Let's connect",
  info_1: "COD Available",
  info_2: "24 Hour Dispatch",
  info_3: "7 Days easy return & exchange",
  details_title: "Product Details",
  reviews_title: "Reviews:",
  ...(p.page || {}),
};
  const logos = (place) => (p.logos || []).filter((l) => l.place === place);

  const loggedIn = () => {
    if (localStorage.getItem("access")) return true;
    toast.error("Please login first.");
    navigate("/login");
    return false;
  };
  const ready = () => {
    if (!loggedIn()) return false;
    if (!size) { toast.error("Please select a size."); return false; }
    return true;
  };

  const addToCart = async () => {
    if (!ready()) return;
    try {
      await api.post("/cart/items/", { product_id: p.id, size, color: colorName, quantity: qty });
      window.dispatchEvent(new Event("cart-updated"));
      toast.success("Added to cart!");
      navigate("/cart");
    } catch (err) {
      const d = err.response?.data;
      const first = d && !d.detail ? Object.values(d).flat()[0] : null;
      toast.error(d?.detail || (first ? String(first) : "Could not add to cart."));
    }
  };
  const buyNow = () => {
    if (!ready()) return;
    navigate(`/checkout?source=buy_now&product_id=${p.id}&size=${encodeURIComponent(size)}&quantity=${qty}`);
  };

  return (
    <div className="pd">
      <button className="pd-back" onClick={() => navigate(-1)}><FaArrowLeft /> Back</button>

      <div className="pd-grid">
        <div className="pd-imgs">
          {p.images.map((src, i) => (
            <div className="pd-img" key={i}><img src={src} alt={p.name} /></div>
          ))}
        </div>

        <div className="pd-info">
          <h1 className="pd-brand">{p.brand_name || "StepUp.in"}</h1>
          <p className="pd-name">{p.name}</p>
          <p className="pd-price">
            MRP {money(p.final_price)}
            {p.discount_percent > 0 && <s>{money(p.price)}</s>}
          </p>
          <p className="pd-rate"><Stars n={p.avg_rating} /> {p.avg_rating}/5 ({p.review_count} reviews)</p>

          {p.colors?.length > 0 && (
            <>
              <p className="pd-label">Color : {colorName}</p>
              <div className="pd-colors">
                {p.colors.map((c) => (
                  <button key={c.id} title={c.name} style={{ background: c.hex }}
                    className={color === c.id ? "on" : ""} onClick={() => setColor(c.id)} />
                ))}
              </div>
            </>
          )}

          {sizes.length > 0 && (
            <div className="pd-block">
              <p className="pd-label">Shoe Size</p>
              <div className="pd-sizes">
                {sizes.map((s) => (
                  <button key={s.size} disabled={s.stock === 0}
                    className={size === s.size ? "on" : ""}
                    onClick={() => { setSize(s.size); setQty(1); }}>{s.size}</button>
                ))}
              </div>
            </div>
          )}

          <div className="pd-block">
            <p className="pd-label">Quantity</p>
            <div className="pd-qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(maxQty, qty + 1))}>+</button>
            </div>
          </div>

          <div className="pd-actions">
            <button className="pd-add" onClick={addToCart}>Add to Cart</button>
            <button className="pd-buy" onClick={buyNow}>
              Buy Now {logos("buynow").map((l, i) => <img key={i} src={l.image} alt="" />)}
            </button>
          </div>

          {logos("secure").length > 0 && (
            <div className="pd-secure">
              <b>{pg.secure_title}</b>
              <div>{logos("secure").map((l, i) => <img key={i} src={l.image} alt="" />)}</div>
            </div>
          )}

          {p.whatsapp_link && (
            <a className="pd-wa" href={p.whatsapp_link} target="_blank" rel="noreferrer">
              {pg.size_help_text} <FaWhatsapp />
            </a>
          )}

          <div className="pd-box"><p>{pg.info_1}</p><p>{pg.info_2}</p><p>{pg.info_3}</p></div>

          <h2 className="pd-dtitle">{pg.details_title}</h2>
          <p className="pd-desc">{p.description || "No description provided."}</p>
        </div>
      </div>

      {p.reviews?.map((r) => (
        <div className="pd-review" key={r.id}>
          <h3>{pg.reviews_title}</h3>
          <div className="pd-rgrid">
            <div>
              <div className="pd-who">
                {r.avatar ? <img src={r.avatar} alt="" /> : <span>{r.name[0]}</span>}
                <b>Reviewed by {r.name}<br />{r.location && `From: ${r.location}`}</b>
              </div>
              {[["Fit", r.fit], ["Comfort", r.comfort], ["Value for Money", r.value_for_money], ["Quality", r.quality]].map(([t, n]) => (
                <p className="pd-row" key={t}>{t}<Stars n={n} /></p>
              ))}
            </div>
            <div>
              <b>{r.title}</b>
              <p className="pd-row2">Overall rating <Stars n={r.overall} /></p>
              <p>{r.text}</p>
              {r.would_recommend && <p className="pd-rec">{r.name} would recommend this product <FaCheck /></p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
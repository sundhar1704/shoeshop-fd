import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../services/api";

export default function ShopProductCard({ p }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const link = `/products/${p.slug}`;
  const rating = Math.round(Number(p.rating) || 0);
  const colors = p.colors || [];

  const addToCart = async () => {
    if (!localStorage.getItem("access")) {
      toast.error("Please login first.");
      navigate("/login");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.get(`/shop/products/${p.slug}/`);
      const variant = (data.sizes || []).find((s) => s.stock > 0);
      if (!variant) {
        toast.error("Out of stock. Please check the product page.");
        navigate(link);
        return;
      }
      await api.post("/cart/items/", {
        product_id: data.id,
        size: variant.size,
        color: data.colors?.[0]?.name || variant.color || "",
        quantity: 1,
      });
      window.dispatchEvent(new Event("cart-updated"));
      toast.success("Added to cart!");
      navigate("/cart");
    } catch (err) {
      const d = err.response?.data;
      const first = d && !d.detail ? Object.values(d).flat()[0] : null;
      toast.error(d?.detail || (first ? String(first) : "Could not add to cart."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="shop-card">
      <Link to={link} className="shop-card__img">
        {p.image && <img src={p.image} alt={p.name} loading="lazy" />}
      </Link>

      <div className="shop-card__body">
        <p className="shop-card__brand">{p.brand_name}</p>
        <Link to={link} className="shop-card__name">{p.name}</Link>

        <div className="shop-card__stars">
          {[1, 2, 3, 4, 5].map((i) => (
            <FaStar key={i} className={i <= rating ? "on" : ""} />
          ))}
        </div>

        <p className="shop-card__mrp">MRP₹ {Number(p.price).toLocaleString("en-IN")}</p>

        <div className="shop-card__colors">
          {p.is_multicolor ? (
            <span>Multi-color</span>
          ) : (
            colors.length > 0 && (
              <>
                <span>Color</span>
                {colors.map((c) => (
                  <i key={c.id} className="dot" style={{ background: c.hex }} title={c.name} />
                ))}
              </>
            )
          )}
        </div>

        <div className="shop-card__btns">
          <button type="button" className="btn-buy" onClick={() => navigate(link)}>Buy</button>
          <button type="button" className="btn-cart" disabled={busy} onClick={addToCart}>
            {busy ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
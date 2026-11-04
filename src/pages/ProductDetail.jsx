import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaStar, FaRegStar, FaArrowLeft, FaShoppingCart, FaBolt } from 'react-icons/fa';
import '../styles/productdetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.get(`/shop/products/${slug}/`)
      .then(res => {
        setProduct(res.data);
        if (res.data.colors?.length > 0) setSelectedColor(res.data.colors[0].id);
        if (res.data.sizes?.length > 0) setSelectedSize(res.data.sizes[0].id);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load product details.");
        setLoading(false);
      });
  }, [slug]);

  const loggedIn = () => {
    if (localStorage.getItem("access")) return true;
    toast.error("Please login first.");
    navigate("/login");
    return false;
  };

  const buildItem = () => {
    const v = product.sizes?.find((s) => s.id === selectedSize);
    const c = product.colors?.find((x) => x.id === selectedColor);
    return {
      product_id: product.id,
      size: v ? v.size : "",
      color: c?.name || v?.color || "",
      quantity,
    };
  };

  const handleAddToCart = async () => {
    if (!loggedIn()) return;
    if (!selectedSize) {
      toast.error("Please select a size.");
      return;
    }
    try {
      await api.post("/cart/items/", buildItem());
      window.dispatchEvent(new Event("cart-updated"));
      toast.success("Added to cart!");
      navigate("/cart");
    } catch (err) {
      const d = err.response?.data;
      const first = d && !d.detail ? Object.values(d).flat()[0] : null;
      toast.error(d?.detail || (first ? String(first) : "Could not add to cart."));
    }
  };

  const handleBuyNow = () => {
    if (!loggedIn()) return;
    if (!selectedSize) {
      toast.error("Please select a size.");
      return;
    }
    const it = buildItem();
    navigate(
      `/checkout?source=buy_now&product_id=${it.product_id}&size=${encodeURIComponent(it.size)}&quantity=${it.quantity}`
    );
  };

  if (loading) return <div className="pd-loading" style={{ textAlign: 'center', padding: '50px', fontSize: '20px' }}>Loading...</div>;
  if (!product) return <div className="pd-loading" style={{ textAlign: 'center', padding: '50px', fontSize: '20px' }}>Product not found.</div>;

  return (
    <div className="product-detail-container" style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', fontFamily: 'Libre Baskerville, serif' }}>
      <button className="pd-back-btn" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', cursor: 'pointer', color: '#2F4F4F', marginBottom: '20px', fontWeight: 'bold' }}>
        <FaArrowLeft /> Back
      </button>

      <div className="pd-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div className="pd-image-section">
          <div className="pd-main-img-box" style={{ background: '#EEEEEE', borderRadius: '8px', overflow: 'hidden', height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={product.images[selectedImage] || "https://via.placeholder.com/400"}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="pd-thumbs" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: selectedImage === idx ? '2px solid #2F4F4F' : '2px solid transparent' }}
                onClick={() => setSelectedImage(idx)}
              />
            ))}
          </div>
        </div>

        <div className="pd-info-section">
          <span className="pd-brand" style={{ fontSize: '14px', textTransform: 'uppercase', color: '#777', letterSpacing: '1px' }}>{product.brand_name || "StepUp.in"}</span>
          <h1 style={{ fontSize: '26px', color: '#222', margin: '8px 0' }}>{product.name}</h1>

          <div className="pd-rating-row" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
            {[...Array(5)].map((_, i) => (
              i < Math.floor(product.rating || 0) ? <FaStar key={i} color="#FFD700" /> : <FaRegStar key={i} color="#FFD700" />
            ))}
            <span>({product.rating || 0})</span>
          </div>

          <div className="pd-price-row" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2F4F4F' }}>₹{product.final_price}</span>
            {product.discount_percent > 0 && (
              <>
                <span style={{ fontSize: '16px', textDecoration: 'line-through', color: '#888' }}>₹{product.price}</span>
                <span style={{ background: '#FFA0A0', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{product.discount_percent}% OFF</span>
              </>
            )}
          </div>

          <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>{product.description || "No description provided."}</p>

          {product.colors?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>Color:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {product.colors.map(c => (
                  <button
                    key={c.id}
                    style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: c.hex, border: selectedColor === c.id ? '2px solid #2F4F4F' : '2px solid #ddd', cursor: 'pointer', transform: selectedColor === c.id ? 'scale(1.1)' : 'none' }}
                    title={c.name}
                    onClick={() => setSelectedColor(c.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>Size / Variant:</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.sizes.map(s => (
                  <button
                    key={s.id}
                    style={{ padding: '8px 14px', border: selectedSize === s.id ? '1px solid #2F4F4F' : '1px solid #ccc', background: selectedSize === s.id ? '#2F4F4F' : '#fff', color: selectedSize === s.id ? '#fff' : '#000', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => setSelectedSize(s.id)}
                  >
                    {s.size} {s.color ? `(${s.color})` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button
              onClick={handleAddToCart}
              style={{ flex: 1, padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px', background: '#fff', border: '2px solid #2F4F4F', color: '#2F4F4F' }}
            >
              <FaShoppingCart /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              style={{ flex: 1, padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px', background: '#2F4F4F', border: '2px solid #2F4F4F', color: '#fff' }}
            >
              <FaBolt /> Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
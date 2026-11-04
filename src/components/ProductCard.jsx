import { Link } from "react-router-dom";

export default function ProductCard({ p }) {
  const img = (p.images.find((x) => x.is_main) || p.images[0])?.image;
  return (
    <Link to={`/products/${p.slug}`} className="pcard">
      <div className="pimg">{img && <img src={img} alt={p.name} loading="lazy" />}</div>
      <p className="pname">{p.name}</p>
      <p>MRP : ₹ {Number(p.price).toLocaleString("en-IN")}</p>
    </Link>
  );
}
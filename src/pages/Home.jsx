import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import api from "../services/api";
import HeroSlider from "../components/HeroSlider";
import ProductCard from "../components/ProductCard";
import OfferBar from "../components/OfferBar";

export default function Home() {
  const c = useOutletContext();
  const [banners, setBanners] = useState([]);
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [b, k, p] = await Promise.all([
          api.get("/banners/?public=true"),
          api.get("/categories/?public=true"),
          api.get("/products/?featured=true&public=true&page_size=8"),
        ]);
        setBanners(b.data);
        setCats(k.data.slice(0, 3));
        setProducts(p.data.results);
      } catch {
        setProducts([]);
      }
    })();
  }, []);

  return (
    <>
      <HeroSlider banners={banners} />
      <h2 className="sec-title">Overview</h2>
      <p className="overview">&quot;{c?.overview_text}&quot;</p>

      <h2 className="sec-title">What are you looking for?</h2>
      <div className="cats">
        {cats.map((k) => (
          <Link key={k.id} to={`/products?category=${k.slug}`} className="cat">
            <div>{k.image && <img src={k.image} alt={k.name} />}</div>
            {k.name}
          </Link>
        ))}
      </div>

      <h2 className="sec-title">New &amp; Trending</h2>
      <div className="pgrid">
        {products === null
          ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="pcard skeleton"><div className="pimg" /></div>)
          : products.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      <div className="right"><Link to="/products" className="viewall">View all</Link></div>

      {c && <OfferBar c={c} />}
    </>
  );
}
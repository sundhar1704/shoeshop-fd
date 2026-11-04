import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SLIDE_MS = 4000; // each slide stays 4 seconds

export default function HeroSlider({ banners }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setTimeout(() => setI((n) => (n + 1) % banners.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, banners.length]);

  if (!banners.length) return null;
  return (
    <section className="hero">
      {banners.map((b, k) => (
        <div
          key={b.id}
          className={`slide ${k === i ? "on" : ""} pos-${b.text_position || "right"}`}
          style={{ backgroundImage: `url(${b.image})` }}
        >
          <div className={`hero-text ${b.text_box ? "box" : ""}`}>{b.title}</div>
          <Link to={b.link} className="hero-btn">{b.button_text}</Link>
        </div>
      ))}
      <div className="dots">
        {banners.map((_, k) => (
          <button key={k} aria-label={`Slide ${k + 1}`} className={k === i ? "on" : ""} onClick={() => setI(k)} />
        ))}
      </div>
    </section>
  );
}
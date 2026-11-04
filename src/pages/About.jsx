import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/about.css";

export default function About() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/about/")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load the About page."));
  }, []);

  if (error) return <p className="about-msg">{error}</p>;
  if (!data) return <p className="about-msg">Loading...</p>;

  return (
    <section className="about">
      <div className="about-inner">
        <div className="about-side">
          <span className="about-green" />
          <div className="about-photo">
            {data.side_image && <img src={data.side_image} alt="" />}
          </div>
        </div>

        <div className="about-text">
          <h1 className="about-title">{data.about_title}</h1>
          <p className="about-para">{data.about_text}</p>

          <h2 className="about-title about-title-mission">{data.mission_title}</h2>
          <p className="about-para">{data.mission_text}</p>
        </div>

        {data.center_image && (
          <div className="about-center">
            <img src={data.center_image} alt="" />
          </div>
        )}

        <div className="about-features">
          {data.features.map((f) => (
            <div className="about-feature" key={f.id}>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
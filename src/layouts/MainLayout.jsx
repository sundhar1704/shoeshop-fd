import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MegaMenu from "../components/MegaMenu";
import api from "../services/api";

export default function MainLayout() {
  const [content, setContent] = useState(null);
  useEffect(() => {
    api.get("/home-content/").then((r) => setContent(r.data)).catch(() => {});
  }, []);
  return (
    <>
      <Navbar />
      <h1 className="brand">StepUp.in</h1>
      <div className="catnav">
        <MegaMenu />
      </div>
      <Outlet context={content} />
      <Footer c={content} />
    </>
  );
}
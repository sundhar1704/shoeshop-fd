import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import ResourceManager from "./ResourceManager";

const thumb = (r) => (r.image ? <img src={r.image} alt="" /> : "-");
const yn = (v) => (v ? "Yes" : "No");

export const ProductsAdmin = () => (
  <ResourceManager
    title="Products" endpoint="/products/"
    columns={[
      { label: "Image", render: (r) => { const i = r.images?.find((x) => x.is_main) || r.images?.[0]; return i ? <img src={i.image} alt="" /> : "-"; } },
      { label: "Name", key: "name" },
      { label: "Category", key: "category_name" },
      { label: "MRP (₹)", key: "price" },
      { label: "Sizes", render: (r) => r.variants.map((v) => v.size).join(", ") },
      { label: "Featured", render: (r) => yn(r.is_featured) },
      { label: "Active", render: (r) => yn(r.is_active) },
    ]}
    fields={[
      { name: "name", label: "Name", type: "text" },
      { name: "brand", label: "Brand", type: "text" },
      { name: "category", label: "Category", type: "select", optionsFrom: "/categories/" },
      { name: "price", label: "MRP (₹)", type: "number" },
      { name: "discount_percent", label: "Discount %", type: "number" },
      { name: "main_image", label: "Main image", type: "file" },
      { name: "sizes", label: "Sizes (e.g. 6,7,8,9)", type: "text" },
      { name: "stock", label: "Stock per size", type: "number" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "is_featured", label: "Show in New & Trending", type: "checkbox" },
      { name: "is_active", label: "Active", type: "checkbox", def: true },
    ]}
  />
);

export const CategoriesAdmin = () => (
  <ResourceManager
    title="Categories" endpoint="/categories/"
    columns={[{ label: "Image", render: thumb }, { label: "Name", key: "name" }, { label: "Slug", key: "slug" }, { label: "Active", render: (r) => yn(r.is_active) }]}
    fields={[
      { name: "name", label: "Name (Mens, Womens, Kids)", type: "text" },
      { name: "image", label: "Image", type: "file" },
      { name: "is_active", label: "Active", type: "checkbox", def: true },
    ]}
  />
);

export const BannersAdmin = () => (
  <ResourceManager
    title="Homepage Banners" endpoint="/banners/"
    columns={[{ label: "Image", render: thumb }, { label: "Text", key: "title" }, { label: "Order", key: "order" }, { label: "Active", render: (r) => yn(r.is_active) }]}
    fields={[
      { name: "title", label: "Banner text", type: "text" },
      { name: "image", label: "Image", type: "file" },
      { name: "button_text", label: "Button text", type: "text", def: "Shop Now" },
      { name: "link", label: "Button link", type: "text", def: "/products" },
      { name: "order", label: "Order (0 first)", type: "number", def: 0 },
      { name: "text_box", label: "Dark box behind text", type: "checkbox" },
      { name: "is_active", label: "Active", type: "checkbox", def: true },
    ]}
  />
);

export function ContentAdmin() {
  const [c, setC] = useState(null);
  useEffect(() => { api.get("/home-content/").then((r) => setC(r.data)); }, []);
  if (!c) return <p>Loading...</p>;
  const set = (k) => (e) => setC({ ...c, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    try { await api.patch("/home-content/", c); toast.success("Saved"); }
    catch { toast.error("Save failed"); }
  };
  const F = [["overview_text", "Overview text", true], ["offer_text_1", "Offer bar text 1"], ["offer_text_2", "Offer bar text 2"],
    ["landline", "Landline"], ["whatsapp", "WhatsApp"], ["email", "Email"], ["address", "Address", true]];
  return (
    <>
      <h2>Home Content</h2>
      <form className="card" onSubmit={save}>
        <div className="fgrid2">
          {F.map(([k, l, area]) => (
            <label key={k}>{l}{area ? <textarea rows={4} value={c[k]} onChange={set(k)} /> : <input value={c[k]} onChange={set(k)} />}</label>
          ))}
        </div>
        <button className="pri" type="submit">Save</button>
      </form>
    </>
  );
}

export function Dashboard() {
  const [s, setS] = useState({});
  useEffect(() => {
    (async () => {
      const [p, c, b] = await Promise.all([api.get("/products/?page_size=1"), api.get("/categories/"), api.get("/banners/")]);
      setS({ Products: p.data.count, Categories: c.data.length, Banners: b.data.length });
    })().catch(() => {});
  }, []);
  return (
    <>
      <h2>Dashboard</h2>
      <div className="stats">
        {Object.entries(s).map(([k, v]) => <div className="card stat" key={k}><b>{v}</b>{k}</div>)}
      </div>
      <p>Orders, payments and revenue will show here when those modules are built.</p>
    </>
  );
}
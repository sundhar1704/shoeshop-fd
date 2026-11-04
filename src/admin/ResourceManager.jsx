import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function ResourceManager({ title, endpoint, fields, columns }) {
  const initial = (row) =>
    Object.fromEntries(fields.filter((f) => f.type !== "file").map((f) =>
      [f.name, row ? row[f.name] ?? (f.type === "checkbox" ? false : "") : f.def ?? (f.type === "checkbox" ? false : "")]));
  const [rows, setRows] = useState([]);
  const [opts, setOpts] = useState({});
  const [form, setForm] = useState(() => initial());
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [fileKey, setFileKey] = useState(0);

  const load = () => api.get(`${endpoint}?page_size=100`).then((r) => setRows(r.data.results ?? r.data));
  const err = (e, fb) => {
    const d = e.response?.data;
    toast.error(d && typeof d === "object" ? Object.values(d).flat().join(" ") : fb);
  };

  useEffect(() => {
    load().catch(() => toast.error("Could not load data"));
    fields.filter((f) => f.optionsFrom).forEach((f) =>
      api.get(`${f.optionsFrom}?page_size=100`).then((r) =>
        setOpts((o) => ({ ...o, [f.name]: r.data.results ?? r.data }))));
  }, []);

  const set = (name, v) => setForm((f) => ({ ...f, [name]: v }));
  const reset = () => { setForm(initial()); setEditId(null); setFileKey((k) => k + 1); };
  const edit = (row) => {
    setEditId(row.id); setForm(initial(row)); setFileKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData();
    fields.forEach((f) => {
      const v = form[f.name];
      if (f.type === "file") { if (v instanceof File) fd.append(f.name, v); }
      else if (f.type === "checkbox") fd.append(f.name, v ? "true" : "false");
      else if (["text", "textarea"].includes(f.type) || (v !== undefined && v !== "")) fd.append(f.name, v ?? "");
    });
    try {
      if (editId) await api.patch(`${endpoint}${editId}/`, fd);
      else await api.post(endpoint, fd);
      toast.success("Saved");
      reset();
      load();
    } catch (er) { err(er, "Save failed"); }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try { await api.delete(`${endpoint}${id}/`); toast.success("Deleted"); load(); }
    catch { toast.error("Delete failed (item may be in use)"); }
  };

  return (
    <>
      <h2>{title}</h2>
      <form className="card" onSubmit={submit}>
        <div className="fgrid2">
          {fields.map((f) => (
            <label key={f.name} style={f.type === "textarea" ? { gridColumn: "1/-1" } : undefined}>
              {f.label}
              {f.type === "textarea" ? (
                <textarea rows={3} value={form[f.name]} onChange={(e) => set(f.name, e.target.value)} />
              ) : f.type === "checkbox" ? (
                <input type="checkbox" checked={!!form[f.name]} onChange={(e) => set(f.name, e.target.checked)} />
              ) : f.type === "file" ? (
                <input key={fileKey} type="file" accept="image/*" onChange={(e) => set(f.name, e.target.files[0])} />
              ) : f.type === "select" ? (
                <select value={form[f.name]} onChange={(e) => set(f.name, e.target.value)}>
                  <option value="">Select...</option>
                  {(opts[f.name] || []).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              ) : (
                <input type={f.type} step={f.type === "number" ? "any" : undefined} value={form[f.name]} onChange={(e) => set(f.name, e.target.value)} />
              )}
            </label>
          ))}
        </div>
        <button className="pri" disabled={busy}>{editId ? "Update" : "Add"}</button>
        {editId && <button type="button" className="sec" onClick={reset}>Cancel</button>}
      </form>

      <div className="card tbl">
        <table>
          <thead><tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}<th>Actions</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                {columns.map((c) => <td key={c.label}>{c.render ? c.render(r) : r[c.key]}</td>)}
                <td>
                  <button className="sec" onClick={() => edit(r)}>Edit</button>
                  <button className="danger" onClick={() => remove(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={columns.length + 1}>No data yet</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
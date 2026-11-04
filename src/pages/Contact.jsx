import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/contact.css";

const EMPTY = { name: "", email: "", phone: "", message: "" };

function errorText(err) {
  const res = err.response;
  if (!res) return "Network error. Please try again.";
  if (res.status === 429) return "Too many messages. Please try again later.";
  if (res.status === 400 && res.data && typeof res.data === "object") {
    const first = Object.values(res.data)[0];
    return Array.isArray(first) ? first[0] : String(first);
  }
  return "Something went wrong. Please try again.";
}

export default function Contact() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);

  useEffect(() => {
    api
      .get("/contact/")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load the Contact page."));
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    api
      .post("/enquiry/", form)
      .then((res) => {
        setNote({ type: "ok", text: res.data.message || "Thank you!" });
        setForm(EMPTY);
      })
      .catch((err) => setNote({ type: "err", text: errorText(err) }))
      .finally(() => setBusy(false));
  };

  if (error) return <p className="contact-msg">{error}</p>;
  if (!data) return <p className="contact-msg">Loading...</p>;

  return (
    <section className="contact">
      <div className="contact-top">
        <div className="contact-info">
          <h1 className="contact-title">{data.title}</h1>
          <h2 className="contact-sub">{data.section_title}</h2>

          {data.inquiry_label && <p>{data.inquiry_label}</p>}
          {data.inquiry_phone && <p>{data.inquiry_phone}</p>}

          {data.other_label && <p className="contact-gap">{data.other_label}</p>}
          {data.other_phone_1 && <p>{data.other_phone_1}</p>}
          {data.other_phone_2 && <p>{data.other_phone_2}</p>}
          {data.working_hours && <p>{data.working_hours}</p>}

          {data.email && (
            <p>
              Email: <a href={`mailto:${data.email}`}>{data.email}</a>
            </p>
          )}
        </div>

        <div className="contact-photo">
          {data.image && <img src={data.image} alt="" />}
        </div>
      </div>

      <hr className="contact-line" />

      <form className="enq" onSubmit={submit}>
        <h2 className="enq-title">{data.enquiry_title}</h2>

        <div className="enq-field first">
          <label htmlFor="enq-name">Name</label>
          <input id="enq-name" name="name" value={form.name} onChange={change} required />
        </div>

        <div className="enq-row">
          <div className="enq-field">
            <label htmlFor="enq-email">Email</label>
            <input id="enq-email" type="email" name="email" value={form.email} onChange={change} required />
          </div>
          <div className="enq-field">
            <label htmlFor="enq-phone">Phone</label>
            <input id="enq-phone" type="tel" name="phone" value={form.phone} onChange={change} />
          </div>
        </div>

        <div className="enq-field">
          <label htmlFor="enq-message">Message</label>
          <textarea id="enq-message" name="message" value={form.message} onChange={change} required />
        </div>

        <button className="enq-btn" type="submit" disabled={busy}>
          {busy ? "Sending..." : "Send"}
        </button>

        {note && <p className={`enq-note ${note.type}`}>{note.text}</p>}
      </form>
    </section>
  );
}
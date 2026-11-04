import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { FaMeta } from "react-icons/fa6";
import api from "../services/api";

const shop = [["New in", "/products?featured=true"], ["Women", "/products?category=womens"], ["Men", "/products?category=mens"],
  ["Accessories", "/products?category=accessories"], ["Heels", "/products?search=heels"], ["About us", "/about"]];
const info = [["Search", "/products"], ["Return & Exchange Policy", "/return-policy"], ["Privacy Policy", "/privacy-policy"],
  ["Terms of Service", "/terms"], ["Shipping Policy", "/shipping-policy"], ["Blogs", "/blogs"]];

export default function Footer({ c }) {
  const [email, setEmail] = useState("");
  const subscribe = async (e) => {
    e.preventDefault();
    try {
      await api.post("/subscribe/", { email });
      toast.success("Subscribed!");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.email?.[0] || "Could not subscribe");
    }
  };
  return (
    <footer className="footer">
      <div className="fgrid">
        <div>
          <h3>Contact Us</h3>
          <p>We’d love to hear from you!<br />Landline : {c?.landline}<br />WhatsApp : {c?.whatsapp}<br />Email : {c?.email}<br />Address : {c?.address}</p>
        </div>
        <div><h3>Shop</h3><ul>{shop.map(([t, to]) => <li key={t}><Link to={to}>{t}</Link></li>)}</ul></div>
        <div><h3>Info</h3><ul>{info.map(([t, to]) => <li key={t}><Link to={to}>{t}</Link></li>)}</ul></div>
        <div><h3>Social Media</h3><div className="social"><FaFacebookF /><FaInstagram /><FaTwitter /><FaMeta /></div></div>
        <form className="news" onSubmit={subscribe}>
          <h3>Lets stay in touch !</h3>
          <p>Sign up for exclusive offers, original stories, events and more.</p>
          <label>Email id</label>
          <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </footer>
  );
}
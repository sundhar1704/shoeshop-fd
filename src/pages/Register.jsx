import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import api from "../services/api";
import "../styles/login.css";

const EMPTY = { full_name: "", email: "", phone: "", password: "", confirm_password: "" };

const FIELDS = [
  { name: "full_name", label: "Full Name", placeholder: "Enter your full name", type: "text", auto: "name" },
  { name: "email", label: "Email id", placeholder: "Enter your email", type: "email", auto: "email" },
  { name: "phone", label: "Phone Number", placeholder: "Enter 10-digit mobile number", type: "tel", auto: "tel" },
  { name: "password", label: "Password", placeholder: "Enter password", type: "password", auto: "new-password" },
  { name: "confirm_password", label: "Confirm Password", placeholder: "Re-enter password", type: "password", auto: "new-password" },
];

const msg = (v) => (Array.isArray(v) ? v.join(" ") : String(v));

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await api.post("/auth/register/", form);
      toast.success("Account created. Please log in.");
      navigate("/login");
    } catch (err) {
      const res = err.response;
      if (res && res.status === 400 && res.data && typeof res.data === "object") {
        setErrors(res.data);
      } else if (res && res.status === 429) {
        toast.error("Too many tries. Please wait a minute.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth">
        <div className="auth-tabs">
          <Link className="auth-tab" to="/login">Log in</Link>
          <span className="auth-tab on">Register</span>
        </div>

        <form className="auth-form" onSubmit={submit} noValidate>
          {FIELDS.map((f) => {
            const isPass = f.type === "password";
            return (
              <div className="auth-field" key={f.name}>
                <label className="auth-label" htmlFor={`reg-${f.name}`}>{f.label}</label>
                <div className="auth-input">
                  <input
                    id={`reg-${f.name}`}
                    name={f.name}
                    type={isPass && show ? "text" : f.type}
                    placeholder={f.placeholder}
                    autoComplete={f.auto}
                    value={form[f.name]}
                    onChange={change}
                    required
                  />
                  {isPass && (
                    <button
                      type="button"
                      className="auth-eye"
                      onClick={() => setShow(!show)}
                      aria-label={show ? "Hide password" : "Show password"}
                    >
                      {show ? <FiEye /> : <FiEyeOff />}
                    </button>
                  )}
                </div>
                {errors[f.name] && <p className="auth-err">{msg(errors[f.name])}</p>}
              </div>
            );
          })}

          {errors.non_field_errors && <p className="auth-err">{msg(errors.non_field_errors)}</p>}

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Please wait..." : "Register"}
          </button>

          <p className="auth-or">Or</p>

          <button
            type="button"
            className="auth-google"
            onClick={() => toast("Google login is coming soon")}
          >
            Continue with google <FcGoogle />
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
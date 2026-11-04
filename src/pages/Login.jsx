import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(email, password);
      navigate(u.role === "customer" ? "/" : "/admin");
    } catch {
      toast.error("Wrong email or password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth">
        <div className="auth-tabs">
          <span className="auth-tab on">Log in</span>
          <Link className="auth-tab" to="/register">Register</Link>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Email id</label>
            <div className="auth-input">
              <input
                id="login-email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <div className="auth-input">
              <input
                id="login-password"
                type={show ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <FiEye /> : <FiEyeOff />}
              </button>
            </div>
            <Link className="auth-forgot" to="/forgot-password">Forget Password?</Link>
          </div>

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Please wait..." : "Log In"}
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
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
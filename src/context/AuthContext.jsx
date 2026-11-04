import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login/", { username: email, password });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    const refresh = localStorage.getItem("refresh");
    // tell the backend (blocks the token + saves the Logout row); never stop the logout if it fails
    if (refresh) api.post("/auth/logout/", { refresh }).catch(() => {});
    localStorage.clear();
    setUser(null);
  };

  const isManager = user && (user.role === "admin" || user.role === "staff");

  return <AuthContext.Provider value={{ user, login, logout, isManager }}>{children}</AuthContext.Provider>;
}
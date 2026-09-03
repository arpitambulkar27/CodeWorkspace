// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  // Set default Axios authorization header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // Fetch logged-in user profile on boot
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch current user:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Register User
  const register = async (username, email, password) => {
    const res = await axios.post("http://localhost:5000/api/auth/register", {
      username,
      email,
      password,
    });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  // Login User
  const login = async (email, password) => {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  // Google & GitHub Social OAuth Login / Signup
  const socialLogin = async (provider, email, username, avatar) => {
    const res = await axios.post("http://localhost:5000/api/auth/social", {
      provider,
      email,
      username,
      avatar,
    });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, socialLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
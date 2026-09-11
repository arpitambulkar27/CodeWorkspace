// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
      const res = await axios.get(`${API_BASE_URL}/api/auth/me`);
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
    const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      username,
      email,
      password,
    });
    if (res.data && res.data.token) {
      const { token: newToken, ...userData } = res.data;
      localStorage.setItem("token", newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);
    }
    return res.data;
  };

  // Send / Resend OTP
  const sendOtp = async (email) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, {
      email,
    });
    return res.data;
  };

  // Verify OTP
  const verifyOtp = async (email, otp) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
      email,
      otp,
    });
    if (res.data && res.data.token) {
      const { token: newToken, ...userData } = res.data;
      localStorage.setItem("token", newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);
    }
    return res.data;
  };

  // Login User
  const login = async (email, password) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password,
    });
    if (res.data && res.data.token) {
      const { token: newToken, ...userData } = res.data;
      localStorage.setItem("token", newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);
    }
    return res.data;
  };

  // Google One-Tap / Button Login
  const loginWithGoogle = async (credential) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/google`, {
      credential,
    });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem("token", newToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  // GitHub OAuth Login
  const loginWithGithub = async (code) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/github`, {
      code,
    });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem("token", newToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  // Deprecated fallback route
  const socialLogin = async (provider, email, username, avatar) => {
    throw new Error("Social login fallback is deprecated. Use Google or GitHub buttons.");
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        sendOtp,
        verifyOtp,
        loginWithGoogle,
        loginWithGithub,
        socialLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
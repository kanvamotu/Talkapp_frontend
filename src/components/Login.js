import React, { useState } from "react";
import axios from "axios";
import { connectSocket } from "../socket";

const API_URL = process.env.REACT_APP_BASE_URL;

const Login = ({ setLoggedIn, setUser, setSocket, switchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const s = connectSocket(res.data.accessToken);

      setUser(res.data.user);
      setSocket(s);
      setLoggedIn(true);
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>

        {/* 🔥 LOGO */}
        <img
          src="https://dynamic.design.com/preview/logodraft/f0ac73df-7212-443d-8239-a0ffceb94ecb/image/large.png"
          alt="App Logo"
          style={styles.logo}
        />

        <p style={styles.subtitle}>Login to your account</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Login
          </button>

          {error && <p style={styles.error}>{error}</p>}
        </form>

        <p style={styles.registerText}>
          Don’t have an account?{" "}
          <span style={styles.registerLink} onClick={switchToRegister}>
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    fontFamily: "Inter, sans-serif",
  },

  formBox: {
    backdropFilter: "blur(15px)",
    background: "rgba(255, 255, 255, 0.08)",
    padding: "40px",
    borderRadius: "16px",
    width: "360px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  logo: {
    width: "90px",
    marginBottom: "20px",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  },

  subtitle: {
    marginBottom: "25px",
    color: "#e0e0e0",
    fontSize: "14px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
  },

  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#ffffff",
    color: "#4f46e5",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s",
  },

  error: {
    color: "#ff6b6b",
    fontSize: "13px",
  },

  registerText: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#ddd",
  },

  registerLink: {
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Login;
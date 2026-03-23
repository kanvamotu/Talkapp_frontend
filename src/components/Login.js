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
      <div style={styles.card}>

        {/* 🔥 LOGO */}
        <img
          src="https://dynamic.design.com/preview/logodraft/2b9a11b0-c483-4b31-bba6-eab59b22c31c/image/large.png"
          alt="App Logo"
          style={styles.logo}
        />

        <h2 style={styles.title}>Welcome Back</h2>
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
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    fontFamily: "Inter, Arial, sans-serif",
  },
  card: {
    background: "#fff",
    padding: "40px 35px",
    borderRadius: "12px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    width: "380px",
    textAlign: "center",
  },
  logo: {
    width: "70px",
    marginBottom: "15px",
  },
  title: {
    marginBottom: "5px",
    fontSize: "26px",
    fontWeight: "600",
  },
  subtitle: {
    marginBottom: "25px",
    color: "#777",
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
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#667eea",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s",
  },
  error: {
    color: "red",
    fontSize: "13px",
  },
  registerText: {
    marginTop: "20px",
    fontSize: "14px",
  },
  registerLink: {
    color: "#667eea",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Login;
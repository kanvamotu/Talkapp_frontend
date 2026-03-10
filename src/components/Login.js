import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BASE_URL;

const Login = ({ setLoggedIn, switchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setLoggedIn(true);
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Login to your account</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Enter your password"
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
          New user?{" "}
          <span style={styles.registerLink} onClick={switchToRegister}>
            Create an account
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
    fontFamily: "Arial, sans-serif",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    width: "350px",
    textAlign: "center",
  },
  title: {
    marginBottom: "5px",
    fontSize: "28px",
    fontWeight: "bold",
    color: "#333",
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
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    transition: "0.3s",
  },
  button: {
    padding: "12px",
    borderRadius: "6px",
    border: "none",
    background: "#667eea",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
  registerText: {
    marginTop: "20px",
    fontSize: "14px",
  },
  registerLink: {
    color: "#667eea",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Login;
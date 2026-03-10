import React, { useState } from "react";
import axios from "axios";

const Register = ({ switchToLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = process.env.REACT_APP_BASE_URL;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post(`${API_URL}/register`, {
        username,
        email,
        password,
      });

      setSuccess("Account created successfully 🎉 Please login");
      setUsername("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        switchToLogin();
      }, 1500);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError("Username already taken ❌ Try another one");
      } else {
        setError("Server error. Please try again later");
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join our platform</p>

        <form onSubmit={handleRegister} style={styles.form}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />

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

          <button style={styles.button}>Create Account</button>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
        </form>

        <p style={styles.loginText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={switchToLogin}>
            Login
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
    borderRadius: "12px",
    width: "350px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
    textAlign: "center",
  },

  title: {
    marginBottom: 5,
    fontSize: 26,
    fontWeight: "bold",
    color: "#1F2937",
  },

  subtitle: {
    marginBottom: 25,
    color: "#6B7280",
    fontSize: 14,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },

  input: {
    padding: 12,
    borderRadius: 6,
    border: "1px solid #D1D5DB",
    fontSize: 14,
    outline: "none",
    transition: "0.2s",
  },

  button: {
    padding: 12,
    borderRadius: 6,
    border: "none",
    background: "#667eea",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
  },

  error: {
    color: "#DC2626",
    fontSize: 14,
  },

  success: {
    color: "#16A34A",
    fontSize: 14,
  },

  loginText: {
    marginTop: 20,
    fontSize: 14,
  },

  link: {
    color: "#667eea",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Register;
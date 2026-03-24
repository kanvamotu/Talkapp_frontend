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
      <style>
        {`
          input::placeholder {
            color: white;
            opacity: 1;
          }

          input:focus::placeholder {
            color: white;
          }
        `}
      </style>

      <div style={styles.formBox}>
        {/* 🔥 LOGO */}
        <img
          src="https://dynamic.design.com/preview/logodraft/f0ac73df-7212-443d-8239-a0ffceb94ecb/image/large.png"
          alt="App Logo"
          style={styles.logo}
        />

        <p style={styles.subtitle}>Create your account</p>

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

          <button type="submit" style={styles.button}>
            Create Account
          </button>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
        </form>

        <p style={styles.loginText}>
          Already have an account?{" "}
          <span style={styles.loginLink} onClick={switchToLogin}>
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
    background: "linear-gradient(135deg, rgb(48, 35, 174), rgb(200, 109, 215))",
    fontFamily: "Inter, sans-serif",
  },

  formBox: {
    backdropFilter: "blur(20px)",
    background: "rgba(255, 255, 255, 0.1)",
    padding: "45px 35px",
    borderRadius: "18px",
    width: "380px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },

  logo: {
    width: "140px",
    marginBottom: "25px",
    borderRadius: "14px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.35)",
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
    padding: "13px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "0.3s",
  },

  button: {
    padding: "13px",
    borderRadius: "10px",
    border: "none",
    background: "#ffffff",
    color: "rgb(48, 35, 174)",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
  },

  error: {
    color: "#ff6b6b",
    fontSize: "13px",
  },

  success: {
    color: "#4ade80",
    fontSize: "13px",
  },

  loginText: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#ddd",
  },

  loginLink: {
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Register;
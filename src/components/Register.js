import React, { useState } from "react";
import axios from "axios";

const Register = ({ switchToLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = "https://talkappbackend-production.up.railway.app";

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

      setSuccess("Account created! Please login 🔐");
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
      <h2>Create Account</h2>

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
          placeholder="Email"
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

        <button style={styles.button}>Register</button>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
      </form>

      <p>
        Already have an account?{" "}
        <span style={styles.link} onClick={switchToLogin}>
          Login
        </span>
      </p>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    width: 300,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    padding: 10,
    fontSize: 16,
  },
  button: {
    padding: 10,
    cursor: "pointer",
  },
  error: { color: "red" },
  success: { color: "green" },
  link: {
    color: "blue",
    cursor: "pointer",
  },
};

export default Register;

import React, { useState } from "react";
import axios from "axios";
//import { connectSocket } from "../socket";

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
      <h2>Login</h2>

      <form onSubmit={handleLogin} style={styles.form}>
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

        <button type="submit" style={styles.button}>
          Login
        </button>

        {error && <p style={styles.error}>{error}</p>}
      </form>

      {/* 🔥 REGISTER LINK */}
      <p style={{ marginTop: 10 }}>
        New user?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={switchToRegister}
        >
          Create an account
        </span>
      </p>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
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
    fontSize: 16,
    cursor: "pointer",
  },
  error: {
    color: "red",
  },
};


export default Login;

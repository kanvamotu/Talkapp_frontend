import React, { useState, useEffect } from "react";
import axios from "axios";
import { connectSocket } from "../socket"; // make sure your socket function is imported

const API_URL = process.env.REACT_APP_BASE_URL;

const Login = ({ setLoggedIn, setUser, setSocket, switchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [pupilX, setPupilX] = useState(0);
  const [pupilY, setPupilY] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPasswordFocus, setIsPasswordFocus] = useState(false);

  /* 👁 FOLLOW MOUSE */
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isPasswordFocus) return;

      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      const max = 10;

      setPupilX(Math.max(Math.min(x, max), -max));
      setPupilY(Math.max(Math.min(y, max), -max));
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isPasswordFocus]);

  /* 👁 BLINK */
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 400);
    }, Math.random() * 4000 + 2500);

    return () => clearInterval(blinkInterval);
  }, []);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setPupilX(-6);
    setPupilY(-2);
  };

  const handlePasswordFocus = () => setIsPasswordFocus(true);
  const handlePasswordBlur = () => setIsPasswordFocus(false);

  /* ✅ HANDLE LOGIN AND REDIRECT */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });

      // Save tokens & user
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Initialize socket immediately
      const s = connectSocket(res.data.accessToken);

      // Update App state to redirect to Chat page
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
        {/* Eye */}
        <div style={styles.eyeWrapper}>
          <svg width="160" height="100" viewBox="0 0 160 100">
            {/* Eyebrow */}
            <path
              d="M30,25 Q80,0 130,25"
              stroke="#333"
              strokeWidth="4"
              fill="transparent"
              strokeLinecap="round"
            />

            {/* Upper eyelid */}
            <path
              d={
                isBlinking || isPasswordFocus
                  ? "M20,50 Q80,50 140,50"
                  : "M20,50 Q80,20 140,50"
              }
              stroke="#333"
              strokeWidth="3"
              fill="transparent"
            />

            {/* Lower eyelid */}
            <path
              d={
                isBlinking || isPasswordFocus
                  ? "M20,50 Q80,50 140,50"
                  : "M20,50 Q80,80 140,50"
              }
              stroke="#333"
              strokeWidth="2"
              fill="transparent"
            />

            {!isBlinking && !isPasswordFocus && (
              <>
                <defs>
                  <radialGradient id="irisGradient">
                    <stop offset="0%" stopColor="#aad4ff" />
                    <stop offset="70%" stopColor="#6aa1f2" />
                    <stop offset="100%" stopColor="#2d69c8" />
                  </radialGradient>
                </defs>

                <circle
                  cx={80 + pupilX}
                  cy={50 + pupilY}
                  r="15"
                  fill="url(#irisGradient)"
                />

                <circle cx={80 + pupilX} cy={50 + pupilY} r="7" fill="#000" />
                <circle cx={76 + pupilX} cy={46 + pupilY} r="3" fill="#fff" />
              </>
            )}
          </svg>
        </div>

        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Login to your account</p>

        <form onSubmit={handleLogin} style={styles.form}>
          {/* EMAIL */}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            required
            style={styles.input}
          />

          {/* PASSWORD WITH MONKEY */}
          <div style={styles.passwordWrapper}>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.passwordInput}
            />

            <span style={styles.monkey}>
              {isPasswordFocus ? "🙈" : "🐵"}
            </span>
          </div>

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
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    fontFamily: "Arial",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    width: "420px",
    textAlign: "center",
  },
  eyeWrapper: { marginBottom: "15px" },
  title: { marginBottom: "5px", fontSize: "28px", fontWeight: "bold" },
  subtitle: { marginBottom: "25px", color: "#777", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: { padding: "12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" },
  passwordWrapper: { position: "relative", display: "flex", alignItems: "center" },
  passwordInput: { width: "100%", padding: "12px", paddingRight: "40px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" },
  monkey: { position: "absolute", right: "10px", fontSize: "20px" },
  button: { padding: "12px", borderRadius: "6px", border: "none", background: "#667eea", color: "#fff", fontSize: "16px", fontWeight: "bold", cursor: "pointer" },
  error: { color: "red", fontSize: "14px" },
  registerText: { marginTop: "20px", fontSize: "14px" },
  registerLink: { color: "#667eea", fontWeight: "bold", cursor: "pointer" },
};

export default Login;
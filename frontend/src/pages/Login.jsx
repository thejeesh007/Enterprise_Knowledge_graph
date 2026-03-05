import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("admin@ekg.local");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "var(--bg-main)",
      display: "grid",
      placeItems: "center",
      padding: "20px",
      fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
    },
    card: {
      width: "100%",
      maxWidth: "420px",
      borderRadius: "16px",
      border: "1px solid var(--border-color)",
      background: "var(--card-bg)",
      padding: "22px",
      boxShadow: "var(--shadow-soft)"
    },
    title: { margin: 0, color: "var(--text-primary)", fontSize: "24px", fontWeight: 800 },
    subtitle: { marginTop: "6px", color: "var(--text-muted)", fontSize: "14px" },
    input: {
      width: "100%",
      borderRadius: "10px",
      border: "1px solid var(--border-color)",
      background: "var(--bg-main)",
      color: "var(--text-primary)",
      padding: "10px 12px",
      fontSize: "14px"
    },
    label: { fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px", display: "block" },
    button: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid var(--accent-primary)",
      background: "var(--accent-primary)",
      color: "#fff",
      fontWeight: 700,
      cursor: "pointer"
    },
    error: { color: "#dc2626", fontSize: "13px", marginTop: "8px" },
    hint: { color: "var(--text-muted)", fontSize: "12px", marginTop: "12px" }
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={onSubmit}>
        <h1 style={styles.title}>Sign In</h1>
        <div style={styles.subtitle}>Use demo credentials to access graph features.</div>

        <div style={{ marginTop: "14px" }}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div style={{ marginTop: "10px" }}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button style={{ ...styles.button, marginTop: "14px" }} disabled={loading} type="submit">
          {loading ? "Signing in..." : "Sign In"}
        </button>
        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.hint}>
          Bootstrap admin (default): admin@ekg.local / Admin@123
          <br />
          Can be overridden with backend env:
          <br />
          AUTH_BOOTSTRAP_ADMIN_EMAIL, AUTH_BOOTSTRAP_ADMIN_PASSWORD
        </div>
      </form>
    </div>
  );
}

export default Login;

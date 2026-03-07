"use client";
// app/(auth)/signup/page.jsx
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) { setError("please accept the terms to continue"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    // Auto sign in after signup
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
  };

  const handleGoogle = () => {
    if (!agreed) { setError("please accept the terms to continue"); return; }
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div style={s.root}>
      <div style={s.blob1} /><div style={s.blob2} />
      <div style={s.card}>
        <Link href="/" style={s.back}>← back</Link>
        <div style={{ fontSize: 30, textAlign: "center" }}>💔</div>
        <h1 style={s.title}>create account</h1>
        <p style={s.sub}>free to start · no credit card needed</p>

        <button style={s.googleBtn} onClick={handleGoogle}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          continue with Google
        </button>

        <div style={s.orRow}><div style={s.orLine} /><span style={s.orLabel}>or</span><div style={s.orLine} /></div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <input style={s.input} type="text" placeholder="name (optional)" value={name} onChange={e => setName(e.target.value)} />
          <input style={s.input} type="email" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={s.input} type="password" placeholder="password (8+ chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />

          <label style={s.checkRow}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: "#c2185b" }} />
            <span style={{ fontSize: 11, color: "rgba(255,180,210,0.45)", lineHeight: 1.5 }}>
              I agree to the{" "}
              <Link href="/terms" style={s.legalLink} target="_blank">terms of service</Link>{" "}
              and{" "}
              <Link href="/privacy" style={s.legalLink} target="_blank">privacy policy</Link>
            </span>
          </label>

          {error && <div style={s.err}>{error}</div>}
          <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
            {loading ? "creating account..." : "create account →"}
          </button>
        </form>

        <p style={s.switch}>already have an account? <Link href="/login" style={s.switchLink}>sign in</Link></p>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: 16 },
  blob1: { position: "fixed", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(180,40,100,0.15) 0%,transparent 70%)", top: -100, right: -100, pointerEvents: "none" },
  blob2: { position: "fixed", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(100,20,140,0.12) 0%,transparent 70%)", bottom: -80, left: -80, pointerEvents: "none" },
  card: { position: "relative", zIndex: 1, width: "100%", maxWidth: 400, background: "rgba(20,10,24,0.9)", border: "1px solid rgba(255,100,160,0.12)", borderRadius: 22, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 16, alignItems: "center", backdropFilter: "blur(20px)", boxShadow: "0 24px 70px rgba(0,0,0,0.5)", animation: "fadeUp .4s ease" },
  back: { alignSelf: "flex-start", fontSize: 11, color: "rgba(255,180,210,0.3)", letterSpacing: "0.04em" },
  title: { fontFamily: "'Instrument Serif', serif", fontSize: 26, fontWeight: 400, color: "#ffd6e7" },
  sub: { fontSize: 11, color: "rgba(255,180,210,0.4)", letterSpacing: "0.04em" },
  googleBtn: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#ffd6e7", fontSize: 13 },
  orRow: { display: "flex", alignItems: "center", gap: 10, width: "100%" },
  orLine: { flex: 1, height: 1, background: "rgba(255,100,160,0.1)" },
  orLabel: { fontSize: 10, color: "rgba(255,180,210,0.25)" },
  input: { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,100,160,0.15)", borderRadius: 12, padding: "12px 16px", color: "#ffd6e7", fontSize: 13 },
  checkRow: { display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" },
  legalLink: { color: "#ff9dc6" },
  err: { fontSize: 11, color: "#ff6b9d", textAlign: "center" },
  btn: { width: "100%", background: "linear-gradient(135deg,#c2185b,#880e4f)", border: "none", borderRadius: 12, padding: "13px", color: "#ffd6e7", fontSize: 13, letterSpacing: "0.04em", boxShadow: "0 4px 20px rgba(180,40,100,0.3)", transition: "opacity .2s" },
  switch: { fontSize: 11, color: "rgba(255,180,210,0.3)" },
  switchLink: { color: "#ff9dc6" },
};

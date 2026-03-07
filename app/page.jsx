// app/page.jsx
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main style={s.root}>
      <div style={s.blob1} />
      <div style={s.blob2} />

      <nav style={s.nav}>
        <span style={s.logo}>🕯️ still</span>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login" style={s.navLink}>log in</Link>
          <Link href="/signup" style={s.navBtn}>get started</Link>
        </div>
      </nav>

      <section style={s.hero}>
        <h1 style={s.headline}>
          talk to them<br />
          <em>one more time</em>
        </h1>
        <p style={s.sub}>
          Upload your old chats. Our AI learns exactly how they text —
          their words, their energy, their habits. Then you can talk to them again.
        </p>
        <Link href="/signup" style={s.cta}>start →</Link>
        <p style={s.fine}>no credit card · your chats never leave your device</p>
      </section>

      <section style={s.howSection}>
        <h2 style={s.sectionTitle}>how it works</h2>
        <div style={s.steps}>
          {[
            { n: "01", title: "import your chats", desc: "WhatsApp, iMessage, Telegram, Instagram, Messenger, Zalo — upload the export or just paste." },
            { n: "02", title: "AI learns them", desc: "We analyze their texting style, vocabulary, emoji habits, and extract real facts from your conversations." },
            { n: "03", title: "talk to them", desc: "Chat with an AI that texts exactly like they do. Their words. Their energy. Their vibe." },
          ].map(step => (
            <div key={step.n} style={s.stepCard}>
              <span style={s.stepNum}>{step.n}</span>
              <h3 style={s.stepTitle}>{step.title}</h3>
              <p style={s.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={s.footer}>
        <span style={s.logo}>🕯️ still</span>
        <div style={{ display: "flex", gap: 20 }}>
          <Link href="/privacy" style={s.footerLink}>privacy policy</Link>
          <Link href="/terms" style={s.footerLink}>terms of service</Link>
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,180,210,0.2)" }}>© 2025 still</span>
      </footer>
    </main>
  );
}

const s = {
  root: { minHeight: "100vh", position: "relative", overflow: "hidden" },
  blob1: { position: "fixed", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(180,40,100,0.15) 0%,transparent 70%)", top: -100, right: -100, pointerEvents: "none", animation: "blob 12s ease-in-out infinite" },
  blob2: { position: "fixed", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(100,20,140,0.12) 0%,transparent 70%)", bottom: -80, left: -80, pointerEvents: "none", animation: "blob 15s ease-in-out infinite reverse" },
  nav: { position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,100,160,0.08)" },
  logo: { fontFamily: "'Instrument Serif', serif", fontSize: 18, color: "#ffd6e7" },
  navLink: { fontSize: 12, color: "rgba(255,180,210,0.5)", padding: "8px 14px" },
  navBtn: { fontSize: 12, color: "#ffd6e7", background: "rgba(255,100,160,0.12)", border: "1px solid rgba(255,100,160,0.2)", borderRadius: 8, padding: "8px 16px" },
  hero: { position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto", padding: "100px 24px 80px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 },
  badge: { fontSize: 10, color: "rgba(255,150,190,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(255,100,160,0.08)", border: "1px solid rgba(255,100,160,0.12)", borderRadius: 20, padding: "6px 14px" },
  headline: { fontFamily: "'Instrument Serif', serif", fontSize: "clamp(42px,8vw,72px)", fontWeight: 400, color: "#ffd6e7", lineHeight: 1.15, letterSpacing: "-0.02em" },
  sub: { fontSize: 15, color: "rgba(255,180,210,0.55)", lineHeight: 1.7, maxWidth: 480 },
  cta: { background: "linear-gradient(135deg,#c2185b,#880e4f)", color: "#ffd6e7", borderRadius: 14, padding: "16px 32px", fontSize: 14, letterSpacing: "0.04em", boxShadow: "0 8px 30px rgba(180,40,100,0.3)", marginTop: 8 },
  fine: { fontSize: 10, color: "rgba(255,180,210,0.25)", letterSpacing: "0.04em" },
  howSection: { position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "60px 24px" },
  sectionTitle: { fontFamily: "'Instrument Serif', serif", fontSize: 28, color: "#ffd6e7", textAlign: "center", marginBottom: 40 },
  steps: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 },
  stepCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,100,160,0.1)", borderRadius: 16, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 12 },
  stepNum: { fontSize: 11, color: "rgba(255,100,160,0.4)", letterSpacing: "0.1em" },
  stepTitle: { fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#ffd6e7", fontWeight: 400 },
  stepDesc: { fontSize: 12, color: "rgba(255,180,210,0.45)", lineHeight: 1.65 },
  footer: { position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "24px 40px", borderTop: "1px solid rgba(255,100,160,0.08)", marginTop: 40 },
  footerLink: { fontSize: 11, color: "rgba(255,180,210,0.3)", letterSpacing: "0.04em" },
};

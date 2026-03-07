"use client";
// app/dashboard/DashboardClient.jsx
import { useState } from "react";
import { signOut } from "next-auth/react";
import ChatApp from "@/components/ChatApp";

const PLATFORM_ICONS = { whatsapp: "💬", imessage: "🫧", telegram: "✈️", instagram: "📸", messenger: "💙", zalo: "🟦" };

export default function DashboardClient({ user, personas: initial }) {
  const [personas, setPersonas] = useState(initial);
  const [activePersona, setActivePersona] = useState(null); // { name, platform, styleGuide, id }
  const [showNewChat, setShowNewChat] = useState(false);

  const handleSavePersona = async (name, platform, styleGuide) => {
    const res = await fetch("/api/personas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, platform, styleGuide }),
    });
    const saved = await res.json();
    setPersonas(prev => [saved, ...prev]);
    return saved.id;
  };

  const handleDeletePersona = async (id) => {
    await fetch("/api/personas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPersonas(prev => prev.filter(p => p.id !== id));
    if (activePersona?.id === id) setActivePersona(null);
  };

  if (showNewChat || activePersona) {
    return (
      <ChatApp
        initialPersona={activePersona}
        onSavePersona={handleSavePersona}
        onBack={() => { setShowNewChat(false); setActivePersona(null); }}
      />
    );
  }

  return (
    <div style={s.root}>
      <div style={s.blob1} /><div style={s.blob2} />

      <nav style={s.nav}>
        <span style={s.logo}>🕯️ still</span>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={s.userName}>{user.name || user.email}</span>
          <button style={s.signOutBtn} onClick={() => signOut({ callbackUrl: "/" })}>sign out</button>
        </div>
      </nav>

      <main style={s.main}>
        <div style={s.header}>
          <h1 style={s.title}>your people</h1>
          <button style={s.newBtn} onClick={() => setShowNewChat(true)}>+ new chat</button>
        </div>

        {personas.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 40 }}>👻</div>
            <p style={{ fontSize: 13, color: "rgba(255,180,210,0.4)", marginTop: 12 }}>no one yet — start a new chat to bring someone back</p>
            <button style={s.emptyBtn} onClick={() => setShowNewChat(true)}>start →</button>
          </div>
        ) : (
          <div style={s.grid}>
            {personas.map(p => (
              <div key={p.id} style={s.personaCard}>
                <div style={s.personaIcon}>{PLATFORM_ICONS[p.platform] || "💬"}</div>
                <div style={{ flex: 1 }}>
                  <div style={s.personaName}>{p.name}</div>
                  <div style={s.personaMeta}>{p.platform} · {p.messageCount} messages</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={s.chatBtn} onClick={() => setActivePersona(p)}>chat →</button>
                  <button style={s.deleteBtn} onClick={() => handleDeletePersona(p.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", position: "relative", overflow: "hidden" },
  blob1: { position: "fixed", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(180,40,100,0.12) 0%,transparent 70%)", top: -100, right: -100, pointerEvents: "none" },
  blob2: { position: "fixed", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(100,20,140,0.1) 0%,transparent 70%)", bottom: -80, left: -80, pointerEvents: "none" },
  nav: { position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 32px", borderBottom: "1px solid rgba(255,100,160,0.08)" },
  logo: { fontFamily: "'Instrument Serif', serif", fontSize: 17, color: "#ffd6e7" },
  userName: { fontSize: 11, color: "rgba(255,180,210,0.4)" },
  signOutBtn: { fontSize: 11, color: "rgba(255,180,210,0.3)", background: "none", border: "1px solid rgba(255,100,160,0.12)", borderRadius: 8, padding: "6px 12px" },
  main: { position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "40px 24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  title: { fontFamily: "'Instrument Serif', serif", fontSize: 28, color: "#ffd6e7", fontWeight: 400 },
  newBtn: { background: "linear-gradient(135deg,#c2185b,#880e4f)", border: "none", borderRadius: 10, padding: "10px 20px", color: "#ffd6e7", fontSize: 12, letterSpacing: "0.04em", boxShadow: "0 4px 16px rgba(180,40,100,0.25)" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 8 },
  emptyBtn: { marginTop: 16, background: "rgba(255,100,160,0.1)", border: "1px solid rgba(255,100,160,0.2)", borderRadius: 10, padding: "10px 24px", color: "#ff9dc6", fontSize: 12 },
  grid: { display: "flex", flexDirection: "column", gap: 12 },
  personaCard: { display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,100,160,0.1)", borderRadius: 16 },
  personaIcon: { fontSize: 22, flexShrink: 0 },
  personaName: { fontSize: 15, color: "#ffd6e7", fontFamily: "'Instrument Serif', serif" },
  personaMeta: { fontSize: 10, color: "rgba(255,180,210,0.35)", marginTop: 3, letterSpacing: "0.04em" },
  chatBtn: { background: "rgba(255,100,160,0.1)", border: "1px solid rgba(255,100,160,0.18)", borderRadius: 8, padding: "7px 14px", color: "#ff9dc6", fontSize: 11 },
  deleteBtn: { background: "none", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "7px 10px", color: "rgba(255,180,210,0.25)", fontSize: 11 },
};

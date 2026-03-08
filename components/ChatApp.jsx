"use client";
// components/ChatApp.jsx
import { useState, useRef, useEffect } from "react";
import { parseWhatsApp, parseTelegram, parseInstagram, parseGeneric, getSenders } from "@/lib/parsers";

const PLATFORMS = {
  whatsapp:  { label: "WhatsApp",  icon: "💬", acceptFile: ".txt",           parse: parseWhatsApp,  howTo: ['Open the chat → tap ⋮ → More → "Export chat"', 'Choose "Without Media"', "Upload the .txt file here"] },
  imessage:  { label: "iMessage",  icon: "🫧", acceptFile: ".txt,.csv",       parse: parseGeneric,   howTo: ['Use "iExporter" on Mac to export as .txt', "Or copy-paste the messages below"] },
  telegram:  { label: "Telegram",  icon: "✈️", acceptFile: ".txt,.json",      parse: parseTelegram,  howTo: ["Open the chat → ⋮ → Export chat history", 'Select "Plain text" or JSON', "Upload the file here"] },
  instagram: { label: "Instagram", icon: "📸", acceptFile: ".txt,.json",      parse: parseInstagram, howTo: ["Settings → Your activity → Download your information", 'Request "Messages" in JSON format', "Or copy-paste the DMs below"] },
  messenger: { label: "Messenger", icon: "💙", acceptFile: ".txt,.json,.html",parse: parseGeneric,   howTo: ["Facebook → Settings → Download your information", 'Select "Messages" and download', "Or copy-paste below"] },
  zalo:      { label: "Zalo",      icon: "🟦", acceptFile: ".txt",            parse: parseGeneric,   howTo: ["No direct export — copy-paste your messages below", "Format: Name: message"] },
};

// ─── API calls (go through /api/chat to keep key secret) ─────────────────────
const callClaude = async (body) => {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
};

const analyzeStyle = async (messages, exName, extraContext = "") => {
  const fullConvo  = messages.slice(-300).map(m => `${m.sender}: ${m.text}`).join("\n");
  const theirMsgs  = messages.filter(m => m.sender === exName).slice(0, 150).map(m => m.text).join("\n");
  return callClaude({
    model: "claude-sonnet-4-20250514", max_tokens: 2000,
    messages: [{ role: "user", content: `You are helping write a fictional character named "${exName}" for a creative story. Based on these sample messages, build a detailed character profile. Return TWO sections:\n\n## STYLE GUIDE\nDescribe exactly how this character texts: vocabulary, slang, emoji habits (which ones, how often), punctuation, capitalization, tone, energy, filler words. Give real examples.\n\nIMPORTANT - also analyze their MESSAGE LENGTH PATTERN: Do they send one long paragraph at a time? Multiple short messages in a row? A mix? Look at the actual messages and describe exactly how they chunk their texts. This is critical for realism.\n\n## CONTEXT & FACTS\nEvery meaningful fact about this character: job/studies, things they passed/failed, places, people, problems, plans, opinions, inside jokes. Be very thorough.\n\n--- THEIR MESSAGES ---\n${theirMsgs}\n\n--- FULL CONVERSATION ---\n${fullConvo}${extraContext ? "\n\n--- EXTRA CONTEXT ---\n" + extraContext : ""}` }],
  });
};

const replyAsEx = async (styleGuide, exName, conversation) => {
  const text = await callClaude({
    model: "claude-sonnet-4-20250514", max_tokens: 400,
    system: `You are a texting style simulator. Respond ONLY as the character described below. No disclaimers, no meta commentary, just text back.\n\n${styleGuide}\n\n---\nOUTPUT FORMAT (mandatory):\n- Use ||| to separate every individual text bubble\n- Max 8 words per bubble\n- Send 2-5 bubbles per response\n- NEVER write a long paragraph as one chunk\n- CORRECT: "omg|||wait seriously|||thats insane|||u ok?"\n- WRONG: "omg wait seriously thats insane u ok?"\n- Your ENTIRE response must use ||| format, no exceptions\n- Detect the language the character used in their messages and reply in that same language. If they texted in Vietnamese, reply in Vietnamese. If English, reply in English. Match their language exactly.`,
    messages: conversation,
  });
  return text.split("|||").map(m => m.trim()).filter(Boolean);
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChatApp({ initialPersona, onSavePersona, onBack }) {
  const [step, setStep]               = useState(initialPersona ? "chat" : "platform");
  const [platform, setPlatform]       = useState(initialPersona?.platform || null);
  const [rawText, setRawText]         = useState("");
  const [parsedMsgs, setParsedMsgs]   = useState([]);
  const [senders, setSenders]         = useState([]);
  const [exName, setExName]           = useState(initialPersona?.name || "");
  const [extraContext, setExtraContext]= useState("");
  const [styleGuide, setStyleGuide]   = useState(initialPersona?.styleGuide || "");
  const [personaId, setPersonaId]     = useState(initialPersona?.id || null);
  const [messages, setMessages]       = useState(initialPersona ? [] : []);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [dragOver, setDragOver]       = useState(false);
  const [parseError, setParseError]   = useState("");
  const fileRef  = useRef(null);
  const bottomRef= useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // If loading an existing persona, generate opener immediately
  useEffect(() => {
    if (initialPersona && messages.length === 0) {
      setLoading(true);
      replyAsEx(initialPersona.styleGuide, initialPersona.name, [
        { role: "user", content: `Send your first text to start the conversation, exactly like ${initialPersona.name} would.` }
      ]).then(opener => {
        const openerParts = Array.isArray(opener) ? opener : [opener];
        setMessages(openerParts.map(content => ({ role: "assistant", content })));
        setLoading(false);
      });
    }
  }, []);

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = e => {
      const buf = e.target.result;
      const utf8 = new TextDecoder("utf-8").decode(buf);
      const hasGarbled = (utf8.match(/\uFFFD/g) || []).length > 5;
      setRawText(hasGarbled ? new TextDecoder("latin-1").decode(buf) : utf8);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleParse = () => {
    if (!rawText.trim()) { setParseError("paste or upload your chat first"); return; }
    const msgs = PLATFORMS[platform].parse(rawText);
    if (msgs.length < 2) { setParseError("couldn't parse this format — try copy-pasting directly instead"); return; }
    setParseError("");
    setParsedMsgs(msgs);
    setSenders(getSenders(msgs));
    setStep("identify");
  };

  const handleSelectEx = (name) => { setExName(name); setStep("context"); };

  const handleStartAnalyze = async () => {
    setStep("analyzing");
    try {
      const guide = await analyzeStyle(parsedMsgs, exName, extraContext);
      setStyleGuide(guide);
      // Save persona to DB
      const id = await onSavePersona(exName, platform, guide);
      setPersonaId(id);
      // AI-generated opener
      const opener = await replyAsEx(guide, exName, [
        { role: "user", content: `Send your first text to start the conversation, exactly like ${exName} would.` }
      ]);
      const openerParts = Array.isArray(opener) ? opener : [opener];
      setMessages(openerParts.map(content => ({ role: "assistant", content })));
      setStep("chat");
    } catch { setStep("context"); }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    try {
      const parts = await replyAsEx(styleGuide, exName, next);
      // Drip messages one by one with typing delay
      let current = [...next];
      for (let i = 0; i < parts.length; i++) {
        const msg = parts[i];
        // typing delay based on message length — ~50ms per char, min 800ms, max 3000ms
        const typingDelay = Math.min(Math.max(msg.length * 150, 2000), 8000);
        await new Promise(r => setTimeout(r, typingDelay));
        current = [...current, { role: "assistant", content: msg }];
        setMessages([...current]);
      }
    } catch { setMessages([...next, { role: "assistant", content: "..." }]); }
    setLoading(false);
  };

  return (
    <div style={s.root}>
      <div style={s.blob1} /><div style={s.blob2} />
      <div style={s.card}>

        {step === "platform" && (
          <div style={s.stepWrap}>
            <button style={s.backLink} onClick={onBack}>← dashboard</button>
            <div style={{ fontSize: 34 }}>💔</div>
            <h1 style={s.title}>still</h1>
            <p style={s.sub}>where did you two talk?</p>
            <div style={s.platformGrid}>
              {Object.entries(PLATFORMS).map(([key, cfg]) => (
                <button key={key} style={s.platformBtn} onClick={() => { setPlatform(key); setStep("import"); }}>
                  <span style={{ fontSize: 24 }}>{cfg.icon}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,200,220,0.6)", marginTop: 4 }}>{cfg.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "import" && platform && (
          <div style={s.stepWrap}>
            <button style={s.backLink} onClick={() => setStep("platform")}>← back</button>
            <div style={{ fontSize: 26, textAlign: "center" }}>{PLATFORMS[platform].icon}</div>
            <h2 style={{ ...s.title, fontSize: 21 }}>import from {PLATFORMS[platform].label}</h2>
            <div style={s.howToBox}>
              <div style={s.howToLabel}>how to export</div>
              {PLATFORMS[platform].howTo.map((step, i) => (
                <div key={i} style={s.howToRow}>
                  <span style={s.howToNum}>{i + 1}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,200,220,0.6)", lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
            </div>
            <div style={{ ...s.dropzone, ...(dragOver ? s.dropzoneOn : {}) }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => fileRef.current?.click()}
            >
              {rawText ? <div style={{ color: "#ff6b9d", fontSize: 12 }}>✓ loaded · {rawText.split("\n").length} lines</div>
                : <><div style={{ fontSize: 20, marginBottom: 6 }}>📂</div><div style={{ fontSize: 11, color: "rgba(255,200,220,0.35)" }}>drop {PLATFORMS[platform].acceptFile} file or click to browse</div></>}
            </div>
            <input ref={fileRef} type="file" accept={PLATFORMS[platform].acceptFile} style={{ display: "none" }} onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
            <div style={s.orRow}><div style={s.orLine} /><span style={s.orLabel}>or paste directly</span><div style={s.orLine} /></div>
            <textarea style={s.pasteBox} placeholder={`paste your ${PLATFORMS[platform].label} conversation here...`} value={rawText} onChange={e => setRawText(e.target.value)} rows={5} />
            {parseError && <div style={s.errMsg}>{parseError}</div>}
            <button style={{ ...s.mainBtn, opacity: rawText ? 1 : 0.35 }} onClick={handleParse} disabled={!rawText}>parse chat →</button>
            <p style={s.privNote}>your chat log never leaves your browser</p>
          </div>
        )}

        {step === "identify" && (
          <div style={s.stepWrap}>
            <div style={{ fontSize: 26 }}>👤</div>
            <h2 style={{ ...s.title, fontSize: 21 }}>which one is them?</h2>
            <p style={s.sub}>{parsedMsgs.length} messages · {senders.length} people found</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
              {senders.map(name => (
                <button key={name} style={s.senderBtn} onClick={() => handleSelectEx(name)}>
                  <div style={s.senderAvatar}>{name[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 13, color: "#ffd6e7" }}>{name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,180,210,0.35)", marginTop: 2 }}>{parsedMsgs.filter(m => m.sender === name).length} messages</div>
                  </div>
                  <span style={{ color: "rgba(255,150,190,0.35)", fontSize: 14 }}>→</span>
                </button>
              ))}
            </div>
            <button style={s.backLink} onClick={() => setStep("import")}>← go back</button>
          </div>
        )}

        {step === "context" && (
          <div style={s.stepWrap}>
            <button style={s.backLink} onClick={() => setStep("identify")}>← back</button>
            <div style={s.senderAvatar}>{exName[0]?.toUpperCase()}</div>
            <h2 style={{ ...s.title, fontSize: 21 }}>anything else about {exName}?</h2>
            <p style={s.sub}>optional — add context the chat might not show</p>
            <textarea style={{ ...s.pasteBox, minHeight: 120 }}
              placeholder={`e.g. "he's 22, studying CS, always broke, obsessed with basketball, kinda avoidant, uses humor to deflect..."`}
              value={extraContext} onChange={e => setExtraContext(e.target.value)} rows={5} />
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button style={{ ...s.mainBtn, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,100,160,0.15)", boxShadow: "none", flex: 1 }} onClick={handleStartAnalyze}>skip →</button>
              <button style={{ ...s.mainBtn, flex: 2 }} onClick={handleStartAnalyze}>bring back {exName} ✦</button>
            </div>
          </div>
        )}

        {step === "analyzing" && (
          <div style={{ ...s.stepWrap, justifyContent: "center", minHeight: 280 }}>
            <div style={{ fontSize: 40, animation: "pulse 1.5s ease-in-out infinite" }}>💭</div>
            <p style={{ ...s.sub, marginTop: 14 }}>learning how {exName} texts...</p>
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff6b9d", animation: `dot 1.4s ${i * 0.2}s ease-in-out infinite` }} />)}
            </div>
          </div>
        )}

        {step === "chat" && (
          <div style={s.chatWrap}>
            <div style={s.chatHeader}>
              <button style={s.backLink} onClick={onBack}>←</button>
              <div style={{ textAlign: "center" }}>
                <div style={s.chatName}>{exName}</div>
                <div style={s.chatSub}>{loading ? "typing..." : "active now"}</div>
              </div>
              <div style={{ width: 36 }} />
            </div>
            <div style={s.msgList}>
              <div style={s.dateTag}>only in your head · now</div>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "assistant" ? "flex-start" : "flex-end", animation: "appear .25s ease", marginBottom: 2 }}>
                  {m.role === "assistant" && <div style={s.avatarCircle}>{exName[0]?.toUpperCase()}</div>}
                  <div style={m.role === "assistant" ? s.exBubble : s.meBubble}>{m.content}</div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, animation: "fadeIn .3s ease" }}>
                  <div style={s.avatarCircle}>{exName[0]?.toUpperCase()}</div>
                  <div style={{ ...s.exBubble, padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,180,200,0.7)", animation: `dot 1.4s ${i * 0.2}s ease-in-out infinite` }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={s.inputRow}>
              <textarea style={s.msgInput} placeholder="type something..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} />
              <button style={{ ...s.sendBtn, opacity: input.trim() && !loading ? 1 : 0.3 }} onClick={send} disabled={!input.trim() || loading}>↑</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" },
  blob1: { position:"fixed", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(180,40,100,0.18) 0%,transparent 70%)", top:-100, right:-100, pointerEvents:"none", animation:"blob 12s ease-in-out infinite" },
  blob2: { position:"fixed", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(100,20,140,0.14) 0%,transparent 70%)", bottom:-80, left:-80, pointerEvents:"none", animation:"blob 15s ease-in-out infinite reverse" },
  card: { width:"100%", maxWidth:440, background:"rgba(20,10,24,0.9)", border:"1px solid rgba(255,100,160,0.12)", borderRadius:22, backdropFilter:"blur(20px)", boxShadow:"0 24px 70px rgba(0,0,0,0.6)", overflow:"hidden", margin:"0 14px", animation:"fadeUp .45s ease" },
  stepWrap: { display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"30px 26px" },
  title: { fontFamily:"'Instrument Serif', serif", fontSize:28, fontWeight:400, color:"#ffd6e7", textAlign:"center", letterSpacing:"-0.01em" },
  sub: { fontSize:11, color:"rgba(255,180,210,0.4)", textAlign:"center", letterSpacing:"0.05em" },
  platformGrid: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, width:"100%", marginTop:4 },
  platformBtn: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, padding:"14px 8px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,100,160,0.12)", borderRadius:14, cursor:"pointer", transition:"all .2s" },
  howToBox: { background:"rgba(255,100,160,0.05)", border:"1px solid rgba(255,100,160,0.1)", borderRadius:12, padding:"14px 16px", width:"100%" },
  howToLabel: { fontSize:9, color:"rgba(255,150,190,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 },
  howToRow: { display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" },
  howToNum: { width:18, height:18, borderRadius:"50%", background:"rgba(255,100,160,0.15)", color:"#ff9dc6", fontSize:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 },
  dropzone: { width:"100%", border:"1.5px dashed rgba(255,100,160,0.2)", borderRadius:12, padding:"18px", textAlign:"center", cursor:"pointer", background:"rgba(255,100,160,0.02)", transition:"all .2s" },
  dropzoneOn: { border:"1.5px dashed rgba(255,100,160,0.6)", background:"rgba(255,100,160,0.06)" },
  orRow: { display:"flex", alignItems:"center", gap:10, width:"100%" },
  orLine: { flex:1, height:1, background:"rgba(255,100,160,0.1)" },
  orLabel: { fontSize:9, color:"rgba(255,180,210,0.25)", letterSpacing:"0.08em", whiteSpace:"nowrap" },
  pasteBox: { width:"100%", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,100,160,0.12)", borderRadius:12, padding:"12px 14px", color:"#ffd6e7", fontSize:11, lineHeight:1.6, resize:"vertical" },
  errMsg: { fontSize:11, color:"#ff6b9d", textAlign:"center" },
  mainBtn: { width:"100%", background:"linear-gradient(135deg,#c2185b,#880e4f)", border:"none", borderRadius:12, padding:"13px", color:"#ffd6e7", fontSize:13, cursor:"pointer", letterSpacing:"0.04em", boxShadow:"0 4px 20px rgba(180,40,100,0.3)", transition:"opacity .2s" },
  backLink: { background:"none", border:"none", color:"rgba(255,180,210,0.3)", fontSize:11, cursor:"pointer", letterSpacing:"0.05em", alignSelf:"flex-start" },
  privNote: { fontSize:9, color:"rgba(255,180,210,0.2)", textAlign:"center", letterSpacing:"0.03em" },
  senderBtn: { display:"flex", alignItems:"center", gap:12, padding:"13px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,100,160,0.12)", borderRadius:14, cursor:"pointer", width:"100%" },
  senderAvatar: { width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#c2185b,#7b1fa2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#ffd6e7", fontSize:13, flexShrink:0 },
  chatWrap: { display:"flex", flexDirection:"column", height:"min(760px,100vh)" },
  chatHeader: { padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,100,160,0.08)", background:"rgba(255,80,140,0.04)" },
  chatName: { fontFamily:"'Instrument Serif', serif", fontSize:18, color:"#ffd6e7" },
  chatSub: { fontSize:9, color:"rgba(255,150,190,0.35)", letterSpacing:"0.08em", marginTop:2 },
  msgList: { flex:1, overflowY:"auto", padding:"20px 16px", display:"flex", flexDirection:"column", gap:10 },
  dateTag: { textAlign:"center", fontSize:9, color:"rgba(255,150,190,0.2)", letterSpacing:"0.08em", marginBottom:4 },
  avatarCircle: { width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#c2185b,#7b1fa2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#ffd6e7", alignSelf:"flex-end", marginRight:6, flexShrink:0 },
  exBubble: { maxWidth:"72%", padding:"10px 14px", background:"rgba(255,80,140,0.1)", border:"1px solid rgba(255,100,160,0.15)", borderRadius:"4px 16px 16px 16px", fontSize:13, color:"#ffd6e7", lineHeight:1.55, fontWeight:300 },
  meBubble: { maxWidth:"72%", padding:"10px 14px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px 4px 16px 16px", fontSize:13, color:"rgba(255,210,230,0.7)", lineHeight:1.55, fontWeight:300 },
  inputRow: { padding:"12px 16px", display:"flex", gap:10, alignItems:"flex-end", borderTop:"1px solid rgba(255,100,160,0.08)" },
  msgInput: { flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,100,160,0.15)", borderRadius:14, padding:"10px 14px", color:"#ffd6e7", fontSize:13, fontWeight:300, resize:"none", lineHeight:1.5, maxHeight:90, overflowY:"auto" },
  sendBtn: { width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#c2185b,#880e4f)", border:"none", color:"#ffd6e7", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"opacity .2s", boxShadow:"0 4px 12px rgba(180,40,100,0.3)" },
};
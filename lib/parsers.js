// lib/parsers.js

export function parseWhatsApp(text) {
  const lines = text.split("\n");
  const p1 = /^\[[\d/,: ]+\] (.+?): (.+)$/;
  const p2 = /^[\d/]+,\s[\d:]+ [AP]M? - (.+?): (.+)$/;
  const p3 = /^[\d/]+,\s[\d:]+ - (.+?): (.+)$/;
  const msgs = [];
  for (const line of lines) {
    const m = line.match(p1) || line.match(p2) || line.match(p3);
    if (m) msgs.push({ sender: m[1].trim(), text: sanitize(m[2].trim()) });
  }
  return msgs;
}

export function parseTelegram(text) {
  try {
    const json = JSON.parse(text);
    const msgs = [];
    for (const m of json.messages || []) {
      if (m.type === "message" && m.from && m.text) {
        const t = typeof m.text === "string"
          ? m.text
          : m.text.map((x) => (typeof x === "string" ? x : x.text || "")).join("");
        if (t.trim()) msgs.push({ sender: m.from, text: sanitize(t.trim()) });
      }
    }
    return msgs;
  } catch {}
  return parseGeneric(text);
}

// Fix Meta's broken UTF-8 encoding for Vietnamese and other non-Latin chars
function fixMetaEncoding(str) {
  try {
    return decodeURIComponent(escape(str));
  } catch {
    return str;
  }
}

export function parseInstagram(text) {
  try {
    const json = JSON.parse(text);
    const msgs = [];
    for (const m of [...(json.messages || [])].reverse()) {
      if (m.sender_name && m.content)
        msgs.push({ sender: fixMetaEncoding(m.sender_name), text: sanitize(fixMetaEncoding(m.content)) });
    }
    return msgs;
  } catch {}
  return parseGeneric(text);
}

export function parseGeneric(text) {
  const lines = text.split("\n").filter((l) => l.trim());
  const msgs = [];
  for (const line of lines) {
    const m = line.match(/^(.{1,40}):\s(.+)$/);
    if (m) msgs.push({ sender: m[1].trim(), text: sanitize(m[2].trim()) });
    else if (msgs.length && line.trim())
      msgs[msgs.length - 1].text += " " + sanitize(line.trim());
  }
  return msgs;
}

export function getSenders(messages) {
  const map = {};
  for (const m of messages) map[m.sender] = (map[m.sender] || 0) + 1;
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}

function sanitize(text) {
  return text.replace(/\uFFFD/g, "").replace(/\x00/g, "").trim();
}
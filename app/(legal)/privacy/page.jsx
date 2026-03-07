// app/(legal)/privacy/page.jsx
import Link from "next/link";

export const metadata = { title: "Privacy Policy · Still" };

export default function PrivacyPage() {
  return (
    <div style={s.root}>
      <nav style={s.nav}>
        <Link href="/" style={s.logo}>🕯️ still</Link>
      </nav>
      <main style={s.main}>
        <h1 style={s.title}>Privacy Policy</h1>
        <p style={s.date}>Last updated: January 2025</p>

        <Section title="1. Overview">
          Still ("we", "us", "our") is committed to protecting your privacy. This policy explains how we collect, use, and protect your information when you use our service.
        </Section>

        <Section title="2. Information We Collect">
          <b>Account information:</b> When you sign up, we collect your email address and optionally your name. If you sign in with Google, we receive your name and email from Google.
          <br /><br />
          <b>Chat data:</b> The chat logs you upload are processed temporarily to generate an AI persona profile. <strong>We do not store your raw chat logs.</strong> Only the resulting AI style guide (a text description) is saved to your account.
          <br /><br />
          <b>Usage data:</b> We track how many messages you send per persona to help us improve the service.
        </Section>

        <Section title="3. How We Use Your Data">
          <ul style={s.list}>
            <li>To provide and operate the Still service</li>
            <li>To authenticate your account and keep it secure</li>
            <li>To save your AI personas so you can return to them</li>
            <li>To improve our AI models and service quality</li>
          </ul>
        </Section>

        <Section title="4. Third-Party Services">
          We use the following third-party services:
          <ul style={s.list}>
            <li><strong>Anthropic Claude API</strong> — processes your chat logs to generate persona profiles. Subject to Anthropic's privacy policy.</li>
            <li><strong>Google OAuth</strong> — optional sign-in method. Subject to Google's privacy policy.</li>
            <li><strong>Vercel</strong> — hosting provider. Subject to Vercel's privacy policy.</li>
          </ul>
        </Section>

        <Section title="5. Data Storage & Security">
          Your data is stored in a secure PostgreSQL database. We use industry-standard encryption for data in transit (HTTPS) and at rest. Passwords are hashed using bcrypt and never stored in plain text.
        </Section>

        <Section title="6. Your Chat Logs">
          <strong>Your original chat logs never leave your device.</strong> All parsing happens in your browser. Only the AI-generated profile summary is sent to our servers and stored. You can delete any persona (and its profile) from your dashboard at any time.
        </Section>

        <Section title="7. Data Retention">
          We retain your account data for as long as your account is active. You can request deletion of your account and all associated data by emailing us at privacy@still.com.
        </Section>

        <Section title="8. Children's Privacy">
          Still is not intended for users under 18 years of age. We do not knowingly collect personal information from minors.
        </Section>

        <Section title="9. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on the site.
        </Section>

        <Section title="10. Contact">
          If you have questions about this Privacy Policy, contact us at: <a href="mailto:privacy@still.com" style={s.link}>privacy@still.com</a>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#ffd6e7", marginBottom: 12, fontWeight: 400 }}>{title}</h2>
      <div style={{ fontSize: 13, color: "rgba(255,180,210,0.55)", lineHeight: 1.8 }}>{children}</div>
    </section>
  );
}

const s = {
  root: { minHeight: "100vh", background: "#0d0810" },
  nav: { padding: "20px 40px", borderBottom: "1px solid rgba(255,100,160,0.08)" },
  logo: { fontFamily: "'Instrument Serif', serif", fontSize: 17, color: "#ffd6e7" },
  main: { maxWidth: 680, margin: "0 auto", padding: "60px 24px" },
  title: { fontFamily: "'Instrument Serif', serif", fontSize: 38, color: "#ffd6e7", fontWeight: 400, marginBottom: 8 },
  date: { fontSize: 11, color: "rgba(255,180,210,0.3)", marginBottom: 48, letterSpacing: "0.04em" },
  list: { paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 },
  link: { color: "#ff9dc6" },
};

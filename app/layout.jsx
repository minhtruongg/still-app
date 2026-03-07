// app/layout.jsx
import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Still",
  description: "talk to them again.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

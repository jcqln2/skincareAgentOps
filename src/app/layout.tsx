import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "skincare agentops",
  description: "Customer chat agents for the brands you love, each behind guardrails you can see.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f3efe8] font-sans text-ink antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intention Action",
  description:
    "Turns “I want to do this” into “this is what I should do next.”",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        {children}
        <footer className="pb-6 text-center">
          <Link href="/devlog" className="text-xs text-stone-400 hover:text-stone-600">
            Development log
          </Link>
        </footer>
      </body>
    </html>
  );
}

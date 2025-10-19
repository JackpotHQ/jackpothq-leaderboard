
import "./globals.css";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export const metadata = { title: "JackpotHQ Leaderboards", description: "Exclusive wager races — JackpotHQ" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Poppins:wght@300;400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-dvh">
        <Navbar />
        <main className="container-max">{children}</main>
      </body>
    </html>
  );
}

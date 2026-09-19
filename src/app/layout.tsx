import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BPTI Inventory & Asset Management System",
  description: "Production-grade enterprise system for inventory control, asset tracking, stock ledger, maintenance workflows, and operational monitoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-[#f8fafc] antialiased">
        {children}
      </body>
    </html>
  );
}

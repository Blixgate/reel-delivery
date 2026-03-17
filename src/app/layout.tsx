import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reel Delivery - Delivery Intelligence for Filmmakers",
  description: "Upload your contracts, sales estimates, and delivery schedules. AI builds your deliverables, finance plan, and gap analysis automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reel Delivery - Film Delivery Schedule Parser",
  description: "Professional delivery schedule parser and tracker for independent film producers",
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

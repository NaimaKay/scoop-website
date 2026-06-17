import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scoop & Joy 🍦",
  description: "Subscribe to get notified when your favorite ice cream flavors are back in stock!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

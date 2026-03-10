import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Minimal Teleprompter",
  description: "Lightweight browser-based teleprompter"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}


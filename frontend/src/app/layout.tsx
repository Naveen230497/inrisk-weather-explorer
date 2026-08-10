import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Weather Explorer | InRisk Labs",
  description: "Climate Risk Platform for historical weather data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#050510] text-gray-100 antialiased selection:bg-blue-500/30`}>
        {children}
      </body>
    </html>
  );
}

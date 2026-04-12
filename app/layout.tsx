import "./globals.css";
import type React from "react";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Социальные страхи первокурсников",
  description:
    "Веб-платформа для курсового исследования социальных страхов, социальной тревоги и адаптационных трудностей студентов первого курса.",
  generator: "v0.app",
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${manrope.variable} ${manrope.className} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

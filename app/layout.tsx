import type { Metadata } from "next";
import { Lilita_One, Nunito } from "next/font/google";
import "./globals.css";

// Display font: chunky, hand-drawn feel for headings and buttons.
const displayFont = Lilita_One({ weight: "400", subsets: ["latin"], variable: "--font-display", display: "swap" });
// Body font: rounded and friendly, readable at small sizes.
const bodyFont = Nunito({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "The Career Experiment",
  description: "Explore careers through evidence, not guesswork.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}

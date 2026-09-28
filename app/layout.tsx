import type { Metadata } from "next";
import "./globals.css";
import "./care.css";
import "./care-details.css";
import { CareProvider } from "./components/care-store";

export const metadata: Metadata = {
  title: "Merabetta | Healthcare You Can Trust, Delivered with Care",
  description:
    "A senior-focused health platform that makes healthcare essentials easier to find, understand, and order.",
  openGraph: {
    title: "Merabetta | Healthcare You Can Trust, Delivered with Care",
    description: "Trusted healthcare essentials and thoughtful support for seniors and their families.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body><CareProvider>{children}</CareProvider></body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

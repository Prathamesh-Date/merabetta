import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Lab Tests | Merabetta",
  description: "Explore lab test categories, compare test details, and request a preferred appointment time with Merabetta.",
};

export default function LabTestLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

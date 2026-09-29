import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Healthcare Products | Merabetta",
  description: "Explore healthcare, wellness, and everyday care products at Merabetta.",
};

export default function ProductsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

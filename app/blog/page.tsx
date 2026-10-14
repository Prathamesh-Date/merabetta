import type { Metadata } from "next";
import BlogContent from "../components/blog-content";

export const metadata: Metadata = { title: "Blog | Merabetta" };

export default function BlogPage() {
  return <BlogContent/>;
}

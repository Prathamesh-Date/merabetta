import type { Metadata } from "next";
import ContactContent from "../components/contact-content";

export const metadata: Metadata = { title: "Contact Us | Merabetta" };

export default function ContactPage() {
  return <ContactContent/>;
}

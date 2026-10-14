import type { Metadata } from "next";
import CommunityContent from "../components/community-content";

export const metadata: Metadata = { title: "Services & Community | Merabetta" };

export default function CommunityPage() {
  return <CommunityContent/>;
}

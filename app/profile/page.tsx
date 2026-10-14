import { ProfileScreen } from "../components/care-account";
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string; from?: string }> }) {
  const { tab, from } = await searchParams;
  return <ProfileScreen key={`${tab ?? "account"}:${from ?? ""}`} initialTab={tab} fromHome={from === "home"}/>;
}

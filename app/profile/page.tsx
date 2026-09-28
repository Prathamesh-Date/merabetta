import { ProfileScreen } from "../components/care-account";
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return <ProfileScreen key={tab ?? "account"} initialTab={tab}/>;
}

import { LabsScreen } from "../components/care-catalog";
export default async function Page({ searchParams }: { searchParams: Promise<{ test?: string }> }) {
  const params = await searchParams;
  return <LabsScreen key={params.test ?? "all"} initialTest={params.test}/>;
}

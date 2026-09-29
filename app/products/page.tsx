import { ProductsScreen } from "../components/care-catalog";
export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string; q?: string; account?: string }> }) {
  const params = await searchParams;
  if (params.account) { const { redirect } = await import("next/navigation"); redirect("/profile"); }
  return <ProductsScreen key={`${params.category ?? ""}:${params.q ?? ""}`} initialCategory={params.category} initialQuery={params.q}/>;
}

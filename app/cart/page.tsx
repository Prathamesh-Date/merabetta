import { CartScreen } from "../components/care-account";
export default async function Page({ searchParams }: { searchParams: Promise<{ appointment?: string }> }) {
  const { appointment } = await searchParams;
  return <CartScreen key={appointment ?? "cart"} appointment={appointment === "1"}/>;
}

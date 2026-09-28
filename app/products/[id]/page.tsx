import { notFound } from "next/navigation";
import ProductScreen from "../../components/care-product";
import { products } from "../../data/catalog";

export function generateStaticParams() { return products.map(({ id }) => ({ id })); }
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!products.some(p => p.id === id)) notFound();
  return <ProductScreen key={id} id={id}/>;
}

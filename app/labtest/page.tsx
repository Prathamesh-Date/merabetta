import { notFound } from "next/navigation";
import LabsScreen from "../components/care-labs";
import { labPanels, type LabPanel } from "../data/lab-flow";
import { labs, tests, labListings } from "../data/catalog";

export default async function Page({ searchParams }: { searchParams: Promise<{ lab?: string; test?: string; panel?: string }> }) {
  const params = await searchParams;
  const lab = params.lab === "orange-health" ? "orange" : params.lab;
  const test = params.test ? tests.find(t => t.id === params.test || t.name === params.test)?.id : undefined;
  if ((lab && !labs.some(l => l.id === lab)) || (params.test && !test) || (lab && test && !labListings.some(l => l.lab === lab && l.test === test))) notFound();
  if (params.panel && (!lab || !labPanels.includes(params.panel as LabPanel) || (!test && !["trust", "support"].includes(params.panel)))) notFound();
  return <LabsScreen key={[lab, test, params.panel].join(":")} labId={lab} testId={test} panel={params.panel as LabPanel | undefined}/>;
}

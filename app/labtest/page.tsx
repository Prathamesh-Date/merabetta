import LabsScreen from "../components/care-labs";
import { labPanels, type LabPanel } from "../data/lab-flow";

export default async function Page({ searchParams }: { searchParams: Promise<{ lab?: string; test?: string; panel?: string; q?: string }> }) {
  const params = await searchParams;
  const panel = labPanels.includes(params.panel as LabPanel) ? params.panel as LabPanel : undefined;
  return <LabsScreen key={[params.lab, params.test, panel, params.q].join(":")} labId={params.lab} testId={params.test} panel={panel} initialQuery={params.q}/>;
}

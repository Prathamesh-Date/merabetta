export const labPanels = ["included", "preparation", "report", "trust", "guidance", "related", "preview", "support"] as const;
export type LabPanel = typeof labPanels[number];

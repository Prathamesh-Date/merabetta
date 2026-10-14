import { labListings, tests } from "./catalog";
import type { Test } from "../lib/customer-api";

// Existing public browsing content. Checkout always resolves a live backend ID.
export const publicLabCatalog: Test[] = labListings.filter(listing => listing.lab === "redcliffe").map(listing => {
  const test = tests.find(item => item.id === listing.test)!;
  return { id: listing.id, packageCode: "", labId: "redcliffe", labName: "Redcliffe Labs", name: test.name, subtitle: test.subtitle, category: test.category, categories: [test.category], price: listing.price, mrp: listing.mrp, image: `/app/${test.image}.webp`, parameters: test.parameters, reportTime: `Within ${listing.hours} hours`, fasting: listing.preparation, sampleType: "Blood sample", available: true, preview: true, groups: test.included.map(name => ({ name, parameters: [] })) };
});
export function resolvePublicTest(preview: Test, live: Test[]) {
  const normalize = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");
  // Only an exact, unique name match is safe. Similar tests must be reselected.
  const matches = live.filter(test => test.available && normalize(test.name) === normalize(preview.name));
  return matches.length === 1 ? matches[0] : undefined;
}

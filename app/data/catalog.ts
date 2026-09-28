import { referenceLabs, referenceTests } from "./lab-reference";
// Content and sample prices recovered from the supplied app-release.apk.
export const categories = [
  { id: "category-1", name: "Medicines", image: "medicine", icon: "medical" },
  { id: "category-9", name: "Adult Diapers", image: "diapers", icon: "layers" },
  { id: "category-10", name: "Mobility & Accessories", image: "mobility", icon: "walk" },
  { id: "category-11", name: "Senior Furniture", image: "furniture", icon: "chair" },
  { id: "category-2", name: "Health Devices", image: "device", icon: "pulse" },
  { id: "category-3", name: "Personal Care", image: "skincare", icon: "lab" },
  { id: "category-5", name: "Wellness & Nutrition", image: "vitamins", icon: "leaf" },
];
export type Product = { id: string; name: string; subtitle: string; price: number; mrp: number; image: string; rating: string; category: string };
export const products: Product[] = [
  { id: "p1", name: "Crocin Advance Tablet", subtitle: "Paracetamol 500mg | Pain relief", price: 52, mrp: 86, image: "medicine", rating: "4.6", category: "category-1" },
  { id: "p2", name: "Daily Multivitamin", subtitle: "Daily wellness | 60 tablets", price: 349, mrp: 499, image: "vitamins", rating: "4.8", category: "category-5" },
  { id: "p3", name: "Digital BP Monitor", subtitle: "Easy, accurate home monitoring", price: 1499, mrp: 2199, image: "device", rating: "4.7", category: "category-2" },
  { id: "p4", name: "Gentle Face Cleanser", subtitle: "Hydrating care | 150 ml", price: 249, mrp: 349, image: "skincare", rating: "4.5", category: "category-3" },
  { id: "p7", name: "Home Care Essentials", subtitle: "Everyday hygiene kit", price: 299, mrp: 449, image: "skincare", rating: "4.6", category: "category-3" },
  { id: "p8", name: "Adult Pull-Up Diapers", subtitle: "Large size | Pack of 10", price: 449, mrp: 599, image: "diapers", rating: "4.7", category: "category-9" },
  { id: "p9", name: "Adjustable Walking Stick", subtitle: "Height-adjustable | Single stick", price: 699, mrp: 999, image: "mobility", rating: "4.8", category: "category-10" },
  { id: "p10", name: "Senior Care Recliner", subtitle: "Padded recliner | Beige", price: 14999, mrp: 19999, image: "furniture", rating: "4.6", category: "category-11" },
];
export const labs = [
  { id: "redcliffe", name: "Redcliffe Labs", color: "#e26570", background: "#fff0f1" },
  { id: "orange", name: "Orange Health Labs", color: "#f49a4e", background: "#fff1e5" },
  { id: "merabeta", name: "Merabeta Diagnostics", color: "#26b69c", background: "#e8f8f2" },
  { id: "citycare", name: "CityCare Labs", color: "#6796da", background: "#edf4ff" },
  { id: "wellness", name: "Wellness Path Labs", color: "#9b79ce", background: "#f3edff" },
  { id: "healthfirst", name: "HealthFirst Labs", color: "#4eaaad", background: "#e8f7f8" },
];
export const tests = [
  { id: "test-1", name: "Complete Health Checkup", subtitle: "97 parameters · Home collection", category: "Full Body", image: "lab", parameters: 97, included: ["Complete Blood Count (CBC)", "ESR", "Liver function", "Glucose fasting", "HbA1c", "Iron studies", "Kidney function", "Lipid profile"] },
  { id: "test-2", name: "Thyroid Profile", subtitle: "T3, T4, TSH · 3 parameters", category: "Thyroid", image: "lab", parameters: 3, included: ["T3 — Triiodothyronine", "T4 — Thyroxine", "TSH — Thyroid stimulating hormone"] },
  { id: "test-3", name: "Vitamin D Test", subtitle: "Vitamin D (25-OH) · 1 parameter", category: "Vitamins", image: "vitamins", parameters: 1, included: ["Vitamin D (25-OH)"] },
  { id: "test-4", name: "Lipid Profile", subtitle: "Heart health · 8 parameters", category: "Heart", image: "lab", parameters: 8, included: ["Total cholesterol", "HDL cholesterol", "LDL cholesterol", "Triglycerides"] },
];
export type LabListing = { id: string; lab: string; test: string; price: number; mrp: number; hours: number; preparation: string };
const listingRows: [string, string, string, number, number, number][] = [
  ["l1", "redcliffe", "test-1", 999, 2499, 12], ["l2", "redcliffe", "test-2", 499, 899, 12], ["l3", "redcliffe", "test-3", 799, 1499, 12], ["l4", "redcliffe", "test-4", 599, 1199, 12],
  ["orange-test-1", "orange", "test-1", 1079, 2599, 18], ["orange-test-3", "orange", "test-3", 849, 1599, 18],
  ["merabeta-test-1", "merabeta", "test-1", 1159, 2699, 24], ["merabeta-test-2", "merabeta", "test-2", 629, 1099, 24], ["merabeta-test-4", "merabeta", "test-4", 669, 1399, 24],
  ["citycare-test-1", "citycare", "test-1", 1239, 2799, 30], ["citycare-test-3", "citycare", "test-3", 949, 1799, 30], ["citycare-test-4", "citycare", "test-4", 704, 1499, 30],
  ["wellness-test-2", "wellness", "test-2", 759, 1299, 36], ["wellness-test-3", "wellness", "test-3", 999, 1899, 36], ["wellness-test-4", "wellness", "test-4", 739, 1599, 36],
  ["healthfirst-test-1", "healthfirst", "test-1", 1399, 2999, 42], ["healthfirst-test-2", "healthfirst", "test-2", 824, 1399, 42], ["healthfirst-test-3", "healthfirst", "test-3", 1049, 1999, 42],
];
export const labListings: LabListing[] = listingRows.map(([id, lab, test, price, mrp, hours]) => ({ id, lab, test, price, mrp, hours, preparation: test === "test-1" || test === "test-4" ? "8–12 hours; confirm with lab" : "No fasting required" }));
export const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
export const asset = (name: string) => `/app/${name}.webp`;
export const demoDescription = "Merabetta is currently a demonstration app. All products, prices, lab packages and orders are sample data. The app does not provide medical advice, real prescriptions, diagnostic services or live payments.";

// Keep existing listing IDs for saved carts, and restore the earlier lab catalog.
const testAliases: Record<string, string> = { "Comprehensive Health Check": "test-1" };
for (const original of referenceTests) {
  const current = tests.find(test => test.name === original.name || test.id === testAliases[original.name]);
  if (current) { testAliases[original.name] = current.id; continue; }
  const id = "reference-" + original.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");
  testAliases[original.name] = id;
  tests.push({ id, name: original.name, subtitle: original.summary, category: original.category === "Immunity Check" ? "Vitamins" : original.category, image: original.category === "Immunity Check" ? "vitamins" : "lab", parameters: original.name === "Vitamin B12 & D Package" ? 2 : original.type === "Package" ? 97 : original.type === "Profile" ? 3 : 1, included: original.name === "Vitamin B12 & D Package" ? ["Vitamin B12", "Vitamin D"] : [original.name] });
}
export const referenceLabIds = referenceLabs.map(lab => lab.id === "orange-health" ? "orange" : lab.id);
for (const original of referenceLabs) {
  const id = original.id === "orange-health" ? "orange" : original.id;
  if (!labs.some(lab => lab.id === id)) labs.push({ id, name: original.name, color: "#8453a7", background: "#f1eaf8" });
  for (const name of original.testNames) {
    const testId = testAliases[name];
    if (labListings.some(listing => listing.lab === id && listing.test === testId)) continue;
    const test = referenceTests.find(test => test.name === name)!;
    labListings.push({ id: id + "-" + testId, lab: id, test: testId, price: test.price, mrp: test.price, hours: Number(test.report.match(/\d+/)?.[0] ?? 24), preparation: "Confirm preparation with your selected lab" });
  }
}

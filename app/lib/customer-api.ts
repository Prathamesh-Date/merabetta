export type Gender = "Female" | "Male" | "Other" | "Prefer not to say";
export type Location = { provider: string; placeId: string; displayName: string; latitude: number; longitude: number; address: Record<string, string>; city?: string; state?: string; postalCode?: string };
export type Address = { id?: string; line1: string; line2?: string; landmark?: string; state: string; city: string; postalCode: string; houseNumber?: string; buildingName?: string; location?: Location | null };
export type Member = { id: string; name: string; relationship: string; dateOfBirth: string; gender: Gender; phone?: string };
export type Profile = { firstName: string; lastName: string; phone: string; email: string; dateOfBirth: string; gender: Gender };
export type Account = { user: Profile & { id: string; name: string; profileCompleted: boolean }; identities: { method: string; contact: string }[]; addresses: Address[]; members: Member[] };
export type Test = { id: string; packageCode: string; labId: string; labName: string; name: string; subtitle?: string; category: string; categories?: string[]; price: number; mrp: number; image?: string; available: boolean; parameters?: number; rating?: string | number; reportTime?: string; sampleType?: string; fasting?: string; preview?: boolean; groups?: { name: string; parameters: string[] }[] };
export type Lab = { id: string; name: string; description?: string; active: boolean; city: string; homeCollection: boolean };
export type Slot = { id: string; startTime: string; label: string; available: boolean };
export type Order = { id: string; requestKey?: string; kind: "labs" | "products"; date: string; status: string; paymentStatus: string; total: number; items: { id?: string; name: string; quantity: number; price: number }[]; address: Address; slot?: string; collectionDate?: string; paymentUrl?: string | null; reports?: { id?: string; reportId?: string; filename?: string; name?: string }[] };
export type Checkout = { requestKey: string; items: { id: string; quantity: number }[]; address: Address; notes?: string; coupon?: boolean };
export type Booking = Omit<Checkout, "coupon"> & { memberId: string; collectionDate: string; slotId: string };
export type Challenge = { challengeId: string; expiresIn: number; resendAfter: number; delivery: string; devCode?: string };

const configuredOrigin = process.env.NEXT_PUBLIC_CUSTOMER_API_URL?.trim() ?? "";
export const apiConfigured = Boolean(configuredOrigin);
export class ApiError extends Error {
  constructor(public status: number, message: string, public details: { path: string; message: string }[] = [], public retryAfter = 0) { super(message); }
}
export const errorMessage = (error: unknown) => error instanceof ApiError
  ? [error.message, ...error.details.map(detail => `${detail.path}: ${detail.message}`)].join(" · ")
  : error instanceof Error ? error.message : "Unable to complete the request. Please retry.";

export async function request<T>(path: string, method = "GET", body?: unknown, signal?: AbortSignal): Promise<{ data: T; status: number }> {
  if (!apiConfigured) throw new Error("The care service is not connected yet. Please try again later.");
  const sameOrigin = configuredOrigin === "/";
  const origin = sameOrigin ? null : new URL(configuredOrigin);
  if (origin && (!["http:", "https:"].includes(origin.protocol) || origin.pathname !== "/" || origin.search || origin.hash || origin.username || origin.password)) throw new Error("The care service URL is invalid.");
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("..")) throw new Error("Invalid API path");
  const mutation = !["GET", "HEAD"].includes(method);
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timeout = path === "/redcliffe/catalog" ? 120_000 : mutation || path.includes("/reports/") ? 45_000 : 15_000;
  const timer = setTimeout(abort, timeout);
  try {
    const response = await fetch(`${origin?.origin ?? ""}/api/app${path}`, {
      method, credentials: "include", cache: "no-store", signal: controller.signal,
      headers: { Accept: "application/json", ...(mutation ? { "Content-Type": "application/json" } : {}) },
      ...(mutation ? { body: JSON.stringify(body ?? {}) } : {}),
    });
    if (response.status === 401 && !path.startsWith("/auth/otp/")) window.dispatchEvent(new Event("merabetta-session-expired"));
    if (response.status === 204) return { data: undefined as T, status: 204 };
    const raw = await response.text();
    let data;
    try { data = raw ? JSON.parse(raw) : null; }
    catch { throw new ApiError(response.status, response.ok ? "Invalid service response. Please retry." : `Request failed (${response.status}). Please retry.`, [], retrySeconds(response.headers.get("Retry-After"))); }
    if (!response.ok) {
      throw new ApiError(response.status, data?.error || `Request failed (${response.status})`, Array.isArray(data?.details) ? data.details : [], retrySeconds(response.headers.get("Retry-After")));
    }
    return { data: data as T, status: response.status };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (signal?.aborted) throw error;
    throw new Error(mutation ? "Connection interrupted. The request may still be processing. Check your orders before retrying checkout." : "Could not reach the care service. Please retry.");
  } finally { clearTimeout(timer); signal?.removeEventListener("abort", abort); }
}
function retrySeconds(value: string | null) { if (!value) return 0; return /^\d+$/.test(value) ? Number(value) : Math.max(0, Math.ceil((Date.parse(value) - Date.now()) / 1000)) || 0; }
export async function api<T>(path: string, method = "GET", body?: unknown, signal?: AbortSignal) { return (await request<T>(path, method, body, signal)).data; }
const id = encodeURIComponent;
export const customerApi = {
  me: (signal?: AbortSignal) => api<Account>("/auth/me", "GET", undefined, signal),
  requestOtp: (contact: string) => api<Challenge>("/auth/otp/request", "POST", { method: "phone", contact }),
  verifyOtp: (challengeId: string, code: string) => api<Account>("/auth/otp/verify", "POST", { challengeId, code, deviceInfo: { platform: "web" } }),
  logout: (all = false) => api<void>(all ? "/auth/logout-all" : "/auth/logout", "POST"),
  profile: (profile: Profile) => api<Account>("/customers/me/profile", "PUT", profile),
  deleteAccount: () => api<void>("/customers/me", "DELETE"),
  address: (address: Address, addressId?: string) => api<Account>(`/customers/me/addresses${addressId ? `/${id(addressId)}` : ""}`, addressId ? "PUT" : "POST", cleanAddress(address)),
  deleteAddress: (addressId: string) => api<Account>(`/customers/me/addresses/${id(addressId)}`, "DELETE"),
  member: (member: Omit<Member, "id">, memberId?: string) => api<Account>(`/customers/me/family-members${memberId ? `/${id(memberId)}` : ""}`, memberId ? "PUT" : "POST", member),
  deleteMember: (memberId: string) => api<Account>(`/customers/me/family-members/${id(memberId)}`, "DELETE"),
  faqs: (signal?: AbortSignal) => api<{ data: { id: string; question: string; answer: string }[] }>("/faqs", "GET", undefined, signal),
  states: (signal?: AbortSignal) => api<{ data: { id: string; name: string }[] }>("/states", "GET", undefined, signal),
  cities: (stateId: string, signal?: AbortSignal) => api<{ data: { id: string; name: string }[] }>(`/states/${id(stateId)}/cities`, "GET", undefined, signal),
  locations: (q: string, signal?: AbortSignal) => api<{ data: Location[] }>(`/locations/search?${new URLSearchParams({ q })}`, "GET", undefined, signal),
  reverse: (lat: number, lon: number) => api<Location>(`/locations/reverse?${new URLSearchParams({ lat: String(lat), lon: String(lon) })}`),
  map: (lat: number, lon: number, signal?: AbortSignal) => api<{ uri: string }>(`/locations/map?${new URLSearchParams({ lat: String(lat), lon: String(lon), zoom: "15" })}`, "GET", undefined, signal),
  labs: (signal?: AbortSignal) => api<{ data: Lab[]; pagination: { totalPages: number } }>("/labs/lablisting?limit=100", "GET", undefined, signal),
  catalog: (signal?: AbortSignal) => api<{ data: Test[] }>("/redcliffe/catalog", "GET", undefined, signal),
  parameters: (code: string, signal?: AbortSignal) => api<{ data: { name: string; parameters: string[] }[] }>(`/redcliffe/packages/${id(code)}/parameters`, "GET", undefined, signal),
  dates: (signal?: AbortSignal) => api<{ dates: string[]; timeZone: string }>("/redcliffe/dates", "GET", undefined, signal),
  slots: (collectionDate: string, location: Location, signal?: AbortSignal) => api<{ serviceable: boolean; message: string; slots: Slot[] }>(`/redcliffe/slots?${new URLSearchParams({ collectionDate, latitude: String(location.latitude), longitude: String(location.longitude) })}`, "GET", undefined, signal),
  bookings: () => api<{ data: Order[]; statusRefreshFailed: boolean }>("/lab-bookings"),
  book: (body: Booking) => request<Order>("/lab-bookings", "POST", body),
  cancel: (bookingId: string, reason: string) => api<Order>(`/lab-bookings/${id(bookingId)}/cancel`, "POST", { reason }),
  amend: (bookingId: string, body: { requestKey: string; testIds: string[]; memberId?: string }) => api<Order>(`/lab-bookings/${id(bookingId)}/amend`, "POST", body),
  orders: () => api<{ data: Order[] }>("/orders"),
  order: (orderId: string) => api<Order>(`/orders/${id(orderId)}`),
  checkout: (body: Checkout) => request<Order>("/orders", "POST", body),
};
export function cleanAddress(address: Address): Address {
  const { line1, line2, landmark, state, city, postalCode, houseNumber, buildingName, location } = address;
  return { line1, line2, landmark, state, city, postalCode, houseNumber, buildingName, ...(location ? { location: { provider: location.provider, placeId: location.placeId, displayName: location.displayName, latitude: location.latitude, longitude: location.longitude, address: location.address } } : {}) };
}
export async function downloadReport(bookingId: string, reportId: string) {
  const report = await api<{ filename: string; base64: string }>(`/lab-bookings/${id(bookingId)}/reports/${id(reportId)}`);
  const bytes = Uint8Array.from(atob(report.base64), ch => ch.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const link = document.createElement("a"); link.href = url; link.download = report.filename; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

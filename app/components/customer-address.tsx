"use client";
import { useEffect, useId, useRef, useState } from "react";
import { customerApi, errorMessage, type Address, type Location } from "../lib/customer-api";
import { ErrorText } from "./customer-auth";
import CareIcon from "./care-icon";
import AddressSelect from "./address-select";
import styles from "./customer-address.module.css";

export const blankAddress: Address = { line1: "", line2: "", state: "", city: "", postalCode: "", houseNumber: "", buildingName: "", landmark: "" };
export default function AddressFields({ value, onChange }: { value: Address; onChange: (address: Address) => void }) {
  const [query, setQuery] = useState(""); const [results, setResults] = useState<Location[]>([]); const [error, setError] = useState("");
  const [states, setStates] = useState<{ id: string; name: string }[]>([]); const [cities, setCities] = useState<{ id: string; name: string }[]>([]); const [map, setMap] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [locating, setLocating] = useState(false);
  const searchId = useId(); const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => { const controller = new AbortController(); customerApi.states(controller.signal).then(r => setStates(r.data)).catch(e => { if (!controller.signal.aborted) setError(errorMessage(e)); }); return () => controller.abort(); }, []);
  const stateId = states.find(state => state.name === value.state)?.id;
  useEffect(() => { setCities([]); if (!stateId) return; const controller = new AbortController(); customerApi.cities(stateId, controller.signal).then(r => setCities(r.data)).catch(e => { if (!controller.signal.aborted) setError(errorMessage(e)); }); return () => controller.abort(); }, [stateId]);
  useEffect(() => {
    setResults([]); if (query.trim().length < 3) return;
    const controller = new AbortController();
    const timer = setTimeout(() => { customerApi.locations(query.trim(), controller.signal).then(r => { if (!controller.signal.aborted) { setResults(r.data); setError(""); } }).catch(e => { if (!controller.signal.aborted) { setError(errorMessage(e)); if (e?.retryAfter) setCooldown(Date.now() + e.retryAfter * 1000); } }); }, Math.max(400, cooldown - Date.now()));
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, cooldown]);
  const latitude = value.location?.latitude; const longitude = value.location?.longitude;
  useEffect(() => { setMap(""); if (latitude === undefined || longitude === undefined) return; const controller = new AbortController(); customerApi.map(latitude, longitude, controller.signal).then(r => { if (!controller.signal.aborted) setMap(r.uri); }).catch(e => { if (!controller.signal.aborted) setError(errorMessage(e)); }); return () => controller.abort(); }, [latitude, longitude]);
  function choose(location: Location) { onChange({ ...value, location, city: location.city || location.address.city || value.city, state: location.state || location.address.state || value.state, postalCode: location.postalCode || location.address.postcode || value.postalCode }); setResults([]); setQuery(""); }
  function useCurrentLocation() {
    if (locating) return;
    if (!navigator.geolocation) { setError("Location is unavailable in this browser."); return; }
    setLocating(true); setError("");
    navigator.geolocation.getCurrentPosition(position => {
      customerApi.reverse(position.coords.latitude, position.coords.longitude).then(choose).catch(e => setError(errorMessage(e))).finally(() => setLocating(false));
    }, () => { setLocating(false); setError("Location access unavailable. Search your address above."); }, { timeout: 15000 });
  }
  return <div className={styles.addressFields}><div className="ca-field"><label htmlFor={searchId}>Search your area</label><div className={styles.searchBox}><input id={searchId} ref={searchInput} className={styles.searchInput} autoComplete="off" value={value.location?.displayName ?? query} onChange={e => { setQuery(e.target.value); onChange({ ...value, location: null }); }} maxLength={200} placeholder="Search area, street or landmark"/>{(value.location || query) && <button type="button" className={styles.clearLocation} aria-label="Clear location" title="Clear location" disabled={locating} onClick={() => { setQuery(""); setResults([]); setMap(""); setError(""); onChange({ ...value, location: null }); searchInput.current?.focus(); }}><CareIcon name="close" size={17}/></button>}</div></div>
    {results.length > 0 && <div className={styles.results} role="group" aria-label="Collection location options">{results.map(location => <button key={location.placeId} type="button" className={styles.locationOption} onClick={() => choose(location)}><CareIcon name="pin" size={20}/><span>{location.displayName}</span><CareIcon name="chevron" size={17}/></button>)}</div>}
    <button type="button" className={styles.currentLocation} disabled={locating} onClick={useCurrentLocation}><CareIcon name="pin" size={18}/>{locating ? "Finding your location…" : "Use current location"}</button>
    {map && <img src={map} alt="Selected collection location map" style={{ maxWidth: "100%", borderRadius: 12 }}/>}
    <div className="ca-form-grid">{(["houseNumber", "buildingName", "line1", "line2", "landmark", "postalCode"] as const).map(field => <label key={field}>{({ houseNumber: "House / flat number", buildingName: "Building", line1: "Address line 1", line2: "Address line 2", landmark: "Landmark", postalCode: "PIN code" })[field]}<input required={field === "line1" || field === "postalCode" || (field === "houseNumber" && !!value.location)} minLength={field === "line1" ? 5 : undefined} maxLength={field === "postalCode" ? 6 : field === "houseNumber" ? 100 : 200} pattern={field === "postalCode" ? "[1-9][0-9]{5}" : undefined} value={value[field] ?? ""} onChange={e => onChange({ ...value, [field]: e.target.value })}/></label>)}
      <AddressSelect label="State" value={value.state} options={states.map(state => state.name)} onChange={state => onChange({ ...value, state, city: "", location: null })}/>
      <AddressSelect label="City" value={value.city} options={cities.map(city => city.name)} onChange={city => onChange({ ...value, city, location: null })}/>
    </div><ErrorText message={error}/></div>;
}

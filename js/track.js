// ⚠️ TRACKING PLACEHOLDER (CLAUDE.md rule 16). Nothing is sent anywhere yet.
// Before ANY public launch, wire: (1) Microsoft Clarity, (2) the Supabase event tracker (?src=<channel>),
// (3) the consent gate: Clarity + cookies load ONLY after the visitor clicks "Leisti".
// Without consent: anonymous, cookie-less events only. Fill CONFIG, then run bin/tracking-audit.py on the repo.
const CONFIG = {
  clarityId: "",        // e.g. "abc123xyz"  (leave empty = off)
  eventsUrl: "",        // Supabase edge function / REST endpoint for anonymous events (leave empty = off)
};
const src = new URLSearchParams(location.search).get("src") || "direct";
let consent = false;
try { consent = localStorage.getItem("r1joga_consent") === "yes"; } catch (e) {}

export function setConsent(yes) {
  consent = !!yes;
  try { localStorage.setItem("r1joga_consent", yes ? "yes" : "no"); } catch (e) {}
  if (consent && CONFIG.clarityId) loadClarity(CONFIG.clarityId);
}
function loadClarity(id) {
  // TODO(before launch): standard Clarity snippet goes here, only reached after consent.
  void id;
}
export function track(event, data = {}) {
  if (!CONFIG.eventsUrl) return; // placeholder: off
  const body = JSON.stringify({ event, src, data, t: Date.now() }); // anonymous, no cookies, no IDs
  try { navigator.sendBeacon(CONFIG.eventsUrl, body); } catch (e) {}
}
if (consent && CONFIG.clarityId) loadClarity(CONFIG.clarityId);

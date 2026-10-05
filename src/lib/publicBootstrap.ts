import type { WebsiteContentPayload } from "./websiteContent";
import type { CatalogSubject } from "./publicPrograms";
declare global { interface Window { __bimbelkuWebsiteContent?: Promise<WebsiteContentPayload | null>; __bimbelkuWebsiteContentValue?: WebsiteContentPayload | null; __bimbelkuProgramCatalog?: Promise<CatalogSubject[] | null>; } }
// Start public content alongside the JS bundle, not after React's first effect.
const base = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
// Subject profiles cannot show their verified title until the catalog arrives.
// Start that public request before ancillary site settings on these routes.
if (/^\/program\/[^/]+\/?$/.test(window.location.pathname)) {
  window.__bimbelkuProgramCatalog = fetch(base + "/learning-catalog?compact=1", {
    credentials: "include", headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10_000),
  }).then((response) => response.ok ? response.json() : null)
    .then((payload) => Array.isArray(payload?.subject_options) ? payload.subject_options as CatalogSubject[] : null)
    .catch(() => null);
}
window.__bimbelkuWebsiteContent = fetch(base + "/website-content", {
  credentials: "include", headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000),
}).then(response => response.ok ? response.json() : null).then((content) => { window.__bimbelkuWebsiteContentValue = content; return content; }).catch(() => null);

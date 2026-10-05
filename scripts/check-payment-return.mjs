import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/paymentReturn.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { getPaymentReturnOrderId } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

for (const query of ["?gateway=success&order_id=12", "?gateway=cancelled&order_id=12", "?checkout=resume&order_id=12", "?order_id=12"]) {
  assert.equal(getPaymentReturnOrderId(query), 12);
}
assert.equal(getPaymentReturnOrderId(""), null);
for (const query of ["?order_id=", "?order_id=0", "?order_id=-1", "?order_id=1.5", "?order_id=1e3", "?order_id=abc", "?order_id=12&order_id=13", "?order_id=9007199254740992", "?gateway=success", "?gateway=cancelled", "?checkout=resume"]) {
  assert.throws(() => getPaymentReturnOrderId(query));
}
const page = await readFile(new URL("../src/pages/pembayaran/PaymentPage.tsx", import.meta.url), "utf8");
assert.ok(page.includes("returnOrderId !== null || !resolved?.orderId"), "ID pengembalian mengalahkan cache/navigation state");
assert.ok(page.includes("? await http.get(`/student/orders/${returnOrderId}/status`)"), "Tagihan pengembalian dimuat dari endpoint milik akun");
assert.ok(page.includes("Number(response.data?.id) !== returnOrderId"), "Respons harus cocok dengan ID pengembalian");
assert.ok(page.includes("setLoadIssue(message)"), "Kesalahan tidak disamarkan sebagai tagihan kedaluwarsa");

// Execute the real page callbacks with deferred HTTP, not a copy of their logic.
const callbacksStart = page.indexOf("  const capturePaymentScope =");
const callbacksEnd = page.indexOf("\n  useEffect(() => {", page.indexOf("  const initialize ="));
const checkoutStart = page.indexOf("  const openXenditCheckout =");
const checkoutEnd = page.indexOf("  const paymentOrderId =", checkoutStart);
assert.ok(callbacksStart >= 0 && callbacksEnd > callbacksStart && checkoutEnd > checkoutStart);
const callbacks = page.slice(callbacksStart, callbacksEnd) + page.slice(checkoutStart, checkoutEnd);
const setters = [...new Set(callbacks.match(/\bset[A-Z]\w+/g))];
const runtime = ts.transpileModule(`export function build(env) {
  const { http, location, loadGeneration, activeOrderId, statusRequestId, designPreview, notify, sessionStorage,
    getPaymentReturnOrderId, getApiError, getApiErrorDetails, useCallback, window, order, submitting,
    ${setters.join(", ")} } = env;
  ${callbacks}
  return { checkStatus, initialize, openXenditCheckout };
}`, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { build } = await import(`data:text/javascript;base64,${Buffer.from(runtime).toString("base64")}`);
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const harness = (http) => {
  const store = { Order: { orderId: 1, price: 50000 }, State: "pending", notices: [], cache: new Map() };
  const env = {
    http, location: { search: "?order_id=1", state: null },
    loadGeneration: { current: 1 }, activeOrderId: { current: 1 }, statusRequestId: { current: 0 }, designPreview: false,
    notify: Object.fromEntries(["success", "warning", "error"].map(key => [key, message => store.notices.push(message)])),
    sessionStorage: { getItem: key => store.cache.get(key) ?? null, setItem: (key, value) => store.cache.set(key, value), removeItem: key => store.cache.delete(key) },
    getPaymentReturnOrderId, getApiError: error => error.message,
    getApiErrorDetails: error => ({ message: error.message }), useCallback: fn => fn,
    window: { location: { protocol: "https:" } }, order: store.Order, submitting: false,
  };
  for (const setter of setters) env[setter] = value => {
    const key = setter.slice(3);
    store[key] = typeof value === "function" ? value(store[key]) : value;
  };
  return { store, env, ...build(env) };
};

for (const oldStatus of ["paid", "expired", "refunded", "refund_pending"]) {
  const response = deferred(), started = deferred();
  const test = harness({ post: async () => {}, get: () => { started.resolve(); return response.promise; } });
  const request = test.checkStatus(1);
  await started.promise;
  ++test.env.loadGeneration.current;
  test.env.activeOrderId.current = 2;
  test.store.Order = { orderId: 2 };
  test.store.cache.set("bimbelku_payment_order", "tagihan B");
  response.resolve({ data: { id: 1, status: oldStatus } });
  assert.equal(await request, false);
  assert.equal(test.store.Order.orderId, 2);
  assert.equal(test.store.State, "pending", `Respons ${oldStatus} A tidak mengubah B`);
  assert.equal(test.store.cache.get("bimbelku_payment_order"), "tagihan B");
  assert.equal(test.store.notices.length, 0);
}

for (const rejectOld of [false, true]) {
  const response = deferred();
  const test = harness({
    post: async () => {},
    get: async url => {
      if (url === "/student/orders/1/status") return response.promise;
      if (url === "/student/orders/2/status") return { data: { id: 2, status: "pending", order_number: "INV-B", amount: 90000 } };
      if (url.endsWith("wallet-quote")) return { data: { supported: true, external_due: 90000 } };
      if (url.endsWith("payment-pin/status")) return { data: { configured: false } };
      return { data: { merchant_name: "BimbelKu" } };
    },
  });
  const old = test.initialize();
  test.env.location.search = "?order_id=2";
  await test.initialize();
  if (rejectOld) response.reject(new Error("Respons lama gagal"));
  else response.resolve({ data: { id: 1, status: "paid", order_number: "INV-A", amount: 50000 } });
  await old;
  assert.equal(test.store.Order.orderId, 2, "Inisialisasi lama tidak menimpa B");
  assert.equal(test.store.State, "pending");
  assert.equal(test.store.LoadIssue, null);
  assert.equal(JSON.parse(test.store.cache.get("bimbelku_payment_order")).orderId, 2);
  assert.equal(test.store.notices.length, 0);
}

const checkoutResponse = deferred();
const checkout = harness({ post: () => checkoutResponse.promise });
const oldCheckout = checkout.openXenditCheckout();
++checkout.env.loadGeneration.current;
checkout.env.activeOrderId.current = 2;
checkout.store.Submitting = true;
checkoutResponse.resolve({ data: { data: { mode: "COMPONENTS", components_sdk_key: "sdk-A", session_id: "ps-A" } } });
await oldCheckout;
assert.equal(checkout.store.EmbeddedSession, undefined, "Checkout A tidak dibuka pada B");
assert.equal(checkout.store.CheckoutOpen, undefined);
assert.equal(checkout.store.Submitting, true, "Finally A tidak mengubah tombol B");

const current = harness({ post: async () => {}, get: async () => ({ data: { id: 1, status: "paid" } }) });
assert.equal(await current.checkStatus(1), true);
assert.equal(current.store.State, "paid", "Respons tagihan yang sesuai tetap diproses");

const olderStatus = deferred(), olderStarted = deferred();
let reads = 0;
const sameInvoice = harness({ post: async () => {}, get: () => {
  if (++reads === 1) { olderStarted.resolve(); return olderStatus.promise; }
  return Promise.resolve({ data: { id: 1, status: "paid" } });
} });
const oldPoll = sameInvoice.checkStatus(1, false);
await olderStarted.promise;
assert.equal(await sameInvoice.checkStatus(1, false), true);
olderStatus.resolve({ data: { id: 1, status: "pending" } });
assert.equal(await oldPoll, false);
assert.equal(sameInvoice.store.State, "paid", "Polling lama tagihan yang sama tidak menimpa hasil terbaru");
console.log("PASS: 20 pemeriksaan tautan + 9 skenario respons asynchronous pada callback pembayaran asli.");

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString("base64")}`;
const helperUrl = moduleUrl(await readFile(new URL("../src/lib/packageWeekdays.ts", import.meta.url), "utf8"));
const { normalizeWeekdays, normalizePackageWeekdays } = await import(helperUrl);
const builder = await readFile(new URL("../src/pages/students/PackageBuilder.tsx", import.meta.url), "utf8");
const dateHelpers = builder.slice(builder.indexOf("const dateInput ="), builder.indexOf("const normalizeDurationHours ="));
const factories = builder.slice(builder.indexOf("const isoWeekday ="), builder.indexOf("const rebuildSchedules ="));
const { createSubject, nextSlots } = await import(moduleUrl(`import { normalizeWeekdays, maxWeekdaysForSessions } from "${helperUrl}";\n${dateHelpers}\n${factories}\nexport { createSubject, nextSlots };`));

assert.deepEqual(normalizeWeekdays([1, 3, 5], 1), [1]);
assert.deepEqual(normalizeWeekdays([0, 1, "1", 8, "bad", 3], 2), [1, 3]);
assert.deepEqual(createSubject(1).weekdays, [], "Pesanan baru tidak memilih hari otomatis");
assert.deepEqual(createSubject(1).schedules, [], "Tanpa pilihan hari, jadwal kosong");
assert.equal(createSubject(1, "18:00", 0, true).weekdays.length, 1, "Perpanjangan satu sesi tidak memilih dua hari");
assert.equal(createSubject(4, "18:00", 0, true).weekdays.length, 2);
assert.deepEqual(nextSlots(1, "18:00", "2026-10-10", []), [], "Tidak ada fallback ke Senin");
assert.equal(nextSlots(1, "18:00", "2026-10-10", [1]).length, 1);
assert.deepEqual(normalizePackageWeekdays([{ weekdays: [1, 3, 5] }], 1)[0].weekdays, [1], "Draf tiga hari dibatasi ke satu");
assert.deepEqual(normalizePackageWeekdays([{ weekdays: [1, 3] }, { weekdays: [3, 5] }], 4).map((item) => item.weekdays), [[1, 3], [3]], "Batas dihitung untuk seluruh paket multi-mapel");
const unchanged = { weekdays: [4] };
assert.equal(normalizePackageWeekdays([unchanged], 1)[0], unchanged, "Pilihan valid tetap sama, tidak memicu reset jadwal");
assert.deepEqual(normalizePackageWeekdays([{ weekdays: [] }], 1)[0].weekdays, [], "Draf kosong tetap kosong");
assert.ok(builder.includes("weekdays: restoredDays,") && !builder.includes("restoredDays.length ? restoredDays : [1, 3, 5]"), "Pemulihan draf tidak mengisi tiga hari bawaan");
const picker = await readFile(new URL("../src/components/LearningFocusPicker.tsx", import.meta.url), "utf8");
assert.ok(picker.includes("dari {chapters.length} bab tersedia dipilih") && !picker.includes("/8 bab dipilih"), "Jumlah bab tersedia dipisahkan dari batas pilihan");
console.log("PASS: 14 pemeriksaan jumlah bab dan inisialisasi hari belajar.");

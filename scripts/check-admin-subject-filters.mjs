import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/adminSubjectFilters.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { filterAdminSubjects } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const subjects = [
  { id: 1, name: "Matematika", group_name: "Wajib", education_levels: ["SD", "SMP", "SMA"], is_active: true },
  { id: 2, name: "Bahasa Indonesia", group_name: "Wajib", education_levels: ["SD", "SMA"], is_active: false },
  { id: 3, name: "Piano", group_name: "Seni", education_levels: ["Umum"], is_active: true },
  { id: 4, name: "Melukis", group_name: "Seni", education_levels: ["SD", "Umum"], is_active: false },
];
const defaults = { search: "", category: "", level: "", status: "active" };
const ids = (filters) => filterAdminSubjects(subjects, { ...defaults, ...filters }).map((subject) => subject.id);

assert.deepEqual(ids({}), [1, 3], "Default hanya mapel aktif");
assert.deepEqual(ids({ status: "all" }), [1, 2, 3, 4], "Semua status mencakup nonaktif");
assert.deepEqual(ids({ status: "inactive" }), [2, 4], "Nonaktif tidak bercampur dengan aktif");
assert.deepEqual(ids({ category: "Seni", status: "all" }), [3, 4], "Kategori cocok tepat");
assert.deepEqual(ids({ level: "SMP", status: "all" }), [1], "Mapel multi-jenjang tetap muncul");
assert.deepEqual(ids({ search: "  MATEMATIKA  " }), [1], "Pencarian mengabaikan kapital dan spasi tepi");
assert.deepEqual(ids({ search: "seni" }), [3], "Kategori juga dapat dicari");
assert.deepEqual(ids({ search: "umum" }), [3], "Jenjang juga dapat dicari");
assert.deepEqual(ids({ category: "Wajib", level: "SMA", status: "inactive", search: "indonesia" }), [2], "Semua filter dikombinasikan");
assert.deepEqual(ids({ category: "Seni", level: "SMA", status: "all" }), [], "Kombinasi tanpa kecocokan kosong");
assert.deepEqual(filterAdminSubjects([], defaults), [], "Daftar kosong aman");
assert.deepEqual(ids(defaults), [1, 3], "Reset mengembalikan filter awal");
assert.equal(subjects.length, 4, "Filter tidak menghapus data sumber");
console.log("PASS: 13 pemeriksaan filter mapel admin.");

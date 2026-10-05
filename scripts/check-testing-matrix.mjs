import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const matrix = fs.readFileSync(path.join(root, 'testing-matrix.md'), 'utf8');
const scenarioSection = matrix.split('## Skenario terdaftar')[1]?.split(/\r?\n## /)[0] ?? '';
const rows = scenarioSection.split(/\r?\n/).filter((line) => line.startsWith('| ') && !line.startsWith('| ID |') && !line.startsWith('| ---'))
  .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
const errors = [];
const ids = new Set();
const statuses = new Set(['BELUM', 'LULUS', 'GAGAL', 'TERHALANG', 'ULANG']);
const roles = new Set(['TAMU', 'MURID', 'PEMILIK', 'TEMAN', 'TUTOR', 'ADMIN', 'UTAMA', 'SISTEM', 'HARNESS']);
const modes = new Set(['READ', 'API', 'UI', 'SANDBOX', 'CLOCK']);
const flows = new Set(['PRE', 'ADM', 'PUB', 'QA', ...Array.from({ length: 16 }, (_, i) => String(i + 1).padStart(2, '0'))]);
const counts = { scenarios: rows.length, byStage: {}, byFlow: {}, byStatus: {} };

for (const cells of rows) {
  if (cells.length !== 9) {
    errors.push(`${cells[0]}: expected 9 columns, got ${cells.length}`);
    continue;
  }
  const [id, stage, flow, role, mode, scenario, expected, status, evidence] = cells;
  if (!/^[A-Z][A-Z0-9]*-\d{2}$/.test(id)) errors.push(`${id}: invalid scenario ID`);
  if (ids.has(id)) errors.push(`${id}: duplicate ID`);
  ids.add(id);
  if (!/^[1-9]$/.test(stage)) errors.push(`${id}: invalid stage`);
  if (!flows.has(flow)) errors.push(`${id}: invalid flow`);
  if (!roles.has(role)) errors.push(`${id}: invalid actor`);
  if (!mode.split('+').every((part) => modes.has(part))) errors.push(`${id}: invalid method`);
  if (!scenario || !expected) errors.push(`${id}: missing scenario/expected result`);
  if (!statuses.has(status)) errors.push(`${id}: invalid status`);
  if (['LULUS', 'GAGAL', 'TERHALANG', 'ULANG'].includes(status) && (!evidence || evidence === '—')) errors.push(`${id}: result needs evidence/reason`);
  counts.byStage[stage] = (counts.byStage[stage] ?? 0) + 1;
  counts.byFlow[flow] = (counts.byFlow[flow] ?? 0) + 1;
  counts.byStatus[status] = (counts.byStatus[status] ?? 0) + 1;
}

for (let stage = 1; stage <= 9; stage++) if (!counts.byStage[stage]) errors.push(`Missing stage ${stage}`);
for (const flow of flows) if (!counts.byFlow[flow]) errors.push(`Missing flow ${flow}`);
if (rows.length < 100) errors.push('Matrix unexpectedly contains fewer than 100 scenarios');

// Source pointers are entry points, not assertions of behavioral coverage.
for (const line of matrix.split(/\r?\n/).filter((text) => /^\| (\d{2}|ADM|PUB|QA) /.test(text))) {
  for (const testName of line.match(/\b[A-Z][A-Za-z0-9]+Test\b/g) ?? []) {
    if (!fs.existsSync(path.join(root, 'bimbelku-backend', 'tests', 'Feature', `${testName}.php`))) errors.push(`Missing referenced test ${testName}`);
  }
}

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log('Matriks valid: ID unik, 16 alur layanan, alur pendukung, dan 9 tahap tercakup.');
  console.log(JSON.stringify(counts, null, 2));
}

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.join(root, 'bimbelku-backend');
const matrix = spawnSync(process.execPath, [path.join(root, 'scripts', 'check-testing-matrix.mjs')], { cwd: root, stdio: 'inherit', windowsHide: true });
if (matrix.status !== 0 || matrix.error) process.exit(matrix.status || 1);

const cachePath = 'bootstrap/cache/config-stage1-preparation.php';
if (fs.existsSync(path.join(backend, cachePath))) {
  console.error('Reserved test config cache already exists; refusing to run against an unknown cached database.');
  process.exit(1);
}
console.log('Tahap 1 saja: SQLite :memory:, email array, gateway tiruan. Database lokal tidak direset.');
const result = spawnSync('php', [
  'vendor/bin/phpunit', '--configuration', 'phpunit.xml',
  '--filter', 'TestingStageOnePreparationTest|DemoJourneyTimeCommandTest|DemoGatewayConnectivityCommandTest',
], {
  cwd: backend, stdio: 'inherit', windowsHide: true,
  env: {
    ...process.env,
    APP_ENV: 'testing', APP_CONFIG_CACHE: cachePath,
    DB_CONNECTION: 'sqlite', DB_DATABASE: ':memory:',
    MAIL_MAILER: 'array', QUEUE_CONNECTION: 'sync', CACHE_STORE: 'array', SESSION_DRIVER: 'array',
    XENDIT_ENABLED: 'false', XENDIT_SECRET_KEY: 'xnd_development_stage1_synthetic_only',
    XENDIT_WEBHOOK_TOKEN: 'stage1-synthetic-webhook-token', XENDIT_BASE_URL: 'https://api.xendit.test',
  },
});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);

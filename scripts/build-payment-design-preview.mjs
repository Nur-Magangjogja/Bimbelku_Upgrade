import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Keep this visual-only build separate from dist: a normal build must never
// overwrite the preview, nor should a release accidentally ship the fixture.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const viteBin = path.join(root, "node_modules", "vite", "bin", "vite.js");
const child = spawn(process.execPath, [viteBin, "build", "--outDir", "dist-payment-preview"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, VITE_PAYMENT_DESIGN_PREVIEW: "true" },
});

child.once("error", (error) => {
  process.stderr.write(`Gagal membangun pratinjau pembayaran: ${error.message}\n`);
  process.exitCode = 1;
});
child.once("exit", (code) => {
  process.exitCode = code ?? 1;
});

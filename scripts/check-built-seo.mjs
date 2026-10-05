import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../dist${path}`, import.meta.url), "utf8");
const homepage = read("/index.html");
const sitemap = read("/sitemap.xml");
const headers = read("/.htaccess");
const siteUrl = (process.env.VITE_SITE_URL || "https://bimbelcerdas.com").replace(/\/+$/, "");
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const inlineScript = homepage.match(/<script>([\s\S]*?)<\/script>/)?.[1];
check(Boolean(inlineScript), "Preload hero beranda tidak ditemukan.");
if (inlineScript) {
  const hash = `sha256-${createHash("sha256").update(inlineScript).digest("base64")}`;
  check(homepage.includes(hash) && headers.includes(hash), "Hash CSP preload hero tidak sama di HTML dan Apache.");
}

const routes = [
  ["/program", "Program Bimbel"], ["/tutor", "Tutor Bimbel"],
  ["/area-layanan", "Area Layanan"], ["/seleksi-tutor", "Tutor BimbelKu Diseleksi"],
  ["/testimonials", "Cerita dan Ulasan"], ["/why-us", "Apa Itu BimbelKu"],
  ["/privacy", "Kebijakan Privasi"], ["/terms", "Syarat dan Ketentuan"],
  ["/cara-belajar/privat-online", "Panduan privat online"],
];
for (const [path, expectedTitle] of routes) {
  const html = read(`${path}/index.html`);
  check(html.includes(`<title>`) && html.includes(expectedTitle), `${path}: judul HTML awal salah.`);
  check(/<meta name="description" content="[^"]+"\s*\/>/.test(html), `${path}: deskripsi HTML awal kosong.`);
  check(html.includes(`rel="canonical" href="${siteUrl}${path}"`), `${path}: canonical HTML awal salah.`);
  check(sitemap.includes(`${siteUrl}${path}<`), `${path}: tidak ada dalam sitemap.`);
}

const firstProgram = [...sitemap.matchAll(/<loc>([^<]+\/program\/([a-z0-9-]+)\?level=[^<]+)<\/loc>/g)][0]?.[2];
if (firstProgram) {
  const programHtml = read(`/program/${firstProgram}/index.html`);
  check(/<title>Les [^<]+ \| BimbelKu<\/title>/.test(programHtml), "Profil mapel tidak memiliki judul awal spesifik.");
  check(!programHtml.includes('rel="canonical"'), "Profil mapel multi-jenjang memiliki canonical statis yang bertentangan dengan ?level=.");
}
check(!sitemap.includes("<lastmod>"), "Sitemap mengklaim seluruh halaman baru diperbarui pada tanggal build.");

if (failures.length) {
  console.error("SEO build gagal:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log(`SEO build valid: ${routes.length} rute utama, profil mapel, sitemap, dan CSP.`);

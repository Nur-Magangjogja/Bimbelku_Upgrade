# Catatan untuk petugas hosting/developer

Dokumen teknis pendamping. Versi awal diperiksa 4 Oktober 2026 dan dipisahkan dari panduan pemilik pada 5 Oktober 2026. Temuan bertanggal adalah catatan pemeriksaan saat itu, bukan hasil audit baru hari ini.

Pemilik membaca **panduan-pindah-dan-hosting.md** terlebih dahulu. Dokumen ini mempertahankan petunjuk teknis, keselamatan pemindahan data, checklist uji, dan rancangan program yang belum diterapkan.

# Panduan pindah perangkat, hosting, dan pengujian BimbelKu

Tanggal pemeriksaan: 4 Oktober 2026. Berdasarkan kode proyek saat ini, bukan petunjuk Laravel generik.

Tujuan: orang yang menerima proyek mengetahui berkas yang harus dipindahkan, nilai konfigurasi yang harus diisi, alamat yang harus didaftarkan ke layanan luar, dan bukti pengujian sebelum pelanggan sungguhan menggunakannya.

## 1. Kesimpulan sebelum menyerahkan proyek

Proyek boleh diserahkan untuk pemasangan dan pengujian di hosting. Namun **sudah diunggah bukan berarti sudah layak menerima pembayaran pelanggan**. Lakukan pemasangan HTTPS dengan key pembayaran TEST dahulu, lalu luluskan checklist pada bagian 12 sebelum berpindah ke LIVE.

Tiga hal yang tidak selesai hanya dengan mengisi `.env`:

- **Verifikasi nama rekening tutor:** `bimbelku-backend/app/Services/BankAccountNameVerifier.php` saat ini mengembalikan `false`. Pencairan ditahan sebelum dana dikirim. Layanan validasi bank perlu diaktifkan dan integrasinya benar-benar dibuat; tidak ada variabel `.env` yang sekarang dapat menghidupkannya. Jangan mengganti hasilnya menjadi `true` untuk meloloskan tes.
- **Pembayaran di dalam halaman:** perlu HTTPS, akun dan kanal pembayaran yang mendukung Components, origin yang cocok, serta aturan CSP server yang tidak memblokir SDK/frame penyedia. HTTPS saja belum membuktikan tampilannya berjalan.
- **Program bebas jenjang:** kode saat ini masih menyaring program dan mapelnya berdasarkan jenjang. Rancangan perubahan ada pada bagian 15; belum diterapkan oleh pembuatan panduan ini.

Tes otomatis pada pekerjaan sebelumnya lulus 386 tes backend. Itu bukti regresi kode, bukan pengganti tes koneksi SMTP, Google, webhook, dan kanal pembayaran pada hosting yang sesungguhnya.

## 2. Tentukan alamat website dan backend

Domain yang kamu sebutkan adalah `bimbelcerdas.com`. Panduan ini memakai susunan berikut sebagai **rencana pemasangan**, bukan klaim bahwa domain/subdomain ini sudah aktif:

| Kegunaan | Alamat setelah dipasang |
| --- | --- |
| Website yang dibuka murid/tutor/admin | `https://bimbelcerdas.com` |
| Backend Laravel | `https://api.bimbelcerdas.com` |
| Alamat API frontend | `https://api.bimbelcerdas.com/api` |
| Callback Google, diisi pada Google Cloud | `https://api.bimbelcerdas.com/api/auth/google/callback` |
| Webhook pembayaran/refund/payout, diisi pada dashboard penyedia | `https://api.bimbelcerdas.com/api/webhooks/xendit` |
| Kembali setelah pembayaran berhasil | `https://bimbelcerdas.com/payment?gateway=success` |
| Kembali setelah keluar dari checkout | `https://bimbelcerdas.com/payment?gateway=cancelled` |
| Pemeriksaan backend hidup | `https://api.bimbelcerdas.com/up` |

Webhook adalah pemberitahuan **server penyedia ke server BimbelKu**. Alamat kembali pembayaran adalah **halaman browser pengguna**. Jangan menukarkan kedua alamat itu. Tidak perlu menambahkan `order_id` manual pada konfigurasi URL; kode menambahkannya saat membuat checkout baru.

Jika penyedia hosting memilih backend satu domain lewat `/api`, semua alamat API harus disesuaikan bersama. Jangan mencampur sebagian konfigurasi subdomain dan sebagian satu domain. Beri panduan ini kepada petugas hosting dan minta mereka mengonfirmasi susunan alamat terlebih dahulu.

Untuk awal, gunakan domain tanpa `www` secara konsisten. Jika `www.bimbelcerdas.com` digunakan juga, arahkan ke domain utama. Tambahkan origin terpisah hanya jika frontend benar-benar diakses dari sana, bukan sekadar karena ada DNS-nya.

## 3. Berkas yang dipindahkan

Ada dua `.env` yang berbeda:

1. `.env` di folder utama: konfigurasi build frontend. Nilai berawalan `VITE_` dapat dibaca pengunjung dari hasil build.
2. `bimbelku-backend/.env`: database, APP_KEY, SMTP, Google secret, dan secret pembayaran. Wajib privat.

Pindahkan source, `package-lock.json`, `composer.lock`, aset `public/`, dan backend. Bila ingin mempertahankan data, pindahkan juga backup database dan file upload di `bimbelku-backend/storage/app/` melalui jalur privat.

Jangan menaruh `.env`, dump SQL, `storage/`, arsip proyek, atau backup di direktori publik website. Jangan kirim secret melalui screenshot, Git, atau chat umum. Beri akses privat hanya kepada petugas yang memasang server. Akun demo dengan password sederhana tidak boleh dibuka ke publik.

### Pindah data lama atau mulai database baru?

**Mempertahankan data lama:** backup/import database dan upload; simpan **APP_KEY lama yang sama**. Data terenkripsi/cookie dapat rusak jika key diganti. Jangan menjalankan `key:generate`, `migrate:fresh`, atau seeder massal pada database yang dipindahkan.

**Mulai bersih untuk rilis:** buat database kosong dan APP_KEY baru satu kali. Jangan membawa transaksi sandbox, akun demo, atau data uji sebagai transaksi live. Ini keputusan terpisah; jangan menghapus database lama tanpa backup dan persetujuan pemilik.

Staging HTTPS untuk pengujian harus mempunyai database, cache, dan upload terpisah dari production. Menggunakan key TEST pada database pelanggan LIVE tetap tidak aman untuk pengujian.

## 4. Pindah ke laptop/PC lain untuk pengembangan

Pasang Node.js yang memenuhi dependency proyek, npm, PHP 8.2+, Composer 2, dan MySQL/MariaDB kompatibel. Gunakan lockfile; jangan upgrade dependency sembarang saat pindah perangkat.

Dari folder utama proyek, jalankan PowerShell:

```powershell
npm ci
```

Isi `.env` frontend untuk penggunaan lokal:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_SITE_URL=https://bimbelcerdas.com
SEO_PROGRAM_API=http://127.0.0.1:8000/api/program-groups
```

Masuk ke backend:

```powershell
cd bimbelku-backend
composer install
```

Jika belum ada `.env`, salin `.env.example` melalui editor/file manager. Jika sudah ada `.env`, jangan menimpanya. Isi database milik perangkat baru dan alamat lokal:

```dotenv
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:8080
FRONTEND_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/api/auth/google/callback
SESSION_SECURE_COOKIE=false
SESSION_DOMAIN=null
```

Gunakan `key:generate` **hanya bila instalasi baru dengan database kosong**, bukan ketika membawa data lama. Setelah isi database dan key selesai:

```powershell
php artisan optimize:clear
php artisan migrate
php artisan storage:link
php artisan migrate:status
```

Pada pemeriksaan 4 Oktober, migration `2026_09_30_000100_add_education_levels_to_learning_programs` masih **Pending** di database lokal. Migration ini menambah kolom multi-jenjang program; harus ikut dijalankan. Jangan hanya memindahkan source dan melewatkan migration.

Dari folder utama, jalankan:

```powershell
npm run build
npm run preview -- --port 8080
```

Buka `http://localhost:8080` secara konsisten. Pesan port sudah aktif berarti launcher memakai proses yang ada, bukan gagal membuat aplikasi. Jika proses yang ada ternyata proyek lain/versi lama, identifikasi proses terlebih dahulu, jangan asal mematikan semua PHP/Node.

SMTP dan Google dapat menggunakan akun layanan yang sama di perangkat baru jika diizinkan pemilik. Alamat lokal Google tetap perlu terdaftar. Webhook dari internet tidak dapat menjangkau `localhost` laptop baru; perlu staging HTTPS atau tunnel publik yang dikonfigurasi khusus. `npm run preview` tidak otomatis menjalankan scheduler.

## 5. Pemasangan domain, SSL, dan direktori hosting

Minta penyedia hosting melakukan ini sebelum mengisi webhook:

1. Hubungkan DNS `bimbelcerdas.com` dan `api.bimbelcerdas.com` ke server yang tepat.
2. Pasang sertifikat HTTPS valid untuk keduanya dan aktifkan pembaruan sertifikat.
3. Redirect HTTP ke HTTPS; jangan memasang redirect tambahan yang mengubah POST webhook menjadi GET.
4. Document root frontend hanya folder `dist/` hasil build. Document root backend hanya `bimbelku-backend/public/`.
5. Aktifkan routing frontend agar membuka ulang `/login`, `/payment`, `/oauth/google/callback`, dan halaman lain tidak menjadi 404.
6. Aktifkan routing Laravel ke `public/index.php`. Jika Apache, gunakan `.htaccess` yang sesuai. Jika Nginx, petugas perlu aturan setara.
7. Beri izin tulis kepada user aplikasi hanya pada `storage/` dan `bootstrap/cache/`; jangan chmod seluruh source menjadi 777.
8. Pastikan PHP mempunyai ekstensi yang dibutuhkan lockfile/Laravel/PDF serta bisa melakukan HTTPS keluar ke Google dan penyedia pembayaran. Pastikan koneksi SMTP port 587 diizinkan.
9. Jika HTTPS diterminasi reverse proxy/CDN, pastikan Laravel mengenali request HTTPS dan proxy dipercaya secara terbatas. Hindari redirect loop serta cookie aman yang tidak terkirim.
10. Jangan cache API login, pembayaran, refund, saldo, atau data pribadi di CDN. Webhook harus lolos tanpa CAPTCHA, Basic Auth, halaman maintenance HTML, dan challenge browser.

`/up` memberi bukti proses Laravel bisa menerima request, bukan bukti database, SMTP, Google, dan pembayaran sudah benar.

## 6. Isi `.env` backend di hosting

Mulai dari `bimbelku-backend/.env.production.example`. Template ini sudah dilengkapi variabel pembayaran dan sesi login. Salin menjadi `.env` secara privat di server, lalu ubah bagian berikut:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.bimbelcerdas.com
APP_TIMEZONE=Asia/Jakarta
FRONTEND_URL=https://bimbelcerdas.com
FRONTEND_ORIGINS=https://bimbelcerdas.com

DB_CONNECTION=mysql
DB_HOST=ALAMAT_DATABASE_DARI_HOSTING
DB_PORT=3306
DB_DATABASE=NAMA_DATABASE_DARI_HOSTING
DB_USERNAME=USER_DATABASE_DARI_HOSTING
DB_PASSWORD="PASSWORD_DATABASE_DARI_HOSTING"

CACHE_STORE=database
QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
SESSION_DOMAIN=null

GOOGLE_CLIENT_ID=CLIENT_ID_DARI_GOOGLE
GOOGLE_CLIENT_SECRET="CLIENT_SECRET_DARI_GOOGLE"
GOOGLE_REDIRECT_URI=https://api.bimbelcerdas.com/api/auth/google/callback

XENDIT_ENABLED=true
XENDIT_SECRET_KEY="SECRET_KEY_TEST_DARI_DASHBOARD"
XENDIT_WEBHOOK_TOKEN="VERIFICATION_TOKEN_TEST_DARI_DASHBOARD"
XENDIT_BASE_URL=https://api.xendit.co
XENDIT_COUNTRY=ID
XENDIT_CURRENCY=IDR
XENDIT_SUCCESS_URL=https://bimbelcerdas.com/payment?gateway=success
XENDIT_CANCEL_URL=https://bimbelcerdas.com/payment?gateway=cancelled
XENDIT_SESSION_TTL_MINUTES=60
XENDIT_PAYOUT_API_VERSION=2025-09-01

PRIMARY_ADMIN_EMAIL=EMAIL_ADMIN_UTAMA_MILIK_CLIENT
SEED_ADMIN_EMAIL=EMAIL_ADMIN_UTAMA_MILIK_CLIENT
SEED_ADMIN_PASSWORD="PASSWORD_AWAL_KUAT_MINIMAL_12_KARAKTER"
SEED_DEMO_USERS=false
```

Bagian huruf besar seperti `NAMA_DATABASE_DARI_HOSTING` adalah petunjuk nilai yang harus diganti, **bukan isian yang boleh dibiarkan**. Nama database/user di hosting bisa memiliki awalan akun hosting; jangan menyalin `root` laptop.

`SESSION_DOMAIN=null` membuat cookie host-only pada backend; cocok dengan frontend dan API subdomain satu situs di atas. Frontend sudah memakai request dengan credentials. Jangan mengganti domain cookie ke localhost pada server.

Jangan menetapkan `SANCTUM_TOKEN_EXPIRATION=720`: proyek sudah memberikan tanggal kedaluwarsa per token. Batas global itu akan memotong opsi ingat perangkat 30 hari menjadi 12 jam. Admin tetap memakai durasi tersendiri.

Deadline pembayaran saat ini **60 menit di kode**, bukan nilai admin bebas. `XENDIT_SESSION_TTL_MINUTES` tidak mengalahkan konstanta kode.

## 7. SMTP: email OTP dan reset password

Konfigurasi bawaan proyek menunjuk Brevo. Jika memakai penyedia lain, sesuaikan kredensial dan protokol dari penyedia itu; tidak perlu menambah semua layanan Mailgun/SES/Postmark sekaligus.

Untuk Brevo:

1. Gunakan akun layanan milik client dan buka halaman **SMTP & API**, bagian **SMTP**.
2. Salin **SMTP login** yang ditampilkan. Ini tidak selalu sama dengan email akun login Brevo.
3. Buat **SMTP key**; bukan API key, bukan password akun Brevo.
4. Tambahkan alamat pengirim dan autentikasi domain `bimbelcerdas.com` menggunakan record DNS yang diberikan Brevo. Jangan menebak nilai DNS atau membuat record SPF ganda.
5. Isi pada `.env` backend:

```dotenv
MAIL_MAILER=smtp
MAIL_SCHEME=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=SMTP_LOGIN_YANG_DITAMPILKAN_BREVO
MAIL_PASSWORD="SMTP_KEY_YANG_DIBUAT_DI_BREVO"
MAIL_FROM_ADDRESS=noreply@bimbelcerdas.com
MAIL_FROM_NAME="BimbelKu"
```

Port 587 memakai SMTP dengan negosiasi TLS sesuai transport. Bila penyedia secara khusus meminta SSL port 465, ikuti konfigurasi `smtps` penyedia; jangan menyalin pengaturan 465 dan 587 secara campur.

Setelah mengubah konfigurasi, bangun ulang cache Laravel sesuai bagian 10. Uji dari UI dengan satu akun sintetis yang emailnya kamu kendalikan: pendaftaran/OTP dan lupa password. Periksa inbox, spam, pengirim, tautan kembali ke domain frontend yang benar, dan laporan pengiriman Brevo.

`MAIL_MAILER=log` hanya menulis email ke log, tidak mengirimnya. Jangan menganggap email bekerja karena request UI sukses saja. Kode OTP/reset saat ini dikirim langsung; mengisi queue worker saja tidak memperbaiki password SMTP yang salah.

Referensi: [pengaturan Brevo SMTP](https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP) dan [SMTP key](https://help.brevo.com/hc/en-us/articles/7959631848850-Create-and-manage-your-SMTP-keys).

## 8. Google login: apa yang diubah setelah pindah

1. Buka Google Cloud / **Google Auth Platform**, pilih proyek OAuth milik client.
2. Pada **Clients**, buka client bertipe **Web application** yang dipakai BimbelKu.
3. Pada **Authorized redirect URIs**, tambahkan tepat:

```text
https://api.bimbelcerdas.com/api/auth/google/callback
```

4. Untuk pengembangan lokal, URI berikut boleh tetap tersimpan sebagai entri berbeda:

```text
http://127.0.0.1:8000/api/auth/google/callback
```

5. Jika diminta mengisi **Authorized JavaScript origins**, domain frontend adalah `https://bimbelcerdas.com`, tanpa `/api` atau `/login`. Proyek menggunakan callback OAuth di backend; isian origins tidak menggantikan redirect URI backend.
6. Salin client ID dan client secret ke `.env` backend. Jangan menaruh client secret di `.env` frontend.
7. Pada Branding, sesuaikan nama, email dukungan client, domain yang diizinkan, homepage `https://bimbelcerdas.com`, kebijakan privasi `/privacy`, dan syarat `/terms`.
8. Pada Audience, pengujian terbatas memakai test users yang diizinkan. Untuk pelanggan umum, sesuaikan status publikasi dan persyaratan verifikasi yang ditampilkan Google. Jangan gunakan Internal jika client ingin melayani akun Google masyarakat umum.
9. Bangun ulang cache backend, lalu uji Google login dari domain frontend. Sesudah kembali, pastikan langsung masuk akun yang benar, bukan baru terlihat login setelah menekan Back.

Callback harus cocok persis termasuk `http/https`, hostname, port lokal, path, dan garis miring akhir. Pindah laptop tetapi memakai URI lokal identik biasanya tidak memerlukan client baru; pindah domain memerlukan entri callback domain baru.

Kode Google yang kembali ditukar lewat cache backend. Gunakan database/Redis cache persisten dan bersama jika ada lebih dari satu proses/server; jangan `CACHE_STORE=array` pada hosting.

Referensi: [OAuth Google untuk web server](https://developers.google.com/identity/protocols/oauth2/web-server) dan [kebijakan production OAuth](https://developers.google.com/identity/protocols/oauth2/policies).

## 9. Pembayaran dan webhook di dashboard penyedia

### 9.1 Key dan izin

Gunakan **Test mode** dahulu. Secret key TEST dan token webhook TEST harus satu akun/environment. Berikan izin sesuai API yang benar-benar dipakai untuk pembayaran, refund, dan payout; cek ketersediaan produk pada akun. Label izin dashboard dapat berubah. Izin Money-in/Money-out saja bukan bukti semua produk dan kanal sudah aktif.

Jangan menyimpan secret pada frontend. SDK hanya menerima key sesi khusus dari backend. Sesudah semua tes lolos, LIVE memakai kredensial LIVE dan pengaturan webhook LIVE, bukan kredensial TEST.

### 9.2 URL mana yang dimasukkan?

Pada **Settings → Webhooks** di dashboard, isi URL ini pada event/produk terkait:

```text
https://api.bimbelcerdas.com/api/webhooks/xendit
```

| Produk yang dipakai kode | Event/kelompok yang dicari | Tujuan |
| --- | --- | --- |
| Payment Session | `payment_session.completed`, `payment_session.expired` | Penerimaan dana dan checkout berakhir |
| Unified Refund / Refund | event `refund.*` yang disediakan produk terkait | Status pengembalian dana |
| Payout v3 | `v3_payout.*` | Status transfer keluar |

Beberapa kolom boleh memakai **URL yang sama** karena backend memisahkan jenis event. Nama label dashboard tidak selalu sama dengan nama event API. Jangan mengisi semua kolom produk yang tidak digunakan. Kolom Remittance saja tidak membuktikan event Payment Session dan Unified Refund telah terpasang.

Ambil verification token dari halaman webhook, lalu masukkan sebagai `XENDIT_WEBHOOK_TOKEN`. Server memeriksa header `x-callback-token`; jangan menonaktifkan pemeriksaan itu supaya tes dashboard berhasil.

Jika Payment Session atau Unified Refund tidak tersedia pada dashboard akun, minta petugas/support penyedia menunjukkan konfigurasi **produk API tersebut**. Jangan menggantinya dengan webhook invoice lama secara asal.

Referensi: [webhook Payment Session](https://docs.xendit.co/apidocs/webhook-notification-sent-defined-webhook-url-updates-payment-session), [Payout v3](https://docs.xendit.co/apidocs/payout-v3-webhook), dan [verifikasi serta pengiriman ulang webhook](https://docs.xendit.co/docs/handling-webhooks).

### 9.3 Cara membuktikan webhook bekerja

1. Buat satu pesanan baru melalui website staging HTTPS menggunakan akun uji dan key TEST.
2. Simpan nomor pesanan, ID tagihan, ID sesi, dan nominal. Jangan menyimpan secret atau SDK key dalam laporan.
3. Selesaikan simulasi pembayaran pada kanal sandbox yang tersedia. Tidak ada uang pelanggan sungguhan.
4. Buka riwayat pengiriman webhook di dashboard. Pastikan menuju URL backend yang tepat dan mendapat respons 2xx.
5. Buka pesanan di website: status, jumlah pembayaran, matching, dan jurnal harus cocok.
6. Ulangi pengiriman **event yang sama untuk transaksi uji**; tidak boleh menambah pembayaran, kelas, atau saldo kedua kali.
7. Ulangi dengan browser ditutup setelah membayar. Webhook dan scheduler tetap harus memperbarui status server.

Respons 2xx pada payload contoh acak saja belum membuktikan transaksi tersambung. Backend dapat menjawab 202 untuk event yang diabaikan karena ID tidak dikenal. Bukti harus memakai checkout uji yang benar-benar dibuat aplikasi ini.

Membuka webhook dari address bar browser dapat menghasilkan 405 karena route-nya POST; itu bukan tes pembayaran. Jangan membuat pembayaran palsu dengan mengirim payload sukses buatan ke production.

### 9.4 Pembayaran di dalam website

Kode frontend mempunyai `EmbeddedCheckout`, dan backend dapat membuat sesi Components. Pada HTTP lokal, kode sengaja beralih ke hosted checkout. Untuk membuktikan embedded checkout, buat **tagihan/sesi baru pada HTTPS**; sesi hosted lama tidak berubah menjadi Components hanya karena domain telah berubah.

Periksa pada staging:

- Sesi benar-benar bermode Components dan origin tepat `https://bimbelcerdas.com` atau domain staging yang memang sedang dipakai.
- Pilihan kanal dapat diklik; tombol konfirmasi hanya aktif setelah data kanal siap.
- VA menampilkan nomor serta nominal; QR dapat dibaca; e-wallet menjalankan tindakan autentikasi yang disediakan penyedia dan pengguna dapat kembali untuk memeriksa status.
- Jangan menjanjikan semua e-wallet akan selalu membuka aplikasi secara otomatis: browser, kanal, dan perangkat memengaruhi perilakunya.
- Status lunas tetap berasal dari verifikasi server, bukan dari URL `gateway=success` atau tampilan sukses SDK saja.

**Catatan keamanan yang masih perlu pengujian/penyesuaian:** `public/.htaccess` frontend saat ini memiliki CSP ketat tanpa allowlist `frame-src` penyedia. Kebijakan tersebut dapat memblokir frame yang digunakan SDK. Petugas/developer harus memeriksa Console browser di HTTPS dan menyelaraskan CSP HTML/header berdasarkan domain resmi SDK yang benar-benar diperlukan. Jangan menghapus seluruh CSP atau mengizinkan semua script/frame. Dua CSP yang berbeda dapat sama-sama membatasi halaman; melonggarkan satu saja belum tentu cukup.

Referensi: [Xendit Components](https://docs.xendit.co/docs/components-overview).

## 10. Instalasi backend dan build frontend

### Backend, dijalankan petugas hosting dari folder backend

```bash
composer install --no-dev --prefer-dist --optimize-autoloader
php artisan optimize:clear
php artisan migrate --force
php artisan storage:link
php artisan migrate:status
php artisan route:list --path=webhooks
```

Bila instalasi baru dengan database kosong, lakukan `php artisan key:generate` **sebelum** konfigurasi dicache dan sebelum menyimpan data terenkripsi. Bila import database lama, gunakan APP_KEY lama dan lewatkan perintah itu.

Untuk database baru yang membutuhkan katalog awal, pemilik/developer harus meninjau seed yang akan dipakai. Jangan menjalankan `migrate --seed` atau `DatabaseSeeder` massal pada data lama. Untuk membuat admin utama pertama saja:

```bash
php artisan db:seed --class=AdminSeeder --force
```

Jalankan sekali setelah email/password seed diisi dan sebelum config dicache. Seeder ini dapat mengubah password admin yang sudah ada, jadi jangan diulang otomatis setiap deployment. Setelah berhasil login, hapus nilai `SEED_ADMIN_PASSWORD` dari `.env`; pertahankan `PRIMARY_ADMIN_EMAIL`.

Setelah konfigurasi akhir lengkap:

```bash
php artisan optimize
php artisan schedule:list
```

### Frontend, dari folder utama

Isi `.env.production` frontend (bukan `.env` backend):

```dotenv
VITE_API_BASE_URL=https://api.bimbelcerdas.com/api
VITE_SITE_URL=https://bimbelcerdas.com
SEO_PROGRAM_API=https://api.bimbelcerdas.com/api/program-groups
```

Script Node untuk sitemap/prerender memakai environment proses, tidak otomatis membaca semua isi `.env.production` seperti Vite. Karena itu isi variabel berikut juga di environment build hosting/CI, atau ekspor sebelum build pada Linux:

```bash
export VITE_API_BASE_URL=https://api.bimbelcerdas.com/api
export VITE_SITE_URL=https://bimbelcerdas.com
export SEO_PROGRAM_API=https://api.bimbelcerdas.com/api/program-groups
npm ci
npm run build
```

Jika build dilakukan di PowerShell laptop untuk kemudian mengunggah `dist/`:

```powershell
$env:VITE_API_BASE_URL = "https://api.bimbelcerdas.com/api"
$env:VITE_SITE_URL = "https://bimbelcerdas.com"
$env:SEO_PROGRAM_API = "https://api.bimbelcerdas.com/api/program-groups"
npm ci
npm run build
```

Alamat katalog ini sesuai parser sitemap saat ini. Pastikan backend sudah bisa dijangkau saat build agar mapel tambahan dari admin masuk sitemap, bukan hanya katalog bawaan. Perubahan `VITE_` memerlukan **build ulang**, bukan sekadar upload `.env`.

Unggah hasil `dist/` beserta routing/aturan server ke document root frontend. Jangan menjalankan `npm run preview` sebagai server publik production. Jangan mengunggah hasil `build:payment-preview`; itu alat tampilan lokal, bukan transaksi nyata.

Jalankan pemeriksaan dan tes dari checkout pengujian/CI dengan dev dependencies, bukan memaksa `php artisan test` setelah `composer install --no-dev` di server pelanggan. Laporan tes dan Lighthouse domain deployment disimpan untuk handoff; jangan menyebut skor hanya berdasarkan target.

## 11. Scheduler, cache, worker, dan backup

Cron Laravel wajib berjalan setiap menit. Dari direktori backend, `schedule:list` hanya menampilkan jadwal; **tidak menjalankan pekerjaan**.

Minta petugas hosting mengisi Cron Jobs setiap menit dengan bentuk:

```cron
* * * * * cd /PATH-ABSOLUT-BACKEND-DARI-HOSTING && /PATH-PHP-DARI-HOSTING artisan schedule:run >> /PATH-LOG-PRIVAT-DARI-HOSTING/scheduler.log 2>&1
```

Path di atas harus diganti petugas dengan lokasi nyata pada server; path Windows laptop tidak berlaku pada Linux hosting. Minta bukti path dan log putaran cron yang berhasil, bukan hanya screenshot cron telah disimpan.

Scheduler saat ini menjalankan pemeriksaan pembayaran, kedaluwarsa booking, kedaluwarsa pesanan tamu, refund, pemeriksaan jurnal, dan pembersihan token. Jangan memasang cron reconcile tambahan paralel tanpa memahami lock-nya.

Gunakan `CACHE_STORE=database` atau Redis yang dipakai bersama seluruh proses. Jangan menggunakan `array` pada hosting. Jalankan worker bila pekerjaan antrean dipakai; konfigurasi worker/Supervisor dilakukan petugas sesuai queue dan timeout proyek. Restart worker setelah rilis jika ada worker aktif.

**Cron dan worker bisa memproses transaksi tersimpan.** Pastikan staging benar-benar memakai database sandbox sebelum menjalankannya. Jangan memakai command skip waktu/demo pada production.

Backup database dan upload secara berkala ke lokasi privat, simpan APP_KEY secara aman, dan uji restore. Saat berpindah server lama ke baru, jangan biarkan dua scheduler berbeda memproses satu database selama cutover tanpa koordinasi.

Referensi: [scheduler Laravel 12](https://laravel.com/framework/docs/12.x/scheduling). Rincian keamanan tambahan ada di `DEPLOYMENT_SECURITY.md`.

## 12. Checklist pengujian HTTPS sebelum LIVE

Tes ini dijalankan manusia melalui UI staging, bukan hanya command demo koneksi. Halaman dan metode yang tersedia harus dilaporkan sesuai hasil nyata.

| Pengujian | Bukti hasil yang harus diperoleh |
| --- | --- |
| Login manual dan Google | Kembali langsung ke akun/role yang benar; sesi bertahan sesuai pilihan; logout mengakhiri akses |
| Register, OTP, lupa password | Email benar-benar diterima; token/kode valid; tautan memakai domain baru |
| Pesanan tanpa login | Masuk ke akun email yang cocok; tidak masuk akun lain; pembayaran dapat dilanjutkan |
| Privat satu orang | Nominal UI = tagihan = penerimaan gateway; matching hanya setelah lunas |
| Privat bersama teman | Jumlah peserta, diskon, pembagian dana dan akses anggota sesuai pesanan |
| Program beberapa mapel, termasuk 2 jam | Total dan alokasi per mapel benar; tutor per mapel; tidak wajib bab program |
| Kelas bersama dan renewal | Kursi/masa berlaku benar; tidak ada riwayat pembayaran ganda |
| Embedded VA/QR/e-wallet yang aktif | Pilihan metode bekerja; instruksi sesuai kanal; kembali tidak salah tagihan |
| Tutup checkout dan buka lagi | Memakai sesi yang ada; tidak menggandakan tagihan atau pembayaran |
| Browser ditutup setelah membayar | Webhook/cron memperbarui pesanan tanpa bergantung browser |
| Webhook dikirim ulang | Transaksi, kelas, saldo, jurnal tidak bertambah dua kali |
| Pembayaran berakhir 1 jam | Pesanan berakhir menurut deadline; pembayaran terlambat tidak menghidupkan kelas yang dibatalkan |
| Tutor tidak ditemukan seluruh/sebagian | Informasi mapel yang sudah/belum cocok jelas; cari lagi/ubah jadwal/batal konsisten |
| Refund saldo dan metode asal | Status admin = murid; pending bukan dianggap sukses; dana/jurnal hanya berubah sekali |
| Pencairan tutor | Saat ini **belum lulus produksi**, menunggu integrasi verifikasi nama bank dan tes payout nyata sandbox |
| Bukti, foto, sampul, PDF | Upload tersimpan; hanya media publik bebas diakses; dokumen privat perlu izin |
| Responsive, CSP, SEO | Tidak overflow; tidak ada frame/script penting terblokir; canonical/sitemap domain benar |

Untuk e-wallet/refund, simulator tiap kanal mungkin tidak mencakup semua perilaku aplikasi asli. Catat batas simulator; bila dibutuhkan, lakukan transaksi LIVE nominal kecil yang disetujui pemilik setelah akun aktif. Jangan mengganti key LIVE diam-diam untuk membuktikan tes.

Tidak ada tes yang dapat menjamin nol bug selamanya. Kriteria rilisnya adalah skenario utama terbukti, kegagalan tidak menggandakan dana, dan masalah tersisa tertulis serta tidak dipromosikan sebagai fitur aktif.

## 13. Beralih dari TEST ke LIVE

1. Pemilik client menyelesaikan aktivasi akun dan kanal pembayaran yang diperlukan.
2. Seluruh checklist kritis telah lulus dan dua catatan integrasi pada bagian 1 telah dituntaskan atau fiturnya jelas ditahan.
3. Gunakan database production bersih atau data yang telah disetujui untuk production, bukan transaksi sandbox.
4. Isi secret key LIVE dan verification token LIVE di `.env` backend production.
5. Daftarkan URL webhook pada **Live mode** juga. Simpan URL sukses/batal domain production.
6. Bangun ulang cache backend; restart proses persisten jika ada; pastikan hanya scheduler production yang memproses database production.
7. Lakukan smoke test yang disetujui pemilik, pantau pengiriman webhook dan jurnal. Pengujian payout/refund memerlukan kemampuan/saldo operasional yang sesuai.
8. Jangan mengganti key TEST/LIVE bolak-balik untuk tagihan yang sama. Catat environment transaksi.

## 14. Jika gagal, periksa bagian yang tepat

| Gejala | Pemeriksaan pertama |
| --- | --- |
| Login Google `redirect_uri_mismatch` | URI dashboard Google harus sama persis dengan backend `.env` dan cache baru |
| Kembali Google tetapi login gagal | Domain frontend/origin, credentials cookie, cache OAuth persisten, session cookie HTTPS, request exchange |
| Email tidak diterima | `MAIL_MAILER=smtp`, SMTP login/key, pengirim terverifikasi, koneksi port, laporan Brevo |
| Webhook 401 | Token environment dashboard tidak sama dengan backend, header tidak diteruskan |
| Webhook 404/405 | URL/backend routing atau metode salah; harus POST route `/api/webhooks/xendit` |
| Webhook 419/403/challenge HTML | Middleware/WAF/proxy salah; endpoint harus menerima callback server tanpa login browser |
| Webhook 202 tetapi order tidak berubah | ID/ref payload tidak cocok transaksi aplikasi; lihat apakah event sengaja diabaikan |
| Webhook 500 / unknown column | Migration belum lengkap atau error server; lihat log privat, jangan tampilkan stack trace ke publik |
| Pesanan pending setelah browser ditutup | Riwayat webhook, cron sungguh berjalan, ID sesi, kegagalan reconcile, lock/cache bersama |
| SDK/kanal pembayaran tidak muncul | HTTPS, mode sesi, akun/kanal aktif, origin, Console CSP, CDN/header |
| Masih menuju checkout luar | HTTP lokal, sesi hosted lama, atau mode yang dikembalikan API; gunakan tagihan baru untuk tes HTTPS |
| Foto/sampul hilang setelah pindah | File upload belum dipindah, base API salah, izin media; database saja tidak membawa foto |
| Pilihan program Umum kosong | Migration multi-jenjang, target program dan jenjang/kelas mapel penyusun belum cocok |
| Tutor tidak bisa menarik dana | Verifier nama bank belum terintegrasi, identitas/rekening/alamat, hold, saldo tersedia, gateway |

Kumpulkan ID pesanan, waktu kejadian, kode HTTP, dan pesan error yang sudah disamarkan. Jangan mengirim `.env`, nomor rekening lengkap, SDK key, secret, atau stack trace berisi credential ke publik.

## 15. Rancangan program lebih fleksibel — belum diterapkan

### Masalah sekarang

- Form admin program memilih SD/SMP/SMA/Umum dan dapat membatasi kelas.
- Semua mapel penyusun wajib kompatibel dengan jenjang program.
- Builder dan backend menolak peserta yang jenjang/kelasnya tidak cocok.
- Harga dan matching juga memakai jenjang; menghapus filter frontend saja akan membuat pilihan, harga, dan tutor tidak konsisten.

### Konsep yang sesuai keinginanmu

Pisahkan **siapa pesertanya** dari **apa produk persiapan tes yang dibeli**:

1. Admin memilih cakupan program: **Semua jenjang** atau **Jenjang tertentu**.
2. Semua jenjang berarti peserta boleh SD/SMP/SMA/Umum; kelas peserta tetap menjadi data profil, bukan alasan menolak program itu.
3. Jenjang tertentu merupakan opsi apabila benar-benar diperlukan; tidak memaksa semua program menjadi SMA.
4. Admin menyusun mapel program, deskripsi target ujian, dan kompetensi tutor yang diperlukan. Pemesanan masih memilih mapel, sesi, durasi, serta jadwal; bab tidak wajib.
5. Mapel biasa tetap mengikuti jenjang/kelas, pilihan bab atau materi sendiri, dan tarif jenjang yang sekarang.
6. Dalam jalur program, mapel penyusun dipilih karena termasuk program, bukan karena kelas sekolah peserta. Namun keaktifan mapel, kapasitas sesi, dan kompetensi tutor tetap divalidasi.
7. Tarif harus mempunyai dasar jelas untuk program/varian materi, tidak diam-diam memakai harga SD karena peserta SD memilih persiapan ujian tingkat lain. Admin perlu menetapkan dasar tarif/kompetensi atau tarif khusus program sebelum bisa dipesan; jangan membuat angka default yang belum disetujui.
8. Matching harus mencari tutor kompeten untuk materi program. Jangan melonggarkan aturan menjadi semua tutor boleh mengajar semua tes hanya karena program terbuka untuk umum.
9. TKA/tes yang berbeda sasaran dapat mempunyai varian materi yang jelas. Bebas membeli pendampingan bukan klaim peserta memenuhi syarat mengikuti ujian resmi.
10. Quote, checkout tamu/login, reschedule, renewal, sesi, laporan tutor, refund, dan halaman program harus menggunakan aturan yang sama. Pesanan lama tetap memakai snapshot harga/materi lama.

### Hasil akhir yang dituju

Peserta umum maupun peserta sekolah dapat membeli program yang admin buka untuk semua jenjang. Program yang memang terbatas tetap dapat dibatasi. Mapel reguler tidak ikut menjadi bebas jenjang. Tarif dan tutor ditentukan oleh produk/materi yang dibeli, bukan menebak dari profil sekolah peserta.

Pembuatan panduan ini **belum mengubah sistem program atau menjalankan migration pada database pengguna**. Perubahan tersebut perlu implementasi dan tes end-to-end tersendiri sebelum dicentang selesai.


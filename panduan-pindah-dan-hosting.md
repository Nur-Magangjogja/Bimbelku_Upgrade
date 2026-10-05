# Tutorial konfigurasi BimbelKu: SMTP, Google, Xendit, dan hosting

Diperbarui 5 Oktober 2026.

Alamat deployment dalam panduan:

- Website: **https://bimbelcerdas.com**
- Backend: **https://api.bimbelcerdas.com**

Pasang DNS dan HTTPS keduanya dahulu. Jika memakai domain pengujian terpisah, ganti domain pada semua URL secara konsisten dan gunakan database/cache pengujian, bukan database pelanggan.

## 1. File pengaturan

- **bimbelku-backend/.env:** database, SMTP, Google, dan pembayaran.
- **.env.production di folder utama:** alamat API dan domain frontend.
- Template backend: **bimbelku-backend/.env.production.example**.

Semua secret hanya masuk file backend. Jangan menaruh secret pada variabel VITE_.

## 2. Alamat dan database backend

Pada backend .env, isi:

~~~dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.bimbelcerdas.com
APP_TIMEZONE=Asia/Jakarta
FRONTEND_URL=https://bimbelcerdas.com
FRONTEND_ORIGINS=https://bimbelcerdas.com
~~~

Isi DB_* dengan database yang dibuat pada hosting:

| Pengaturan | Nilai |
| --- | --- |
| DB_CONNECTION | mysql |
| DB_HOST | Host database dari hosting |
| DB_PORT | Port database hosting; biasanya 3306 |
| DB_DATABASE | Nama database lengkap, termasuk prefix akun hosting jika ada |
| DB_USERNAME | User database yang mendapat akses database tersebut |
| DB_PASSWORD | Password user database |

Gunakan pengaturan sesi:

~~~dotenv
CACHE_STORE=database
QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
SESSION_DOMAIN=null
AUTH_SESSION_COOKIE=bimbelku_session
AUTH_SESSION_STANDARD_MINUTES=720
AUTH_SESSION_REMEMBERED_MINUTES=43200
AUTH_SESSION_ADMIN_MINUTES=720
AUTH_SESSION_REFRESH_THRESHOLD_MINUTES=10080
SEED_DEMO_USERS=false
~~~

Jangan menetapkan SANCTUM_TOKEN_EXPIRATION=720 karena akan memotong fitur ingat perangkat 30 hari.

Jika membawa data lama, pertahankan APP_KEY lama dan pindahkan database serta upload storage/app/. Jangan menjalankan key:generate pada database lama. Untuk database baru kosong, buat APP_KEY sekali dengan **php artisan key:generate**.

## 3. SMTP melalui Brevo

### Pada website Brevo

1. Login ke [Brevo](https://app.brevo.com/).
2. Buka **Settings → SMTP & API → SMTP**.
3. Salin nilai **Login / SMTP login**.
4. Klik **Generate a new SMTP key**, buat key, lalu salin.
5. Pada pengaturan sender/domain, tambahkan pengirim **noreply@bimbelcerdas.com** dan autentikasi domain **bimbelcerdas.com**.
6. Pasang record DNS yang diberikan Brevo pada DNS domain, lalu jalankan verifikasi.

### Pada backend .env

~~~dotenv
MAIL_MAILER=smtp
MAIL_SCHEME=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@bimbelcerdas.com
MAIL_FROM_NAME="BimbelKu"
~~~

Isi:

- MAIL_USERNAME = **SMTP login** yang disalin pada langkah 3.
- MAIL_PASSWORD = **SMTP key** yang dibuat pada langkah 4.

SMTP password bukan password akun Brevo dan bukan API key. Setelah konfigurasi dimuat ulang, uji OTP dan lupa password dari website; email harus diterima.

Referensi: [SMTP key](https://help.brevo.com/hc/en-us/articles/7959631848850-Create-and-manage-your-SMTP-keys), [server dan port Brevo](https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP).

## 4. Login Google

### Pada Google Cloud

1. Buka [Google Cloud Console](https://console.cloud.google.com/) dan pilih proyek BimbelKu.
2. Buka **Google Auth Platform → Clients**.
3. Klik client bertipe **Web application** yang digunakan aplikasi.
4. Pada **Authorized redirect URIs**, klik **Add URI**, lalu isi:

~~~text
https://api.bimbelcerdas.com/api/auth/google/callback
~~~

5. Jika ada kolom **Authorized JavaScript origins**, isi:

~~~text
https://bimbelcerdas.com
~~~

6. Simpan.
7. Salin **Client ID** dan **Client secret** dari client yang sama. Jika secret lama tidak tampil lagi, gunakan secret yang disimpan pengelola atau koordinasikan rotasi secret sebelum menggantinya.
8. Pada **Branding**, isi:
   - Homepage: https://bimbelcerdas.com
   - Privacy policy: https://bimbelcerdas.com/privacy
   - Terms: https://bimbelcerdas.com/terms
   - Email dukungan dan domain sesuai persyaratan Google.
9. Pada **Audience**, sesuaikan akses untuk pelanggan umum. Jika masih Testing, masukkan akun penguji ke test users bila diperlukan. Selesaikan persyaratan publikasi/verifikasi yang ditampilkan Google sebelum akses umum.

### Pada backend .env

~~~dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://api.bimbelcerdas.com/api/auth/google/callback
~~~

- GOOGLE_CLIENT_ID = Client ID.
- GOOGLE_CLIENT_SECRET = Client secret.
- GOOGLE_REDIRECT_URI harus sama persis dengan Google; bukan URL /login.

Callback lokal boleh tetap terdaftar sebagai baris terpisah:

~~~text
http://127.0.0.1:8000/api/auth/google/callback
~~~

Setelah konfigurasi dimuat ulang, uji login Google sampai masuk dashboard/profil tanpa perlu menekan Back.

Referensi: [Google OAuth untuk web server](https://developers.google.com/identity/protocols/oauth2/web-server).

## 5. Xendit: secret key dan kanal pembayaran

1. Login ke [Dashboard Xendit](https://dashboard.xendit.co/).
2. Pilih **Test mode**.
3. Buka **Settings → Developers → API Keys**.
4. Buat/copy **Secret API key TEST**.
5. Beri izin untuk API yang dipakai: pembayaran, refund, dan payout. Money-in perlu izin tulis untuk membuat pembayaran; payout memerlukan Money-out. Nama pilihan izin dapat berbeda pada akun; izin key bukan bukti produk sudah aktif.
6. Pada **Payment Channels**, periksa kanal pembayaran yang digunakan. Kanal LIVE perlu aktif sebelum rilis.
7. Isi backend .env:

~~~dotenv
XENDIT_ENABLED=true
XENDIT_SECRET_KEY=
XENDIT_WEBHOOK_TOKEN=
XENDIT_BASE_URL=https://api.xendit.co
XENDIT_COUNTRY=ID
XENDIT_CURRENCY=IDR
XENDIT_SUCCESS_URL=https://bimbelcerdas.com/payment?gateway=success
XENDIT_CANCEL_URL=https://bimbelcerdas.com/payment?gateway=cancelled
XENDIT_SESSION_TTL_MINUTES=60
XENDIT_PAYOUT_API_VERSION=2025-09-01
~~~

Isian kosong:

- XENDIT_SECRET_KEY = Secret API key TEST dari langkah 4.
- XENDIT_WEBHOOK_TOKEN = token verifikasi dari halaman Webhooks, dijelaskan pada bagian 6.

URL sukses/batal di atas masuk **.env backend**, bukan kolom webhook dashboard. Kode menambahkan order_id otomatis. Deadline aplikasi saat ini 60 menit di kode; mengubah .env saja tidak mengubah deadline.

Referensi: [pengaturan API key, kanal, dan webhook](https://docs.xendit.co/docs/payments-integration-setup).

## 6. Xendit: webhook yang harus diisi

Buka **Settings → Webhooks**. Pada sebagian tampilan, pengaturan berada di **Settings → Developers → Webhooks**.

URL untuk kolom yang relevan:

~~~text
https://api.bimbelcerdas.com/api/webhooks/xendit
~~~

### Payment Session dan Refund

| Kolom/topik dashboard | Isi URL |
| --- | --- |
| **Payment Session – Completed** | https://api.bimbelcerdas.com/api/webhooks/xendit |
| **Payment Session – Expired** | https://api.bimbelcerdas.com/api/webhooks/xendit |
| **Unified Refunds – Refund Request Succeeded** | https://api.bimbelcerdas.com/api/webhooks/xendit |
| **Unified Refunds – Refund Request Failed** | https://api.bimbelcerdas.com/api/webhooks/xendit |

Klik **Test & Save** pada pengaturan yang menyediakan tombol tersebut. Nama topik mengikuti [daftar webhook resmi Xendit](https://docs.xendit.co/docs/payments-integration-setup); label pada akun dapat berbeda.

Jika kolom tidak muncul, minta support Xendit menunjukkan/mengaktifkan pengaturan **Payment Session** dan **Unified Refund** untuk akun tersebut. Jangan mengganti dengan webhook invoice lama atau produk lain secara asal.

### Payout / transfer keluar

Pada bagian **PAYOUT**, pasang URL yang sama untuk event berikut. Jika dashboard menyediakan satu URL gabungan, cukup isi URL gabungan itu; jika terpisah, isi masing-masing yang relevan.

| Event | Isi URL |
| --- | --- |
| v3_payout.succeeded | https://api.bimbelcerdas.com/api/webhooks/xendit |
| v3_payout.failed | https://api.bimbelcerdas.com/api/webhooks/xendit |
| v3_payout.reversed | https://api.bimbelcerdas.com/api/webhooks/xendit |
| v3_payout.pending_compliance | https://api.bimbelcerdas.com/api/webhooks/xendit |
| v3_payout.rejected | https://api.bimbelcerdas.com/api/webhooks/xendit |

Jika labelnya **Remittance Payout succeeded/failed/refunded/pending compliance/compliance rejected**, pastikan produk itu mengirim payload event `v3_payout.*` seperti integrasi proyek. Jangan menyimpulkan cocok hanya dari label. Payout tidak menggantikan konfigurasi Payment Session dan Refund.

Referensi: [webhook Payout v3](https://docs.xendit.co/apidocs/payout-v3-webhook).

### Verification Token

1. Di halaman Webhooks, cari **Verification Token**.
2. Copy token dari akun/environment yang dipakai.
3. Tempel ke **XENDIT_WEBHOOK_TOKEN** pada backend .env.
4. Simpan lalu muat ulang konfigurasi backend.

Backend memeriksa header **x-callback-token**. Gunakan token yang berlaku untuk akun/environment TEST saat key TEST digunakan; saat LIVE, periksa dan pasang token LIVE yang sesuai. [Verifikasi webhook](https://docs.xendit.co/docs/handling-webhooks).

Jangan isi localhost, /payment, atau /login sebagai webhook. URL harus menuju backend HTTPS yang dapat menerima POST dari internet tanpa CAPTCHA/login browser.

## 7. Terapkan konfigurasi backend

Dari folder backend, setelah database, APP_KEY, dan .env lengkap:

~~~bash
composer install --no-dev --prefer-dist --optimize-autoloader
php artisan optimize:clear
php artisan migrate --force
php artisan storage:link
php artisan optimize
php artisan route:list --path=webhooks
php artisan schedule:list
~~~

Jangan menjalankan migrate:fresh pada data yang dipertahankan.

Untuk admin pertama pada database baru, isi PRIMARY_ADMIN_EMAIL, SEED_ADMIN_EMAIL, dan SEED_ADMIN_PASSWORD minimal 12 karakter, lalu jalankan sebelum config dicache:

~~~bash
php artisan optimize:clear
php artisan db:seed --class=AdminSeeder --force
~~~

Setelah berhasil login, kosongkan SEED_ADMIN_PASSWORD, lalu jalankan **php artisan optimize**. Jangan mengulang seeder admin setiap deployment karena dapat mengganti password admin lama. AdminSeeder tidak mengisi katalog; siapkan katalog/data rilis secara terpisah sesuai keputusan pemilik.

## 8. Frontend: alamat API dan build

Isi .env.production di folder utama:

~~~dotenv
VITE_API_BASE_URL=https://api.bimbelcerdas.com/api
VITE_SITE_URL=https://bimbelcerdas.com
SEO_PROGRAM_API=https://api.bimbelcerdas.com/api/program-groups
~~~

Script sitemap/prerender memakai environment proses juga. Pada Linux, dari folder utama:

~~~bash
export VITE_API_BASE_URL=https://api.bimbelcerdas.com/api
export VITE_SITE_URL=https://bimbelcerdas.com
export SEO_PROGRAM_API=https://api.bimbelcerdas.com/api/program-groups
npm ci
npm run build
~~~

Jika build dari PowerShell:

~~~powershell
$env:VITE_API_BASE_URL = "https://api.bimbelcerdas.com/api"
$env:VITE_SITE_URL = "https://bimbelcerdas.com"
$env:SEO_PROGRAM_API = "https://api.bimbelcerdas.com/api/program-groups"
npm ci
npm run build
~~~

Backend harus dapat dijangkau saat build agar mapel tambahan masuk sitemap. Upload hasil **dist/** ke document root frontend. Perubahan pengaturan frontend memerlukan build ulang.

Document root backend hanya **bimbelku-backend/public/**. Jangan mengekspos .env, SQL backup, atau storage privat. Jangan memakai Vite preview sebagai server production.

## 9. Pemeriksaan transaksi otomatis / cron

Pasang cron setiap menit:

~~~cron
* * * * * cd /PATH_BACKEND && /PATH_PHP artisan schedule:run >> /PATH_LOG_PRIVAT/scheduler.log 2>&1
~~~

Ganti ketiga path dengan path absolut server. **schedule:list hanya menampilkan jadwal, tidak menjalankannya.**

Cron menjalankan pemeriksaan pembayaran, kedaluwarsa pesanan, dan refund. Pakai cache database/Redis bersama, bukan array. Jika queue worker dipakai, jalankan sebagai proses persisten dan restart setelah rilis.

Untuk pengujian, gunakan database/cache terpisah dan key TEST. Cron dapat memproses transaksi yang sudah tersimpan.

## 10. Uji HTTPS dan webhook

1. Buat pesanan baru melalui website HTTPS menggunakan akun uji dan key TEST.
2. Pilih metode, lalu selesaikan simulasi yang disediakan kanal tersebut.
3. Buka riwayat pengiriman webhook pada dashboard Xendit.
4. Pastikan event transaksi tersebut menuju backend yang benar dan respons 2xx.
5. Periksa BimbelKu: pesanan yang benar lunas, nominal cocok, matching berjalan.
6. Kirim ulang event yang sama dari riwayat webhook: tidak boleh menambah pembayaran, kelas, atau saldo kedua kali.
7. Buat transaksi uji lain, lalu tutup browser setelah membayar. Webhook/cron tetap harus memperbarui pesanan.
8. Uji refund metode asal pada transaksi yang mendukung refund. Cocokkan status gateway, murid, admin, dan nominal.
9. Uji keluar dari checkout lalu melanjutkan pembayaran: tidak boleh membuat tagihan ganda.
10. Uji privat sendiri, privat bersama teman, program multi-mapel durasi 2 jam, kelas bersama, dan renewal.

Respons 202 pada payload contoh dengan ID tidak dikenal dapat berarti event diabaikan. Tombol test dashboard saja belum cukup; harus ada pesanan aplikasi yang benar-benar tersambung.

Untuk pembayaran **di dalam website**, buat tagihan baru lewat HTTPS. Sesi hosted lama tidak otomatis menjadi Components. Periksa pilihan metode, VA/QR/e-wallet, dan Console browser. CSP frontend saat ini perlu diuji terhadap frame/SDK penyedia; jangan mematikan seluruh CSP untuk meloloskan tes.

## 11. Beralih ke LIVE

1. Aktifkan akun dan kanal yang diperlukan pada **Live mode**.
2. Buat/copy Secret API key LIVE.
3. Isi webhook pada Live mode juga dengan URL backend production.
4. Pasang key dan token webhook LIVE pada backend production .env.
5. Jalankan **php artisan optimize:clear**, lalu **php artisan optimize**; restart proses persisten jika ada.
6. Pastikan transaksi sandbox tidak dianggap transaksi pelanggan.
7. Lakukan transaksi pemeriksaan nominal kecil hanya setelah pemilik menyetujuinya; pantau webhook dan jurnal.

## 12. Pindah laptop dan tetap memakai localhost

1. Pindahkan source, database, upload, dan kedua .env secara privat.
2. Pertahankan APP_KEY jika membawa data lama.
3. Ubah DB_* sesuai database laptop baru.
4. Isi alamat lokal pada backend .env:

~~~dotenv
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:8080
FRONTEND_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/api/auth/google/callback
SESSION_SECURE_COOKIE=false
SESSION_DOMAIN=null
~~~

5. Pakai **VITE_API_BASE_URL=http://127.0.0.1:8000/api** pada .env frontend lokal. Sesuaikan .env.production jika masih berisi domain hosting saat build lokal. Sesuaikan variabel proses build dari bagian 8 jika sebelumnya diekspor.
6. Jalankan dari folder utama:

~~~powershell
npm ci
cd bimbelku-backend
composer install
php artisan optimize:clear
php artisan migrate
cd ..
npm run build
npm run preview -- --port 8080
~~~

7. Buka **http://localhost:8080**. Pastikan callback lokal terdaftar pada Google.
8. Webhook tidak dapat langsung menuju localhost dari internet. Untuk webhook/Components, gunakan deployment pengujian HTTPS atau tunnel publik yang dikonfigurasi konsisten.
9. Preview tidak menjalankan scheduler. Jalankan **php artisan schedule:work** hanya pada database/gateway sandbox bila ingin menguji proses berkala.

## 13. Integrasi yang masih perlu dituntaskan

- **Pencairan tutor:** BankAccountNameVerifier belum terhubung ke layanan validasi bank. Mengisi key Xendit belum membuat penarikan dana tutor aktif. Jangan meloloskan verifikasi secara palsu.
- **Embedded payment:** belum dinyatakan lulus sebelum diuji pada HTTPS dengan kanal aktif dan CSP sesuai.
- **Program bebas jenjang:** belum diimplementasikan; rancangan tersimpan pada panduan-hosting-untuk-teknisi.md.

Detail keamanan server dan backup ada pada panduan-hosting-untuk-teknisi.md serta DEPLOYMENT_SECURITY.md. Tutorial ini tidak mengubah konfigurasi aktif, data, atau status fitur.

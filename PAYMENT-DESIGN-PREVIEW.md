# Pratinjau desain pembayaran di localhost

Mode ini menampilkan **halaman pembayaran BimbelKu yang sama** dengan pesanan contoh, termasuk panel cara bayar di dalam web. Pilihan QRIS, virtual account, dan e-wallet di panel adalah **contoh visual**, bukan komponen atau metode aktif dari Xendit. Tidak ada transaksi, tagihan, atau kelas yang berubah di database.

## Jalankan

Dari akar proyek, di PowerShell:

```powershell
npm run build:payment-preview
npm run preview:payment-design
```

Buka langsung di browser lokal, **tanpa perlu login**:

`http://127.0.0.1:8081/payment-preview`

Tekan kartu **Pilih metode pembayaran** untuk membuka panel. Pilih QRIS, virtual account, atau e-wallet, lalu tekan tombol oranye **Konfirmasi pilihan**. Setiap metode menampilkan instruksi contoh yang berbeda. Tombol **Lihat contoh status berhasil** hanya mengubah pratinjau; tidak melunasi tagihan. Coba lebarnya pada desktop dan mode ponsel browser.

Untuk melihat kondisi lain, buka Console browser (F12) pada halaman ini:

```javascript
window.bimbelkuPaymentPreview("open")    // Panel terbuka
window.bimbelkuPaymentPreview("close")   // Panel tertutup
window.bimbelkuPaymentPreview("failed")  // Contoh pesan gagal
window.bimbelkuPaymentPreview("paid")    // Contoh layar berhasil
window.bimbelkuPaymentPreview("pending") // Kembali ke tagihan contoh
```

Perintah ini **hanya mengubah tampilan browser lokal**. Ia tidak melunasi pesanan asli, tidak menghubungi gateway, dan tidak bisa digunakan untuk melewati pembayaran produksi. Pratinjau ditandai jelas dengan banner kuning serta hanya aktif pada `localhost`/`127.0.0.1` jika frontend sengaja dibangun memakai `build:payment-preview`.

## Bedakan tiga bukti yang dibutuhkan

1. **Desain:** mode pratinjau ini untuk menilai tampilan BimbelKu, termasuk mobile, perbedaan instruksi tiap metode, dan layar berhasil/gagal. QR dan nomor virtual account di sini bukan data transaksi. Pratinjau e-wallet tidak mempunyai tautan aplikasi; tautan cadangan asli hanya bisa berasal dari URL transaksi yang diterima komponen pembayaran.
2. **Alur aplikasi:** `npm run demo:payment-journey` menguji pembayaran, webhook, kelas, refund, dan anti-duplikasi dengan gateway tiruan pada database tes.
3. **Integrasi sungguhan:** buka web melalui HTTPS sementara atau staging, pakai Xendit **test mode**, lalu uji komponen asli, pembayaran sandbox, webhook, kembali ke BimbelKu, dan status tagihan. HTTP localhost akan tetap memakai checkout hosted; ini memang pembatasan Xendit Components.

Build dan server pratinjau ada di `dist-payment-preview` dan port 8081. Pembayaran asli tetap di port 8080. Build biasa (`npm run build`) tidak mengaktifkan atau menimpa pratinjau ini; untuk rilis gunakan `dist`, **bukan** `dist-payment-preview`.

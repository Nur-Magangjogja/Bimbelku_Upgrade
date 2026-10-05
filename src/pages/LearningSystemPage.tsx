import type { ReactNode } from "react";
import { ArrowRight, BookOpenCheck, CalendarCheck, CheckCircle2, CreditCard, MapPin, MonitorPlay, Radar, UsersRound, Wifi, Video, ShieldCheck, CircleHelp, Home, Search, ReceiptText, UserRound, LocateFixed } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import StudentPackageLink from "@/components/StudentPackageLink";
import SeoHead from "@/components/SeoHead";
import { usePublicSectionMotion } from "@/hooks/usePublicSectionMotion";

const pages = {
  "panduan-memilih-program": {
    eyebrow: "Memilih program",
    title: "Mulai dari kebutuhan belajar, bukan nama paket yang paling ramai.",
    intro: "Pilih jenjang, mata pelajaran, target atau materi yang ingin difokuskan, dan mode belajar yang benar-benar dibutuhkan. Detail ini diteruskan ke form pesanan dan proses pencarian tutor.",
    icon: BookOpenCheck,
    points: ["Katalog dikelompokkan berdasarkan jenjang dan bidang", "Profil mapel menjelaskan cakupan materi serta cara belajar", "Pilihan program dapat langsung mengisi awal form paket"],
  },
  "cara-pemesanan": {
    eyebrow: "Panduan pemesanan",
    title: "Cara pesan les, dari kebutuhan sampai kelas siap.",
    intro: "Lihat data yang harus diisi, kapan harga menjadi final, kapan membayar, kapan tutor dicari, dan tindakan yang tersedia bila rencana belum berjalan.",
    icon: CalendarCheck,
    points: ["Identitas dan kebutuhan belajar diisi pada tahap yang sesuai", "Ringkasan harga tampil sebelum konfirmasi", "Pesanan dapat dilanjutkan setelah masuk dengan email yang sama"],
  },
  "sistem-matching-tutor": {
    eyebrow: "Matching tutor",
    title: "Bagaimana tutor ditemukan untuk kelasmu?",
    intro: "Lihat kapan pencarian dimulai, syarat tutor yang bisa menerima, arti status tiap mapel, dan keputusanmu bila belum ada yang cocok.",
    icon: Radar,
    points: ["Tutor harus aktif, terverifikasi, dan sesuai kebutuhan", "Online tidak memakai radius lokasi", "Mapel yang belum menemukan tutor punya pilihan lanjutan"],
  },
  "pembayaran-dan-refund": {
    eyebrow: "Pembayaran dan refund",
    title: "Bayar dulu, lalu pantau uangmu dengan jelas.",
    intro: "Pahami tagihan, kapan pencarian tutor dimulai, cara meminta refund sebelum kelas terbentuk, pilihan tujuan dana, dan tempat memeriksa hasilnya.",
    icon: CreditCard,
    points: ["Periksa nominal dan tenggat tagihan", "Tutup checkout bukan berarti harus pesan ulang", "Tujuan refund dikonfirmasi sebelum pengembalian diproses"],
  },
  "privat-tatap-muka": {
    eyebrow: "Panduan privat tatap muka",
    title: "Privat tatap muka, dari alamat sampai kelas pertama.",
    intro: "Pahami syarat lokasi, jangkauan tutor, peserta, materi, biaya, dan langkah setelah pembayaran sebelum memilih kelas tatap muka.",
    icon: MapPin,
    points: ["Alamat dan titik lokasi diminta sebelum pesanan diselesaikan", "Tutor hanya menerima penawaran yang sesuai area dan jadwal", "Target dan materi yang ditulis ikut terbawa ke proses matching"],
  },
  "privat-online": {
    eyebrow: "Panduan privat online",
    title: "Les online yang jelas dari memilih kelas sampai pertemuan pertama.",
    intro: "Pahami peserta, materi, jadwal, biaya, pencarian tutor, tautan kelas, dan pilihan jika rencana tidak berjalan sesuai harapan.",
    icon: MonitorPlay,
    points: ["Belajar tanpa batas radius tatap muka", "Harga diperiksa sebelum membayar", "Tautan tersedia setelah kelas terbentuk"],
  },
  "kelas-bersama": {
    eyebrow: "Kelas Bersama",
    title: "Belajar bersama dengan jadwal, kuota, dan biaya yang jelas sejak awal.",
    intro: "Pilih kelas online yang sudah dijadwalkan, lihat materi dan seluruh sesinya, lalu pahami kapan kursi aman, kapan kelas dikonfirmasi, dan apa yang terjadi jika kuota minimum tidak terpenuhi.",
    icon: UsersRound,
    points: ["Jadwal dan materi ditetapkan per kelas", "Satu pembayaran untuk seluruh sesi", "Kelas berjalan setelah minimum peserta terverifikasi terpenuhi"],
  },
} as const;

const steps = [
  { icon: BookOpenCheck, title: "Kebutuhan", text: "Pilih peserta, jenjang, mapel, dan jelaskan target belajar." },
  { icon: CalendarCheck, title: "Jadwal", text: "Tentukan durasi, hari, jam, mode, dan lokasi bila tatap muka." },
  { icon: CreditCard, title: "Pembayaran", text: "Periksa ringkasan, hubungkan akun, lalu selesaikan pembayaran." },
  { icon: Radar, title: "Matching", text: "Sistem menawarkan kebutuhan secara berurutan kepada tutor yang memenuhi syarat." },
];

const guideGroups: { eyebrow: string; title: string; description: string; slugs: (keyof typeof pages)[] }[] = [
  {
    eyebrow: "Pilih cara belajar",
    title: "Tentukan tempat dan pola interaksi",
    description: "Bandingkan privat tatap muka, privat online, dan kelas online berjadwal sebelum memilih.",
    slugs: ["privat-tatap-muka", "privat-online", "kelas-bersama"],
  },
  {
    eyebrow: "Siapkan pesanan",
    title: "Ubah kebutuhan menjadi rencana yang dapat diperiksa",
    description: "Mulai dari mapel dan kebutuhan belajar, lalu pastikan peserta, paket, serta jadwalnya jelas.",
    slugs: ["panduan-memilih-program", "cara-pemesanan"],
  },
  {
    eyebrow: "Setelah konfirmasi",
    title: "Ketahui apa yang terjadi pada uang dan pencarian tutor",
    description: "Pelajari proses matching, status pembayaran, dan pilihan ketika tutor belum ditemukan.",
    slugs: ["sistem-matching-tutor", "pembayaran-dan-refund"],
  },
];

type Guide = {
  question: string;
  suitable: string;
  unsuitable: string;
  actions: string[];
  example: string;
  limit: string;
  faqs: { question: string; answer: string }[];
  related: string[];
  cta: { label: string; to: string };
};

const guides: Record<keyof typeof pages, Guide> = {
  "panduan-memilih-program": {
    question: "Anak kesulitan pada satu Bab, tetapi belum tahu harus memilih program apa?",
    suitable: "Cocok untuk keluarga yang sudah mengetahui jenjang siswa dan ingin mempersempit kebutuhan ke mapel, materi, serta target yang terukur.",
    unsuitable: "Kurang cocok bila kebutuhan utama adalah diagnosis klinis, terapi, atau layanan pendidikan khusus yang memerlukan tenaga berlisensi.",
    actions: ["Tentukan jenjang dan kelas agar daftar mapel sesuai kurikulum siswa.", "Buka profil mapel; cocokkan cakupan materi dengan buku, tugas, atau hasil evaluasi sekolah. Katalog Bab hanya referensi.", "Tulis target belajar yang bisa diamati, misalnya mampu menyelesaikan soal pecahan bertahap, bukan hanya ‘meningkatkan nilai’.", "Pilih mode, durasi, dan jadwal yang bisa dijalankan konsisten sebelum melihat harga paket."],
    example: "Siswa kelas 8 tertinggal pada persamaan linear. Orang tua memilih Matematika SMP, lalu menulis target ‘dapat menjelaskan langkah penyelesaian dan mengerjakan lima soal mandiri’. Tutor menerima konteks itu saat penawaran.",
    limit: "Murid tidak wajib memilih Bab dari katalog. Tulis materi dengan bahasamu sendiri pada kolom Target atau materi yang ingin difokuskan. Jika belum tahu materi spesifiknya, jelaskan kesulitan atau kebutuhan mengikuti pelajaran sekolah.",
    faqs: [{ question: "Apakah bisa memilih lebih dari satu mapel?", answer: "Form paket mendukung beberapa mapel dengan alokasi sesi untuk masing-masing mapel." }, { question: "Apakah target harus berupa nilai ujian?", answer: "Tidak. Kemampuan menjelaskan konsep atau menyelesaikan jenis soal tertentu biasanya lebih jelas untuk disampaikan kepada tutor." }],
    related: ["cara-pemesanan", "privat-online"], cta: { label: "Jelajahi program", to: "/program" },
  },
  "cara-pemesanan": {
    question: "Apa yang harus saya isi, dan kapan pesanan benar-benar menjadi kelas?",
    suitable: "Untuk pemesan yang ingin memahami form empat tahap serta status setelah pembayaran sebelum memulai.",
    unsuitable: "Jangan menganggap memilih jadwal berarti tutor sudah dipesan; penawaran tutor baru berjalan setelah pembayaran terverifikasi.",
    actions: ["Pilih jalur program atau mapel biasa.", "Lengkapi paket, peserta, dan durasi.", "Tentukan mapel serta pembagian sesi.", "Atur jadwal dan lokasi bila tatap muka.", "Periksa total biaya sebelum mengirim pesanan."],
    example: "Orang tua memilih empat sesi: dua Matematika dan dua IPA. Form menampilkan peserta, durasi, semua tanggal, serta harga akhir sebelum dikonfirmasi. Setelah bayar, kedua mapel dapat memiliki tutor yang berbeda.",
    limit: "Menyimpan pesanan belum menjamin tutor tersedia. Tenggat mulai belajar dan status pencarian mengikuti aturan yang ditampilkan form serta pesanan.",
    faqs: [
      { question: "Apakah harus login sebelum mengisi form?", answer: "Tidak. Sebagai tamu, isi nama, WhatsApp, dan email yang benar. Masuk atau daftar menggunakan email yang sama untuk menghubungkan pesanan dan melanjutkan pembayaran." },
      { question: "Kapan saya tahu total yang harus dibayar?", answer: "Di tahap Konfirmasi, ringkasan menunjukkan paket, peserta, mapel, sesi, durasi, jadwal, potongan yang berlaku, dan total pembayaran sebelum pesanan dikirim." },
      { question: "Apakah memilih jadwal berarti tutor sudah tersedia?", answer: "Belum. Jadwal menjadi permintaan belajar. Tutor yang cocok dicari setelah pembayaran diterima oleh sistem." },
      { question: "Mengapa program persiapan ujian tidak meminta Bab?", answer: "Program memuat pilihan mapel dan target persiapan. Tutor menyiapkan materi berdasarkan mapel serta tujuan yang dicatat; Bab tidak dipaksakan pada program tersebut." },
      { question: "Jika saya menutup halaman pembayaran, apakah harus pesan ulang?", answer: "Tidak. Kembali ke pesanan yang sama dan lanjutkan tagihan yang masih aktif. Hindari membuat pesanan baru hanya untuk mencoba membayar lagi." },
      { question: "Bagaimana jika satu dari beberapa mapel belum mendapat tutor?", answer: "Status mapel yang sudah memiliki tutor dan yang masih menunggu terlihat terpisah. Untuk yang belum cocok, ikuti opsi Cari lagi, Ubah jadwal, atau pembatalan/refund sesuai status pesanan." },
    ],
    related: ["panduan-memilih-program", "sistem-matching-tutor", "pembayaran-dan-refund"], cta: { label: "Mulai susun pesanan", to: "/student/packages/new" },
  },
  "sistem-matching-tutor": {
    question: "Bagaimana sistem memilih tutor, dan apa yang terjadi bila pencarian habis?",
    suitable: "Cocok untuk pemesan yang ingin memahami dasar kecocokan tutor dan pilihan setelah belum ada tutor yang menerima.",
    unsuitable: "Tidak menjanjikan tutor tertentu atau waktu penerimaan yang pasti; kecocokan bergantung pada jadwal dan respons tutor aktif.",
    actions: ["Pembayaran terverifikasi memulai pencarian untuk tiap mapel.", "Sistem menyaring tutor aktif dan terverifikasi yang sesuai mode, jenjang, jadwal, serta lokasi khusus tatap muka.", "Kandidat yang layak menerima penawaran; penerimaan dicek kembali terhadap seluruh jadwal sesi.", "Murid dapat melihat mapel yang sudah siap, masih dicari, atau belum menemukan tutor di Proses Pesanan."],
    example: "Paket tatap muka hari Selasa pukul 16.00 belum menemukan tutor pada radius awal. Murid dapat memperluas pencarian ketika opsi itu tersedia atau mengganti jadwal, tanpa membuat pesanan baru.",
    limit: "Jarak dan jam tersedia tutor dapat berubah. Penawaran yang pernah terkirim bukan jaminan tutor akan menerima atau bahwa seluruh sesi langsung cocok.",
    faqs: [
      { question: "Apakah tutor dipilih secara acak atau rating tertinggi selalu menang?", answer: "Tidak. Sistem menyaring kecocokan lebih dulu, lalu mempertimbangkan jarak untuk tatap muka, kesinambungan tutor, beban kelas dan pemerataan penawaran. Respons serta rating menjadi pertimbangan berikutnya, bukan jaminan urutan pertama." },
      { question: "Apakah tutor sudah ditemukan ketika saya membayar?", answer: "Belum. Pembayaran yang terverifikasi baru memulai pencarian. Tutor harus menerima penawaran dan seluruh jadwalnya diperiksa lagi sebelum kelas terbentuk." },
      { question: "Mengapa dua mapel sudah punya tutor tetapi satu belum?", answer: "Pencarian dilakukan per mapel. Tutor yang menerima dua mapel tidak otomatis mengisi mapel ketiga; paket multi-mapel baru aktif setelah seluruh mapel mendapat tutor." },
      { question: "Apakah online tetap memakai radius 3 km?", answer: "Tidak. Radius dan jangkauan perjalanan hanya berlaku untuk tatap muka. Online tetap memerlukan kecocokan mapel, jenjang, waktu, dan ketersediaan tutor." },
      { question: "Jika tutor menolak, apakah saya harus memesan lagi?", answer: "Tidak. Sistem melanjutkan penawaran kepada kandidat yang memenuhi syarat selama pencarian masih aktif. Pantau status tiap mapel di Proses Pesanan." },
      { question: "Apa pilihan bila tutor tetap tidak ditemukan?", answer: "Saat opsi muncul di Proses Pesanan, pilih Cari lagi, Ubah jadwal untuk mapel yang belum terisi, perluas jangkauan tatap muka, atau batalkan seluruh paket. Pembatalan sebelum kelas terbentuk tidak memerlukan persetujuan admin untuk keputusan refund, tetapi Anda tetap perlu memilih tujuan dana di Riwayat Transaksi." },
    ],
    related: ["cara-pemesanan", "pembayaran-dan-refund", "privat-tatap-muka"], cta: { label: "Lihat Proses Pesanan", to: "/student/packages" },
  },
  "pembayaran-dan-refund": {
    question: "Ke mana uang kembali ketika tutor tidak ditemukan?",
    suitable: "Cocok bagi pemesan yang ingin memahami tahap pembayaran, asal dana, serta status pengembalian yang bisa dipantau.",
    unsuitable: "Halaman ini tidak menggantikan pemeriksaan kasus sengketa sesi, ketidakhadiran, atau keberatan pribadi yang memerlukan penanganan tim.",
    actions: ["Periksa total dan batas waktu tagihan sebelum memilih metode bayar.", "Jika checkout tertutup, buka kembali tagihan pesanan yang sama.", "Pembayaran terverifikasi memulai matching; uang sudah tercatat tetapi kelas belum tentu terbentuk.", "Jika membatalkan pencarian sebelum kelas terbentuk, buka Riwayat Transaksi untuk memilih dan mengonfirmasi tujuan refund, lalu pantau statusnya."],
    example: "Jika Rp150.000 dibayar memakai Rp50.000 Saldo BimbelKu dan Rp100.000 pembayaran eksternal, bagian saldo selalu kembali ke saldo. Untuk bagian eksternal, pilih tujuan yang tersedia pada transaksi sebelum mengonfirmasi refund.",
    limit: "Saldo BimbelKu yang diterima sebagai refund dapat dipakai untuk layanan belajar tetapi tidak bisa ditarik tunai. Waktu dana eksternal kembali bergantung pada metode pembayaran; hasil gagal atau tertahan perlu ditangani tim.",
    faqs: [
      { question: "Saya menutup checkout. Apakah perlu membuat pesanan baru?", answer: "Tidak. Buka kembali tagihan pada pesanan yang sama selama masih bisa dibayar. Sistem memakai satu sesi pembayaran aktif agar percobaan ulang tidak membuat tagihan ganda." },
      { question: "Apakah membayar berarti tutor sudah pasti ada?", answer: "Belum. Pembayaran terverifikasi memulai pencarian tutor. Kelas baru terbentuk ketika semua tutor mapel yang diperlukan menerima dan jadwalnya cocok." },
      { question: "Tutor tidak ditemukan. Apakah admin harus menyetujui refund?", answer: "Pembatalan saat masih dalam pencarian sebelum kelas terbentuk tidak memerlukan keputusan persetujuan admin. Anda tetap harus memilih dan mengonfirmasi tujuan refund di Riwayat Transaksi agar pengembalian dapat diproses." },
      { question: "Dapatkah seluruh refund masuk ke rekening atau e-wallet lain?", answer: "Bagian yang semula dibayar dari Saldo BimbelKu selalu kembali ke saldo. Untuk pembayaran eksternal melalui penyedia pembayaran, pilihan yang tersedia adalah Saldo BimbelKu atau metode pembayaran asal; rekening/e-wallet manual hanya tampil pada transaksi yang mendukungnya." },
      { question: "Apakah Saldo BimbelKu bisa ditarik tunai?", answer: "Tidak. Saldo refund dapat digunakan membayar Paket Belajar atau Kelas Bersama, tetapi tidak dapat dicairkan ke rekening atau e-wallet." },
      { question: "Di mana saya melihat status dan apa jika refund gagal?", answer: "Buka Riwayat Transaksi. Status menunjukkan apakah tujuan belum dipilih, permintaan telah dikirim, sedang diproses, berhasil, atau gagal. Kegagalan tetap tercatat dan ditangani tim BimbelKu; jangan mengajukan pesanan baru untuk mengulang refund." },
    ],
    related: ["sistem-matching-tutor", "cara-pemesanan"], cta: { label: "Buka Riwayat Transaksi", to: "/student/history" },
  },
  "privat-tatap-muka": {
    question: "Bagaimana memastikan lokasi, jadwal, dan tutor benar-benar cocok untuk datang?",
    suitable: "Untuk siswa yang membutuhkan pendampingan langsung pada alamat belajar yang jelas dan dapat dijangkau tutor.",
    unsuitable: "Jika lokasi belum pasti atau tidak bisa memberikan titiknya, mode online lebih mudah disiapkan karena tidak memakai radius.",
    actions: ["Isi alamat belajar dan ambil titik lokasi pada tahap jadwal.", "Pilih peserta, mapel atau program, materi, sesi, dan durasi.", "Tentukan hari serta jam yang realistis untuk semua pertemuan.", "Periksa total biaya, bayar, lalu pantau pencarian tutor yang sesuai jangkauan."],
    example: "Siswa memilih Matematika di rumah, empat sesi sore hari. Alamat tertulis dan titik peta dipakai untuk mengecek tutor yang menerima kelas tatap muka di sekitar lokasi; harga terlihat sebelum pembayaran.",
    limit: "Alamat dalam cakupan layanan tidak otomatis berarti tutor tersedia pada jadwal tersebut. Pencarian bergantung pada bidang ajar, jarak, jadwal, dan respons tutor.",
    faqs: [
      { question: "Mengapa alamat dan titik lokasi sama-sama diminta?", answer: "Alamat membantu tutor memahami tempat belajar; titik koordinat diperlukan agar sistem dapat menghitung jarak dan memeriksa jangkauan tutor. Untuk tamu, form meminta persetujuan penyimpanan lokasi ke akun yang terhubung." },
      { question: "Apakah tutor langsung datang setelah saya membayar?", answer: "Tidak. Pembayaran memulai pencarian tutor. Kelas aktif setelah tutor yang sesuai menerima dan jadwalnya cocok." },
      { question: "Apakah saya bisa memilih beberapa mapel?", answer: "Bisa jika paket yang dipilih mengizinkan. Sesi dibagi per mapel dan tutor untuk tiap mapel dapat berbeda." },
      { question: "Jika dua mapel sudah punya tutor dan satu belum, apakah kelas langsung berjalan?", answer: "Belum. Proses Pesanan menampilkan status per mapel. Paket multi-mapel baru siap sebagai satu kelas lengkap setelah semua tutor yang diperlukan ditemukan; untuk mapel yang belum cocok, ikuti opsi Cari lagi, Ubah jadwal, atau pembatalan yang tersedia." },
      { question: "Bagaimana jika tidak ada tutor dalam jangkauan awal?", answer: "Periksa Proses Pesanan. Sistem dapat mencari kembali atau memperluas jangkauan sesuai aturan yang tersedia; Anda juga dapat mengubah jadwal atau memilih pembatalan/refund ketika opsi itu muncul." },
      { question: "Apakah harga berubah karena jarak rumah?", answer: "Gunakan nominal pada ringkasan form sebagai acuan final sebelum membayar. Jangan mengandalkan perkiraan biaya dari jarak tanpa melihat tagihan." },
      { question: "Bagaimana jika tempat belajar berubah setelah memesan?", answer: "Jangan menganggap tutor yang sudah cocok otomatis bisa menjangkau alamat baru. Hubungi bantuan melalui WhatsApp untuk memeriksa dampaknya pada jadwal dan pencarian." },
    ],
    related: ["cara-pemesanan", "sistem-matching-tutor", "privat-online"], cta: { label: "Susun privat tatap muka", to: "/student/packages/new?mode=offline" },
  },
  "privat-online": {
    question: "Apa saja yang terjadi sebelum dan sesudah saya membayar kelas online?",
    suitable: "Cocok untuk belajar dari tempat yang punya internet stabil, baik privat sendiri maupun bersama teman ketika pilihan peserta tersedia di form.",
    unsuitable: "Jika siswa memerlukan pendampingan fisik atau koneksinya tidak memadai, pertimbangkan privat tatap muka.",
    actions: ["Pilih materi dan peserta", "Atur sesi dan jadwal", "Periksa harga lalu bayar", "Sistem mencari tutor", "Buka tautan di Kelas Saya"],
    example: "Seorang siswa memilih Matematika online, menuliskan target belajar, dan menetapkan empat sesi. Harga diperiksa sebelum dibayar. Sesudah tutor cocok, jadwal dan tautan kelas terlihat pada Kelas Saya.",
    limit: "Tutor dan tautan belum dijamin saat form baru diisi. Jika pencarian tidak berhasil, gunakan tindakan Cari lagi, Ubah jadwal, atau pembatalan/refund yang tersedia pada status pesanan.",
    faqs: [
      { question: "Apakah alamat rumah dan radius diperlukan untuk kelas online?", answer: "Tidak. Mode online tidak memakai radius pencarian tatap muka. Yang perlu dipastikan adalah perangkat, internet, dan jadwal." },
      { question: "Apakah harus punya akun sebelum menyusun pesanan?", answer: "Tidak. Anda dapat mengisi form sebagai tamu. Gunakan email yang sama saat membuat atau masuk ke akun untuk melanjutkan pembayaran dan memantau pesanan." },
      { question: "Kapan saya tahu biaya akhirnya?", answer: "Ringkasan form menampilkan jumlah sesi, peserta, potongan yang berlaku, dan total sebelum pembayaran. Harga di halaman panduan bukan pengganti ringkasan pesanan." },
      { question: "Apakah satu tutor mengajar semua mapel dalam program?", answer: "Tidak selalu. Untuk paket multi-mapel, pencarian tutor dilakukan sesuai mapel; satu mapel dapat ditangani tutor yang berbeda dari mapel lainnya." },
      { question: "Kapan tautan Google Meet atau Zoom muncul?", answer: "Setelah tutor ditemukan dan kelas terbentuk, tutor menyiapkan tautan pertemuan pada detail kelas. Tautan tidak tersedia saat form baru disusun." },
      { question: "Bagaimana jika belum ada tutor yang cocok?", answer: "Lihat status Proses Pesanan. Jika opsi tersedia, pilih Cari lagi atau Ubah jadwal; bila tidak ingin melanjutkan, ikuti pilihan pembatalan dan pengembalian dana yang muncul untuk pesanan tersebut." },
    ],
    related: ["cara-pemesanan", "sistem-matching-tutor", "pembayaran-dan-refund"], cta: { label: "Susun privat online", to: "/student/packages/new?mode=online" },
  },
  "kelas-bersama": {
    question: "Apakah kursi yang saya pesan pasti menjadi kelas, dan bagaimana jika peserta kurang?",
    suitable: "Cocok jika siswa bisa mengikuti jadwal dan materi kelas online yang sudah ditentukan serta nyaman belajar dengan peserta lain.",
    unsuitable: "Jika butuh memilih sendiri Bab, jam, lokasi tatap muka, atau susunan peserta, pilih privat; Kelas Bersama bukan paket privat bersama teman.",
    actions: ["Masuk ke akun murid dan lihat kelas yang sedang membuka pendaftaran.", "Periksa jenjang, mapel, Bab, seluruh jadwal, harga total, serta minimum dan maksimum peserta.", "Bergabung untuk menahan kursi sementara, lalu bayar sebelum tenggat yang tampil pada tagihan.", "Pantau verifikasi pembayaran dan jumlah peserta terkonfirmasi.", "Jika kelas dikonfirmasi, buka jadwal dan tautan pertemuan di Kelas Saya."],
    example: "Sebuah kelas Matematika online menawarkan empat pertemuan pada tanggal yang sudah tercantum. Murid memeriksa apakah seluruh waktunya cocok, bergabung, dan membayar satu tagihan untuk empat sesi. Kelas berjalan bila jumlah peserta terverifikasi mencapai minimum yang ditampilkan pada kelas tersebut.",
    limit: "Harga, tanggal, kapasitas, dan tenggat dapat berbeda pada setiap kelas. Menahan kursi atau membayar belum menjamin kelas terbentuk; cek status terbaru pada akunmu.",
    faqs: [
      { question: "Apa bedanya Kelas Bersama dan privat bersama teman?", answer: "Kelas Bersama memiliki jadwal, mapel, Bab, harga, dan kuota yang sudah ditetapkan untuk pendaftar dari berbagai akun. Privat bersama teman adalah satu pesanan privat dengan peserta yang diajak pemesan dan jadwal yang disusun sendiri." },
      { question: "Bisakah saya melihat jadwal tanpa akun?", answer: "Daftar kelas aktif saat ini berada di area murid. Masuk atau daftar akun murid terlebih dahulu untuk melihat penawaran dan bergabung." },
      { question: "Apakah kursi langsung pasti setelah saya menekan Bergabung?", answer: "Belum. Kursi ditahan sementara sampai tenggat pembayaran yang ditampilkan. Jika waktu habis tanpa pembayaran yang dapat diterima, kursi dapat dilepas." },
      { question: "Apakah harus bayar per pertemuan?", answer: "Tidak. Harga per peserta pada kelas adalah satu tagihan untuk seluruh sesi yang tercantum, bukan tagihan baru setiap kali belajar." },
      { question: "Kapan tutor dan tautan kelas terlihat?", answer: "Sistem memastikan tutor sesuai sebelum pendaftaran dibuka. Nama tutor dan tautan pertemuan baru tersedia untuk peserta yang berhak setelah kelas dikonfirmasi. Tutor menyiapkan tautan sebelum sesi dimulai." },
      { question: "Bagaimana kalau peserta minimum tidak tercapai?", answer: "Kelas dibatalkan jika syarat minimum peserta terverifikasi tidak terpenuhi. Pembayaran yang sudah diterima masuk proses pengembalian dan statusnya dapat dipantau di Riwayat Transaksi." },
      { question: "Bisakah saya membatalkan kursi sendiri?", answer: "Sebelum bukti atau pembayaran dikirim dan selagi pendaftaran masih dibuka, pembatalan tersedia jika tombolnya tampil. Sesudah pembayaran masuk, jangan menganggap kursi bisa dibatalkan dengan cara yang sama; lihat status transaksi atau hubungi bantuan untuk kasus khusus." },
      { question: "Di mana saya melihat materi dan progress?", answer: "Lihat daftar sesi dan Bab pada detail kelas. Setelah kelas aktif, jadwal muncul di Kelas Saya; progress resmi ditampilkan setelah laporan sesi selesai diverifikasi." },
    ],
    related: ["privat-online", "panduan-memilih-program", "pembayaran-dan-refund"], cta: { label: "Lihat Kelas Bersama", to: "/student/kelas-murah" },
  },
};

export default function LearningSystemPage() {
  const { slug } = useParams();
  const page = slug && slug in pages ? pages[slug as keyof typeof pages] : null;
  if (!page) return <Overview />;
  const Icon = page.icon;
  const guide = guides[slug as keyof typeof pages];
  const schemas = [
    { "@context": "https://schema.org", "@type": "Article", headline: page.title, description: page.intro, inLanguage: "id-ID", dateModified: slug === "kelas-bersama" ? "2026-09-30" : ["privat-online", "privat-tatap-muka", "cara-pemesanan", "sistem-matching-tutor", "pembayaran-dan-refund"].includes(slug || "") ? "2026-09-29" : "2026-09-27", author: { "@type": "Organization", name: "BimbelKu" }, publisher: { "@type": "Organization", name: "BimbelKu" } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: guide.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
  ];
  return <>
    <SeoHead title={`${page.eyebrow} | BimbelKu`} description={page.intro} canonicalPath={`/cara-belajar/${slug}`} type="article" schemas={schemas} />
    <Shell>
      {slug === "privat-online" ? <OnlineHero title={page.title} intro={page.intro} /> : slug === "privat-tatap-muka" ? <OfflineHero title={page.title} intro={page.intro} /> : slug === "kelas-bersama" ? <GroupClassHero title={page.title} intro={page.intro} /> : slug === "cara-pemesanan" ? <BookingHero title={page.title} intro={page.intro} /> : slug === "sistem-matching-tutor" ? <MatchingHero title={page.title} intro={page.intro} /> : slug === "pembayaran-dan-refund" ? <RefundHero title={page.title} intro={page.intro} /> : <section className="relative overflow-hidden border-b border-stone-200 bg-[#F7F1E8] pt-12 sm:pt-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-8 border-orange-200/40" />
        <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
          <Link to="/cara-belajar" className="inline-flex items-center gap-2 text-sm font-extrabold text-orange-700">Cara belajar <ArrowRight size={15} /></Link>
          <div className="relative grid gap-8 py-10 lg:grid-cols-[1fr_340px] lg:items-end lg:py-14">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.18em] text-orange-700">{page.eyebrow}</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-[#14213D] sm:text-5xl">{page.title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{page.intro}</p>
            </div>
            <aside className="rounded-[2rem] bg-[#14213D] p-7 text-white shadow-xl shadow-slate-900/10">
              <Icon size={34} className="text-orange-300" />
              <p className="mt-5 text-xs font-black uppercase tracking-wider text-orange-200">Pertanyaan yang dijawab</p>
              <p className="mt-2 text-base font-bold leading-7 text-slate-100">{guide.question}</p>
            </aside>
          </div>
          <GuideNav active={slug} />
        </div>
      </section>}
      <GuideContent guide={guide} slug={slug} />
    </Shell>
  </>;
}

function GroupClassHero({ title, intro }: { title: string; intro: string }) {
  return <section className="relative overflow-hidden bg-[#F4F5F1]">
    <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full border-[28px] border-[#D5E9E3]/70" />
    <div className="relative mx-auto max-w-[1100px] px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14">
      <Link to="/cara-belajar" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-teal-900">Cara belajar <ArrowRight size={15} /></Link>
      <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_355px] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-teal-800">Panduan Kelas Bersama</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-[#14213D] sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">{intro}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-teal-950"><span className="rounded-full border border-teal-200 bg-white px-3 py-2">Online berjadwal</span><span className="rounded-full border border-teal-200 bg-white px-3 py-2">Biaya per peserta</span><span className="rounded-full border border-teal-200 bg-white px-3 py-2">Kuota terlihat</span></div>
          <Link to="/student/kelas-murah" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#14213D] px-6 text-sm font-extrabold text-white hover:bg-slate-800">Lihat kelas yang tersedia <ArrowRight size={18} /></Link>
          <p className="mt-3 text-xs font-medium text-slate-600">Daftar kelas aktif memerlukan akun murid.</p>
        </div>
        <aside className="relative rounded-[2rem] bg-[#153E43] p-6 text-white shadow-xl shadow-teal-950/15 sm:p-7">
          <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-orange-200"><UsersRound size={25} /></span><div><p className="text-xs font-black uppercase tracking-[.16em] text-orange-200">Bukan privat beramai-ramai</p><p className="mt-1 text-lg font-extrabold">Satu kelas, rencana yang sama</p></div></div>
          <div className="mt-7 space-y-3 text-sm">{[{ label: "Sebelum bergabung", detail: "Lihat materi, semua tanggal, biaya, dan kuota." }, { label: "Saat mendaftar", detail: "Kursi ditahan sampai batas pembayaran." }, { label: "Sebelum belajar", detail: "Kelas dikonfirmasi jika minimum peserta terpenuhi." }].map((item) => <div key={item.label} className="border-t border-white/15 pt-3"><strong className="block text-orange-100">{item.label}</strong><span className="mt-1 block leading-6 text-teal-50/80">{item.detail}</span></div>)}</div>
        </aside>
      </div>
      <div className="mt-10"><GuideNav active="kelas-bersama" /></div>
    </div>
  </section>;
}

function OnlineHero({ title, intro }: { title: string; intro: string }) {
  return <section className="relative overflow-hidden bg-[#10283B] text-white">
    <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-40 h-96 w-96 rounded-full border-[32px] border-teal-300/10" />
    <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(249,115,22,.14),transparent_70%)]" />
    <div className="relative mx-auto max-w-[1100px] px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14">
      <Link to="/cara-belajar" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-teal-100 hover:text-white">Cara belajar <ArrowRight size={15} /></Link>
      <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_370px] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Panduan privat online</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">{intro}</p>
          <div className="mt-7 flex flex-wrap gap-2 text-xs font-bold text-teal-50"><span className="rounded-full border border-white/25 px-3 py-2">Tanpa radius lokasi</span><span className="rounded-full border border-white/25 px-3 py-2">Harga sebelum bayar</span><span className="rounded-full border border-white/25 px-3 py-2">Status tutor terlihat</span></div>
          <StudentPackageLink to="/student/packages/new?mode=online" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-extrabold text-slate-950 transition hover:bg-orange-400">Susun kelas online <ArrowRight size={18} /></StudentPackageLink>
        </div>
        <aside aria-label="Urutan kelas online" className="relative rounded-[2rem] border border-white/15 bg-[#263c4d] p-5 shadow-xl sm:p-6 lg:bg-white/10 lg:backdrop-blur-sm">
          <div className="flex items-center gap-3 border-b border-white/15 pb-4"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-300/20 text-teal-100"><Video size={22} /></span><div><p className="text-xs font-black uppercase tracking-wider text-orange-300">Gambaran alur</p><p className="font-extrabold">Dari rencana ke ruang kelas</p></div></div>
          <div className="mt-5 space-y-4">{[["Rencanakan kelas", "Tentukan peserta, mapel, jumlah sesi, dan jadwal yang memungkinkan."], ["Periksa biaya", "Lihat rincian harga akhir sebelum memilih metode pembayaran."], ["Tunggu pencocokan", "Setelah pembayaran terverifikasi, sistem mencari tutor yang sesuai."], ["Mulai belajar", "Saat kelas terbentuk, tautan pertemuan tersedia di Kelas Saya."]].map(([label, detail]) => <div key={label} className="border-l-2 border-orange-300/70 pl-4"><strong className="block text-sm">{label}</strong><p className="mt-0.5 text-xs leading-5 text-slate-300">{detail}</p></div>)}</div>
        </aside>
      </div>
      <div className="mt-10"><GuideNav active="privat-online" /></div>
    </div>
  </section>;
}

function OfflineHero({ title, intro }: { title: string; intro: string }) {
  return <section className="relative overflow-hidden border-b border-orange-100 bg-[#FFF5E9]">
    <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-36 h-96 w-96 rounded-full border-[34px] border-orange-200/40" />
    <div className="relative mx-auto max-w-[1100px] px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14">
      <Link to="/cara-belajar" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-orange-800">Cara belajar <ArrowRight size={15} /></Link>
      <div className="mt-5 grid gap-9 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-orange-700">Panduan privat tatap muka</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-[#14213D] sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">{intro}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-orange-950"><span className="rounded-full border border-orange-200 bg-white/70 px-3 py-2">Alamat dan titik lokasi</span><span className="rounded-full border border-orange-200 bg-white/70 px-3 py-2">Jadwal pilihanmu</span><span className="rounded-full border border-orange-200 bg-white/70 px-3 py-2">Harga sebelum bayar</span></div>
          <StudentPackageLink to="/student/packages/new?mode=offline" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 text-sm font-extrabold text-white hover:bg-orange-700">Susun kelas tatap muka <ArrowRight size={18} /></StudentPackageLink>
        </div>
        <aside aria-label="Data untuk mencocokkan tutor tatap muka" className="rounded-[2rem] border border-orange-200 bg-white p-5 shadow-xl shadow-orange-900/10 sm:p-6">
          <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-orange-700"><Home size={25} /></span><div><p className="text-xs font-black uppercase tracking-wider text-orange-700">Dari rumah ke tutor</p><p className="font-extrabold text-[#14213D]">Tiga data yang harus cocok</p></div></div>
          <div className="mt-6 space-y-3">{[{ label: "Lokasi", detail: "Alamat + titik peta", Icon: MapPin }, { label: "Kebutuhan", detail: "Mapel dan jenjang", Icon: BookOpenCheck }, { label: "Waktu", detail: "Hari serta jam tiap sesi", Icon: CalendarCheck }].map(({ label, detail, Icon }) => <div key={label} className="flex items-center gap-3 rounded-2xl bg-[#FFF8F0] p-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-orange-700"><Icon size={18} /></span><span><strong className="block text-sm text-[#14213D]">{label}</strong><span className="text-xs text-slate-600">{detail}</span></span></div>)}</div>
          <p className="mt-5 border-t border-orange-100 pt-4 text-xs leading-5 text-slate-600">Tutor dicari setelah pembayaran terverifikasi. Memilih lokasi belum memesan tutor tertentu.</p>
        </aside>
      </div>
      <div className="mt-10"><GuideNav active="privat-tatap-muka" /></div>
    </div>
  </section>;
}

function BookingHero({ title, intro }: { title: string; intro: string }) {
  return <section className="relative overflow-hidden border-b border-teal-100 bg-[#EAF6F3]">
    <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full border-[28px] border-teal-200/50" />
    <div className="relative mx-auto max-w-[1100px] px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14">
      <Link to="/cara-belajar" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-teal-900">Cara belajar <ArrowRight size={15} /></Link>
      <div className="mt-5 grid gap-9 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-teal-800">Panduan pemesanan</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-[#14213D] sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">{intro}</p>
          <StudentPackageLink to="/student/packages/new" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#14213D] px-6 text-sm font-extrabold text-white hover:bg-teal-950">Mulai susun pesanan <ArrowRight size={18} /></StudentPackageLink>
        </div>
        <aside aria-label="Tahap form pemesanan" className="rounded-[2rem] bg-[#14213D] p-5 text-white shadow-xl shadow-teal-950/10 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[.18em] text-teal-200">Isi form dalam 4 tahap</p>
          <div className="mt-5 space-y-1">{[["Kebutuhan", "Paket, peserta, durasi"], ["Mapel", "Program atau materi dan sesi"], ["Jadwal", "Hari, jam, lokasi bila perlu"], ["Konfirmasi", "Rincian dan harga akhir"]].map(([label, detail]) => <div key={label} className="border-t border-white/20 py-3"><strong className="block text-sm">{label}</strong><span className="mt-1 block text-xs leading-5 text-slate-300">{detail}</span></div>)}</div>
          <p className="mt-5 border-t border-white/15 pt-4 text-xs leading-5 text-slate-300">Empat tahap ini untuk menyusun pesanan. Pembayaran dan pencarian tutor berlangsung sesudahnya.</p>
        </aside>
      </div>
      <div className="mt-10"><GuideNav active="cara-pemesanan" /></div>
    </div>
  </section>;
}

function MatchingHero({ title, intro }: { title: string; intro: string }) {
  return <section className="relative overflow-hidden bg-[#113747] text-white">
    <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full border-[26px] border-teal-300/10" />
    <div className="relative mx-auto max-w-[1100px] px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14">
      <Link to="/cara-belajar" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-teal-100">Cara belajar <ArrowRight size={15} /></Link>
      <div className="mt-5 grid gap-9 lg:grid-cols-[minmax(0,1fr)_370px] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Sistem matching tutor</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-teal-50 sm:text-lg">{intro}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full border border-teal-300/30 px-3 py-2">Mulai setelah bayar</span><span className="rounded-full border border-teal-300/30 px-3 py-2">Kecocokan lebih dulu</span><span className="rounded-full border border-teal-300/30 px-3 py-2">Status per mapel</span></div>
          <Link to="/cara-belajar/cara-pemesanan" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-extrabold text-[#14213D] hover:bg-orange-400">Lihat alur pemesanan <ArrowRight size={18} /></Link>
        </div>
        <aside aria-label="Gambaran penyaringan tutor" className="rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-sm sm:p-6">
          <p className="text-xs font-black uppercase tracking-[.17em] text-orange-300">Sebelum tutor menerima kelas</p>
          <div className="mt-5 space-y-3">{[{ Icon: ShieldCheck, label: "Siap menerima", detail: "Akun aktif dan profil terverifikasi" }, { Icon: BookOpenCheck, label: "Sesuai kebutuhan", detail: "Mapel, jenjang, dan mode belajar" }, { Icon: CalendarCheck, label: "Sesuai rencana", detail: "Seluruh jadwal sesi tidak bertabrakan" }, { Icon: MapPin, label: "Sesuai lokasi", detail: "Hanya untuk kelas tatap muka" }].map(({ Icon, label, detail }) => <div key={label} className="flex gap-3 rounded-2xl bg-white/10 p-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-200/15 text-teal-100"><Icon size={19} /></span><span><strong className="block text-sm">{label}</strong><span className="mt-0.5 block text-xs leading-5 text-teal-100/80">{detail}</span></span></div>)}</div>
          <p className="mt-5 border-t border-white/15 pt-4 text-xs leading-5 text-teal-100">Rating bukan tiket otomatis. Tutor tetap harus menerima penawaran dan lolos pemeriksaan jadwal akhir.</p>
        </aside>
      </div>
      <div className="mt-10"><GuideNav active="sistem-matching-tutor" /></div>
    </div>
  </section>;
}

function RefundHero({ title, intro }: { title: string; intro: string }) {
  return <section className="relative overflow-hidden border-b border-violet-100 bg-[#F2F0F8]">
    <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full border-[30px] border-violet-200/45" />
    <div className="relative mx-auto max-w-[1100px] px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14">
      <Link to="/cara-belajar" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-violet-900">Cara belajar <ArrowRight size={15} /></Link>
      <div className="mt-5 grid gap-9 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-violet-800">Pembayaran dan refund</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-[#14213D] sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">{intro}</p>
          <Link to="/cara-belajar/cara-pemesanan" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#14213D] px-6 text-sm font-extrabold text-white hover:bg-slate-800">Pahami dari awal pesanan <ArrowRight size={18} /></Link>
        </div>
        <aside aria-label="Peta status pembayaran dan refund" className="rounded-[2rem] border border-violet-200 bg-white p-5 shadow-xl shadow-violet-950/10 sm:p-6">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-800"><ReceiptText size={22} /></span><div><p className="text-xs font-black uppercase tracking-wider text-violet-700">Dua status berbeda</p><p className="font-extrabold text-[#14213D]">Tagihan ≠ refund</p></div></div>
          <div className="mt-6 space-y-3"><div className="rounded-2xl bg-[#F8F6FC] p-4"><p className="text-xs font-black text-violet-700">SEBELUM KELAS</p><p className="mt-1 font-extrabold text-[#14213D]">Tagihan → bayar → mencari tutor</p><p className="mt-2 text-xs leading-5 text-slate-600">Membayar belum berarti tutor tersedia.</p></div><div className="rounded-2xl bg-[#F8F6FC] p-4"><p className="text-xs font-black text-violet-700">BILA PERLU REFUND</p><p className="mt-1 font-extrabold text-[#14213D]">Pilih tujuan → pantau hasil</p><p className="mt-2 text-xs leading-5 text-slate-600">Tujuan dipilih di Riwayat Transaksi, sesuai sumber dana.</p></div></div>
        </aside>
      </div>
      <div className="mt-10"><GuideNav active="pembayaran-dan-refund" /></div>
    </div>
  </section>;
}

function GuideNav({ active }: { active?: string }) {
  return (
    <nav aria-label="Panduan cara belajar" className="pb-5">
      <div className="flex flex-wrap gap-2">
        {Object.entries(pages).map(([itemSlug, item]) => (
          <Link
            key={itemSlug}
            to={`/cara-belajar/${itemSlug}`}
            aria-current={active === itemSlug ? "page" : undefined}
            className={`inline-flex min-h-11 max-w-full items-center rounded-full border px-4 py-2.5 text-sm font-extrabold transition ${active === itemSlug ? "border-[#14213D] bg-[#14213D] text-white" : "border-stone-300 bg-white/70 text-slate-700 hover:border-orange-400 hover:text-orange-700"}`}
          >
            {item.eyebrow}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function GuideContent({ guide, slug }: { guide: Guide; slug: string }) {
  let body: ReactNode;
  if (slug === "panduan-memilih-program") {
    body = <><section><p className="text-xs font-black uppercase tracking-[.18em] text-orange-700">Sebelum memilih</p><h2 className="mt-3 text-3xl font-extrabold text-[#14213D]">Mulai dari cerita belajar anak, bukan nama paketnya.</h2><p className="mt-5 max-w-3xl leading-8 text-slate-600">Satu pilihan yang terlihat cocok di katalog belum tentu pas dengan materi yang sedang sulit atau waktu keluarga. Coba bicarakan hal-hal berikut sebelum membuka formulir.</p><div className="mt-7 grid gap-x-10 md:grid-cols-2">{[
      ["Apa materi yang belum dipahami?", "Sebutkan mapel dan, bila ada, Bab atau soal yang sering membuat anak berhenti. Tutor akan lebih mudah memulai dari titik itu daripada mengulang seluruh pelajaran."],
      ["Targetnya konsep, tugas, ujian, atau nilai?", "Persiapan ujian bisa memerlukan beberapa mapel; tugas harian mungkin hanya butuh satu. Target yang berbeda akan mengubah pilihan program dan pembagian sesi."],
      ["Lebih fokus sendiri atau nyaman bersama peserta lain?", "Privat memberi ruang mengikuti kecepatan satu anak atau teman yang diajak dalam pesanan. Kelas Bersama mengikuti materi dan jadwal yang sudah ditetapkan."],
      ["Tatap muka atau online yang realistis dijalankan?", "Pertimbangkan perjalanan tutor, tempat belajar, perangkat, koneksi internet, dan jam yang benar-benar dapat diikuti sepanjang paket."],
    ].map(([question, explanation]) => <article key={question} className="border-t border-stone-300 py-6"><h3 className="text-xl font-extrabold text-[#14213D]">{question}</h3><p className="mt-3 leading-7 text-slate-600">{explanation}</p></article>)}</div></section><section className="mt-12 overflow-x-auto rounded-3xl border border-stone-200"><table className="w-full min-w-[600px] text-left text-sm"><caption className="bg-[#14213D] p-5 text-left text-xl font-extrabold text-white">Bandingkan pilihan belajar</caption><thead className="bg-stone-100"><tr><th className="p-4">Kebutuhan</th><th className="p-4">Paket Belajar</th><th className="p-4">Kelas Bersama</th></tr></thead><tbody className="divide-y divide-stone-200"><tr><td className="p-4 font-bold">Jadwal</td><td className="p-4">Dipilih saat menyusun paket</td><td className="p-4">Mengikuti jadwal kelas aktif</td></tr><tr><td className="p-4 font-bold">Materi</td><td className="p-4">Mapel dipilih, target dan materi dijelaskan pemesan</td><td className="p-4">Mengikuti penawaran kelas</td></tr><tr><td className="p-4 font-bold">Peserta</td><td className="p-4">Privat atau peserta dalam satu pesanan</td><td className="p-4">Belajar bersama peserta lain</td></tr></tbody></table></section><aside className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-6"><h2 className="text-xl font-extrabold text-[#14213D]">Contoh rekomendasi</h2><p className="mt-3 leading-7">{guide.example}</p><p className="mt-3 text-sm font-bold leading-6 text-amber-900">Batas: {guide.limit}</p></aside></>;
  } else if (slug === "kelas-bersama") {
    body = <GroupClassGuide />;
  } else if (slug === "cara-pemesanan") {
    body = <BookingGuide />;
  } else if (slug === "sistem-matching-tutor") {
    body = <MatchingGuide />;
  } else if (slug === "pembayaran-dan-refund") {
    body = <RefundGuide />;
  } else if (slug === "privat-tatap-muka") {
    body = <OfflineGuide />;
  } else {
    body = <OnlineGuide />;
  }

  return <article className="mx-auto max-w-[1100px] px-5 py-14 text-slate-700 sm:px-8 sm:py-20">{body}<GuideClosing guide={guide} slug={slug} /></article>;
}

function GuideNumber({ value }: { value: number }) {
  return <span aria-hidden="true" data-topic={value} className="inline-block h-1 w-12 rounded-full bg-orange-500" />;
}

function GroupClassGuide() {
  const phases = [
    {
      id: "bersama-pilih",
      label: "Sebelum memilih",
      title: "Pastikan kelas yang tersedia sesuai kebutuhanmu.",
      tone: "bg-[#F3F8F5]",
      items: [
        { title: "Kelas Bersama itu seperti apa?", text: "Ini kelas online dengan peserta dari beberapa akun yang mempelajari materi dan mengikuti jadwal yang sama. Berbeda dari privat bersama teman: pemesan tidak menyusun sendiri jadwal, Bab, atau daftar peserta kelas." },
        { title: "Untuk siapa, dan kapan lebih baik privat?", text: "Pilih Kelas Bersama jika siswa nyaman berdiskusi dalam kelompok dan dapat hadir pada seluruh jadwal yang ditawarkan. Jika perlu pendampingan satu-satu, materi sangat spesifik, atau jam fleksibel, lihat privat online atau tatap muka." },
        { title: "Di mana daftar kelasnya?", text: "Masuk ke akun murid lalu buka Kelas Bersama. Daftar aktif menampilkan penawaran yang masih relevan; jika kosong, belum ada kelas yang dapat diikuti saat itu. Halaman riwayat memisahkan kelas yang selesai atau dibatalkan." },
        { title: "Apa yang wajib diperiksa di kartu kelas?", text: "Cocokkan mapel, jenjang, kelas, Bab dan topik, tanggal seluruh sesi, serta tenggat pendaftaran. Jumlah sesi dan waktunya sudah ditetapkan; jangan bergabung hanya karena sesi pertama cocok." },
      ],
    },
    {
      id: "bersama-daftar",
      label: "Pendaftaran dan biaya",
      title: "Pahami arti kursi, tagihan, dan peserta terverifikasi.",
      tone: "bg-[#FFF7ED]",
      items: [
        { title: "Berapa peserta dalam satu kelas?", text: "Setiap kelas memperlihatkan kuota minimum dan maksimum yang diatur untuk penawaran itu. Kursi yang sedang ditahan belum sama dengan peserta terverifikasi; lihat kedua angka ini secara terpisah. Pendaftaran dapat ditutup saat tenggat lewat atau kuota habis." },
        { title: "Harga dihitung bagaimana?", text: "Nominal per peserta yang tercantum adalah total untuk seluruh sesi kelas tersebut. Periksa jumlah sesi, harga, serta tagihan akhir sebelum membayar. Tidak ada tagihan baru tiap pertemuan untuk paket kelas yang sama." },
        { title: "Apa yang terjadi saat menekan Bergabung?", text: "Sistem memeriksa kuota, jadwal yang tidak bentrok dengan kelas aktifmu, dan kesiapan tutor. Jika lolos, satu kursi ditahan sementara dan satu pesanan dibuat. Batas bayar mengikuti waktu yang tampil di tagihan atau tenggat pendaftaran, mana yang lebih dulu." },
        { title: "Kapan kursi benar-benar aman?", text: "Selesaikan pembayaran dari pesanan yang sama sebelum tenggat. Status kursi ditahan bukan bukti pembayaran diterima. Jika masa tahan habis, kursi dapat dilepas; jika transaksi masih diperiksa, pantau statusnya dan jangan membuat pesanan ganda." },
      ],
    },
    {
      id: "bersama-berjalan",
      label: "Setelah membayar",
      title: "Ketahui kapan kelas berjalan dan ke mana harus melihat.",
      tone: "bg-[#EEF3FA]",
      items: [
        { title: "Apa syarat kelas dikonfirmasi?", text: "Pembayaran peserta harus terverifikasi dan jumlahnya mencapai minimum yang tertera. Sistem juga memastikan tutor masih dapat mengajar seluruh jadwal sebelum status kelas menjadi dikonfirmasi. Pembayaranmu sendiri belum cukup untuk menjamin kelas berjalan." },
        { title: "Kapan tutor dan tautan muncul?", text: "Tutor disiapkan untuk kelas sebelum pendaftaran dibuka, tetapi identitas dan tautan pertemuan hanya ditampilkan kepada peserta yang berhak setelah kelas dikonfirmasi. Lihat detail Kelas Bersama atau Kelas Saya menjelang sesi; tutor melengkapi tautannya sebelum kelas dimulai." },
        { title: "Di mana jadwal, kehadiran, dan progress?", text: "Setelah kelas aktif, Kelas Saya memuat jadwal setiap sesi. Detail kelas menampilkan status pertemuan; catatan materi, kehadiran, dan progress resmi mengikuti laporan sesi yang sudah diperiksa, bukan langsung saat pertemuan ditutup." },
        { title: "Kalau batal atau minimum peserta tidak tercapai?", text: "Sebelum pembayaran dikirim, pembatalan kursi tersedia hanya saat syaratnya terpenuhi dan tombolnya tampil. Bila kelas dibatalkan—misalnya peserta terverifikasi kurang dari minimum—pembayaran yang sudah diterima masuk alur refund. Pantau status dan tujuan dana di Riwayat Transaksi; jika pembayaran masih diperiksa, hasil pemeriksaan menentukan apakah ada dana yang harus dikembalikan." },
      ],
    },
  ];

  return <>
    <nav aria-label="Isi panduan Kelas Bersama" className="rounded-3xl border border-teal-200 bg-[#153E43] p-6 text-white sm:p-8">
      <p className="text-xs font-black uppercase tracking-[.17em] text-orange-200">Panduan Kelas Bersama</p>
      <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Tidak perlu menebak apa yang terjadi setelah bayar.</h2>
      <div className="mt-6 grid gap-2 sm:grid-cols-3">{phases.map((phase) => <a key={phase.id} href={`#${phase.id}`} className="flex min-h-12 items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/20">{phase.label}</a>)}</div>
    </nav>
    {phases.map((phase) => <section key={phase.id} id={phase.id} className="scroll-mt-28 pt-16">
      <div className="flex items-center gap-3"><span aria-hidden="true" className="h-1 w-12 rounded-full bg-orange-500" /><p className="text-xs font-black uppercase tracking-[.17em] text-teal-800">{phase.label}</p></div>
      <h2 className="mt-4 max-w-3xl text-3xl font-extrabold text-[#14213D]">{phase.title}</h2>
      <div className="mt-7 grid gap-x-10 md:grid-cols-2">{phase.items.map((item) => <article key={item.title} className="border-t border-stone-300 py-7"><h3 className="text-xl font-extrabold text-[#14213D]">{item.title}</h3><p className="mt-3 leading-8 text-slate-700">{item.text}</p></article>)}</div>
    </section>)}
    <aside className="mt-16 grid gap-6 rounded-[2rem] bg-[#14213D] p-6 text-white sm:p-8 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-xs font-black uppercase tracking-[.16em] text-orange-200">Sebelum mengambil keputusan</p><h2 className="mt-2 text-2xl font-extrabold">Jadwal kelas cocok? Baru ambil kursi.</h2><p className="mt-3 max-w-2xl leading-7 text-slate-200">Bila tidak ada kelas yang cocok, jangan mendaftar kelas hanya untuk meminta perubahan jadwal. Susun privat agar mapel, waktu, dan format belajar bisa mengikuti kebutuhanmu.</p></div><div className="flex flex-col gap-2"><Link to="/student/kelas-murah" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-extrabold text-[#14213D]">Lihat Kelas Bersama <ArrowRight size={17} /></Link><StudentPackageLink to="/student/packages/new?mode=online" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-5 text-sm font-extrabold text-white">Bandingkan privat online <ArrowRight size={17} /></StudentPackageLink></div></aside>
  </>;
}

function MatchingGuide() {
  const checks = [
    { number: 1, icon: CreditCard, title: "Kapan tutor mulai dicari?", text: "Sesudah pembayaran terverifikasi, bukan ketika form selesai atau jadwal baru dipilih. Di Proses Pesanan, tiap mapel dapat menunjukkan status pencariannya sendiri." },
    { number: 2, icon: ShieldCheck, title: "Tutor seperti apa yang bisa menerima?", text: "Akun tutor harus aktif, profilnya terverifikasi, bersedia menerima permintaan, dan mapelnya aktif untuk jenjang serta mode belajar yang kamu pilih." },
    { number: 3, icon: MapPin, title: "Apakah lokasi membatasi pencarian?", text: "Hanya untuk tatap muka. Sistem memakai titik lokasi siswa, jangkauan pencarian, dan kesediaan perjalanan tutor. Kelas online tidak memakai radius 3 km atau radius rumah." },
    { number: 4, icon: CalendarCheck, title: "Apakah cukup satu jam yang cocok?", text: "Tidak. Tutor harus tersedia untuk seluruh sesi pada mapel tersebut dan tidak boleh memiliki kelas atau penawaran lain yang bentrok. Kecocokan diperiksa kembali ketika tutor menerima." },
  ];
  const decisions = [
    { number: 8, title: "Cari lagi", text: "Jika tombol tersedia, sistem mencari kandidat baru pada mapel yang belum terisi. Untuk tatap muka, jangkauan dapat diperluas bertahap sesuai batas sistem; online tidak memakai perluasan radius." },
    { number: 9, title: "Ubah jadwal", text: "Perbaiki hari atau jam hanya untuk mapel yang belum mendapat tutor. Jadwal tutor yang sudah menerima tidak ikut diubah, dan kamu tidak perlu membayar ulang untuk memulai pencarian pada jadwal baru." },
    { number: 10, title: "Batalkan paket", text: "Jika tidak ingin melanjutkan, batalkan seluruh paket dari Proses Pesanan sebelum kelas terbentuk. Refund tidak memerlukan keputusan persetujuan admin untuk kondisi ini; pilih tujuan dana di Riwayat Transaksi." },
  ];
  return <>
    <section aria-label="Isi panduan matching tutor">
      <p className="text-xs font-black uppercase tracking-[.18em] text-teal-800">Memahami matching tutor</p>
      <h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-[#14213D]">Kecocokan dulu, baru penawaran dan keputusan tutor.</h2>
      <div className="mt-6 flex flex-wrap gap-2 text-sm font-bold"><a href="#matching-syarat" className="rounded-full border border-teal-200 px-4 py-2 text-teal-900 hover:bg-teal-50">Syarat tutor</a><a href="#matching-urutan" className="rounded-full border border-teal-200 px-4 py-2 text-teal-900 hover:bg-teal-50">Urutan dan status</a><a href="#matching-pilihan" className="rounded-full border border-teal-200 px-4 py-2 text-teal-900 hover:bg-teal-50">Jika belum cocok</a></div>
    </section>

    <section id="matching-syarat" className="mt-12 scroll-mt-28">
      <p className="text-xs font-black uppercase tracking-[.18em] text-teal-800">SEBELUM TUTOR MENERIMA</p>
      <h2 className="mt-2 text-2xl font-extrabold text-[#14213D]">Empat syarat yang tidak bisa dilewati.</h2>
      <p className="mt-4 max-w-3xl leading-8 text-slate-600">Mencari yang cocok tidak sama dengan mengambil guru paling tinggi ratingnya. Sistem terlebih dahulu memeriksa apakah kebutuhan kelas dapat dijalankan oleh tutor yang aktif.</p>
      <div className="mt-7 grid gap-x-10 md:grid-cols-2">{checks.map(({ icon: Icon, title, text }) => <article key={title} className="border-t border-stone-300 py-6"><Icon size={24} className="text-teal-800" /><h3 className="mt-4 text-xl font-extrabold text-[#14213D]">{title}</h3><p className="mt-3 leading-8">{text}</p></article>)}</div>
    </section>

    <section id="matching-urutan" className="mt-14 scroll-mt-28">
      <div className="grid gap-8 rounded-[2rem] bg-[#14213D] p-6 text-white sm:p-8 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">PENAWARAN, BUKAN UNDIAN</p><h2 className="mt-3 text-2xl font-extrabold">Siapa yang lebih dulu mendapat penawaran?</h2><p className="mt-4 leading-7 text-slate-200">Setelah lolos syarat, sistem mengurutkan kandidat memakai faktor yang relevan: jarak untuk tatap muka, kesinambungan tutor pada kelas lanjutan, beban kelas, pemerataan penawaran, dan keandalan respons. Rating turut dipertimbangkan setelahnya—bukan satu-satunya penentu dan bukan jaminan tutor tertentu.</p></div>
        <aside className="rounded-2xl border border-white/15 bg-white/10 p-5"><Radar size={28} className="text-orange-300" /><p className="mt-4 text-lg font-extrabold">Apa tutor bisa menolak?</p><p className="mt-2 text-sm leading-6 text-slate-200">Bisa. Penawaran harus diterima tutor, dan kecocokan jadwal dicek lagi sebelum penempatan. Karena itu, status mencari tutor belum sama dengan kelas aktif.</p></aside>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-[1.75rem] border border-stone-200 p-6"><GuideNumber value={6} /><h3 className="mt-4 text-lg font-extrabold text-[#14213D]">Bisakah memilih tutor tertentu?</h3><p className="mt-2 leading-7">Pesanan baru tidak menjanjikan nama tutor tertentu. Pada perpanjangan, tutor lama dapat diprioritaskan jika masih aktif dan cocok dengan rencana baru. Tutor tetap perlu menerima penawaran.</p></div>
        <div className="rounded-[1.75rem] border border-orange-200 bg-orange-50 p-6"><GuideNumber value={7} /><h3 className="mt-4 text-lg font-extrabold text-[#14213D]">Bagaimana kalau paket punya beberapa mapel?</h3><p className="mt-2 leading-7">Pencarian berjalan per mapel. Contoh: dua tutor sudah siap mengajar, satu mapel masih mencari. Proses Pesanan menampilkan keduanya secara terpisah; paket program belum aktif sampai semua mapel mendapat tutor.</p></div>
      </div>
    </section>

    <section id="matching-pilihan" className="mt-14 scroll-mt-28">
      <p className="text-xs font-black uppercase tracking-[.18em] text-orange-700">BILA BELUM ADA TUTOR</p><h2 className="mt-2 text-2xl font-extrabold text-[#14213D]">Tiga pilihan nyata, tanpa membuat pesanan baru.</h2>
      <div className="mt-7 grid gap-x-8 lg:grid-cols-3">{decisions.map(({ title, text }) => <article key={title} className="border-t-2 border-orange-500 py-6"><h3 className="text-xl font-extrabold text-[#14213D]">{title}</h3><p className="mt-3 leading-8">{text}</p></article>)}</div>
      <div className="mt-6 flex flex-wrap gap-3"><Link to="/student/packages" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#14213D] px-4 text-sm font-extrabold text-white">Buka Proses Pesanan <ArrowRight size={16} /></Link><Link to="/cara-belajar/pembayaran-dan-refund" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-200 px-4 text-sm font-extrabold text-orange-900">Jika memilih refund <ArrowRight size={16} /></Link></div>
    </section>
    <aside className="mt-12 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><CircleHelp className="mt-0.5 shrink-0" size={19} /><p><strong>Batas yang jujur:</strong> jadwal, jangkauan, dan respons tutor dapat berubah. BimbelKu tidak menjanjikan tutor atau waktu penerimaan tertentu hanya karena pembayaran sudah selesai.</p></aside>
  </>;
}

function RefundGuide() {
  const timeline = [
    { number: 1, title: "Periksa tagihan", text: "Lihat jumlah peserta, sesi, potongan, total, dan batas waktu pembayaran pada pesanan. Tagihan yang belum dibayar belum memulai pencarian tutor." },
    { number: 2, title: "Lanjutkan pesanan yang sama", text: "Jika checkout tertutup atau kembali ke halaman sebelumnya, buka tagihan yang masih aktif. Jangan membuat pesanan baru hanya untuk mencoba membayar lagi." },
    { number: 3, title: "Tunggu konfirmasi pembayaran", text: "Setelah pembayaran terverifikasi, status pesanan diperbarui dan matching dimulai. Pembayaran berhasil bukan berarti kelas sudah terbentuk." },
  ];
  const statuses = [
    { title: "Belum memilih tujuan", text: "Refund sudah tercatat, tetapi murid perlu memilih dan mengonfirmasi ke mana dana dikembalikan." },
    { title: "Dipilih / disiapkan", text: "Tujuan tersimpan. Sistem menyiapkan pengembalian atau mengirim permintaan ke penyedia pembayaran." },
    { title: "Dikirim / diproses", text: "Permintaan sudah berjalan. Hasil akhir belum tentu langsung terlihat pada metode pembayaran." },
    { title: "Berhasil / gagal", text: "Berhasil berarti pengembalian tercatat selesai. Jika gagal, dana tetap tercatat dan tim memeriksa masalahnya." },
  ];
  return <>
    <section aria-label="Isi panduan pembayaran dan refund"><p className="text-xs font-black uppercase tracking-[.18em] text-violet-800">PANDUAN DANA PEMESAN</p><h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-[#14213D]">Dari tagihan hingga dana kembali, ketahui tindakanmu di setiap status.</h2><p className="mt-4 max-w-2xl leading-7 text-slate-600">Bagian ini memisahkan uang yang masih menunggu pembayaran, uang dari pesanan yang belum mendapatkan tutor, dan pengembalian yang sedang diproses. Setiap keadaan punya tindakan yang berbeda.</p><div className="mt-6 flex flex-wrap gap-2 text-sm font-bold"><a href="#refund-bayar" className="rounded-full border border-violet-200 px-4 py-2 text-violet-900 hover:bg-violet-50">Membayar</a><a href="#refund-keputusan" className="rounded-full border border-violet-200 px-4 py-2 text-violet-900 hover:bg-violet-50">Memilih refund</a><a href="#refund-status" className="rounded-full border border-violet-200 px-4 py-2 text-violet-900 hover:bg-violet-50">Memantau hasil</a></div></section>

    <section id="refund-bayar" className="mt-12 scroll-mt-28"><p className="text-xs font-black uppercase tracking-[.18em] text-violet-800">SEBELUM PENCARIAN TUTOR</p><h2 className="mt-2 text-2xl font-extrabold text-[#14213D]">Pembayaran punya urutan yang jelas.</h2><p className="mt-4 max-w-3xl leading-8 text-slate-600">Rencana belajar berubah menjadi tagihan lebih dulu. Pembayaran yang berhasil kemudian diverifikasi; hanya setelah itu sistem menawarkan kebutuhan kepada tutor. Menutup halaman pembayaran tidak menghapus pesananmu.</p><div className="mt-7 grid gap-x-8 md:grid-cols-3">{timeline.map(({ title, text }) => <article key={title} className="border-t-2 border-violet-400 py-6"><h3 className="text-xl font-extrabold text-[#14213D]">{title}</h3><p className="mt-3 leading-8">{text}</p></article>)}</div></section>

    <section id="refund-keputusan" className="mt-14 scroll-mt-28"><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="rounded-[2rem] bg-[#14213D] p-6 text-white sm:p-8"><div className="flex items-center gap-3"><GuideNumber value={4} /><p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">JIKA TUTOR TIDAK DITEMUKAN</p></div><h2 className="mt-5 text-2xl font-extrabold">Batalkan pencarian, lalu pilih tujuan refund.</h2><p className="mt-3 leading-7 text-slate-200">Selama kelas belum terbentuk, kamu dapat membatalkan seluruh paket dari Proses Pesanan. Keputusan refund karena pencarian tutor tidak ditemukan tidak perlu persetujuan admin. Setelah pembatalan tercatat, buka Riwayat Transaksi untuk memilih dan mengonfirmasi tujuan dana—proses tidak selesai hanya dengan menekan Batalkan.</p></div><aside className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6"><CircleHelp size={25} className="text-amber-800" /><h3 className="mt-4 text-lg font-extrabold text-[#14213D]">Jika kelas sudah berjalan?</h3><p className="mt-2 text-sm leading-7">Sengketa sesi, ketidakhadiran, atau keberatan lain berbeda dari tutor yang tidak ditemukan sebelum kelas terbentuk. Kasus tersebut dapat membutuhkan bukti dan pemeriksaan tim.</p></aside></div>
      <div className="mt-6"><div className="flex items-center gap-3"><GuideNumber value={5} /><h2 className="text-2xl font-extrabold text-[#14213D]">Ke mana refund dapat dikirim?</h2></div><p className="mt-3 leading-7">Pilihan yang terlihat bergantung pada sumber pembayaran pesanan. Tentukan tujuan di Riwayat Transaksi, baca nominalnya, lalu konfirmasi; setelah pengembalian mulai diproses, tujuan tidak dapat diubah.</p></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-[1.75rem] border border-indigo-200 bg-indigo-50 p-6"><GuideNumber value={6} /><h3 className="mt-4 text-xl font-extrabold text-[#14213D]">Saldo BimbelKu</h3><p className="mt-2 text-sm leading-7">Bagian yang semula dibayar dari saldo selalu kembali ke saldo. Kamu juga dapat memilih saldo sebagai tujuan untuk dana eksternal yang memenuhi syarat. Saldo bisa dipakai membayar layanan belajar, tetapi tidak bisa ditarik tunai.</p></div><div className="rounded-[1.75rem] border border-teal-200 bg-teal-50 p-6"><GuideNumber value={7} /><h3 className="mt-4 text-xl font-extrabold text-[#14213D]">Metode pembayaran asal</h3><p className="mt-2 text-sm leading-7">Untuk pembayaran eksternal melalui penyedia pembayaran, dana dapat kembali ke metode asal bila pilihan itu tersedia. Nomor rekening/e-wallet manual hanya diminta pada transaksi lama atau metode yang mendukungnya, bukan untuk semua pembayaran.</p></div></div>
      <div className="mt-5 rounded-[1.75rem] border border-orange-200 bg-[#FFF8F0] p-6"><div className="flex items-center gap-3"><GuideNumber value={8} /><h3 className="text-xl font-extrabold text-[#14213D]">Contoh pembayaran campuran</h3></div><p className="mt-3 leading-7">Pesanan Rp150.000 dibayar Rp50.000 dari Saldo BimbelKu dan Rp100.000 lewat metode eksternal. Bila seluruh pesanan layak direfund, Rp50.000 kembali ke saldo. Untuk Rp100.000, pilih tujuan yang tersedia: metode asal atau Saldo BimbelKu. Riwayat Transaksi menampilkan pembagian ini.</p></div>
    </section>

    <section id="refund-status" className="mt-14 scroll-mt-28"><div className="flex items-center gap-3"><GuideNumber value={9} /><h2 className="text-2xl font-extrabold text-[#14213D]">Pantau di Riwayat Transaksi, bukan menebak dari status paket.</h2></div><div className="mt-6 grid gap-4 md:grid-cols-2">{statuses.map(({ title, text }) => <div key={title} className="rounded-2xl border border-stone-200 p-5"><p className="font-extrabold text-[#14213D]">{title}</p><p className="mt-2 text-sm leading-6">{text}</p></div>)}</div><div className="mt-6 rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6"><div className="flex items-center gap-3"><GuideNumber value={10} /><h3 className="text-xl font-extrabold text-[#14213D]">Kalau status gagal atau terlalu lama?</h3></div><p className="mt-3 leading-7">Jangan membayar atau membatalkan ulang. Buka detail refund pada Riwayat Transaksi: permintaan dan referensinya tetap tersimpan. Tim BimbelKu meninjau kegagalan atau keterlambatan; waktu dana terlihat kembali juga bergantung pada metode pembayaran asal.</p></div><div className="mt-6 flex flex-wrap gap-3"><Link to="/student/history" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#14213D] px-4 text-sm font-extrabold text-white">Buka Riwayat Transaksi <ArrowRight size={16} /></Link><Link to="/cara-belajar/sistem-matching-tutor" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-teal-200 px-4 text-sm font-extrabold text-teal-900">Mengapa tutor belum ditemukan? <ArrowRight size={16} /></Link></div></section>
  </>;
}

function OfflineGuide() {
  return <>
    <nav aria-label="Isi panduan privat tatap muka" className="rounded-3xl border border-orange-200 bg-[#FFF7ED] p-5 sm:p-7">
      <p className="text-xs font-black uppercase tracking-[.16em] text-orange-700">Panduan privat tatap muka</p>
      <h2 className="mt-2 text-2xl font-extrabold text-[#14213D]">Mulai dari tempat belajar, baru pikirkan jadwal dan pembayaran.</h2>
      <div className="mt-5 grid gap-2 sm:grid-cols-3"><a href="#tatap-lokasi" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#14213D] hover:text-orange-700">Lokasi dan area</a><a href="#tatap-rencana" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#14213D] hover:text-orange-700">Rencana belajar</a><a href="#tatap-setelah" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#14213D] hover:text-orange-700">Setelah memesan</a></div>
    </nav>

    <section id="tatap-lokasi" className="scroll-mt-28 pt-14">
      <p className="text-xs font-black uppercase tracking-[.16em] text-orange-700">Lokasi lebih dulu</p>
      <h2 className="mt-3 text-3xl font-extrabold text-[#14213D]">Alamat jelas membuat pencarian tutor masuk akal.</h2>
      <div className="mt-7 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-[1.75rem] bg-[#14213D] p-6 text-white sm:p-7">
          <GuideNumber value={1} /><LocateFixed className="mt-5 text-orange-300" size={28} />
          <h3 className="mt-3 text-xl font-extrabold">Kenapa harus menulis alamat dan mengambil titik peta?</h3>
          <p className="mt-3 leading-7 text-slate-200">Alamat menunjukkan tempat tutor harus datang. Titik koordinat membuat sistem dapat menghitung jarak secara benar. Keduanya diisi pada tahap Jadwal untuk kelas tatap muka; alamat saja tanpa titik belum cukup untuk pencarian radius.</p>
          <p className="mt-5 rounded-xl bg-white/10 p-4 text-sm leading-6 text-slate-100">Jika memesan sebagai tamu, form meminta persetujuan sebelum lokasi disimpan ke profil akun yang nantinya terhubung dengan email pesanan.</p>
        </div>
        <div className="rounded-[1.75rem] border border-teal-200 bg-teal-50 p-6 sm:p-7">
          <GuideNumber value={2} /><Search className="mt-5 text-teal-700" size={28} />
          <h3 className="mt-3 text-xl font-extrabold text-[#14213D]">Apakah semua alamat pasti mendapat tutor?</h3>
          <p className="mt-3 leading-7">Tidak. Tutor harus menerima mode tatap muka, bisa mengajar mapel dan jenjang yang dipilih, tersedia pada jadwalnya, serta menjangkau titik lokasi. Pencarian dapat memperluas radius sesuai aturan sistem, tetapi <strong>area yang terjangkau tetap bukan jaminan tutor tersedia</strong>.</p>
          <Link to="/area-layanan" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-teal-900 underline decoration-teal-400 underline-offset-4">Lihat penjelasan area layanan <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>

    <section id="tatap-rencana" className="scroll-mt-28 pt-16">
      <p className="text-xs font-black uppercase tracking-[.16em] text-teal-700">Rencana yang diterima tutor</p>
      <h2 className="mt-3 text-3xl font-extrabold text-[#14213D]">Rencana kelas yang jelas membuat harga dan pencarian lebih masuk akal.</h2>
      <p className="mt-4 max-w-3xl leading-8 text-slate-600">Sebelum melihat total, keluarga perlu menyebut siapa yang belajar, apa yang akan dipelajari, dan kapan sesi itu realistis dijalankan. Jawaban ini menjadi acuan yang dilihat tutor, bukan hanya catatan administratif.</p>
      <div className="mt-7 grid gap-x-10 sm:grid-cols-2">
        <article className="border-t border-stone-300 py-6"><UsersRound className="text-orange-700" size={25} /><h3 className="mt-4 text-xl font-extrabold text-[#14213D]">Siapa yang belajar?</h3><p className="mt-3 leading-8">Pilih satu siswa untuk privat sendiri. Jika pilihan privat bersama teman dibuka di form, jumlah peserta dan identitas tiap peserta harus sesuai; ini berbeda dari Kelas Bersama yang punya jadwal dan kuota tersendiri.</p></article>
        <article className="border-t border-stone-300 py-6"><BookOpenCheck className="text-orange-700" size={25} /><h3 className="mt-4 text-xl font-extrabold text-[#14213D]">Mapel, program, dan target apa?</h3><p className="mt-3 leading-8">Pilih mapel biasa atau program persiapan ujian, lalu tulis target belajar. Tidak perlu memilih Bab dari katalog. Materi dan kesulitan dapat dijelaskan dengan bahasamu sendiri; untuk program, target khusus bersifat opsional. Beberapa mapel ditangani tutor berbeda.</p></article>
        <article className="border-t border-stone-300 py-6"><CalendarCheck className="text-teal-800" size={25} /><h3 className="mt-4 text-xl font-extrabold text-[#14213D]">Kapan dan berapa lama?</h3><p className="mt-3 leading-8">Pilih paket berisi jumlah sesi, durasi per sesi, hari, tanggal mulai, dan jam. Form menampilkan batas pemesanan serta rencana tanggal pertemuan. Pilih jam yang realistis untuk seluruh sesi; jadwal ini belum mengunci tutor.</p></article>
        <article className="border-t border-stone-300 py-6"><ReceiptText className="text-teal-800" size={25} /><h3 className="mt-4 text-xl font-extrabold text-[#14213D]">Kapan biaya diketahui?</h3><p className="mt-3 leading-8">Di ringkasan sebelum pesanan dikirim. Periksa paket, peserta, sesi, durasi, potongan yang berlaku, jadwal, dan <strong>total pembayaran</strong>. Nominal pada ringkasan itulah acuanmu sebelum membayar.</p></article>
      </div>
    </section>

    <section id="tatap-setelah" className="scroll-mt-28 pt-16">
      <p className="text-xs font-black uppercase tracking-[.16em] text-orange-700">Setelah rencana disusun</p>
      <h2 className="mt-3 text-3xl font-extrabold text-[#14213D]">Bayar, pantau tutor, lalu siapkan tempat belajar.</h2>
      <div className="mt-7 overflow-hidden rounded-[1.75rem] border border-orange-200">
        <div className="grid gap-4 bg-[#FFF7ED] p-6 sm:grid-cols-[3rem_1fr] sm:p-7"><GuideNumber value={7} /><div><h3 className="text-xl font-extrabold text-[#14213D]">Bisa memesan tanpa login?</h3><p className="mt-2 leading-7">Bisa. Isi nama, WhatsApp, dan email saat menyusun pesanan. Setelah pesanan tersimpan, masuk atau daftar memakai <strong>email yang sama</strong> agar pesanan terhubung dan pembayaran dapat dilanjutkan.</p></div></div>
        <div className="grid gap-4 bg-white p-6 sm:grid-cols-[3rem_1fr] sm:p-7"><GuideNumber value={8} /><div><h3 className="text-xl font-extrabold text-[#14213D]">Apakah membayar berarti tutor sudah ditemukan?</h3><p className="mt-2 leading-7">Belum. Pembayaran yang terverifikasi memulai matching. Sistem menilai mapel, jenjang, jadwal, mode tatap muka, dan jangkauan lokasi sebelum menawarkan kelas kepada tutor. Statusnya bisa dilihat di <strong>Proses Pesanan</strong>.</p></div></div>
        <div className="grid gap-4 bg-teal-50 p-6 sm:grid-cols-[3rem_1fr] sm:p-7"><GuideNumber value={9} /><div><h3 className="text-xl font-extrabold text-[#14213D]">Apa yang disiapkan setelah kelas terbentuk?</h3><p className="mt-2 leading-7">Buka <strong>Kelas Saya</strong> untuk melihat tutor dan jadwal. Pastikan alamat masih benar, sediakan tempat aman dan cukup tenang, serta siapkan buku atau tugas yang ingin dibahas. Kehadiran dan progress belajar mengikuti catatan tiap sesi di kelas.</p></div></div>
        <div className="grid gap-4 bg-white p-6 sm:grid-cols-[3rem_1fr] sm:p-7"><GuideNumber value={10} /><div><h3 className="text-xl font-extrabold text-[#14213D]">Kalau tutor tidak ditemukan atau alamat berubah?</h3><p className="mt-2 leading-7">Pada <strong>Proses Pesanan</strong>, lihat opsi yang tersedia: Cari lagi, perluas jangkauan, Ubah jadwal, atau batalkan dan ikuti refund. Jika alamat berubah setelah memesan, hubungi bantuan sebelum menganggap tutor yang sudah dipilih dapat menjangkau lokasi baru.</p></div></div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.75rem] border border-teal-200 bg-teal-50 p-6 sm:p-7"><GuideNumber value={11} /><h3 className="mt-4 text-xl font-extrabold text-[#14213D]">Jika memilih beberapa mapel, apakah tutornya sama?</h3><p className="mt-3 leading-7">Belum tentu. Tutor harus sesuai dengan mapel dan jenjang yang diajar. Paket Matematika dan IPA, misalnya, bisa memiliki dua tutor berbeda. Kecocokan jadwal dan jarak diperiksa untuk tiap tutor yang diperlukan.</p></div>
        <div className="rounded-[1.75rem] border border-orange-200 bg-orange-50 p-6 sm:p-7"><GuideNumber value={12} /><h3 className="mt-4 text-xl font-extrabold text-[#14213D]">Bagaimana bila satu mapel sudah dapat tutor dan lainnya belum?</h3><p className="mt-3 leading-7">Lihat status tiap mapel di <strong>Proses Pesanan</strong>; yang sudah siap tidak disamakan dengan yang masih mencari. Paket multi-mapel belum mulai sebagai kelas lengkap sampai seluruh tutor mapelnya tersedia. Untuk mapel yang belum cocok, pilih Cari lagi atau Ubah jadwal bila ditawarkan; pembatalan dan refund mengikuti status pesanan.</p></div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3"><Link to="/cara-belajar/sistem-matching-tutor" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-teal-200 px-4 text-sm font-extrabold text-teal-900 hover:bg-teal-50">Cara tutor dicari <ArrowRight size={16} /></Link><Link to="/cara-belajar/pembayaran-dan-refund" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-200 px-4 text-sm font-extrabold text-orange-900 hover:bg-orange-50">Jika perlu refund <ArrowRight size={16} /></Link></div>
    </section>
    <aside className="mt-12 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><ShieldCheck className="mt-0.5 shrink-0" size={19} /><p><strong>Batas yang perlu diketahui:</strong> alamat dan jadwal yang sudah diisi membantu matching, tetapi tidak menjanjikan tutor tertentu. Bila lokasi belum siap atau di luar jangkauan, pertimbangkan <Link to="/cara-belajar/privat-online" className="font-black underline">privat online</Link>.</p></aside>
  </>;
}

function BookingGuide() {
  const stages = [
    { number: 1, title: "Kebutuhan", Icon: UsersRound, question: "Paket dan peserta apa yang dipilih?", text: "Pilih jumlah sesi, siapa yang belajar, jenjang, mode online atau tatap muka, serta durasi tiap pertemuan. Jika memesan sebagai tamu, identitas pemesan dan email diisi di sini. Peserta tambahan hanya tersedia jika harga untuk jumlah itu sudah diatur." },
    { number: 2, title: "Mapel", Icon: BookOpenCheck, question: "Belajar apa di setiap sesi?", text: "Pilih jalur mapel biasa atau program persiapan. Untuk beberapa mapel, bagi sesi sesuai kebutuhan; total sesi paket tidak bertambah ketika alokasi dipindah. Tulis target atau materi yang ingin difokuskan per mapel. Nama Bab tidak wajib diketahui; untuk program persiapan, target khusus bersifat opsional." },
    { number: 3, title: "Jadwal", Icon: CalendarCheck, question: "Kapan dan di mana kelas berlangsung?", text: "Isi tanggal mulai, hari, dan jam untuk setiap mapel. Batas waktu pemesanan tampil di form. Untuk tatap muka, tambahkan alamat, titik lokasi, dan persetujuan penyimpanannya; mode online tidak meminta radius lokasi." },
    { number: 4, title: "Konfirmasi", Icon: ReceiptText, question: "Apa yang harus diperiksa sebelum dikirim?", text: "Ringkasan menunjukkan paket, peserta, pembagian mapel, durasi, seluruh tanggal, potongan yang berlaku, dan total. Gunakan Kembali & Ubah bila ada yang keliru. Menyimpan pesanan belum berarti pembayaran atau matching selesai." },
  ];
  return <>
    <nav aria-label="Isi panduan pemesanan" className="rounded-3xl border border-teal-200 bg-teal-50 p-5 sm:p-7">
      <p className="text-xs font-black uppercase tracking-[.16em] text-teal-800">Peta panduan</p>
      <h2 className="mt-2 text-2xl font-extrabold text-[#14213D]">Dari memilih kebutuhan sampai kelas siap dimulai.</h2>
      <div className="mt-5 grid gap-2 sm:grid-cols-3"><a href="#pesan-siapkan" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#14213D] hover:text-teal-800">Sebelum form</a><a href="#pesan-empat-tahap" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#14213D] hover:text-teal-800">Empat tahap form</a><a href="#pesan-setelah" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#14213D] hover:text-teal-800">Setelah dikirim</a></div>
    </nav>

    <section id="pesan-siapkan" className="scroll-mt-28 pt-14">
      <p className="text-xs font-black uppercase tracking-[.16em] text-teal-700">Sebelum membuka form</p>
      <h2 className="mt-3 text-3xl font-extrabold text-[#14213D]">Siapkan data yang nanti menentukan tutor dan harga.</h2>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6"><GuideNumber value={1} /><BookOpenCheck className="mt-5 text-teal-700" size={27} /><h3 className="mt-3 text-xl font-extrabold text-[#14213D]">Program atau mapel biasa?</h3><p className="mt-3 leading-7">Pilih <strong>program</strong> untuk target seperti persiapan ujian, lalu pilih mapel yang diperlukan di dalamnya. Pilih <strong>mapel biasa</strong> untuk kebutuhan pelajaran seperti Matematika. Keputusan ini mendahului empat tahap form agar kolom berikutnya sesuai kebutuhan.</p></div>
        <div className="rounded-[1.75rem] border border-stone-200 bg-[#F7F1E8] p-6"><GuideNumber value={2} /><UserRound className="mt-5 text-orange-700" size={27} /><h3 className="mt-3 text-xl font-extrabold text-[#14213D]">Kalau belum punya akun?</h3><p className="mt-3 leading-7">Kamu boleh mulai sebagai tamu. Siapkan nama, nomor WhatsApp, dan <strong>email yang benar-benar dapat diakses</strong>. Email itu dipakai untuk menghubungkan pesanan saat kamu masuk atau mendaftar. Akun dengan email lain tidak otomatis mengambil pesanan tersebut.</p></div>
      </div>
    </section>

    <section id="pesan-empat-tahap" className="scroll-mt-28 pt-16">
      <p className="text-xs font-black uppercase tracking-[.16em] text-orange-700">Di dalam form</p>
      <h2 className="mt-3 text-3xl font-extrabold text-[#14213D]">Apa yang diisi pada tiap tahap?</h2>
      <p className="mt-3 max-w-3xl leading-7">Tahap ini menyusun rencana dan harga. Belum ada tutor yang dipesan hanya karena kolom telah lengkap.</p>
      <div className="mt-7 border-t border-stone-300">{stages.map(({ title, Icon, question, text }) => <article key={title} className="grid gap-5 border-b border-stone-300 py-7 sm:grid-cols-[3.5rem_1fr]"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50"><Icon className="text-teal-700" size={25} /></span><div><p className="text-xs font-black uppercase tracking-[.16em] text-orange-700">{title}</p><h3 className="mt-2 text-xl font-extrabold text-[#14213D]">{question}</h3><p className="mt-3 leading-8 text-slate-700">{text}</p></div></article>)}</div>
      <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm leading-6 text-orange-950"><strong>Contoh:</strong> Empat sesi dapat dibagi menjadi dua Matematika dan dua IPA. Ringkasan menampilkan masing-masing jadwal dan total yang harus dibayar, bukan sekadar nama paket.</div>
    </section>

    <section id="pesan-setelah" className="scroll-mt-28 pt-16">
      <p className="text-xs font-black uppercase tracking-[.16em] text-teal-700">Setelah menekan konfirmasi</p>
      <h2 className="mt-3 text-3xl font-extrabold text-[#14213D]">Empat status ini tidak berarti hal yang sama.</h2>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5"><div className="flex items-center gap-3"><GuideNumber value={7} /><h3 className="text-lg font-extrabold text-[#14213D]">Pesanan tersimpan</h3></div><p className="mt-3 text-sm leading-6">Rencana tercatat. Tamu mendapat kode pesanan; masuk atau daftar dengan email yang sama untuk menghubungkannya. <strong>Belum ada tutor yang dicari.</strong></p></div>
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5"><div className="flex items-center gap-3"><GuideNumber value={8} /><h3 className="text-lg font-extrabold text-[#14213D]">Menunggu pembayaran</h3></div><p className="mt-3 text-sm leading-6">Periksa nominal dan tenggat pada tagihan. Jika checkout tertutup, kembali ke pesanan yang sama; sistem menggunakan satu sesi pembayaran aktif agar percobaan ulang tidak membuat tagihan ganda.</p></div>
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5"><div className="flex items-center gap-3"><GuideNumber value={9} /><h3 className="text-lg font-extrabold text-[#14213D]">Pembayaran diterima → mencari tutor</h3></div><p className="mt-3 text-sm leading-6">Setelah pembayaran terverifikasi, sistem menawarkan kebutuhan kepada tutor yang sesuai mapel, jenjang, mode, jadwal, dan area khusus tatap muka. Untuk paket multi-mapel, status tiap mapel dapat berbeda.</p></div>
        <div className="rounded-2xl border border-stone-200 bg-[#14213D] p-5 text-white"><div className="flex items-center gap-3"><GuideNumber value={10} /><h3 className="text-lg font-extrabold">Kelas terbentuk</h3></div><p className="mt-3 text-sm leading-6 text-slate-200">Saat tutor menerima dan jadwal cocok, buka <strong className="text-white">Kelas Saya</strong> untuk melihat kelas, jadwal, dan aktivitas sesi. Link online diisi setelah kelas terbentuk; tatap muka memakai lokasi yang sudah dipilih.</p></div>
      </div>
      <div className="mt-5 rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6"><div className="flex items-center gap-3"><CircleHelp className="text-amber-700" size={25} /><h3 className="text-xl font-extrabold text-[#14213D]">Kalau tutor belum ditemukan?</h3></div><p className="mt-3 leading-7">Buka <strong>Proses Pesanan</strong>, bukan buat pesanan baru. Tergantung status, kamu dapat memilih Cari lagi, Ubah jadwal, perluas radius untuk tatap muka, atau batalkan dan ikuti pengembalian dana. Jika sebagian mapel sudah mendapat tutor, status mapel siap dan yang masih menunggu ditampilkan terpisah.</p><div className="mt-5 flex flex-wrap gap-3"><Link to="/cara-belajar/sistem-matching-tutor" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-extrabold text-amber-950">Pahami matching <ArrowRight size={16} /></Link><Link to="/cara-belajar/pembayaran-dan-refund" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-300 px-4 text-sm font-extrabold text-amber-950">Pahami refund <ArrowRight size={16} /></Link></div></div>
    </section>
  </>;
}

function OnlineGuide() {
  const number = (value: number) => <GuideNumber value={value} />;
  return <>
    <nav aria-label="Isi panduan privat online" className="rounded-3xl border border-stone-200 bg-[#F7F1E8] p-5 sm:p-7">
      <p className="text-xs font-black uppercase tracking-[.16em] text-orange-700">Panduan privat online</p>
      <h2 className="mt-2 text-2xl font-extrabold text-[#14213D]">Cari jawaban sesuai tahapmu</h2>
      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <a href="#online-sebelum" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#14213D] hover:text-orange-700">Sebelum pesan</a>
        <a href="#online-biaya" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#14213D] hover:text-orange-700">Biaya dan akun</a>
        <a href="#online-setelah" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#14213D] hover:text-orange-700">Setelah membayar</a>
      </div>
    </nav>

    <section id="online-sebelum" className="scroll-mt-28 pt-14">
      <p className="text-xs font-black uppercase tracking-[.16em] text-teal-700">Sebelum memesan</p>
      <h2 className="mt-3 text-3xl font-extrabold text-[#14213D]">Pastikan format kelasnya memang cocok.</h2>
      <div className="mt-8 grid gap-x-12 md:grid-cols-2">
        <article className="border-t-2 border-teal-600 py-7">
          <MonitorPlay className="text-teal-700" size={27} />
          <h3 className="mt-4 text-xl font-extrabold text-[#14213D]">Belajar dari rumah, tanpa radius pencarian.</h3>
          <p className="mt-3 leading-8">Siapkan perangkat yang bisa membuka ruang pertemuan, internet stabil, dan tempat cukup tenang. Tutor online dicocokkan menurut mapel dan waktu, <strong>bukan jarak rumah</strong>. Jika siswa butuh pendampingan fisik atau koneksi sering terputus, pertimbangkan privat tatap muka.</p>
        </article>
        <article className="border-t-2 border-orange-500 py-7">
          <UsersRound className="text-orange-600" size={27} />
          <h3 className="mt-4 text-xl font-extrabold text-[#14213D]">Pilih jumlah peserta sesuai cara belajarnya.</h3>
          <p className="mt-3 leading-8"><strong>Privat sendiri</strong> untuk satu siswa. <strong>Privat bersama teman</strong> memakai satu pesanan dan satu rencana kelas, jika pilihan peserta serta tabel harganya tersedia. <strong>Kelas Bersama</strong> berbeda: jadwal dan kuotanya sudah ditetapkan.</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">Untuk privat bersama teman, peserta yang masuk dengan kode kelas tetap memerlukan persetujuan pemesan.</p>
        </article>
        <article className="border-t border-stone-300 py-7">
          <BookOpenCheck className="text-teal-700" size={27} />
          <h3 className="mt-4 text-xl font-extrabold text-[#14213D]">Mapel untuk kebutuhan spesifik, program untuk target belajar.</h3>
          <p className="mt-3 leading-8">Pilih <strong>mapel</strong> untuk kebutuhan seperti Matematika. Pilih <strong>program</strong> untuk tujuan seperti persiapan ujian, lalu tentukan mapel di dalamnya. Tulis target atau materi yang masih sulit dengan bahasamu sendiri. Tidak perlu memilih Bab dari katalog; target khusus pada program persiapan bersifat opsional. Beberapa mapel dapat membutuhkan tutor yang berbeda.</p>
        </article>
        <article className="border-t border-stone-300 py-7">
          <CalendarCheck className="text-orange-700" size={27} />
          <h3 className="mt-4 text-xl font-extrabold text-[#14213D]">Jadwal disusun sebelum pembayaran.</h3>
          <p className="mt-3 leading-8">Pilih jumlah sesi, durasi, hari, tanggal mulai, dan jam yang dapat dijalankan siswa. Ringkasan menunjukkan rencana pertemuan sebelum pesanan dikirim. Jadwal ini masih <strong>permintaan belajar</strong>, belum berarti tutor menerimanya.</p>
        </article>
      </div>
    </section>

    <section id="online-biaya" className="scroll-mt-28 pt-16">
      <p className="text-xs font-black uppercase tracking-[.16em] text-orange-700">Saat memesan</p>
      <h2 className="mt-3 text-3xl font-extrabold text-[#14213D]">Periksa biaya, lalu hubungkan pesananmu.</h2>
      <div className="mt-8 grid gap-8 border-t border-stone-300 pt-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article>
          <CreditCard className="text-teal-700" size={27} />
          <h3 className="mt-4 text-xl font-extrabold text-[#14213D]">Harga akhir ada di ringkasan pesanan.</h3>
          <p className="mt-3 leading-8">Harga mengikuti paket, sesi, durasi, jumlah peserta, dan diskon aktif. Jika tabel harga privat bersama teman belum lengkap, pilihan itu belum dibuka. Periksa peserta, sesi, durasi, potongan, dan <strong>total tagihan yang tampil sebelum membayar</strong>; jangan memakai perkiraan dari halaman ini.</p>
        </article>
        <article>
          <ShieldCheck className="text-orange-700" size={27} />
          <h3 className="mt-4 text-xl font-extrabold text-[#14213D]">Pesanan tamu terhubung melalui email yang sama.</h3>
          <p className="mt-3 leading-8">Kamu boleh mulai tanpa login. Masuk atau daftar memakai <strong>email yang diisi pada pesanan</strong> agar pesanan muncul di akunmu. Setelah ringkasan diperiksa, selesaikan pembayaran. Pencarian tutor baru dimulai saat pembayaran terverifikasi. Jika checkout tertutup, lanjutkan pesanan yang sama—tidak perlu membuat pesanan baru.</p>
        </article>
      </div>
    </section>

    <section id="online-setelah" className="scroll-mt-28 pt-16">
      <p className="text-xs font-black uppercase tracking-[.16em] text-teal-700">Setelah pembayaran</p>
      <h2 className="mt-3 text-3xl font-extrabold text-[#14213D]">Tahu harus melihat apa, dan bertindak di mana.</h2>
      <div className="mt-7 overflow-hidden rounded-[1.75rem] border border-stone-200">
        <div className="grid gap-5 bg-teal-50 p-6 sm:grid-cols-[3rem_1fr] sm:p-7">
          {number(7)}<div><h3 className="text-xl font-extrabold text-[#14213D]">Bagaimana tutor ditemukan?</h3><p className="mt-2 leading-7">Status pencarian ada di <strong>Proses Pesanan</strong>. Sistem menyaring tutor aktif menurut mapel, jenjang, mode online, dan ketersediaan jadwal—tanpa radius lokasi. Untuk program multi-mapel, lihat status tiap mapel; dua tutor bisa siap sementara satu mapel masih mencari tutor.</p></div>
        </div>
        <div className="grid gap-5 bg-white p-6 sm:grid-cols-[3rem_1fr] sm:p-7">
          {number(8)}<div><h3 className="text-xl font-extrabold text-[#14213D]">Di mana tautan kelas dan catatan belajar?</h3><p className="mt-2 leading-7">Setelah tutor cocok dan kelas terbentuk, buka <strong>Kelas Saya</strong> untuk melihat jadwal. Tutor menyiapkan tautan Google Meet/Zoom pada detail sesi; tautan itu tidak muncul saat pesanan masih mencari tutor. Gunakan tautan hanya untuk peserta kelas. Kehadiran dan progress sesi dicatat di kelas setelah pertemuan.</p></div>
        </div>
        <div className="grid gap-5 bg-orange-50 p-6 sm:grid-cols-[3rem_1fr] sm:p-7">
          {number(9)}<div><h3 className="text-xl font-extrabold text-[#14213D]">Kalau tutor belum ketemu atau koneksi terputus?</h3><p className="mt-2 leading-7">Jika tutor belum ditemukan, buka tindakan pada <strong>Proses Pesanan</strong>: <strong>Cari lagi</strong>, <strong>Ubah jadwal</strong>, atau batalkan dan ikuti alur refund yang tersedia. Tutor yang sudah siap dan mapel yang masih menunggu ditampilkan terpisah. Jika sesi sedang berjalan lalu koneksi bermasalah, coba masuk lagi, beri tahu tutor, dan laporkan gangguan melalui bantuan agar riwayatnya bisa diperiksa.</p></div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3"><Link to="/cara-belajar/sistem-matching-tutor" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-teal-200 px-4 text-sm font-extrabold text-teal-900 hover:bg-teal-50"><Radar size={17} /> Detail matching</Link><Link to="/cara-belajar/pembayaran-dan-refund" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-200 px-4 text-sm font-extrabold text-orange-900 hover:bg-orange-50"><CircleHelp size={17} /> Pembayaran dan refund</Link></div>
    </section>
    <aside className="mt-12 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><Wifi className="mt-0.5 shrink-0" size={19} /><p><strong>Catatan realistis:</strong> perangkat, koneksi, dan waktu yang cocok tetap memengaruhi pengalaman kelas online. BimbelKu tidak menjanjikan tutor atau tautan kelas sebelum proses matching selesai.</p></aside>
  </>;
}

function GuideClosing({ guide, slug }: { guide: Guide; slug: string }) {
  return <><section className="mt-14"><h2 className="text-3xl font-extrabold text-[#14213D]">Pertanyaan khusus halaman ini</h2><div className="mt-5 space-y-3">{guide.faqs.map((faq) => <details key={faq.question} className="rounded-2xl border border-stone-200 p-5"><summary className="cursor-pointer font-extrabold text-[#14213D]">{faq.question}</summary><p className="mt-3 leading-7">{faq.answer}</p></details>)}</div></section><div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6 text-sm"><p>Tim BimbelKu · bersumber dari alur produk dan kebijakan aktif · diperbarui {slug === "kelas-bersama" ? "30" : ["privat-online", "privat-tatap-muka", "cara-pemesanan", "sistem-matching-tutor", "pembayaran-dan-refund"].includes(slug) ? "29" : "27"} September 2026.</p><Link to={guide.cta.to} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-600 px-5 font-extrabold text-white">{guide.cta.label}<ArrowRight size={17} /></Link></div><section className="mt-10"><h2 className="text-xl font-extrabold text-[#14213D]">Bacaan terkait</h2><div className="mt-4 flex flex-wrap gap-3">{guide.related.filter((related) => related !== slug).map((related) => <Link key={related} to={`/cara-belajar/${related}`} className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-bold text-[#14213D] hover:border-orange-400">{pages[related as keyof typeof pages].eyebrow}</Link>)}</div></section></>;
}

function Overview() {
  return <>
    <SeoHead title="Panduan Belajar dan Pemesanan | BimbelKu" description="Pelajari pilihan layanan, cara pemesanan, pembayaran, refund, dan sistem matching tutor BimbelKu." canonicalPath="/cara-belajar" />
    <Shell>
      <section className="relative overflow-hidden bg-[#F7F1E8] py-16 sm:py-20">
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full border-8 border-teal-100/70" />
        <div className="relative mx-auto grid max-w-[1100px] gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-orange-700">Cara belajar di BimbelKu</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-[#14213D] sm:text-5xl">Pahami perjalanan belajarnya sebelum memesan.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Pilih layanan, siapkan kebutuhan, periksa biaya, lalu ikuti pencarian tutor. Setiap tahap memiliki penjelasan dan batas yang berbeda.</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["Pilihan layanan", "Form dan harga", "Matching tutor", "Pembayaran dan refund"].map((item) => <span key={item} className="rounded-full border border-stone-300 bg-white/75 px-4 py-2 text-sm font-bold text-slate-700">{item}</span>)}
            </div>
          </div>
          <aside className="rounded-[2rem] bg-[#14213D] p-7 text-white shadow-xl shadow-slate-900/10">
            <p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Alur ringkas</p>
            <ol className="mt-5 space-y-4">
              {steps.map((step) => <li key={step.title} className="border-t border-white/20 py-3"><strong className="block text-sm text-orange-100">{step.title}</strong><span className="mt-1 block text-xs leading-5 text-slate-300">{step.text}</span></li>)}
            </ol>
          </aside>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1100px] space-y-14 px-5 sm:px-8">
          {guideGroups.map((group, groupIndex) => (
            <div key={group.eyebrow} className="grid gap-6 lg:grid-cols-[300px_1fr]">
              <div className="lg:pt-3">
                <p className="text-xs font-black uppercase tracking-[.18em] text-orange-700">0{groupIndex + 1} · {group.eyebrow}</p>
                <h2 className="mt-3 text-2xl font-extrabold text-[#14213D]">{group.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{group.description}</p>
              </div>
              <div className="divide-y divide-stone-200 border-y border-stone-200">
                {group.slugs.map((itemSlug) => { const item = pages[itemSlug]; const Icon = item.icon; return (
                  <Link key={itemSlug} to={`/cara-belajar/${itemSlug}`} className="group grid gap-4 py-6 transition hover:bg-orange-50/60 sm:grid-cols-[3rem_1fr_auto] sm:items-center sm:px-4">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-orange-100 text-orange-700"><Icon size={21} /></span>
                    <span><span className="block text-xl font-extrabold text-[#14213D]">{item.eyebrow}</span><span className="mt-2 block text-sm leading-6 text-slate-600">{item.intro}</span></span>
                    <span className="inline-flex items-center gap-2 text-sm font-extrabold text-orange-700">Pelajari <ArrowRight size={18} className="transition group-hover:translate-x-1" /></span>
                  </Link>
                ); })}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Detail points={["Pesanan bisa dimulai tanpa login", "Harga tampil sebelum pembayaran", "Matching berjalan setelah pembayaran diverifikasi"]} />
    </Shell>
  </>;
}

function Detail({ points }: { points: string[] }) {
  return <><section className="bg-white py-16 sm:py-20"><div className="mx-auto max-w-[1100px] px-5 sm:px-8"><div className="grid gap-4 md:grid-cols-3">{points.map((point) => <p key={point} className="flex gap-3 rounded-3xl border border-stone-200 bg-[#FFFBF7] p-5 text-sm font-bold leading-6 text-slate-700"><CheckCircle2 className="mt-0.5 shrink-0 text-teal-700" size={19} />{point}</p>)}</div><div className="mt-16 grid gap-8 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-700">Perjalanan belajar</p><h2 className="mt-3 text-3xl font-extrabold text-[#14213D]">Alur yang sama dari depan sampai kelas terbentuk.</h2><p className="mt-5 leading-7 text-slate-600">Kebutuhan dan biaya terlihat lebih dulu. Setelah pembayaran terverifikasi, sistem baru mencari tutor yang sesuai, lalu kelas dan jadwalnya dapat diikuti dari akun murid.</p></div><div className="border-t border-stone-200">{steps.map((step) => { const Icon = step.icon; return <article key={step.title} className="flex gap-5 border-b border-stone-200 py-6"><Icon className="mt-1 shrink-0 text-orange-700" size={26} /><div><h3 className="text-xl font-extrabold text-[#14213D]">{step.title}</h3><p className="mt-2 leading-7 text-slate-600">{step.text}</p></div></article>; })}</div></div></div></section><section className="bg-orange-600 py-14 text-white"><div className="mx-auto flex max-w-[1100px] flex-col gap-5 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-3xl font-extrabold">Sudah siap menentukan kebutuhan?</h2><p className="mt-2 text-orange-50">Form terdiri dari empat tahap dan menunjukkan data yang harus dilengkapi pada tahapnya.</p></div><StudentPackageLink to="/student/packages/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#14213D] px-6 text-sm font-extrabold text-white">Susun paket <ArrowRight size={17} /></StudentPackageLink></div></section></>;
}

function Shell({ children }: { children: ReactNode }) { const motionRef = usePublicSectionMotion(); return <div className="public-site min-h-screen bg-white"><Navbar /><main ref={motionRef}>{children}</main><Footer /></div>; }

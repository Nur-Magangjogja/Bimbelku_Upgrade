import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import SeoHead from "@/components/SeoHead";

const privatePath = /^(?:\/admin(?:\/|$)|\/guru(?:\/|$)|\/student(?:\/|$)|\/payment(?:-preview)?$|\/pesanan\/|\/pesan$|\/login$|\/register$|\/forgot-password$|\/reset-password$|\/verify-email$|\/oauth\/|\/complete-profile$|\/access-denied$)/;

const publicMeta: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Bimbel Privat SD, SMP & SMA di Yogyakarta | BimbelKu",
    description: "Bimbel privat online dan tatap muka untuk SD, SMP, dan SMA di Yogyakarta. Pilih mapel, jelaskan target, jadwal, serta mode belajar sebelum memesan tutor.",
  },
  "/program": {
    title: "Program Bimbel dan Les Privat SD–SMA | BimbelKu",
    description: "Jelajahi program bimbel dan les privat SD, SMP, serta SMA. Buka profil mapel, materi, jenjang, tutor, dan pilihan belajar yang tersedia.",
  },
  "/tutor": {
    title: "Tutor Bimbel Terverifikasi Berdasarkan Bidang | BimbelKu",
    description: "Kenali tutor BimbelKu yang telah melalui pemeriksaan, memberikan izin tampil, dan disetujui admin, dikelompokkan berdasarkan bidang mapel.",
  },
  "/area-layanan": {
    title: "Area Layanan Bimbel Online dan Tatap Muka | BimbelKu",
    description: "Pelajari cakupan belajar online dan cara ketersediaan tutor tatap muka diperiksa berdasarkan alamat, mapel, dan jadwal.",
  },
  "/seleksi-tutor": {
    title: "Bagaimana Tutor BimbelKu Diseleksi | BimbelKu",
    description: "Lihat proses dokumen, tes WhatsApp, persetujuan admin, dan cara tutor dicocokkan dengan kebutuhan belajar murid.",
  },
  "/testimonials": {
    title: "Cerita dan Ulasan Siswa BimbelKu",
    description: "Baca cerita belajar dan ulasan siswa yang dipublikasikan setelah persetujuan serta pemeriksaan admin BimbelKu.",
  },
  "/cara-belajar": {
    title: "Cara Belajar Privat Online dan Tatap Muka | BimbelKu",
    description: "Pahami alur bimbel privat BimbelKu, mulai dari memilih kebutuhan, pembayaran otomatis, pencarian tutor, jadwal, sampai laporan perkembangan.",
  },
  "/why-us": {
    title: "Apa Itu BimbelKu? Cara Belajar, Tutor, dan Pemesanan",
    description: "Kenali BimbelKu lewat 10 jawaban sederhana: siapa yang belajar, pilihan privat atau kelas bersama, cara memilih pelajaran, biaya, tutor, dan jadwal kelas.",
  },
  "/jadi-tutor": {
    title: "Daftar Tutor BimbelKu | Seleksi melalui WhatsApp",
    description: "Pelajari proses pendaftaran dan seleksi tutor BimbelKu. Kandidat tutor menjalani pemeriksaan data dan tes yang dikoordinasikan melalui WhatsApp.",
  },
  "/privacy": { title: "Kebijakan Privasi | BimbelKu", description: "Kebijakan pengelolaan dan perlindungan data pengguna BimbelKu." },
  "/terms": { title: "Syarat dan Ketentuan | BimbelKu", description: "Syarat penggunaan layanan, pemesanan, pembayaran, kelas, dan akun BimbelKu." },
};

const learningLabels: Record<string, string> = {
  "panduan-memilih-program": "Panduan Memilih Program Bimbel",
  "cara-pemesanan": "Cara Memesan Bimbel",
  "sistem-matching-tutor": "Sistem Matching Tutor",
  "pembayaran-dan-refund": "Pembayaran dan Refund",
  "privat-tatap-muka": "Les Privat Tatap Muka",
  "privat-online": "Les Privat Online",
};

export default function RouteSeoManager() {
  const { pathname } = useLocation();
  const metadata = useMemo(() => {
    // These pages provide CMS-aware metadata and structured data themselves.
    if (pathname === "/" || pathname === "/program" || pathname.startsWith("/program/")) return null;
    if (privatePath.test(pathname)) {
      return {
        title: "BimbelKu",
        description: "Halaman akun dan operasional BimbelKu.",
        robots: "noindex,nofollow,noarchive",
      };
    }
    if (pathname.startsWith("/cara-belajar/")) {
      const slug = pathname.split("/").filter(Boolean).at(-1) || "";
      const label = learningLabels[slug] || "Sistem Belajar";
      return {
        title: `${label} | BimbelKu`,
        description: `Pelajari ${label.toLowerCase()} di BimbelKu, termasuk pemesanan, pembayaran, jadwal, dan pencarian tutor.`,
      };
    }
    return publicMeta[pathname] || {
      title: "Halaman Tidak Ditemukan | BimbelKu",
      description: "Halaman yang dicari tidak tersedia di BimbelKu.",
      robots: "noindex,follow",
    };
  }, [pathname]);

  return metadata ? <SeoHead canonicalPath={pathname} {...metadata} /> : null;
}

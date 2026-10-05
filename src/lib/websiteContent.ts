export type WebsiteNavigationItem = {
  key: string;
  label: string;
  url: string;
  is_visible?: boolean;
};

export type WebsiteSectionContent = {
  secondary_cta_label?: string;
  trust_points?: string[];
  status_pending?: string;
  status_found?: string;
  search_placeholder?: string;
  trust_media_titles?: string[];
  trust_media_notes?: string[];
};

export type WebsiteSection = {
  id: number;
  section_key: string;
  label: string;
  eyebrow: string | null;
  title: string | null;
  description: string | null;
  content: WebsiteSectionContent | null;
  is_visible: boolean;
  order_locked: boolean;
  sort_order: number;
};

export type WebsiteTrustItem = {
  id: number;
  title: string;
  display_value: string | null;
  resolved_value: string | null;
  description: string | null;
  icon_key: string | null;
  source_type: "system" | "manual" | "commitment";
  source_key: "active_programs" | "verified_tutors" | "completed_sessions" | "average_rating" | "service_area" | null;
  source_updated_at: string | null;
  is_visible: boolean;
  sort_order: number;
};

export type WebsiteSettings = {
  brand_name: string;
  brand_description: string | null;
  information_bar_enabled: boolean;
  information_bar_text: string | null;
  navigation_items: WebsiteNavigationItem[];
  primary_cta_label: string;
  primary_cta_url: string;
  whatsapp_enabled: boolean;
  whatsapp_number: string | null;
  whatsapp_label: string;
  whatsapp_hours: string | null;
  whatsapp_default_message: string | null;
  contact_email: string | null;
  office_address: string | null;
  google_maps_url: string | null;
  animations_enabled: boolean;
  logo_url: string | null;
  logo_light_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  social_share_image_url: string | null;
  hero_desktop_image_url: string | null;
  hero_mobile_image_url: string | null;
  trust_image_1_url: string | null;
  trust_image_2_url: string | null;
  trust_image_3_url: string | null;
  trust_image_4_url: string | null;
  trust_image_5_url: string | null;
  trust_image_6_url: string | null;
  theme: {
    name: string;
    primary: string;
    primary_button: string;
    primary_hover: string;
    cream: string;
    heading: string;
  };
};

export type WebsiteTestimonial = {
  id: number;
  rating_id: number | null;
  display_name: string;
  audience_role: string | null;
  quote: string;
  program_name: string | null;
  outcome: string | null;
  institution: string | null;
  major: string | null;
  achievement_year: number | null;
  photo_url: string | null;
  rating: number | null;
  is_verified: boolean;
  consent_at: string | null;
  verified_at: string | null;
  verified_by_name: string | null;
  is_featured: boolean;
  is_visible: boolean;
  sort_order: number;
  created_at: string | null;
};
export type WebsiteContentPayload = {
  settings: WebsiteSettings;
  sections: WebsiteSection[];
  trust_items: WebsiteTrustItem[];
  rating_summary: WebsiteRatingSummary | null;
  testimonials: WebsiteTestimonial[];
};

export type WebsiteRatingSummary = {
  average: number;
  count: number;
  distribution: Record<string, number>;
};

export const defaultWebsiteContent: WebsiteContentPayload = {
  settings: {
    brand_name: "BimbelKu",
    brand_description: "Bimbingan belajar SD–SMA di Yogyakarta dengan pilihan belajar online dan offline.",
    information_bar_enabled: true,
    information_bar_text: "Melayani Yogyakarta · Online & Offline",
    navigation_items: [
      { key: "programs", label: "Program", url: "/program" },
      { key: "how-it-works", label: "Cara Kerja", url: "/#cara-kerja" },
      { key: "tutors", label: "Tutor", url: "/#tutor" },
      { key: "pricing", label: "Harga", url: "/#paket" },
      { key: "help", label: "Bantuan", url: "/#faq" },
    ],
    primary_cta_label: "Cari Bimbingan",
    primary_cta_url: "/student/packages/new",
    whatsapp_enabled: false,
    whatsapp_number: null,
    whatsapp_label: "Konsultasi WhatsApp",
    whatsapp_hours: "Senin–Sabtu, 08.00–20.00 WIB",
    whatsapp_default_message: "Halo BimbelKu, saya ingin berkonsultasi mengenai program belajar.",
    contact_email: "info@bimbelku.com",
    office_address: "Yogyakarta, Indonesia",
    google_maps_url: null,
    animations_enabled: true,
    logo_url: null,
    logo_light_url: null,
    logo_dark_url: null,
    favicon_url: null,
    social_share_image_url: null,
    hero_desktop_image_url: null,
    hero_mobile_image_url: null,
    trust_image_1_url: null,
    trust_image_2_url: null,
    trust_image_3_url: null,
    trust_image_4_url: null,
    trust_image_5_url: null,
    trust_image_6_url: null,
    theme: {
      name: "warm-clear-trusted",
      primary: "#F97316",
      primary_button: "#C2410C",
      primary_hover: "#9A3412",
      cream: "#FFFBF7",
      heading: "#14213D",
    },
  },
  sections: [
    {
      id: 0,
      section_key: "hero",
      label: "Hero",
      eyebrow: "Bimbel privat SD–SMA di Yogyakarta",
      title: "Bimbel privat yang dimulai dari kebutuhan belajar anak.",
      description: "Pilih mata pelajaran, jelaskan target belajar, jadwal, serta mode online atau tatap muka. Harga terlihat sejak awal, lalu pencarian tutor dimulai setelah pembayaran terverifikasi.",
      content: {
        secondary_cta_label: "Konsultasi WhatsApp",
        trust_points: ["Harga terlihat sebelum membayar", "Tutor diperiksa admin", "Progress tercatat"],
        status_pending: "Memeriksa jadwal",
        status_found: "Tutor ditemukan",
      },
      is_visible: true,
      order_locked: true,
      sort_order: 0,
    },
    {
      id: 0,
      section_key: "trust",
      label: "Bukti kepercayaan",
      eyebrow: "Dapat diperiksa, bukan sekadar dipercaya",
      title: "Kepercayaan dibangun dari sistem yang jelas.",
      description: "Setiap angka berasal dari sistem atau dilengkapi catatan sumber dan tanggal pembaruan.",
      content: {
        trust_media_titles: ["Tutor pendamping", "Tutor mata pelajaran", "Tutor sesuai jenjang", "Tutor SD", "Tutor SMP", "Tutor SMA"],
        trust_media_notes: [
          "Foto tutor yang sudah memberi persetujuan publik.",
          "Dokumentasi profil yang aman untuk ditampilkan.",
          "Identitas sensitif tetap tidak dipublikasikan.",
          "Pendamping belajar sesuai kebutuhan siswa.",
          "Profil aktif yang telah diperiksa admin.",
          "Bidang ajar ditampilkan tanpa data pribadi.",
        ],
      },
      is_visible: true,
      order_locked: true,
      sort_order: 1,
    },
    {
      id: 0,
      section_key: "programs",
      label: "Program",
      eyebrow: "Program unggulan",
      title: "Program yang paling dibutuhkan siswa.",
      description: "Cari mata pelajaran berdasarkan jenjang, lalu lanjutkan kebutuhanmu ke penyusunan paket.",
      content: { search_placeholder: "Cari Matematika, Bahasa Inggris, Fisika..." },
      is_visible: true,
      order_locked: false,
      sort_order: 2,
    },
    {
      id: 0,
      section_key: "how_it_works",
      label: "Cara kerja",
      eyebrow: "Dari kebutuhan sampai kelas pertama",
      title: "Empat langkah yang jelas, tanpa kejutan di tengah.",
      description: "Harga dan jadwal dipilih lebih dulu. Pencarian tutor dimulai setelah pembayaran terverifikasi.",
      content: null,
      is_visible: true,
      order_locked: true,
      sort_order: 3,
    },
    {
      id: 0,
      section_key: "proof",
      label: "Bukti sistem",
      eyebrow: "Bukti di dalam produk",
      title: "Yang dijanjikan di depan, terlihat lagi di dashboard.",
      description: "Lihat contoh bagaimana verifikasi, matching, jadwal, dan laporan bekerja di sistem BimbelKu.",
      content: null,
      is_visible: true,
      order_locked: false,
      sort_order: 4,
    },
    {
      id: 0,
      section_key: "tutors",
      label: "Tutor pilihan",
      eyebrow: "Kenali tutor BimbelKu",
      title: "Tutor yang siap mendampingi proses belajarmu.",
      description: "Galeri hanya memuat tutor yang telah diverifikasi dan memberikan izin untuk ditampilkan.",
      content: null,
      is_visible: true,
      order_locked: false,
      sort_order: 5,
    },
    {
      id: 0,
      section_key: "pricing",
      label: "Paket dan harga",
      eyebrow: "Paket belajar",
      title: "Pilih ritme belajar, lalu lihat harga finalnya.",
      description: "Jumlah sesi dan masa aktif berasal dari paket yang benar-benar tersedia di sistem.",
      content: null,
      is_visible: true,
      order_locked: false,
      sort_order: 7,
    },
    {
      id: 0,
      section_key: "progress",
      label: "Dashboard dan progress",
      eyebrow: "Progress yang mudah dibaca",
      title: "Orang tua tahu apa yang dipelajari, siswa tahu apa berikutnya.",
      description: "Target dan hasil belajar tersusun per paket, dengan laporan tutor setiap sesi.",
      content: null,
      is_visible: true,
      order_locked: false,
      sort_order: 8,
    },
    {
      id: 0,
      section_key: "reviews",
      label: "Ulasan",
      eyebrow: "Cerita dari proses belajar",
      title: "Testimoni punya ruang sendiri, agar mudah dibaca.",
      description: "Ulasan nyata akan ditampilkan setelah terhubung ke rating kelas dan memperoleh persetujuan publik.",
      content: null,
      is_visible: true,
      order_locked: false,
      sort_order: 6,
    },
    {
      id: 0,
      section_key: "areas",
      label: "Area layanan",
      eyebrow: "Area layanan",
      title: "Belajar online dari mana saja, atau tatap muka di Yogyakarta.",
      description: "Ketersediaan tutor tatap muka tetap mengikuti alamat, jarak, mapel, dan jadwal yang dipilih.",
      content: null,
      is_visible: true,
      order_locked: false,
      sort_order: 9,
    },
    {
      id: 0,
      section_key: "faq",
      label: "FAQ",
      eyebrow: "Sebelum kamu memesan",
      title: "Pertanyaan penting, dijawab tanpa disembunyikan.",
      description: "Termasuk urutan pembayaran, proses matching, serta pilihan ketika tutor belum ditemukan.",
      content: null,
      is_visible: true,
      order_locked: false,
      sort_order: 10,
    },
    {
      id: 0,
      section_key: "final_cta",
      label: "CTA akhir",
      eyebrow: "Mulai dari kebutuhanmu",
      title: "Belajar lebih terarah dimulai dari kebutuhan yang jelas.",
      description: "Pilih program sendiri atau konsultasikan kebutuhan belajar terlebih dahulu bersama BimbelKu.",
      content: { secondary_cta_label: "Konsultasi WhatsApp" },
      is_visible: true,
      order_locked: false,
      sort_order: 11,
    },
  ],
  trust_items: [
    { id: 0, title: "Program belajar aktif", display_value: null, resolved_value: null, description: "Pilihan mata pelajaran aktif yang tersedia di katalog BimbelKu.", icon_key: "book-open-check", source_type: "system", source_key: "active_programs", source_updated_at: null, is_visible: true, sort_order: 0 },
    { id: 0, title: "Tutor diperiksa admin", display_value: null, resolved_value: null, description: "Profil tutor aktif melalui pemeriksaan admin.", icon_key: "shield-check", source_type: "commitment", source_key: null, source_updated_at: null, is_visible: true, sort_order: 1 },
    { id: 0, title: "Harga terlihat sebelum membayar", display_value: null, resolved_value: null, description: "Ringkasan biaya ditampilkan sebelum transaksi dibuat.", icon_key: "receipt", source_type: "commitment", source_key: null, source_updated_at: null, is_visible: true, sort_order: 2 },
    { id: 0, title: "Jadwal dipilih sejak awal", display_value: null, resolved_value: null, description: "Kebutuhan waktu belajar ditentukan saat menyusun paket.", icon_key: "calendar-check", source_type: "commitment", source_key: null, source_updated_at: null, is_visible: true, sort_order: 3 },
    { id: 0, title: "Progress tercatat setiap sesi", display_value: null, resolved_value: null, description: "Target belajar dan laporan sesi tersimpan dalam riwayat belajar.", icon_key: "chart-no-axes-column-increasing", source_type: "commitment", source_key: null, source_updated_at: null, is_visible: true, sort_order: 4 },
  ],
  rating_summary: null,
  testimonials: [],
};

export const normalizeWhatsappNumber = (value: string | null | undefined) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
};

export const whatsappHref = (
  number: string | null | undefined,
  message: string | null | undefined,
) => {
  const normalized = normalizeWhatsappNumber(number);
  if (normalized.length < 8) return null;
  const query = message?.trim() ? `?text=${encodeURIComponent(message.trim())}` : "";
  return `https://wa.me/${normalized}${query}`;
};

export const whatsappMessageForPath = (pathname: string, fallback?: string | null) => {
  if (pathname.startsWith("/program/")) {
    const program = decodeURIComponent(pathname.split("/").filter(Boolean).at(-1) || "program ini").replace(/-/g, " ");
    return `Halo BimbelKu, saya ingin bertanya tentang program ${program}.`;
  }
  if (pathname === "/program") return "Halo BimbelKu, saya ingin dibantu memilih program belajar.";
  if (pathname === "/cara-belajar/privat-tatap-muka") return "Halo BimbelKu, saya ingin mengecek area layanan privat tatap muka.";
  if (pathname === "/cara-belajar/privat-online") return "Halo BimbelKu, saya ingin berkonsultasi tentang kelas privat online.";
  if (pathname === "/jadi-tutor") return "Halo BimbelKu, saya ingin bertanya tentang proses pendaftaran tutor.";
  if (pathname === "/tutor") return "Halo BimbelKu, saya ingin dibantu memilih tutor yang sesuai.";
  if (pathname.startsWith("/cara-belajar/")) return "Halo BimbelKu, saya ingin bertanya tentang alur belajar dan pemesanan.";
  return fallback?.trim() || "Halo BimbelKu, saya ingin berkonsultasi mengenai kebutuhan belajar.";
};

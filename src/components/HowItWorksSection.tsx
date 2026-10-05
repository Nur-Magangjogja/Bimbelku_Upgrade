import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpenCheck, CreditCard, Radar, SlidersHorizontal, type LucideIcon } from "lucide-react";

import StudentPackageLink from "@/components/StudentPackageLink";
import { useWebsiteContent } from "@/components/WebsiteContentProvider";

type Step = {
  icon: LucideIcon;
  title: string;
  short: string;
  description: string;
  detail: string[];
  accent: string;
};

const steps: Step[] = [
  {
    icon: SlidersHorizontal,
    title: "Susun kebutuhan",
    short: "Mapel, target, mode, dan jadwal",
    description: "Pilih kebutuhan belajar sedetail yang kamu tahu. Semua pilihan tetap dapat diperiksa sebelum lanjut.",
    detail: ["Pilih jenjang dan mata pelajaran", "Atur mode online atau tatap muka", "Tentukan hari dan jam yang memungkinkan"],
    accent: "bg-amber-100 text-amber-800",
  },
  {
    icon: CreditCard,
    title: "Lihat biaya & bayar",
    short: "Ringkasan muncul sebelum transaksi",
    description: "Harga final ditampilkan sebelum pembayaran. Matching tutor belum dimulai pada tahap ini.",
    detail: ["Jumlah sesi dan masa aktif terbaca", "Rincian biaya dapat diperiksa", "Pembayaran diverifikasi sistem/admin"],
    accent: "bg-orange-100 text-orange-800",
  },
  {
    icon: Radar,
    title: "Matching tutor",
    short: "Dimulai setelah pembayaran",
    description: "Sistem mencocokkan mapel, jadwal, mode belajar, dan jangkauan tutor yang sudah diverifikasi.",
    detail: ["Status pencarian terlihat di akun", "Tutor menerima penawaran sesuai kebutuhan", "Jika belum ditemukan, tersedia pilihan lanjut cari atau proses pengembalian sesuai kebijakan"],
    accent: "bg-teal-100 text-teal-800",
  },
  {
    icon: BookOpenCheck,
    title: "Belajar & pantau",
    short: "Materi dan laporan tercatat",
    description: "Sesi berjalan sesuai jadwal. Materi yang dipelajari dan laporan tutor dapat dilihat kembali.",
    detail: ["Jadwal kelas tersimpan", "Hasil belajar dicatat setiap sesi", "Riwayat belajar tetap bisa ditinjau"],
    accent: "bg-sky-100 text-sky-800",
  },
];

export default function HowItWorksSection() {
  const { section } = useWebsiteContent();
  const cms = section("how_it_works");
  const [selected, setSelected] = useState(0);
  const step = steps[selected];
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      const index = visible?.target.getAttribute("data-step-index");
      if (index != null) setSelected(Number(index));
    }, { rootMargin: "-28% 0px -42%", threshold: [0.2, 0.55, 0.8] });
    stepRefs.current.forEach((item) => item && observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative bg-[#F7F1E8] py-20 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full border border-[#147D7E]/10" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid gap-11 lg:grid-cols-[minmax(0,.88fr)_minmax(0,1.12fr)] lg:items-start lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#A94316]">{cms?.eyebrow || "Dari kebutuhan sampai kelas pertama"}</p>
              <h2 className="mt-4 max-w-[15ch] text-balance text-3xl font-extrabold leading-tight tracking-tight text-[#14213D] sm:text-4xl lg:text-[2.75rem]">{cms?.title || "Empat langkah yang jelas, tanpa kejutan di tengah."}</h2>
              <p className="mt-5 max-w-lg text-base leading-8 text-slate-600">{cms?.description || "Harga dan jadwal dipilih lebih dulu. Pencarian tutor dimulai setelah pembayaran terverifikasi."}</p>
              <div className="mt-8 flex items-center gap-3 border-t border-[#14213D]/15 pt-5">
                <span className="text-3xl font-extrabold tabular-nums text-[#147D7E]">0{selected + 1}<span className="text-lg text-slate-400">/04</span></span>
                <span className="text-sm font-bold text-slate-600">{step.short}</span>
              </div>
              <StudentPackageLink to="/student/packages/new" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#C2410C] px-5 text-sm font-extrabold text-white transition hover:bg-[#9A3412]">
                Mulai susun kebutuhan <ArrowRight size={17} />
              </StudentPackageLink>
            </div>
          </div>

          <ol className="relative space-y-4 border-l-2 border-[#147D7E]/25 pl-5 sm:pl-8" aria-label="Empat tahap pemesanan BimbelKu">
            {steps.map((item, index) => {
              const StepIcon = item.icon;
              const active = selected === index;
              return (
                <li key={item.title} ref={(element) => { stepRefs.current[index] = element; }} data-step-index={index} onMouseEnter={() => setSelected(index)} className="relative scroll-mt-32">
                  <span className={`absolute -left-[1.87rem] top-8 h-4 w-4 rounded-full border-[3px] border-[#F7F1E8] sm:-left-[2.63rem] ${active ? "bg-[#C2410C]" : "bg-[#147D7E]"}`} aria-hidden="true" />
                  <article className={`rounded-2xl border bg-white p-5 transition-colors sm:p-7 ${active ? "border-[#147D7E]/40 shadow-[0_14px_35px_rgba(20,33,61,.08)]" : "border-stone-200"}`}>
                    <div className="flex items-start gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#E7F2F0] text-[#147D7E]"><StepIcon size={21} aria-hidden="true" /></span>
                      <div className="min-w-0 flex-1"><p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-[#A94316]">Langkah 0{index + 1}</p><h3 className="mt-1 text-xl font-extrabold text-[#14213D] sm:text-2xl">{item.title}</h3></div>
                    </div>
                    <p className="mt-5 text-sm font-bold text-[#147D7E]">{item.short}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">{item.description}</p>
                    <ul className="mt-5 space-y-2 border-t border-stone-100 pt-4 text-xs font-semibold leading-5 text-slate-600">
                      {item.detail.map((detail) => <li key={detail} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C2410C]" />{detail}</li>)}
                    </ul>
                    {index === 2 && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-900">Jika tutor belum ditemukan, murid dapat memilih lanjut pencarian atau proses pengembalian dana sesuai kebijakan.</p>}
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

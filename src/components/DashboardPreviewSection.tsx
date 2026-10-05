import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpenCheck, CheckCircle2, Layers3, Sparkles, Users, type LucideIcon } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useWebsiteContent } from "@/components/WebsiteContentProvider";

export default function DashboardPreviewSection() {
  const { settings, section } = useWebsiteContent();
  const cms = section("progress");
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element || !("IntersectionObserver" in window)) {
      setActive(settings.animations_enabled);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting && settings.animations_enabled), { threshold: 0.08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [settings.animations_enabled]);

  return (
    <section ref={sectionRef} data-active={active ? "true" : "false"} className="landing-progress-section relative overflow-hidden bg-[#061225] pb-24 pt-16 text-white sm:pb-28 sm:pt-20">
      <div className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full border border-orange-300/10" aria-hidden="true" />

      <div className="container relative mx-auto grid items-center gap-12 px-4 lg:grid-cols-[.82fr_1.18fr] lg:gap-14">
        <div>
          <Reveal direction="right" width="100%">
            <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">{cms?.eyebrow || "Progress yang mudah dibaca"}</p>
          </Reveal>
          <Reveal direction="right" delay={0.08} width="100%">
            <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight text-white md:text-4xl">{cms?.title || "Orang tua tahu apa yang dipelajari, siswa tahu apa berikutnya."}</h2>
          </Reveal>
          <Reveal direction="right" delay={0.16} width="100%">
            <p className="mt-4 max-w-xl leading-7 text-slate-300">{cms?.description || "Target dan hasil belajar tersusun per paket, dengan laporan tutor setiap sesi."}</p>
          </Reveal>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Reveal direction="right" delay={0.22} width="100%"><Point icon={Layers3} text="Halaman awal tersusun per Paket Belajar atau Kelas Bersama" /></Reveal>
            <Reveal direction="right" delay={0.3} width="100%"><Point icon={BookOpenCheck} text="Paket Belajar menyimpan target dan laporan hasil setiap sesi" /></Reveal>
            <Reveal direction="right" delay={0.38} width="100%"><Point icon={Users} text="Kelas Bersama cukup menunjukkan progress per Bab" /></Reveal>
          </div>
        </div>

        <Reveal direction="left" delay={0.12} width="100%">
          <div className="relative">
            <div className="landing-progress-float relative">
              <div className="hidden sm:block"><DesktopProgressPreview /></div>
              <div className="sm:hidden"><MobileProgressPreview /></div>
            </div>
          </div>
        </Reveal>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent via-[#0b1729]/75 to-[#0F172A] sm:h-24" />
    </section>
  );
}

function DesktopProgressPreview() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#0b172a] p-4 text-white shadow-[0_30px_90px_rgba(0,0,0,0.38)] ring-1 ring-white/[0.04] sm:p-5">
      <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-[#14213d] via-[#172b4d] to-[#20375f] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-orange-400/[0.10] blur-2xl" aria-hidden="true" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-orange-200">Perkembangan Belajar</p>
            <h3 className="mt-2 text-2xl font-black">Pilih program yang ingin dilihat</h3>
            <p className="mt-1 text-xs leading-5 text-slate-300">Detail materi tetap rapi di halaman berikutnya.</p>
          </div>
          <div className="landing-progress-spark grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-orange-300/20 bg-orange-400/10 text-orange-200 shadow-[0_10px_30px_rgba(249,115,22,0.10)]">
            <Sparkles size={20} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <Reveal delay={0.28} width="100%">
          <DarkPreviewProgram badge="Paket Belajar" title="Intensif Matematika" subtitle="Aljabar · Persamaan Linear" progress={67} meta="4 dari 6 pertemuan selesai" />
        </Reveal>
        <Reveal delay={0.38} width="100%">
          <DarkPreviewProgram badge="Kelas Bersama" title="TKA Matematika" subtitle="Belajar bersama · Online" progress={50} meta="2 dari 4 bab selesai" cheap />
        </Reveal>
      </div>

      <Reveal delay={0.48} width="100%">
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-xs">
          <span className="flex min-w-0 items-start gap-2 font-bold leading-5 text-slate-300"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" />Pertemuan selesai dan penilaian materi tutor ditampilkan terpisah.</span>
          <ArrowRight size={15} className="shrink-0 text-orange-300" />
        </div>
      </Reveal>
    </div>
  );
}

function MobileProgressPreview() {
  return (
    <div className="mx-auto max-w-[360px] rounded-[2rem] border border-white/10 bg-[#0b172a] p-3 shadow-[0_26px_70px_rgba(0,0,0,0.38)] ring-1 ring-white/[0.04]">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#13213b] to-[#1b3154] p-4">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-amber-300" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[.14em] text-orange-200">Progress Belajar</p>
            <h3 className="mt-1 text-base font-black text-white">Program kamu</h3>
            <p className="mt-1 text-[10px] leading-4 text-slate-300">Pilih satu untuk melihat detail materi.</p>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-orange-300/20 bg-orange-400/10 text-orange-200"><Sparkles size={16} /></span>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        <MobileProgram badge="Paket Belajar" title="Intensif Matematika" progress={67} meta="4/6 pertemuan selesai" />
        <MobileProgram badge="Kelas Bersama" title="TKA Matematika" progress={50} meta="2/4 bab selesai" cheap />
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.05] p-3 text-[10px] font-semibold leading-4 text-slate-300">
        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
        <span>Persentase paket menunjukkan pertemuan selesai. Penguasaan materi dilihat dari laporan tutor.</span>
      </div>
    </div>
  );
}

function Point({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return <p className="flex items-center gap-3 text-sm font-bold leading-6 text-slate-200"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-orange-300/10 bg-white/[0.07] text-orange-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"><Icon size={17} /></span>{text}</p>;
}

function DarkPreviewProgram({ badge, title, subtitle, progress, meta, cheap = false }: { badge: string; title: string; subtitle: string; progress: number; meta: string; cheap?: boolean }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-orange-300/25 hover:bg-white/[0.08]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${cheap ? "border-amber-300/20 bg-amber-300/10 text-amber-200" : "border-orange-300/20 bg-orange-400/10 text-orange-200"}`}>{badge}</span>
          <p className="mt-2 font-black text-white">{title}</p>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>
        <span className="text-xl font-black text-orange-300">{progress}%</span>
      </div>
      <AnimatedProgressBar progress={progress} dark />
      <p className="mt-2 text-right text-[10px] font-bold text-slate-400">{meta}</p>
    </article>
  );
}

function MobileProgram({ badge, title, progress, meta, cheap = false }: { badge: string; title: string; progress: number; meta: string; cheap?: boolean }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.06] p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${cheap ? "border-amber-300/20 bg-amber-300/10 text-amber-200" : "border-orange-300/20 bg-orange-400/10 text-orange-200"}`}>{badge}</span>
          <p className="mt-1.5 truncate text-xs font-black text-white">{title}</p>
        </div>
        <span className="shrink-0 text-base font-black text-orange-300">{progress}%</span>
      </div>
      <AnimatedProgressBar progress={progress} dark compact />
      <p className="mt-1.5 text-[9px] font-semibold text-slate-400">{meta}</p>
    </article>
  );
}

function AnimatedProgressBar({ progress, dark = false, compact = false }: { progress: number; dark?: boolean; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.45 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${compact ? "mt-2 h-2" : "mt-3 h-2.5"} overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-slate-100"}`}
      role="progressbar"
      aria-label={`Progress ${progress}%`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 shadow-[0_0_12px_rgba(249,115,22,0.22)] transition-[width] duration-1000 ease-out"
        style={{ width: visible ? `${progress}%` : "0%" }}
      />
    </div>
  );
}

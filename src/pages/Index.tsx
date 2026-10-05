import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LandingMarquee from "@/components/LandingMarquee";

import SectionArcDivider, { type DividerVariant } from "@/components/SectionArcDivider";
import { useWebsiteContent } from "@/components/WebsiteContentProvider";
import SeoHead from "@/components/SeoHead";
import { seoAbsoluteUrl } from "@/lib/seo";
import { scrollToPublicAnchor } from "@/lib/scrollToPublicAnchor";

const TrustSection = lazy(() => import("@/components/TrustSection"));
const SubjectsSection = lazy(() => import("@/components/SubjectsSection"));
const HowItWorksSection = lazy(() => import("@/components/HowItWorksSection"));
const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const PackagePreviewSection = lazy(() => import("@/components/PackagePreviewSection"));
const DashboardPreviewSection = lazy(() => import("@/components/DashboardPreviewSection"));
const TutorSection = lazy(() => import("@/components/TutorSection"));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection"));
const AreasSection = lazy(() => import("@/components/AreasSection"));
const FaqSection = lazy(() => import("@/components/FaqSection"));
const CTASection = lazy(() => import("@/components/CTASection"));
const Footer = lazy(() => import("@/components/Footer"));

const sectionColors: Record<string, string> = {
  trust: "#F0FDFA",
  programs: "#FFFBF7",
  how_it_works: "#FFF7ED",
  proof: "#071A2D",
  tutors: "#14213D",
  reviews: "#FFF7ED",
  pricing: "#FFFBF7",
  progress: "#061225",
  areas: "#FFFFFF",
  faq: "#F7F1E8",
  final_cta: "#FFFFFF",
};

const transitionVariants: Record<string, DividerVariant> = {
  trust: "scallop",
  programs: "soft-wave",
  how_it_works: "ribbon",
  proof: "arch",
  tutors: "constellation",
  reviews: "open-book",
  pricing: "steps",
  progress: "learning-path",
  areas: "skyline",
  faq: "pencil",
  final_cta: "orbit",
};

const SectionLoader = () => <div data-section-loader className="h-[360px] w-full animate-pulse bg-stone-50 motion-reduce:animate-none" role="status"><span className="sr-only">Memuat konten</span></div>;

function DeferredSection({ children, minHeight = 480, anchorId }: { children: ReactNode; minHeight?: number; anchorId?: string }) {
  const markerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || !("IntersectionObserver" in window)) {
      setReady(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setReady(true);
        observer.disconnect();
      }
    }, { rootMargin: "150px 0px" });
    observer.observe(marker);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const activate = (event: Event) => {
      if ((event as CustomEvent<string>).detail === anchorId) setReady(true);
    };
    window.addEventListener("bimbelku:load-anchor", activate);
    return () => window.removeEventListener("bimbelku:load-anchor", activate);
  }, [anchorId]);
  return <div id={anchorId} ref={markerRef} data-deferred-ready={ready} style={ready ? undefined : { minHeight }}>{ready ? children : null}</div>;
}

export default function Index() {
  const location = useLocation();
  const { settings, sections, isVisible, loading } = useWebsiteContent();
  const seoSchemas = useMemo(() => {
    const organizationId = `${window.location.origin}/#organization`;
    const organization: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "@id": organizationId,
      name: settings.brand_name,
      url: seoAbsoluteUrl("/"),
      description: settings.brand_description || "Bimbingan belajar SD–SMA dengan pilihan online dan tatap muka di Yogyakarta.",
      areaServed: { "@type": "AdministrativeArea", name: "Daerah Istimewa Yogyakarta" },
    };
    const logo = settings.logo_url || settings.logo_dark_url || "/logo_bimbel.png";
    organization.logo = { "@type": "ImageObject", url: seoAbsoluteUrl(logo) };
    if (settings.contact_email) organization.email = settings.contact_email;
    if (settings.whatsapp_enabled && settings.whatsapp_number) {
      organization.telephone = settings.whatsapp_number;
      organization.contactPoint = {
        "@type": "ContactPoint",
        telephone: settings.whatsapp_number,
        contactType: "customer service",
        availableLanguage: "Indonesian",
      };
    }
    if (settings.office_address) {
      organization.address = {
        "@type": "PostalAddress",
        streetAddress: settings.office_address,
        addressCountry: "ID",
      };
    }
    return [
      organization,
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${window.location.origin}/#website`,
        url: seoAbsoluteUrl("/"),
        name: settings.brand_name,
        inLanguage: "id-ID",
        publisher: { "@id": organizationId },
        potentialAction: {
          "@type": "SearchAction",
          target: `${seoAbsoluteUrl("/program")}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ];
  }, [settings]);
  const registry = useMemo<Record<string, { element: ReactNode; minHeight?: number; anchorId?: string }>>(() => ({
    trust: { element: <TrustSection />, minHeight: 420, anchorId: "kepercayaan" },
    programs: { element: <SubjectsSection />, minHeight: 620, anchorId: "program" },
    how_it_works: { element: <HowItWorksSection />, minHeight: 560, anchorId: "cara-kerja" },
    proof: { element: <FeaturesSection />, minHeight: 560, anchorId: "bukti-sistem" },
    tutors: { element: <TutorSection />, minHeight: 640, anchorId: "tutor" },
    pricing: { element: <PackagePreviewSection />, minHeight: 620, anchorId: "paket" },
    progress: { element: <DashboardPreviewSection />, minHeight: 560, anchorId: "progress" },
    reviews: { element: <ReviewsSection />, minHeight: 520, anchorId: "ulasan" },
    areas: { element: <AreasSection />, minHeight: 640, anchorId: "area" },
    faq: { element: <FaqSection />, minHeight: 680, anchorId: "faq" },
    final_cta: { element: <CTASection />, minHeight: 420, anchorId: "mulai" },
  }), []);
  const orderedSections = sections
    .filter((item) => item.section_key !== "hero" && registry[item.section_key] && isVisible(item.section_key))
    .sort((left, right) => left.sort_order - right.sort_order);
  const lastSectionColor = orderedSections.length
    ? sectionColors[orderedSections[orderedSections.length - 1].section_key] || "#FFFFFF"
    : "#FFFBF7";

  useEffect(() => {
    if (loading || !location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    window.dispatchEvent(new CustomEvent("bimbelku:load-anchor", { detail: id }));
    const target = document.getElementById(id);
    if (target) void scrollToPublicAnchor(target, settings.animations_enabled);
    else {
      const observer = new MutationObserver(() => {
        const loaded = document.getElementById(id);
        if (loaded) {
          observer.disconnect();
          void scrollToPublicAnchor(loaded, settings.animations_enabled);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      const timeout = window.setTimeout(() => observer.disconnect(), 4000);
      return () => { observer.disconnect(); window.clearTimeout(timeout); };
    }
  }, [loading, location.hash, orderedSections.length, settings.animations_enabled]);

  return (
    <div className="public-site min-h-screen bg-white">
      <SeoHead
        title={`Bimbel Privat SD, SMP & SMA di Yogyakarta | ${settings.brand_name}`}
        description={settings.brand_description || "Bimbel privat online dan tatap muka untuk SD, SMP, dan SMA di Yogyakarta. Pilih mapel, jelaskan target, jadwal, dan mode belajar sebelum memesan."}
        canonicalPath="/"
        image={settings.social_share_image_url || settings.hero_desktop_image_url}
        schemas={seoSchemas}
      />
      <Navbar />
      <main>
        {isVisible("hero") && <HeroSection />}
        {isVisible("hero") && <LandingMarquee />}
        {orderedSections.map((item, index) => {
          const entry = registry[item.section_key];
          const previousSection = index > 0 ? orderedSections[index - 1] : null;
          const topColor = previousSection ? sectionColors[previousSection.section_key] || "#FFFFFF" : "#FFFBF7";
          const bottomColor = sectionColors[item.section_key] || "#FFFFFF";
          const variant = transitionVariants[item.section_key] || "soft-wave";
          return <div key={item.section_key}><SectionArcDivider variant={variant} topColor={topColor} bottomColor={bottomColor} accentColor={item.section_key === "tutors" ? "#F6B94A" : "#F97316"} /><DeferredSection minHeight={entry.minHeight} anchorId={entry.anchorId}><Suspense fallback={<SectionLoader />}>{entry.element}</Suspense></DeferredSection></div>;
        })}
      </main>
      <SectionArcDivider variant="footer-rise" topColor={lastSectionColor} bottomColor="#101A31" accentColor="#F6B94A" />
      <Suspense fallback={<div className="h-48 animate-pulse bg-slate-900 motion-reduce:animate-none" />}><Footer /></Suspense>

    </div>
  );
}

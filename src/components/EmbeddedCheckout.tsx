import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { XenditComponents } from "xendit-components-web";

interface EmbeddedCheckoutProps {
  sessionId: string;
  componentsKey: string;
  amount: number;
  resume?: boolean;
  onComplete: () => void;
  onFailure: (message: string) => void;
}

const rupiah = (value: number) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0,
}).format(value);

export default function EmbeddedCheckout({ sessionId, componentsKey, amount, resume = false, onComplete, onFailure }: EmbeddedCheckoutProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sdkRef = useRef<XenditComponents | null>(null);
  const completeRef = useRef(onComplete);
  const failureRef = useRef(onFailure);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(`bimbelku_payment_redirect_${sessionId}`) || "null") as { url?: string; savedAt?: number } | null;
      if (saved?.url && saved.savedAt && Date.now() - saved.savedAt < 30 * 60 * 1000 && new URL(saved.url).protocol === "https:") {
        setFallbackUrl(saved.url);
      }
    } catch { /* A stale or invalid link must never be displayed. */ }
  }, [sessionId]);

  useEffect(() => { completeRef.current = onComplete; failureRef.current = onFailure; }, [onComplete, onFailure]);

  useEffect(() => {
    let disposed = false;
    let picker: HTMLElement | null = null;
    let sdk: XenditComponents | null = null;

    void import("xendit-components-web").then(({ XenditComponents }) => {
      if (disposed) return;
      sdk = new XenditComponents({ componentsSdkKey: componentsKey, resume });
      sdkRef.current = sdk;
      picker = sdk.createChannelPickerComponent();
      mountRef.current?.replaceChildren(picker);
      sdk.addEventListener("init", () => { if (!disposed) setLoading(false); });
      sdk.addEventListener("submission-ready", () => { if (!disposed) setReady(true); });
      sdk.addEventListener("submission-not-ready", () => { if (!disposed) setReady(false); });
      sdk.addEventListener("submission-begin", () => { if (!disposed) { setSubmitting(true); setMessage(""); } });
      sdk.addEventListener("submission-end", (event) => {
        if (disposed) return;
        setSubmitting(false);
        if (event.userErrorMessage?.length) setMessage(event.userErrorMessage.join(" "));
      });
      sdk.addEventListener("will-redirect", (event) => {
        // Use the URL issued for this payment attempt, never a generic wallet URL.
        try {
          if (new URL(event.url).protocol !== "https:") return;
          sessionStorage.setItem(`bimbelku_payment_redirect_${sessionId}`, JSON.stringify({ url: event.url, savedAt: Date.now() }));
          if (!disposed) setFallbackUrl(event.url);
        } catch { /* Some app-only deep links cannot safely be reused as web links. */ }
      });
      sdk.addEventListener("session-complete", () => {
        if (!disposed) { sessionStorage.removeItem(`bimbelku_payment_redirect_${sessionId}`); setFallbackUrl(null); setMessage("Pembayaran diterima. Memastikan status tagihan…"); completeRef.current(); }
      });
      sdk.addEventListener("session-expired-or-canceled", () => {
        if (!disposed) { sessionStorage.removeItem(`bimbelku_payment_redirect_${sessionId}`); failureRef.current("Sesi pembayaran berakhir. Periksa status tagihan sebelum mencoba lagi."); }
      });
      sdk.addEventListener("fatal-error", (event) => {
        if (!disposed) failureRef.current(event.message || "Pilihan pembayaran tidak dapat dimuat. Coba lagi setelah memeriksa status tagihan.");
      });
    }).catch(() => {
      if (!disposed) failureRef.current("Pilihan pembayaran belum dapat dimuat. Periksa koneksi dan coba lagi.");
    });

    return () => {
      disposed = true;
      if (sdk && picker) {
        try { sdk.destroyComponent(picker); } catch { /* Komponen mungkin telah ditutup oleh SDK. */ }
      }
      sdkRef.current = null;
    };
  }, [componentsKey, resume, sessionId]);

  return (
    <div className="min-w-0">
      <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-[#f4f7fa] px-4 py-3">
        <span className="text-sm font-semibold text-slate-600">Total tagihan</span>
        <strong className="text-lg font-black text-[#10233d]">{rupiah(amount)}</strong>
      </div>
      <div ref={mountRef} className="min-h-28 min-w-0 overflow-x-auto" aria-label="Pilihan metode pembayaran" />
      {loading && <div className="flex items-center justify-center gap-2 py-7 text-sm font-semibold text-slate-600"><Loader2 size={17} className="animate-spin" />Memuat metode pembayaran…</div>}
      {message && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">{message}</p>}
      <Button
        type="button"
        disabled={loading || !ready || submitting}
        onClick={() => sdkRef.current?.submit()}
        className="mt-5 min-h-12 w-full rounded-xl bg-[#d45e27] text-sm font-black text-white hover:bg-[#b84b1b] disabled:opacity-60"
      >
        {submitting ? <Loader2 size={18} className="mr-2 animate-spin" /> : <CreditCard size={18} className="mr-2" />}
        {submitting ? "Memproses pembayaran…" : `Konfirmasi & lanjut bayar ${rupiah(amount)}`}
      </Button>
      {fallbackUrl && <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-center text-sm font-bold text-[#10233d] hover:border-orange-300"><ArrowUpRight size={16} />Aplikasi tidak terbuka? Buka lagi tautan konfirmasi</a>}
      <p className="mt-3 flex items-start justify-center gap-2 text-center text-xs leading-5 text-slate-500"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-600" />QRIS menampilkan kode pindai, virtual account menampilkan instruksi bank, dan e-wallet dapat membuka aplikasinya. Tautan cadangan hanya muncul jika tersedia dari transaksi ini. Jangan membayar dua kali; periksa status tagihan jika ragu.</p>
    </div>
  );
}

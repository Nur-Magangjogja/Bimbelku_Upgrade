import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, CreditCard, ExternalLink, QrCode, ShieldCheck, WalletCards } from "lucide-react";

type Method = "qris" | "bank" | "ewallet";

const rupiah = (value: number) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0,
}).format(value);

const methods = [
  { id: "qris" as const, title: "QRIS", detail: "Pindai kode melalui aplikasi pembayaran", icon: QrCode },
  { id: "bank" as const, title: "Virtual account", detail: "Bayar melalui bank pilihanmu", icon: Building2 },
  { id: "ewallet" as const, title: "E-wallet", detail: "Lanjutkan lewat aplikasi dompet digital", icon: WalletCards },
];

export default function PaymentDesignPreview({ amount, onComplete }: { amount: number; onComplete: () => void }) {
  const [selected, setSelected] = useState<Method | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  return <div className="min-w-0">
    <p className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-950">
      PRATINJAU DESAIN LOKAL · Metode di bawah adalah contoh visual, bukan kanal pembayaran Xendit. Tidak ada uang atau tagihan yang diproses.
    </p>
    <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-[#f4f7fa] px-4 py-3">
      <span className="text-sm font-semibold text-slate-600">Total tagihan</span>
      <strong className="text-lg font-black text-[#10233d]">{rupiah(amount)}</strong>
    </div>
    {!confirmed ? <>
      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-black text-[#10233d]">Pilih satu metode pembayaran</legend>
        {methods.map(({ id, title, detail, icon: Icon }) => <button
          key={id} type="button" aria-pressed={selected === id} onClick={() => setSelected(id)}
          className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border p-3 text-left transition sm:p-4 ${selected === id ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100" : "border-slate-200 bg-white hover:border-orange-300"}`}
        >
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${selected === id ? "bg-orange-600 text-white" : "bg-slate-100 text-[#10233d]"}`}><Icon size={20} /></span>
          <span className="min-w-0 flex-1"><strong className="block text-sm text-[#10233d]">{title}</strong><span className="mt-0.5 block text-xs leading-5 text-slate-500">{detail}</span></span>
          {selected === id && <Check size={18} className="shrink-0 text-orange-700" />}
        </button>)}
      </fieldset>
      <button type="button" disabled={!selected} onClick={() => setConfirmed(true)} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d45e27] px-4 text-sm font-black text-white hover:bg-[#b84b1b] disabled:cursor-not-allowed disabled:bg-slate-300">
        <CreditCard size={18} /> Konfirmasi pilihan <ArrowRight size={17} />
      </button>
      <p className="mt-3 text-center text-xs leading-5 text-slate-500">Konfirmasi akan menampilkan instruksi sesuai metode. Ini belum berarti pembayaran berhasil.</p>
    </> : <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 sm:p-5">
      <button type="button" onClick={() => setConfirmed(false)} className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"><ArrowLeft size={16} /> Ganti metode</button>
      <h3 className="mt-3 text-lg font-black text-[#10233d]">{selected === "qris" ? "Bayar dengan QRIS" : selected === "bank" ? "Bayar melalui virtual account" : "Lanjutkan di aplikasi e-wallet"}</h3>
      {selected === "qris" && <div className="mt-4 rounded-xl bg-white p-4 text-sm leading-6 text-slate-600"><div className="mx-auto grid h-36 w-36 place-items-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center text-xs font-bold text-slate-500"><QrCode size={38} className="mx-auto" />QR contoh, tidak dapat dipindai</div><p className="mt-3">Pada transaksi asli, kode QR unik muncul di sini. Pindai lewat aplikasi bank atau e-wallet, lalu tunggu status tagihan diperbarui.</p></div>}
      {selected === "bank" && <div className="mt-4 rounded-xl bg-white p-4 text-sm leading-6 text-slate-600"><p className="font-bold text-[#10233d]">Nomor virtual account</p><p className="mt-1 font-mono text-xl font-black text-slate-400">•••• •••• ••••</p><p className="mt-2">Nomor dan bank tujuan yang asli hanya muncul setelah kanal bank dipilih pada transaksi sungguhan. Transfer sesuai nominal tagihan.</p></div>}
      {selected === "ewallet" && <div className="mt-4 rounded-xl bg-white p-4 text-sm leading-6 text-slate-600"><div className="flex items-center gap-2 font-bold text-[#10233d]"><ExternalLink size={18} /> Aplikasi e-wallet</div><p className="mt-2">Pada transaksi asli, lanjutkan lewat aplikasi e-wallet yang dipilih. Jika aplikasi tidak terbuka, tautan cadangan hanya boleh ditampilkan apabila penyedia pembayaran mengirim URL khusus untuk transaksi itu.</p><p className="mt-2 rounded-lg bg-amber-50 p-3 text-amber-900">Pratinjau ini tidak memiliki tautan transaksi, jadi tombol menuju aplikasi sengaja tidak dibuat.</p></div>}
      <button type="button" onClick={onComplete} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-[#10233d] hover:bg-slate-50">Lihat contoh status berhasil</button>
      <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-600" />Hanya simulasi tampilan. Status asli harus dikonfirmasi server, bukan oleh tombol ini.</p>
    </div>}
  </div>;
}

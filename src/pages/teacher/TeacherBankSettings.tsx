import { notify } from "@/lib/notify";
import React, { useState, useEffect } from "react";
import TeacherLayout from "../../components/TeacherLayout"; 
import { 
  CreditCard, Save, Send, Building, User, Wallet,
  AlertCircle, ShieldCheck, CheckCircle2, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirmDialog } from "@/components/ConfirmDialogProvider";
import http, { getApiError, getCached } from "@/lib/http";
import { isValidAccountNumber, sanitizeDigits } from "@/lib/validation";

const PAYOUT_ACCOUNT_MIN_DIGITS = 8;
const PAYOUT_ACCOUNT_MAX_DIGITS = 20;
const PAYOUT_CHANNELS = [
  ["BCA", "Bank Central Asia (BCA)"],
  ["MANDIRI", "Bank Mandiri"],
  ["BRI", "Bank Rakyat Indonesia (BRI)"],
  ["BNI", "Bank Negara Indonesia (BNI)"],
  ["CIMB", "CIMB Niaga"],
  ["PERMATA", "PermataBank"],
  ["BSI", "Bank Syariah Indonesia (BSI)"],
] as const;

export function TeacherBankSettings({ onSaved, payoutAmount, payoutAvailable = false, onPayoutCompleted }: {
  onSaved?: () => void;
  payoutAmount?: number;
  payoutAvailable?: boolean;
  onPayoutCompleted?: () => void;
}) {
  const confirm = useConfirmDialog();
  const [payoutChannelCode, setPayoutChannelCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [legalName, setLegalName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [payoutHoldUntil, setPayoutHoldUntil] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBankData();
  }, []);

  const fetchBankData = async () => {
    try {
        const response = await getCached("/teacher/profile", { maxAgeMs: 60_000 });
        
        const profileData = response.data.profile;
        setLegalName(String(response.data.user?.name || "").trim());
        if (profileData) {
            setPayoutChannelCode(profileData.payout_channel_code || "");
            setAccountNumber(sanitizeDigits(profileData.account_number || "", 50));
            setAccountHolder(String(profileData.account_name || "").trim());
            setPayoutHoldUntil(profileData.payout_hold_until || null);
        }
    } catch (error) {
        console.error("Gagal load data bank", error);
        notify.error("Gagal memuat data rekening.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (payoutAmount !== undefined && !payoutAvailable) {
        notify.error("Pencairan belum dapat dikirim karena verifikasi nama pemilik rekening dari bank belum aktif. Saldo tetap aman; rekening tidak diubah.");
        return;
    }
    if(!payoutChannelCode || !accountNumber || !legalName || !currentPassword) {
        notify.error("Mohon lengkapi semua data rekening.");
        return;
    }
    if (
        !isValidAccountNumber(accountNumber)
        || accountNumber.length < PAYOUT_ACCOUNT_MIN_DIGITS
        || accountNumber.length > PAYOUT_ACCOUNT_MAX_DIGITS
    ) {
        notify.error(`Nomor rekening atau e-wallet harus berisi ${PAYOUT_ACCOUNT_MIN_DIGITS}–${PAYOUT_ACCOUNT_MAX_DIGITS} digit.`);
        return;
    }
    const approved = await confirm({
        title: payoutAmount !== undefined ? "Konfirmasi pencairan dana?" : "Simpan rekening pencairan?",
        description: payoutAmount !== undefined
          ? `Cairkan Rp${new Intl.NumberFormat("id-ID").format(payoutAmount)} ke rekening ${payoutChannelCode} berakhir ${accountNumber.slice(-4)}. Pastikan rekening ini milik Anda.`
          : "Sistem akan memakai data ini untuk pencairan otomatis. Pastikan bank, nomor, dan nama pemilik sudah tepat.",
        confirmText: payoutAmount !== undefined ? "Cairkan dana" : "Simpan rekening",
        tone: "warning",
    });
    if (!approved) return;

    setIsSaving(true);
    try {
        const response = await http.post("/teacher/bank", {
            payout_channel_code: payoutChannelCode,
            account_number: accountNumber,
            account_name: legalName,
            current_password: currentPassword,
        });
        setCurrentPassword("");
        const holdUntil = response.data?.payout_hold_until || null;
        setPayoutHoldUntil(holdUntil);
        onSaved?.();

        if (payoutAmount !== undefined) {
            if (holdUntil && new Date(holdUntil).getTime() > Date.now()) {
                notify.warning(`Rekening baru tercatat. Demi keamanan, pencairan baru dapat dicoba setelah ${new Date(holdUntil).toLocaleString("id-ID")}. Saldo belum dipotong.`);
                return;
            }
            await http.post("/teacher/payout-requests", { amount: payoutAmount });
            notify.success("Permintaan pencairan dikirim. Pantau status transfer di Dompet Tutor.");
            onPayoutCompleted?.();
            return;
        }

        notify.success("Rekening Berhasil Disimpan!", {
            description: holdUntil
              ? `Perubahan rekening ditahan sampai ${new Date(holdUntil).toLocaleString("id-ID")}. Verifikasi nama bank tetap diperlukan sebelum transfer.`
              : "Data rekening tidak berubah. Verifikasi nama bank tetap diperlukan sebelum transfer.",
            icon: <CheckCircle2 className="text-emerald-600" />,
            style: { background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857' }
        });
    } catch (error) {
        notify.error(getApiError(error, payoutAmount !== undefined ? "Pencairan belum dapat diproses. Saldo tetap aman." : "Gagal menyimpan rekening."));
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) return <div className="grid min-h-60 place-items-center"><Loader2 className="animate-spin text-indigo-600"/></div>;

  return (
      <div id="rekening" className="mx-auto max-w-5xl scroll-mt-6 space-y-6 pb-10 sm:space-y-8">
          
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Rekening Pencairan</h1>
            <p className="text-slate-500 mt-1">Isi tujuan pencairan. Nomor dan nama pemiliknya harus benar-benar sesuai.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* --- KOLOM KIRI: FORMULIR --- */}
            <Card className="rounded-[2rem] border-none shadow-sm bg-white h-fit order-2 lg:order-1">
               <CardHeader className="pb-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Wallet size={24} />
                     </div>
                     <div>
                        <CardTitle className="text-lg font-bold text-slate-900">Data Rekening</CardTitle>
                        <p className="text-xs text-slate-500">Pastikan data sesuai buku tabungan</p>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="space-y-5 p-4 sm:p-6">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Building size={16} className="text-slate-400" /> Bank tujuan pencairan
                     </label>
                     <select value={payoutChannelCode} onChange={(event) => setPayoutChannelCode(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:bg-white">
                       <option value="">Pilih bank</option>
                       {PAYOUT_CHANNELS.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                     </select>
                     <p className="text-xs leading-5 text-slate-500">Daftar dibatasi pada bank yang mendukung pencairan otomatis.</p>
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-slate-400" /> Konfirmasi Kata Sandi
                     </label>
                     <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="Kata sandi akun tutor"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="h-12 rounded-xl border-slate-200 focus:bg-white bg-slate-50 transition"
                     />
                     <p className="text-xs leading-5 text-slate-500">Kata sandi diperlukan untuk mengamankan data rekening. Perubahan rekening menahan pencairan sementara.</p>
                  </div>

                  {payoutHoldUntil && new Date(payoutHoldUntil) > new Date() && (
                     <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                        Pencairan ditahan sampai {new Date(payoutHoldUntil).toLocaleString("id-ID")}.
                     </div>
                  )}

                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <CreditCard size={16} className="text-slate-400" /> Nomor Rekening
                     </label>
                     <Input 
                        placeholder="Contoh: 1234567890"
                        inputMode="numeric"
                        minLength={PAYOUT_ACCOUNT_MIN_DIGITS}
                        maxLength={PAYOUT_ACCOUNT_MAX_DIGITS}
                        autoComplete="off"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(sanitizeDigits(e.target.value, PAYOUT_ACCOUNT_MAX_DIGITS))}
                        className="h-12 rounded-xl border-slate-200 focus:bg-white bg-slate-50 transition font-mono tracking-wide text-lg"
                     />
                     <p className="text-xs leading-5 text-slate-500">
                        Masukkan {PAYOUT_ACCOUNT_MIN_DIGITS}–{PAYOUT_ACCOUNT_MAX_DIGITS} digit tanpa spasi atau tanda baca.
                     </p>
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <User size={16} className="text-slate-400" /> Atas Nama (Wajib Sesuai KTP)
                     </label>
                     <Input value={legalName} readOnly className="h-12 rounded-xl border-slate-200 bg-slate-100 text-slate-700" />
                     {accountHolder && accountHolder.toLocaleLowerCase("id-ID") !== legalName.toLocaleLowerCase("id-ID") && <p className="text-xs text-amber-700">Nama pada rekening tersimpan berbeda dari nama akun. Periksa kembali sebelum melanjutkan.</p>}
                     <p className="text-xs leading-5 text-slate-500">Nama ini diambil dari akun tutor. Jika tidak sama dengan KTP atau rekening bank, perbaiki identitas akun terlebih dahulu.</p>
                  </div>

                  <div className="pt-4">
                     <Button 
                        onClick={handleSave} 
                        disabled={isSaving || (payoutAmount !== undefined && !payoutAvailable)}
                        title={payoutAmount !== undefined && !payoutAvailable ? "Menunggu aktivasi verifikasi nama rekening dari bank" : undefined}
                        className="w-full h-12 rounded-xl bg-slate-900 hover:bg-indigo-600 font-bold text-base shadow-lg shadow-slate-900/20 transition-all"
                     >
                        {isSaving ? <span className="flex items-center gap-2"><Loader2 className="animate-spin"/> {payoutAmount !== undefined ? "Memproses pencairan..." : "Menyimpan..."}</span> : (
                           <span className="flex items-center gap-2">{payoutAmount !== undefined ? <Send size={18}/> : <Save size={18}/>} {payoutAmount !== undefined ? (payoutAvailable ? "Cairkan dana" : "Cairkan dana · menunggu verifikasi") : "Simpan Rekening"}</span>
                        )}
                     </Button>
                  </div>
               </CardContent>
            </Card>

            {/* --- KOLOM KANAN: INFORMASI KEAMANAN --- */}
            <div className="space-y-6 order-1 lg:order-2 flex flex-col items-center lg:items-start">
               {/* Info Box */}
               <div className="w-full bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-3 items-start">
                  <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                     <h4 className="font-bold text-amber-800 text-sm">Penting:</h4>
                     <ul className="text-xs text-amber-700 space-y-1 list-disc ml-4">
                        <li>Pastikan nama pemilik rekening sama dengan nama di profil tutor Anda.</li>
                        <li>Nama yang ditampilkan berasal dari profil, bukan hasil pengecekan bank.</li>
                        <li>Pencairan hanya dapat dikirim setelah layanan verifikasi nama rekening diaktifkan dan pemeriksaan berhasil.</li>
                     </ul>
                  </div>
               </div>

               <div className="flex items-center gap-2 justify-center w-full text-slate-400 text-xs">
                  <ShieldCheck size={14} />
                  <span>Akses data rekening dibatasi untuk proses pencairan.</span>
               </div>
            </div>

          </div>
      </div>
  );
}

export default function TeacherBankSettingsPage() {
  return <TeacherLayout title="Dompet Tutor"><TeacherBankSettings /></TeacherLayout>;
}

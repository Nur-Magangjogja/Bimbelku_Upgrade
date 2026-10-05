import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

type Chapter = { id: number; title: string };
export type LearningFocusMode = "chapters" | "text";
type FocusValue = { curriculum_chapter_ids: number[]; chapter: string; learning_goal: string; focus_mode?: LearningFocusMode };
interface Props {
  id: string;
  subjectId: number | "";
  level: string;
  grade: string;
  showChapters: boolean;
  isProgram: boolean;
  value: FocusValue;
  onChange: (patch: Partial<FocusValue>) => void;
}

export default function LearningFocusPicker({ id, subjectId, level, grade, showChapters, isProgram, value, onChange }: Props) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const latest = useRef({ value, onChange });
  useEffect(() => { latest.current = { value, onChange }; }, [value, onChange]);
  const canChoose = Boolean(subjectId && showChapters && !isProgram);
  const mode = canChoose ? value.focus_mode || (value.curriculum_chapter_ids.length ? "chapters" : value.learning_goal.trim() ? "text" : "chapters") : "text";

  useEffect(() => {
    let active = true;
    setChapters([]);
    setError(false);
    if (!canChoose) {
      setLoading(false);
      if (latest.current.value.curriculum_chapter_ids.length) latest.current.onChange({ curriculum_chapter_ids: [], chapter: "", focus_mode: "text" });
      return;
    }
    setLoading(true);
    void import("@/lib/http").then(({ getCached }) => getCached<{ chapters: Chapter[] }>("/learning-catalog", {
      params: { curriculum_subject_id: subjectId, education_level: level, grade }, maxAgeMs: 60_000,
    })).then(({ data }) => {
      if (!active) return;
      const available = data.chapters || [];
      setChapters(available);
      const selected = latest.current.value.curriculum_chapter_ids;
      const valid = available.filter((chapter) => selected.includes(chapter.id));
      if (selected.length) latest.current.onChange({ curriculum_chapter_ids: valid.map((chapter) => chapter.id), chapter: valid.map((chapter) => chapter.title).join(", ") });
    }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canChoose, subjectId, level, grade, retry]);

  return (
    <div className="min-w-0 space-y-3">
      {canChoose && <fieldset>
        <legend className="mb-2 text-sm font-bold text-slate-700">Bagaimana kamu ingin menentukan materi?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {([ ["chapters", "Pilih bab tersedia"], ["text", "Tulis materi sendiri"] ] as const).map(([option, label]) => <label key={option} className={`flex min-h-12 min-w-0 cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-bold ${mode === option ? "border-indigo-500 bg-indigo-50 text-indigo-800" : "border-slate-200 bg-white text-slate-600"}`}>
            <input type="radio" name={`focus-mode-${id}`} value={option} checked={mode === option} onChange={() => onChange({ focus_mode: option, ...(option === "text" ? { curriculum_chapter_ids: [], chapter: "" } : {}) })} className="shrink-0 accent-indigo-600" />{label}
          </label>)}
        </div>
      </fieldset>}
      {mode === "chapters" && <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <p className="text-sm font-bold text-slate-700">Bab sesuai {level} · {grade}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Pilih satu atau beberapa bab, maksimal 8. Materi tidak cocok? Gunakan “Tulis materi sendiri”.</p>
        {loading ? <p role="status" className="mt-3 flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" />Memuat bab…</p> : error ? <div role="alert" className="mt-3 text-sm text-rose-700">Pilihan bab belum dapat dimuat. Kamu tetap bisa menulis materi sendiri.<button type="button" onClick={() => setRetry((current) => current + 1)} className="ml-2 min-h-10 font-bold underline">Coba lagi</button></div> : !chapters.length ? <p className="mt-3 text-sm text-slate-600">Belum ada bab untuk kelas ini. Pilih “Tulis materi sendiri” untuk melanjutkan.</p> : <div className="mt-3 max-h-64 space-y-2 overflow-y-auto overscroll-contain pr-1">
          {chapters.map((chapter) => {
            const checked = value.curriculum_chapter_ids.includes(chapter.id);
            return <label key={chapter.id} className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${checked ? "border-indigo-200 bg-indigo-50 text-indigo-900" : "border-slate-100 text-slate-700"}`}>
              <input type="checkbox" checked={checked} disabled={!checked && value.curriculum_chapter_ids.length >= 8} onChange={() => {
                const selected = checked ? value.curriculum_chapter_ids.filter((item) => item !== chapter.id) : [...value.curriculum_chapter_ids, chapter.id];
                onChange({ curriculum_chapter_ids: selected, chapter: chapters.filter((item) => selected.includes(item.id)).map((item) => item.title).join(", ") });
              }} className="mt-0.5 shrink-0 accent-indigo-600" /><span className="min-w-0 break-words">{chapter.title}</span>
            </label>;
          })}
        </div>}
        {!loading && !error && chapters.length > 0 && <p className="mt-2 text-xs text-slate-500">{value.curriculum_chapter_ids.length} dari {chapters.length} bab tersedia dipilih</p>}
      </div>}
      <div>
        <label htmlFor={`learning-goal-${id}`} className="mb-2 block text-sm font-bold text-slate-700">{mode === "chapters" ? "Catatan atau fokus tambahan (opsional)" : `Target atau materi yang ingin difokuskan${isProgram ? " (opsional)" : " *"}`}</label>
        <p id={`learning-goal-help-${id}`} className="mb-2 text-xs leading-5 text-slate-500">{mode === "chapters" ? "Jika perlu, jelaskan bagian bab yang paling ingin dibahas. Tidak wajib diisi jika sudah memilih bab." : isProgram ? "Tutor mengikuti materi program. Tambahkan target khusus jika ada." : "Ceritakan materi, kesulitan, atau tujuan belajar. Tidak perlu memilih bab dari daftar."}</p>
        <textarea id={`learning-goal-${id}`} aria-describedby={`learning-goal-help-${id}`} value={value.learning_goal} onChange={(event) => onChange({ learning_goal: event.target.value })} required={!isProgram && mode === "text"} maxLength={1500} rows={3} className="form-field block w-full min-w-0 resize-y" placeholder="Contoh: Masih kesulitan pecahan dan soal cerita. Ingin mengulang dari dasar." />
        <p className="mt-1 text-right text-xs text-slate-500">{value.learning_goal.length}/1500 karakter</p>
      </div>
    </div>
  );
}

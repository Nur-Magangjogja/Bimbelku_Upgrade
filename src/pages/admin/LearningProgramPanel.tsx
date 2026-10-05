import { useEffect, useState, type FormEvent } from "react";
import http, { getApiError } from "@/lib/http";
import { notify } from "@/lib/notify";
import { GRADES_BY_EDUCATION_LEVEL } from "@/lib/educationCatalog";

type Subject = { id: number; name: string; education_levels: string[]; grades: string[] };
type Category = { id: number; name: string };
type Program = { id: number; name: string; description: string | null; catalog_category_id: number | null; education_level: string; education_levels?: string[] | null; grade: string | null; is_active: boolean; sort_order: number; subjects: Subject[] };
type Form = { name: string; description: string; catalog_category_id: number | null; education_levels: string[]; grade: string; is_active: boolean; sort_order: number; subject_ids: number[] };
const blank: Form = { name: "", description: "", catalog_category_id: null, education_levels: ["SMA"], grade: "", is_active: false, sort_order: 0, subject_ids: [] };

export default function LearningProgramPanel({ categories }: { categories: Category[] }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [form, setForm] = useState<Form>(blank);
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [products, subjectsResponse] = await Promise.all([
        http.get<Program[]>("/admin/learning-programs"),
        http.get<Subject[]>("/admin/subjects", { params: { all: 1, active_only: 1 } }),
      ]);
      setPrograms(products.data);
      setSubjects(subjectsResponse.data);
    } catch (error) { notify.error(getApiError(error, "Program belajar belum dapat dimuat.")); }
  };
  useEffect(() => { void load(); }, []);

  const edit = (program: Program) => {
    setEditing(program.id);
    setForm({ name: program.name, description: program.description || "", catalog_category_id: program.catalog_category_id,
      education_levels: program.education_levels?.length ? program.education_levels : [program.education_level], grade: program.grade || "",
      is_active: program.is_active, sort_order: program.sort_order, subject_ids: program.subjects.map((item) => item.id) });
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, education_level: form.education_levels[0], grade: form.grade.trim() || null };
      if (editing) await http.put(`/admin/learning-programs/${editing}`, payload);
      else await http.post("/admin/learning-programs", payload);
      notify.success("Program belajar tersimpan.");
      setEditing(null); setForm(blank); await load();
    } catch (error) { notify.error(getApiError(error, "Program belajar gagal disimpan.")); }
    finally { setSaving(false); }
  };
  const toggle = (id: number) => setForm((current) => ({ ...current,
    subject_ids: current.subject_ids.includes(id) ? current.subject_ids.filter((item) => item !== id) : [...current.subject_ids, id],
  }));
  const eligibleSubjects = subjects.filter((item) => form.education_levels.every((level) =>
    item.education_levels?.includes(level)
    && (!item.grades?.length || (form.grade ? item.grades.includes(form.grade) : (GRADES_BY_EDUCATION_LEVEL[level] || []).some((grade) => item.grades.includes(grade))))));
  const toggleLevel = (level: string) => setForm((current) => {
    const education_levels = current.education_levels.includes(level)
      ? current.education_levels.filter((item) => item !== level)
      : [...current.education_levels, level];
    return { ...current, education_levels, grade: "", subject_ids: [] };
  });

  return <section id="programs" className="grid scroll-mt-24 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,430px)]">
    <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-xl font-black text-slate-900">Program belajar · satu produk</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Contoh: Persiapan UTBK berisi pilihan mapel. Murid memilih mapel serta jumlah sesi saat memesan, membayar sekali, lalu sistem mencari satu tutor berbeda untuk setiap mapel terpilih.</p>
      <div className="mt-5 space-y-3">{programs.map((program) => <article key={program.id} className="rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black text-slate-900">{program.name}</h3><p className="mt-1 text-xs font-bold text-slate-500">{(program.education_levels?.length ? program.education_levels : [program.education_level]).join(", ")}{program.grade ? ` · ${program.grade}` : ""} · {program.is_active ? "Tampil" : "Draf/nonaktif"}</p></div><button type="button" onClick={() => edit(program)} className="min-h-10 rounded-xl border border-slate-300 px-4 text-sm font-bold">Ubah</button></div>
        <p className="mt-3 text-sm text-slate-600">{program.subjects.map((item) => item.name).join(" + ")}</p>
      </article>)}{!programs.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Belum ada produk program. Tambahkan TKA pada formulir di samping.</p>}</div>
    </div>
    <form onSubmit={save} className="min-w-0 space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
      <h3 className="text-lg font-black text-slate-900">{editing ? "Ubah" : "Tambah"} program belajar</h3>
      <label className="block text-sm font-bold">Nama program<input required minLength={2} maxLength={120} className="form-field mt-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Persiapan TKA" /></label>
      <label className="block text-sm font-bold">Kategori katalog<select className="form-field mt-2" value={form.catalog_category_id ?? ""} onChange={(e) => setForm({ ...form, catalog_category_id: e.target.value ? Number(e.target.value) : null })}><option value="">Tanpa kategori</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <div className="grid gap-3 sm:grid-cols-2"><fieldset className="rounded-xl border border-slate-200 p-3"><legend className="px-1 text-sm font-bold">Jenjang peserta</legend><div className="flex flex-wrap gap-3">{["SD", "SMP", "SMA", "Umum"].map((level) => <label key={level} className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" checked={form.education_levels.includes(level)} onChange={() => toggleLevel(level)} />{level}</label>)}</div></fieldset><label className="block text-sm font-bold">Kelas (opsional; satu jenjang saja)<input className="form-field mt-2" disabled={form.education_levels.length !== 1} value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value, subject_ids: [] })} placeholder="Contoh: Kelas 12" /></label></div>
      <p className="text-xs leading-5 text-slate-500">TKA dapat dibatasi ke SMA. Program lintas usia seperti JLPT bisa ditawarkan ke beberapa jenjang termasuk Umum, selama semua mapelnya tersedia untuk jenjang tersebut.</p>
      <fieldset className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 p-3"><legend className="px-1 text-sm font-black">Pilihan mapel program ({form.subject_ids.length})</legend>{eligibleSubjects.map((subject) => <label key={subject.id} className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" checked={form.subject_ids.includes(subject.id)} onChange={() => toggle(subject.id)} />{subject.name}</label>)}</fieldset>
      <p className="text-xs leading-5 text-slate-500">Admin menentukan mapel yang tersedia, bukan jumlah sesi. Murid memilih satu atau beberapa mapel, paket sesi, dan jadwal. Bab tidak wajib untuk program; tutor menyusun materi sesuai target belajar murid.</p>
      <label className="block text-sm font-bold">Deskripsi<textarea maxLength={2000} className="form-field mt-2 min-h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />Tampilkan untuk pemesanan</label>
      <div className="flex gap-2"><button disabled={saving || form.subject_ids.length < 1 || form.education_levels.length < 1} className="min-h-11 flex-1 rounded-xl bg-orange-600 px-4 font-black text-white disabled:opacity-50">{saving ? "Menyimpan…" : "Simpan program"}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm(blank); }} className="rounded-xl border px-4 text-sm font-bold">Batal</button>}</div>
    </form>
  </section>;
}

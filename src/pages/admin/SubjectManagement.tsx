import { notify } from "@/lib/notify";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Loader2, Pencil, Plus, Power, Search, Trash2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import LearningProgramPanel from "./LearningProgramPanel";
import { useConfirmDialog } from "@/components/ConfirmDialogProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import http, { getApiError } from "@/lib/http";
import { filterAdminSubjects, type AdminSubjectFilters } from "@/lib/adminSubjectFilters";
import {
  EDUCATION_LEVELS,
  GRADES_BY_EDUCATION_LEVEL,
} from "@/lib/educationCatalog";

interface Subject {
  id: number;
  name: string;
  group_name: string;
  education_levels: string[];
  grades: string[];
  is_elective: boolean;
  is_active: boolean;
  show_chapter_selection?: boolean;
  curriculum_name?: string;
  edition?: string | null;
  source_url?: string | null;
  chapters_count?: number;
}

interface SubjectGroup {
  id: number;
  name: string;
  subject_count: number;
}

const levels = [...EDUCATION_LEVELS];
const gradesByLevel = GRADES_BY_EDUCATION_LEVEL;
const emptyForm = {
  name: "",
  group_name: "",
  education_levels: ["SD"] as string[],
  is_elective: false,
  is_active: true,
  show_chapter_selection: true,
};

export default function SubjectManagement() {
  const confirm = useConfirmDialog();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<SubjectGroup[]>([]);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SubjectGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminSubjectFilters["status"]>("active");
  const [editing, setEditing] = useState<Subject | null | undefined>(undefined);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [subjectResult, groupResult] = await Promise.allSettled([
        http.get<Subject[]>("/admin/subjects?all=1"),
        http.get<SubjectGroup[]>("/admin/subject-groups"),
      ]);
      if (subjectResult.status === "fulfilled") setSubjects(subjectResult.value.data || []);
      else notify.error(getApiError(subjectResult.reason, "Daftar mata pelajaran gagal dimuat."));
      if (groupResult.status === "fulfilled") setGroups(groupResult.value.data || []);
      else notify.error(getApiError(groupResult.reason, "Daftar kelompok mapel gagal dimuat."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => filterAdminSubjects(subjects, {
    search, category: categoryFilter, level: levelFilter, status: statusFilter,
  }), [search, categoryFilter, levelFilter, statusFilter, subjects]);
  const filtersChanged = Boolean(search || categoryFilter || levelFilter || statusFilter !== "active");
  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setLevelFilter("");
    setStatusFilter("active");
  };
  const groupOptions = useMemo(() => [...new Set([
    ...groups.map((group) => group.name),
    ...subjects.map((subject) => subject.group_name?.trim()).filter((group): group is string => Boolean(group)),
  ])].sort((left, right) => left.localeCompare(right, "id-ID")), [groups, subjects]);

  const resetGroupForm = () => {
    setEditingGroup(null);
    setNewGroupName("");
  };

  const saveGroup = async (event: FormEvent) => {
    event.preventDefault();
    const name = newGroupName.trim().replace(/\s+/g, " ");
    if (groupOptions.some((group) =>
      group.toLocaleLowerCase("id-ID") === name.toLocaleLowerCase("id-ID")
      && group.toLocaleLowerCase("id-ID") !== editingGroup?.name.toLocaleLowerCase("id-ID"))) {
      notify.error("Kelompok mapel ini sudah ada dalam daftar.");
      return;
    }
    setCreatingGroup(true);
    try {
      const response = editingGroup
        ? await http.put<{ message: string; data: SubjectGroup }>(`/admin/subject-groups/${editingGroup.id}`, { name })
        : await http.post<{ message: string; data: SubjectGroup }>("/admin/subject-groups", { name });
      setGroups((current) => editingGroup
        ? current.map((group) => group.id === editingGroup.id ? response.data.data : group)
        : [...current, response.data.data]);
      if (editingGroup) {
        setCategoryFilter((current) => current === editingGroup.name ? response.data.data.name : current);
        setSubjects((current) => current.map((subject) => subject.group_name === editingGroup.name
          ? { ...subject, group_name: response.data.data.name }
          : subject));
      }
      resetGroupForm();
      notify.success(response.data.message);
    } catch (error) {
      notify.error(getApiError(error, "Kelompok mapel gagal disimpan."));
    } finally {
      setCreatingGroup(false);
    }
  };

  const deleteGroup = async (group: SubjectGroup) => {
    if (group.subject_count > 0) return;
    const approved = await confirm({
      title: `Hapus kelompok ${group.name}?`,
      description: "Kelompok kosong ini akan dihapus dari pilihan mapel. Mapel dan Program lain tidak berubah.",
      confirmText: "Hapus kelompok",
      tone: "danger",
    });
    if (!approved) return;
    try {
      const response = await http.delete<{ message: string }>(`/admin/subject-groups/${group.id}`);
      setGroups((current) => current.filter((item) => item.id !== group.id));
      setCategoryFilter((current) => current === group.name ? "" : current);
      if (editingGroup?.id === group.id) resetGroupForm();
      notify.success(response.data.message);
    } catch (error) {
      notify.error(getApiError(error, "Kelompok mapel gagal dihapus."));
    }
  };

  const openForm = (subject?: Subject) => {
    setEditing(subject || null);
    setForm(subject ? {
      name: subject.name,
      group_name: subject.group_name || "",
      education_levels: subject.education_levels,
      is_elective: subject.is_elective,
      is_active: subject.is_active,
      show_chapter_selection: subject.show_chapter_selection !== false,
    } : emptyForm);
  };

  const toggleLevel = (level: string) => {
    setForm((current) => {
      const selected = current.education_levels.includes(level)
        ? current.education_levels.filter((item) => item !== level)
        : [...current.education_levels, level];
      return { ...current, education_levels: selected };
    });
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!groupOptions.includes(form.group_name)) {
      notify.error("Pilih kelompok mapel dari daftar.");
      return;
    }
    if (!form.education_levels.length) {
      notify.error("Pilih minimal satu jenjang.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        grades: form.education_levels.flatMap((level) => gradesByLevel[level]),
        curriculum_name: editing?.curriculum_name || "Kurikulum Merdeka",
        edition: editing?.edition || "Tahap 5",
        source_url: editing?.source_url || "https://buku.kemendikdasmen.go.id/",
      };
      const response = editing
        ? await http.put(`/admin/subjects/${editing.id}`, payload)
        : await http.post("/admin/subjects", payload);
      notify.success(response.data.message);
      setEditing(undefined);
      await load();
    } catch (error) {
      notify.error(getApiError(error, "Mata pelajaran gagal disimpan."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (subject: Subject) => {
    const approved = await confirm({
      title: subject.is_active ? "Hapus atau nonaktifkan mapel?" : "Hapus mapel?",
      description: subject.chapters_count
        ? `${subject.name} sudah mempunyai ${subject.chapters_count} bab. Data akan dinonaktifkan agar riwayat tetap aman.`
        : `${subject.name} akan dihapus jika belum pernah digunakan.`,
      confirmText: subject.chapters_count ? "Nonaktifkan" : "Lanjutkan",
      tone: "danger",
    });
    if (!approved) return;
    try {
      const response = await http.delete(`/admin/subjects/${subject.id}`);
      notify.success(response.data.message);
      await load();
    } catch (error) {
      notify.error(getApiError(error));
    }
  };

  const toggleActive = async (subject: Subject) => {
    try {
      const response = await http.put(`/admin/subjects/${subject.id}`, {
        name: subject.name,
        group_name: subject.group_name || "Umum",
        education_levels: subject.education_levels,
        grades: subject.grades,
        is_elective: subject.is_elective,
        is_active: !subject.is_active,
        curriculum_name: subject.curriculum_name || "Kurikulum Merdeka",
        edition: subject.edition,
        source_url: subject.source_url,
      });
      notify.success(response.data.message);
      await load();
    } catch (error) {
      notify.error(getApiError(error));
    }
  };

  return (
    <AdminLayout title="Kelola Mata Pelajaran">
      <div className="space-y-6 pb-12">
        <section className="flex flex-col justify-between gap-5 rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-6 text-white sm:p-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-indigo-200">Katalog pusat</p>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl">Satu daftar mapel untuk seluruh alur</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/75">Kelola kategori katalog, mapel, dan program belajar dalam satu tempat. Program seperti TKA mengikat beberapa mapel dalam satu pesanan.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Button variant="outline" onClick={() => setGroupDialogOpen(true)} className="min-h-11 rounded-xl border-white/30 bg-white/10 font-bold text-white hover:bg-white/20 hover:text-white"><Plus size={16} className="mr-1" />Tambah kategori</Button>
            <Button onClick={() => openForm()} className="min-h-11 rounded-xl bg-orange-500 font-bold hover:bg-orange-600"><Plus size={16} className="mr-1" />Tambah mapel</Button>
          </div>
        </section>

        <LearningProgramPanel categories={groups} />

        <section aria-label="Filter mata pelajaran" className="min-w-0 space-y-4 rounded-2xl border border-slate-100 bg-white p-4">
          <div>
            <Label htmlFor="subject-search">Cari mata pelajaran</Label>
            <div className="relative mt-2"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={17} /><Input id="subject-search" value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 rounded-xl pl-10" placeholder="Cari nama, kategori, atau jenjang" /></div>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-3">
            <div className="min-w-0">
              <Label htmlFor="subject-category-filter">Kategori katalog</Label>
              <select id="subject-category-filter" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="mt-2 h-11 w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Semua kategori</option>
                {groupOptions.map((group) => <option key={group} value={group}>{group}</option>)}
              </select>
            </div>
            <div className="min-w-0">
              <Label htmlFor="subject-level-filter">Jenjang</Label>
              <select id="subject-level-filter" value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} className="mt-2 h-11 w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Semua jenjang</option>
                {levels.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
            <div className="min-w-0">
              <Label htmlFor="subject-status-filter">Status mapel</Label>
              <select id="subject-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as AdminSubjectFilters["status"])} className="mt-2 h-11 w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
                <option value="all">Semua status</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <p aria-live="polite" role="status" className="text-sm text-slate-600">{loading ? "Memuat mata pelajaran…" : `${filtered.length} dari ${subjects.length} mapel ditampilkan`}</p>
            <Button type="button" variant="outline" disabled={!filtersChanged} onClick={resetFilters} className="min-h-10 rounded-xl">Reset filter</Button>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white">
          {loading ? (
            <div className="grid min-h-64 place-items-center"><Loader2 className="animate-spin text-indigo-600" /></div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-20 text-center"><BookOpen className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-black text-slate-700">Mapel tidak ditemukan</p><p className="mt-2 text-sm text-slate-500">Coba ubah pencarian, kategori, jenjang, atau status mapel.</p>{filtersChanged && <Button type="button" variant="outline" onClick={resetFilters} className="mt-4 min-h-10 rounded-xl">Reset filter</Button>}</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((subject) => (
                <div key={subject.id} className="flex flex-col gap-4 p-4 hover:bg-slate-50 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${subject.is_active ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400"}`}><BookOpen size={21} /></div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><p className="font-black text-slate-900">{subject.name}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${subject.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{subject.is_active ? "Aktif" : "Nonaktif"}</span>{subject.is_elective && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">Pilihan</span>}</div>
                      <p className="mt-1 text-sm text-slate-500">{subject.group_name || "Umum"} · {subject.education_levels.join(", ")}</p>
                      <p className="mt-1 text-xs font-bold text-indigo-600">{subject.chapters_count || 0} bab tersedia · Pilihan bab {subject.show_chapter_selection === false ? "disembunyikan" : "ditampilkan"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <Link to={`/admin/subjects/${subject.id}/page`} className="inline-flex min-h-10 min-w-0 items-center justify-center rounded-xl border border-orange-200 px-3 text-xs font-black text-orange-700">Halaman</Link>
                    <Button variant="outline" className="rounded-xl px-3" onClick={() => toggleActive(subject)} aria-label={subject.is_active ? "Nonaktifkan" : "Aktifkan"}><Power size={16} className="sm:mr-2" /><span className="hidden sm:inline">{subject.is_active ? "Nonaktifkan" : "Aktifkan"}</span></Button>
                    <Button variant="outline" className="rounded-xl px-3" onClick={() => openForm(subject)} aria-label="Ubah mapel"><Pencil size={16} /></Button>
                    <Button variant="ghost" className="rounded-xl px-3 text-rose-600 hover:bg-rose-50" onClick={() => remove(subject)} aria-label="Hapus mapel"><Trash2 size={16} /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Dialog open={groupDialogOpen} onOpenChange={(open) => { setGroupDialogOpen(open); if (!open) resetGroupForm(); }}>
        <DialogContent className="flex max-h-[calc(100dvh-1rem)] min-w-0 flex-col rounded-[2rem] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Kategori katalog</DialogTitle>
            <DialogDescription>Kategori katalog seperti Seni, Agama, Wajib, atau Les Anak. Perubahan nama ikut memperbarui mapel yang memakainya.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveGroup} className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Label htmlFor="new-subject-group">{editingGroup ? "Ubah nama kategori" : "Nama kategori baru"}</Label>
              <Input id="new-subject-group" required minLength={2} maxLength={80} value={newGroupName} onChange={(event) => setNewGroupName(event.target.value)} placeholder="Contoh: Olahraga" className="mt-2 h-11 rounded-xl" />
            </div>
            <Button type="submit" disabled={creatingGroup} className="min-h-11 w-full min-w-0 rounded-xl bg-orange-500 font-bold hover:bg-orange-600 sm:w-auto">{creatingGroup ? <Loader2 size={16} className="mr-1 animate-spin" /> : <Plus size={16} className="mr-1" />}{editingGroup ? "Simpan nama" : "Tambah kategori"}</Button>
          </form>
          {editingGroup && <button type="button" onClick={resetGroupForm} className="self-start text-xs font-bold text-slate-600 underline underline-offset-2">Batal mengubah</button>}
          <div className="min-h-0 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-3 px-1 text-xs font-black uppercase tracking-wider text-slate-500">Daftar kelompok ({groups.length})</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {groups.map((group) => <li key={group.id} className="min-w-0 space-y-2 rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800">
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-2"><span className="min-w-0 break-words">{group.name}</span><span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-black text-indigo-700">{group.subject_count} mapel</span></div>
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-2">
                  <button type="button" onClick={() => { setEditingGroup(group); setNewGroupName(group.name); }} className="min-h-10 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700">Ubah</button>
                  <button type="button" disabled={group.subject_count > 0} title={group.subject_count > 0 ? "Pindahkan mapel ke kelompok lain sebelum menghapus." : undefined} onClick={() => void deleteGroup(group)} className="min-h-10 rounded-lg border border-rose-200 px-3 text-xs font-bold text-rose-700 disabled:cursor-not-allowed disabled:opacity-40">Hapus</button>
                </div>
              </li>)}
            </ul>
            <p className="mt-3 text-xs leading-5 text-slate-500">Kelompok yang masih berisi mapel tidak bisa dihapus. Ubah kelompok pada mapelnya dahulu.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editing !== undefined} onOpenChange={(open) => !open && setEditing(undefined)}>
        <DialogContent className="rounded-[2rem] sm:max-w-xl">
          <form onSubmit={save} className="max-h-[calc(100dvh-5rem)] space-y-5 overflow-y-auto overscroll-contain pr-1">
            <DialogHeader>
              <DialogTitle>{editing ? "Ubah mata pelajaran" : "Tambah mata pelajaran"}</DialogTitle>
              <DialogDescription>Nama yang disimpan langsung tersedia pada dropdown tarif, tutor, materi, dan pemesanan.</DialogDescription>
            </DialogHeader>
            <div><Label>Nama mapel</Label><Input required minLength={2} className="mt-2 h-11 rounded-xl" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Contoh: Antropologi" /></div>
            <div>
              <Label htmlFor="subject-group-name">Kategori katalog</Label>
              <select id="subject-group-name" aria-describedby="subject-group-help" required className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={form.group_name} onChange={(event) => setForm((current) => ({ ...current, group_name: event.target.value }))}>
                <option value="" disabled>Pilih kelompok mapel</option>
                {groupOptions.map((group) => <option key={group} value={group}>{group}</option>)}
              </select>
              <p id="subject-group-help" className="mt-2 text-xs leading-5 text-slate-600">Kategori mengelompokkan mapel di katalog. Program belajar seperti TKA dibuat terpisah di bagian atas halaman ini dan boleh memakai beberapa mapel dari kategori yang berbeda.</p>
            </div>
            <div>
              <Label>Jenjang yang menggunakan mapel ini</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {levels.map((level) => {
                  const active = form.education_levels.includes(level);
                  return <button type="button" key={level} onClick={() => toggleLevel(level)} className={`h-11 rounded-xl border text-sm font-black transition ${active ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-600"}`}>{active && <CheckCircle2 size={14} className="mr-1 inline" />}{level}</button>;
                })}
              </div>
            </div>
            <label className="flex items-center justify-between gap-4 rounded-2xl bg-indigo-50 p-4"><span><span className="block text-sm font-black text-slate-800">Tampilkan pilihan bab kepada murid</span><span className="mt-1 block text-xs leading-5 text-slate-600">Jika aktif, murid dapat memilih bab sesuai jenjang dan kelas atau menulis materi sendiri. Jika nonaktif, murid hanya menulis materi. Data bab dan riwayat lama tidak dihapus. Program belajar tetap mengikuti materi program.</span></span><Switch className="shrink-0" checked={form.show_chapter_selection} onCheckedChange={(value) => setForm((current) => ({ ...current, show_chapter_selection: value }))} /></label>
            <label className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"><span><span className="block text-sm font-black text-slate-800">Mapel pilihan</span><span className="mt-1 block text-xs text-slate-500">Dapat dipakai untuk mapel pilihan sekolah atau keterampilan umum.</span></span><Switch checked={form.is_elective} onCheckedChange={(value) => setForm((current) => ({ ...current, is_elective: value }))} /></label>
            <Button disabled={saving} className="h-12 w-full rounded-xl bg-indigo-600 font-black hover:bg-indigo-700">{saving ? <Loader2 size={17} className="mr-2 animate-spin" /> : <BookOpen size={17} className="mr-2" />}Simpan mapel</Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

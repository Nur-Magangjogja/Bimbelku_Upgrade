export type MaterialProgressStatus = "not_started" | "in_progress" | "completed" | "review_needed" | string;

export type PackageLearningChapterProgress = {
  chapter: string;
  curriculum_chapter_id?: number | null;
  status: MaterialProgressStatus;
  needs_review?: boolean;
  started_at?: string | null;
  completed_at?: string | null;
};
export type PackageSubjectProgress = {
  id: number;
  name: string;
  chapter?: string | null;
  learning_goal?: string | null;
  allocated_sessions: number;
  status: string;
  teacher?: { id: number; name: string; avatar_url?: string | null } | null;
  sessions?: Array<{
    id: number;
    sequence?: number;
    start_at?: string | null;
    end_at?: string | null;
    status?: string;
    booking_id?: number | null;
  }>;
  learning_chapters?: PackageLearningChapterProgress[];
};

export type StudentPackageProgress = {
  id: number;
  package_code: string;
  status: string;
  plan?: { name?: string; validity_days?: number } | null;
  education_level?: string;
  grade?: string;
  learning_mode?: string;
  total_sessions: number;
  used_sessions: number;
  remaining_sessions: number;
  duration_hours?: number;
  total_learning_hours?: number;
  starts_at?: string | null;
  expires_at?: string | null;
  subjects?: PackageSubjectProgress[];
  latest_order?: { status?: string; order_kind?: string } | null;
};

export type CheapClassChapterProgress = {
  curriculum_subject_id?: number | null;
  subject_name: string;
  curriculum_chapter_id?: number | null;
  chapter: string;
  progress_status: "not_started" | "in_progress" | "completed";
  needs_review: boolean;
  progress_notes?: string | null;
  progress_updated_at?: string | null;
};

export type CheapClassProgress = {
  id: number;
  package_code?: string;
  subject_name: string;
  subjects?: CheapClassChapterProgress[];
  education_level?: string;
  grade?: string;
  chapter?: string;
  starts_at?: string;
  ends_at?: string;
  session_count: number;
  sessions?: Array<{
    id: number;
    session_number: number;
    starts_at: string;
    ends_at: string;
    status: string;
    progress_updates?: Array<{
      subject_index: number;
      subject_name: string;
      chapter: string;
      status_before: "not_started" | "in_progress" | "completed";
      status_after: "not_started" | "in_progress" | "completed";
      needs_review_before?: boolean;
      needs_review_after?: boolean;
      notes?: string | null;
    }>;
    progress_notes?: string | null;
    progress_recorded_at?: string | null;
  }>;
  status: string;
  enrollment?: {
    id: number;
    status: string;
    order_status?: string;
  } | null;
  teacher?: { name?: string; photo?: string | null } | null;
  progress_summary?: {
    total_chapters: number;
    completed_chapters: number;
    in_progress_chapters: number;
    progress_percent: number;
  };
};

export type PackageListResponse = StudentPackageProgress[] | { data?: StudentPackageProgress[] };

export const readPackageRows = (payload: PackageListResponse): StudentPackageProgress[] => {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.data) ? payload.data : [];
};

export const packageChapterStats = (item: StudentPackageProgress) => {
  const chapters = (item.subjects || []).flatMap((subject) => subject.learning_chapters || []);
  const total = chapters.length;
  const completed = chapters.filter((chapter) => chapter.status === "completed").length;
  const inProgress = chapters.filter((chapter) => chapter.status === "in_progress" || chapter.status === "review_needed").length;
  return {
    total,
    completed,
    inProgress,
    tracksChapters: total > 0,
    percent: total > 0 ? Math.round((completed / total) * 100)
      : item.total_sessions > 0 ? Math.max(0, Math.min(100, Math.round((item.used_sessions / item.total_sessions) * 100))) : 0,
  };
};

export const cheapClassChapterStats = (item: CheapClassProgress) => {
  if (item.progress_summary) {
    return {
      total: Number(item.progress_summary.total_chapters || 0),
      completed: Number(item.progress_summary.completed_chapters || 0),
      inProgress: Number(item.progress_summary.in_progress_chapters || 0),
      percent: Math.max(0, Math.min(100, Number(item.progress_summary.progress_percent || 0))),
    };
  }
  const chapters = item.subjects || [];
  const completed = chapters.filter((chapter) => chapter.progress_status === "completed").length;
  const inProgress = chapters.filter((chapter) => chapter.progress_status === "in_progress").length;
  return {
    total: chapters.length,
    completed,
    inProgress,
    percent: chapters.length > 0 ? Math.round((completed / chapters.length) * 100) : 0,
  };
};

export const isPackageProgressVisible = (item: StudentPackageProgress) =>
  ["matching", "teacher_pending", "no_teacher", "active", "completed"].includes(item.status);

export const isCheapClassProgressVisible = (item: CheapClassProgress) =>
  ["confirmed", "completed"].includes(item.status)
  && item.enrollment?.status === "confirmed"
  && item.enrollment?.order_status === "paid";

export const materialStatusLabel = (status?: string, needsReview = false) => {
  if (status === "completed" && needsReview) return "Selesai · perlu diulang";
  if (status === "completed") return "Selesai";
  if (status === "in_progress" || status === "review_needed") return "Sedang dipelajari";
  return "Belum dimulai";
};

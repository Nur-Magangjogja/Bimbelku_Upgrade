export interface AdminSubjectFilters {
  search: string;
  category: string;
  level: string;
  status: "active" | "inactive" | "all";
}

interface FilterableSubject {
  name: string;
  group_name: string;
  education_levels: string[];
  is_active: boolean;
}

export function filterAdminSubjects<T extends FilterableSubject>(subjects: T[], filters: AdminSubjectFilters): T[] {
  const search = filters.search.trim().toLocaleLowerCase("id-ID");
  return subjects.filter((subject) => {
    if (filters.status === "active" && !subject.is_active) return false;
    if (filters.status === "inactive" && subject.is_active) return false;
    if (filters.category && subject.group_name?.trim() !== filters.category) return false;
    if (filters.level && !subject.education_levels?.includes(filters.level)) return false;
    const haystack = `${subject.name} ${subject.group_name || ""} ${(subject.education_levels || []).join(" ")}`.toLocaleLowerCase("id-ID");
    return haystack.includes(search);
  });
}

export const maxWeekdaysForSessions = (count: number) => count === 1 ? 1 : count === 4 ? 2 : 4;

export const normalizeWeekdays = (values: unknown, maximum = 4): number[] => {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map(Number))]
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 7)
    .sort((a, b) => a - b)
    .slice(0, maximum);
};

/** Keep valid saved choices, without inventing days or exceeding the package-wide limit. */
export function normalizePackageWeekdays<T extends { weekdays: number[] }>(items: T[], sessionCount: number): T[] {
  const allowed = new Set(normalizeWeekdays(items.flatMap((item) => normalizeWeekdays(item.weekdays)), maxWeekdaysForSessions(sessionCount)));
  return items.map((item) => {
    const weekdays = normalizeWeekdays(item.weekdays).filter((day) => allowed.has(day));
    return weekdays.length === item.weekdays.length && weekdays.every((day, index) => day === item.weekdays[index])
      ? item : { ...item, weekdays };
  });
}

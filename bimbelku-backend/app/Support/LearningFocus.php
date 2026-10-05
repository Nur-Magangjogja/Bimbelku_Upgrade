<?php

namespace App\Support;

use App\Models\CurriculumChapter;
use Illuminate\Validation\ValidationException;

final class LearningFocus
{
    /** Normalize validated input for guest orders and signed-in orders alike. */
    public static function normalizeSubjects(array $subjects, bool $isProgram, ?string $level = null, ?string $grade = null): array
    {
        foreach ($subjects as $index => &$subject) {
            $goal = trim((string) ($subject['learning_goal'] ?? ''));
            if (! $isProgram && $goal === '' && empty($subject['curriculum_chapter_ids'])) {
                throw ValidationException::withMessages([
                    "subjects.{$index}.learning_goal" => 'Pilih minimal satu bab yang tersedia atau ceritakan target/materi yang ingin dipelajari untuk setiap mapel.',
                ]);
            }
            $ids = $subject['curriculum_chapter_ids'] ?? [];
            if ($ids !== [] && $level !== null && $grade !== null) {
                $count = CurriculumChapter::query()
                    ->where('curriculum_subject_id', $subject['curriculum_subject_id'])
                    ->where('education_level', $level)->where('grade', $grade)
                    ->where('is_active', true)->whereIn('id', $ids)->count();
                if ($count !== count($ids)) {
                    throw ValidationException::withMessages([
                        "subjects.{$index}.curriculum_chapter_ids" => 'Ada bab yang tidak sesuai mapel, jenjang, atau kelas, atau sudah tidak aktif. Pilih ulang bab atau tulis materi sendiri.',
                    ]);
                }
            }
            $subject['learning_goal'] = $goal !== '' ? $goal : null;
        }
        unset($subject);

        return $subjects;
    }
}

<?php

namespace App\Services;

use App\Models\LearningPackage;

/** Split the amount actually paid across program subjects and their sessions. */
class PackageEarningsAllocation
{
    public const TEACHER_SHARE_PERCENT = 80;

    /**
     * @return array<int, array{gross_amount: float, teacher_net_amount: float, sessions: array<int, array{gross_amount: float, teacher_net_amount: float}>}>
     */
    public function forPackage(LearningPackage $package): array
    {
        $package->loadMissing('subjects.sessions');
        $subjects = $package->subjects->sortBy('id')->values();
        $durationHours = max(1, (int) $package->duration_hours);
        $bases = $subjects->mapWithKeys(fn ($subject) => [
            $subject->id => max(0, (int) round(
                (float) ($subject->tutor_hourly_gross ?? $subject->unit_price)
                * $durationHours * (int) $subject->allocated_sessions * 100
            )),
        ]);
        $baseTotal = (int) $bases->sum();
        $paidCents = max(0, (int) round((float) $package->total_amount * 100));
        $teacherCents = (int) round($paidCents * self::TEACHER_SHARE_PERCENT / 100);
        $result = [];
        $cumulativeBase = 0;
        $allocatedGross = 0;
        $allocatedNet = 0;

        foreach ($subjects as $subject) {
            $cumulativeBase += (int) ($bases[$subject->id] ?? 0);
            $subjectGross = $baseTotal > 0
                ? (int) round($paidCents * $cumulativeBase / $baseTotal) - $allocatedGross
                : ($subject->id === $subjects->last()?->id ? $paidCents - $allocatedGross : 0);
            $allocatedGross += $subjectGross;
            $subjectNet = $paidCents > 0
                ? (int) round($teacherCents * $allocatedGross / $paidCents) - $allocatedNet
                : 0;
            $allocatedNet += $subjectNet;

            $sessions = $subject->sessions->sortBy('sequence')->values();
            $sessionCount = $sessions->count();
            $sessionGrossSoFar = 0;
            $sessionNetSoFar = 0;
            $sessionAmounts = [];
            foreach ($sessions as $index => $session) {
                $sessionGrossTotal = (int) round($subjectGross * ($index + 1) / $sessionCount);
                $sessionNetTotal = (int) round($subjectNet * ($index + 1) / $sessionCount);
                $sessionAmounts[$session->id] = [
                    'gross_amount' => ($sessionGrossTotal - $sessionGrossSoFar) / 100,
                    'teacher_net_amount' => ($sessionNetTotal - $sessionNetSoFar) / 100,
                ];
                $sessionGrossSoFar = $sessionGrossTotal;
                $sessionNetSoFar = $sessionNetTotal;
            }

            $result[$subject->id] = [
                'gross_amount' => $subjectGross / 100,
                'teacher_net_amount' => $subjectNet / 100,
                'sessions' => $sessionAmounts,
            ];
        }

        return $result;
    }
}

<?php

namespace Tests\Feature;

use App\Models\LearningPackage;
use App\Models\PackageSession;
use App\Models\PackageSubject;
use App\Services\PackageEarningsAllocation;
use Tests\TestCase;

class ProgramTwoHourPriceAllocationTest extends TestCase
{
    public function test_rounding_remainder_is_never_lost_between_subjects(): void
    {
        $package = new LearningPackage(['duration_hours' => 2, 'total_amount' => 100.01]);
        $subjects = collect(range(1, 3))->map(function (int $id) {
            $subject = new PackageSubject(['allocated_sessions' => 1, 'unit_price' => 100, 'tutor_hourly_gross' => 100]);
            $subject->id = $id;
            $session = new PackageSession(['sequence' => 1]);
            $session->id = $id;
            $subject->setRelation('sessions', collect([$session]));

            return $subject;
        });
        $package->setRelation('subjects', $subjects);

        $allocation = app(PackageEarningsAllocation::class)->forPackage($package);

        $this->assertEqualsWithDelta(100.01, collect($allocation)->sum('gross_amount'), 0.001);
        $this->assertEqualsWithDelta(80.01, collect($allocation)->sum('teacher_net_amount'), 0.001);
    }

    public function test_two_hour_discounted_program_reconciles_student_payment_and_all_tutors(): void
    {
        $package = new LearningPackage(['duration_hours' => 2, 'total_amount' => 630000]);
        $subjects = collect([100000, 50000, 25000])->map(function (int $hourly, int $index) {
            $subject = new PackageSubject([
                'allocated_sessions' => 2,
                'unit_price' => $hourly,
                'tutor_hourly_gross' => $hourly,
            ]);
            $subject->id = $index + 1;
            $sessions = collect([1, 2])->map(function (int $sequence) use ($index) {
                $session = new PackageSession(['sequence' => $sequence]);
                $session->id = ($index + 1) * 10 + $sequence;

                return $session;
            });
            $subject->setRelation('sessions', $sessions);

            return $subject;
        });
        $package->setRelation('subjects', $subjects);

        $allocation = app(PackageEarningsAllocation::class)->forPackage($package);

        $this->assertEquals(360000, $allocation[1]['gross_amount']);
        $this->assertEquals(180000, $allocation[2]['gross_amount']);
        $this->assertEquals(90000, $allocation[3]['gross_amount']);
        $this->assertEquals(180000, $allocation[1]['sessions'][11]['gross_amount']);
        $this->assertEquals(144000, $allocation[1]['sessions'][11]['teacher_net_amount']);
        $this->assertEquals(630000, collect($allocation)->sum('gross_amount'));
        $this->assertEquals(504000, collect($allocation)->sum('teacher_net_amount'));
        $this->assertEquals(
            630000.0,
            collect($allocation)->flatMap(fn (array $subject) => $subject['sessions'])->sum('gross_amount')
        );
    }
}

<?php

namespace Tests\Feature;

use App\Models\BookingRequest;
use App\Models\LearningPackage;
use App\Models\LearningTimeSlot;
use App\Models\Order;
use App\Models\PackagePlan;
use App\Models\PackageSession;
use App\Models\PackageSubject;
use App\Models\TeacherAvailability;
use App\Models\TeacherOffer;
use App\Models\TeacherProfile;
use App\Models\TeacherSubject;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PackageRescheduleMatchingRetryTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_changing_unavailable_schedule_offers_the_matching_tutor_immediately(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-09-30 09:00:00', 'Asia/Jakarta'));
        [$student, $teacher, $package, $subject, $request] = $this->fixture('2026-10-03 14:00:00');
        Sanctum::actingAs($student);

        $this->postJson("/api/student/packages/{$package->id}/reschedule", [
            'subjects' => [[
                'package_subject_id' => $subject->id,
                'schedules' => ['2026-10-05T14:00:00+07:00'],
            ]],
        ])->assertOk();

        $request->refresh();
        $this->assertSame('teacher_pending', $request->status);
        $this->assertNull($request->next_matching_at);
        $this->assertSame('matching', $subject->fresh()->status);
        $this->assertSame('matching', $package->fresh()->status);
        $this->assertSame('2026-10-05', $request->scheduled_date->format('Y-m-d'));
        $this->assertSame('Latihan membaca dan memahami teks.', $request->learning_goal);
        $this->assertSame('Latihan membaca dan memahami teks.', $subject->fresh()->learning_goal);
        $this->assertDatabaseHas('teacher_offers', [
            'booking_request_id' => $request->id,
            'teacher_id' => $teacher->id,
            'status' => 'pending',
        ]);
        $this->assertDatabaseHas('matching_operation_logs', [
            'booking_request_id' => $request->id,
            'action' => 'schedule_changed',
        ]);
    }

    public function test_manual_retry_ignores_the_old_waiting_deadline(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-09-30 09:00:00', 'Asia/Jakarta'));
        [$student, $teacher, $package, $subject, $request] = $this->fixture('2026-10-05 14:00:00');
        Sanctum::actingAs($student);

        $this->postJson("/api/student/packages/{$package->id}/retry")
            ->assertOk();

        $this->assertSame('teacher_pending', $request->fresh()->status);
        $this->assertNull($request->fresh()->next_matching_at);
        $this->assertSame('matching', $subject->fresh()->status);
        $this->assertSame('matching', $package->fresh()->status);
        $this->assertSame($teacher->id, TeacherOffer::query()->firstOrFail()->teacher_id);
    }

    private function fixture(string $sessionAt): array
    {
        $student = User::factory()->create(['role' => 'student', 'status' => 'active']);
        $teacher = User::factory()->create(['role' => 'teacher', 'status' => 'active']);
        $profile = TeacherProfile::create([
            'user_id' => $teacher->id,
            'is_accepting_requests' => true,
            'verified_at' => now()->subDay(),
        ]);
        TeacherSubject::create([
            'teacher_profile_id' => $profile->id,
            'name' => 'Bahasa Indonesia',
            'levels' => ['SMA'],
            'is_active' => true,
            'is_online' => true,
            'is_offline' => false,
            'is_private_active' => true,
        ]);
        TeacherAvailability::create([
            'user_id' => $teacher->id,
            'day' => 'Senin',
            'start_time' => '08:00:00',
            'end_time' => '16:00:00',
            'is_active' => true,
        ]);
        LearningTimeSlot::create(['start_time' => '14:00:00', 'is_active' => true]);

        $plan = PackagePlan::create([
            'name' => 'Paket Uji Pencarian Ulang',
            'slug' => 'uji-pencarian-ulang',
            'session_count' => 1,
            'validity_days' => 30,
            'maximum_subjects' => 1,
            'is_active' => true,
        ]);
        $package = LearningPackage::create([
            'student_id' => $student->id,
            'package_plan_id' => $plan->id,
            'package_code' => 'PKG-RETRY-'.uniqid(),
            'education_level' => 'SMA',
            'grade' => 'Kelas 12',
            'learning_mode' => 'online',
            'duration_hours' => 1,
            'status' => 'no_teacher',
            'total_sessions' => 1,
            'used_sessions' => 0,
            'subtotal_amount' => 50000,
            'discount_amount' => 0,
            'total_amount' => 50000,
        ]);
        $subject = PackageSubject::create([
            'learning_package_id' => $package->id,
            'subject_name' => 'Bahasa Indonesia',
            'allocated_sessions' => 1,
            'learning_goal' => 'Latihan membaca dan memahami teks.',
            'unit_price' => 50000,
            'subtotal_amount' => 50000,
            'status' => 'no_teacher',
        ]);
        $start = Carbon::parse($sessionAt, 'Asia/Jakarta');
        PackageSession::create([
            'package_subject_id' => $subject->id,
            'sequence' => 1,
            'scheduled_start_at' => $start,
            'scheduled_end_at' => $start->copy()->addHour(),
            'status' => 'planned',
        ]);
        $request = BookingRequest::create([
            'student_id' => $student->id,
            'package_subject_id' => $subject->id,
            'subject_name' => 'Bahasa Indonesia',
            'education_level' => 'SMA',
            'learning_goal' => 'Latihan membaca dan memahami teks.',
            'grade' => 'Kelas 12',
            'learning_mode' => 'online',
            'class_type' => 'private',
            'scheduled_date' => $start->toDateString(),
            'start_time' => $start->format('H:i:s'),
            'end_time' => $start->copy()->addHour()->format('H:i:s'),
            'duration_hours' => 1,
            'status' => 'no_teacher',
            'search_started_at' => now(),
            'search_expires_at' => now()->addHours(24),
            'next_matching_at' => now()->addMinutes(30),
        ]);
        Order::create([
            'user_id' => $student->id,
            'learning_package_id' => $package->id,
            'order_id' => 'INV-RETRY-'.uniqid(),
            'subtotal_amount' => 50000,
            'discount_amount' => 0,
            'amount' => 50000,
            'status' => 'paid',
        ]);

        return [$student, $teacher, $package, $subject, $request];
    }
}

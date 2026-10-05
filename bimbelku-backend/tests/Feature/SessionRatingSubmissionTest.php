<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingParticipant;
use App\Models\BookingRequest;
use App\Models\Classroom;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SessionRatingSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_approved_session_can_be_rated_without_legacy_classroom(): void
    {
        [$student, $teacher, $booking] = $this->makeSession();
        Sanctum::actingAs($student);
        $this->postJson('/api/ratings', [
            'booking_id' => $booking->id, 'rating' => 5, 'review' => 'Materi TKA dijelaskan dengan jelas.',
        ])->assertCreated()->assertJsonPath('data.booking_id', $booking->id)
            ->assertJsonPath('data.teacher_id', $teacher->id)->assertJsonPath('data.classroom_id', null);
        $this->assertDatabaseHas('ratings', [
            'booking_id' => $booking->id, 'student_id' => $student->id,
            'teacher_id' => $teacher->id, 'classroom_id' => null, 'rating' => 5,
        ]);
        $this->assertDatabaseCount('classrooms', 0);
        $this->postJson('/api/ratings', ['booking_id' => $booking->id, 'rating' => 3])
            ->assertUnprocessable()->assertJsonPath('message', 'Anda sudah mengulas sesi ini.');
        $this->assertDatabaseCount('ratings', 1);
        $class = collect($this->getJson('/api/student/classes')->assertOk()->json())
            ->firstWhere('id', $booking->id);
        $this->assertFalse($class['can_rate']);
    }

    public function test_sessions_on_one_order_are_rated_for_their_own_tutors(): void
    {
        [$student, $firstTeacher, $firstBooking] = $this->makeSession();
        [, $secondTeacher, $secondBooking] = $this->makeSession($student, $firstBooking->order);
        Sanctum::actingAs($student);
        foreach ([[$firstBooking, $firstTeacher, 5], [$secondBooking, $secondTeacher, 4]] as [$booking, $teacher, $stars]) {
            $this->postJson('/api/ratings', ['booking_id' => $booking->id, 'rating' => $stars])
                ->assertCreated()->assertJsonPath('data.teacher_id', $teacher->id);
        }
        $this->assertDatabaseCount('ratings', 2);
        $this->assertDatabaseCount('classrooms', 0);
    }

    public function test_unrelated_student_and_unapproved_session_cannot_be_rated(): void
    {
        [$student, , $booking] = $this->makeSession();
        Sanctum::actingAs(User::factory()->create(['role' => 'student', 'status' => 'active']));
        $this->postJson('/api/ratings', ['booking_id' => $booking->id, 'rating' => 5])->assertForbidden();
        Sanctum::actingAs($student);
        $booking->update(['status' => 'awaiting_student_approval']);
        $this->postJson('/api/ratings', ['booking_id' => $booking->id, 'rating' => 5])->assertUnprocessable();
        $booking->update(['status' => 'completed']);
        $booking->participants()->update(['status' => 'no_show_confirmed']);
        $this->postJson('/api/ratings', ['booking_id' => $booking->id, 'rating' => 5])->assertUnprocessable();
        $this->assertDatabaseCount('ratings', 0);
    }

    public function test_legacy_classroom_reference_is_preserved_when_available(): void
    {
        [$student, $teacher, $booking] = $this->makeSession();
        $classroom = Classroom::create([
            'user_id' => $teacher->id, 'title' => 'Privat lama', 'subject' => 'Matematika', 'type' => 'private',
        ]);
        $booking->order->update(['classroom_id' => $classroom->id]);
        Sanctum::actingAs($student);
        $this->postJson('/api/ratings', ['booking_id' => $booking->id, 'rating' => 5])
            ->assertCreated()->assertJsonPath('data.classroom_id', $classroom->id);
    }

    private function makeSession(?User $student = null, ?Order $order = null): array
    {
        $student ??= User::factory()->create(['role' => 'student', 'status' => 'active']);
        $teacher = User::factory()->create(['role' => 'teacher', 'status' => 'active']);
        $request = BookingRequest::create([
            'student_id' => $student->id, 'matched_teacher_id' => $teacher->id,
            'subject_name' => 'Matematika', 'education_level' => 'SMA', 'grade' => 'Kelas 12',
            'chapter' => 'Persiapan TKA', 'learning_mode' => 'online', 'class_type' => 'private',
            'scheduled_date' => now()->subHours(2)->toDateString(),
            'start_time' => now()->subHours(2)->format('H:i:s'), 'end_time' => now()->subHour()->format('H:i:s'),
            'duration_hours' => 1, 'status' => 'completed', 'hourly_rate' => 50000, 'total_amount' => 50000,
        ]);
        $booking = Booking::create([
            'booking_request_id' => $request->id,
            'student_id' => $student->id, 'teacher_id' => $teacher->id,
            'start_at' => now()->subHours(2), 'end_at' => now()->subHour(),
            'duration_hours' => 1, 'learning_mode' => 'online', 'class_type' => 'private',
            'status' => 'completed', 'session_flow_version' => 'presence_confirmation_v2',
            'hourly_rate' => 50000, 'total_amount' => 50000,
            'gross_amount' => 50000, 'teacher_net_amount' => 40000, 'payout_status' => 'ready',
        ]);
        $order ??= Order::create([
            'user_id' => $student->id, 'booking_id' => $booking->id,
            'order_id' => 'INV-RATING-'.$booking->id, 'amount' => 50000, 'status' => 'paid',
        ]);
        $booking->update(['order_id' => $order->id]);
        BookingParticipant::create([
            'booking_request_id' => $request->id,
            'booking_id' => $booking->id, 'student_id' => $student->id,
            'order_id' => $order->id, 'amount' => 50000, 'status' => 'approved', 'approved_at' => now(),
        ]);

        return [$student, $teacher, $booking->fresh()];
    }
}

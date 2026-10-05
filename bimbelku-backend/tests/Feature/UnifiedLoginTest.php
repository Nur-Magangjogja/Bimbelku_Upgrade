<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\TeacherProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UnifiedLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_use_shared_login_and_keeps_short_session(): void
    {
        User::factory()->create(['email' => 'admin@example.test', 'password' => Hash::make('password'), 'role' => 'admin', 'status' => 'active']);

        $this->postJson('/api/login', [
            'email' => 'admin@example.test',
            'password' => 'password',
            'login_portal' => 'user',
            'remember_device' => true,
        ])->assertOk()->assertJsonPath('user.role', 'admin')->assertJsonPath('remember_device', false);
        $this->postJson('/api/login', ['email' => 'admin@example.test', 'password' => 'password'])
            ->assertOk()->assertJsonPath('user.role', 'admin');
    }

    public function test_legacy_portal_or_submitted_role_cannot_promote_student_to_admin(): void
    {
        User::factory()->create(['email' => 'student@example.test', 'password' => Hash::make('password'), 'role' => 'student', 'status' => 'active']);

        $login = $this->postJson('/api/login', [
            'email' => 'student@example.test',
            'password' => 'password',
            'login_portal' => 'admin',
            'role' => 'admin',
        ])->assertOk()->assertJsonPath('user.role', 'student');
        $this->withToken($login->json('access_token'))->getJson('/api/admin/subjects?all=1')->assertForbidden();
    }

    public function test_verified_teacher_can_use_shared_login(): void
    {
        $teacher = User::factory()->create(['email' => 'teacher@example.test', 'password' => Hash::make('password'), 'role' => 'teacher', 'status' => 'active']);
        TeacherProfile::create(['user_id' => $teacher->id, 'expertise' => 'Matematika', 'verified_at' => now()]);
        $this->postJson('/api/login', ['email' => $teacher->email, 'password' => 'password'])
            ->assertOk()->assertJsonPath('user.role', 'teacher');
    }

    public function test_shared_login_rejects_inactive_admin_and_pending_teacher(): void
    {
        foreach ([['admin', 'rejected'], ['teacher', 'pending']] as [$role, $status]) {
            $user = User::factory()->create(['password' => Hash::make('password'), 'role' => $role, 'status' => $status]);
            $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])->assertForbidden();
            $this->assertSame(0, $user->tokens()->count());
        }
    }
}

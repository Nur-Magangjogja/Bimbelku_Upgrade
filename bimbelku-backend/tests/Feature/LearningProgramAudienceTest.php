<?php

namespace Tests\Feature;

use App\Models\CurriculumSubject;
use App\Models\PackagePlan;
use App\Models\User;
use App\Services\LearningProgramSelection;
use Database\Seeders\StageFiveExperienceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LearningProgramAudienceTest extends TestCase
{
    use RefreshDatabase;

    public function test_program_can_target_multiple_levels_without_opening_sma_only_program_to_everyone(): void
    {
        $this->seed(StageFiveExperienceSeeder::class);
        $plan = PackagePlan::query()->where('is_active', true)->firstOrFail();
        $subject = CurriculumSubject::query()->create([
            'name' => 'Bahasa Jepang', 'normalized_name' => 'bahasa-jepang',
            'group_name' => 'Les Bahasa', 'education_levels' => ['SMP', 'SMA', 'Umum'],
            'grades' => ['Kelas 7', 'Kelas 8', 'Kelas 9', 'Kelas 10', 'Kelas 11', 'Kelas 12', 'Semua tingkat', 'Pemula', 'Menengah', 'Lanjutan'],
            'is_active' => true,
        ]);
        Sanctum::actingAs(User::factory()->create(['role' => 'admin', 'status' => 'active']));
        $program = $this->postJson('/api/admin/learning-programs', [
            'name' => 'Persiapan JLPT', 'education_levels' => ['SMP', 'SMA', 'Umum'],
            'grade' => null, 'is_active' => true, 'sort_order' => 1,
            'subject_ids' => [$subject->id],
        ])->assertCreated()->json('data');
        $this->assertSame(['SMP', 'SMA', 'Umum'], $program['education_levels']);

        $selection = app(LearningProgramSelection::class);
        $subjects = [['curriculum_subject_id' => $subject->id]];
        $this->assertSame($program['id'], $selection->validate($program['id'], $plan->id, 'SMP', 'Kelas 9', $subjects)->id);
        $this->assertSame($program['id'], $selection->validate($program['id'], $plan->id, 'Umum', 'Pemula', $subjects)->id);
        try {
            $selection->validate($program['id'], $plan->id, 'SD', 'Kelas 6', $subjects);
            $this->fail('SD should not be able to order this program.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('learning_program_id', $e->errors());
        }
    }
}

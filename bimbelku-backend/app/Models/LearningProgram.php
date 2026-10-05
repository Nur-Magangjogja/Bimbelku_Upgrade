<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearningProgram extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['is_active' => 'boolean', 'sort_order' => 'integer', 'education_levels' => 'array'];

    public function availableEducationLevels(): array
    {
        return $this->education_levels ?: [$this->education_level];
    }

    public function subjects()
    {
        return $this->belongsToMany(CurriculumSubject::class, 'learning_program_subject')
            ->withPivot('sort_order')->orderByPivot('sort_order');
    }

    public function plan()
    {
        return $this->belongsTo(PackagePlan::class, 'package_plan_id');
    }

    public function category()
    {
        return $this->belongsTo(CurriculumSubjectGroup::class, 'catalog_category_id');
    }
}

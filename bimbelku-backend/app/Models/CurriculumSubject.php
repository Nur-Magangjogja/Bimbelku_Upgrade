<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CurriculumSubject extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'education_levels' => 'array',
        'grades' => 'array',
        'is_elective' => 'boolean',
        'is_active' => 'boolean',
        'show_chapter_selection' => 'boolean',
    ];

    public function chapters(): HasMany
    {
        return $this->hasMany(CurriculumChapter::class);
    }
}

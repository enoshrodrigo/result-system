<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class short_course_mark extends Model
{
    protected $fillable=['assign_short_course_subjects_id','short_course_student_id','marks','grade'];

    use HasFactory;
}

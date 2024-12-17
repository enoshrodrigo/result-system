<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class certificate_level_three extends Model
{
    protected $fillable = ['level_student_id','level_course_id','Grammar & Writing','Reading & Vocabulary','Speech & Listening','status'];

    use HasFactory;
}

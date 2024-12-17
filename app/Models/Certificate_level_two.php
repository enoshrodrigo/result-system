<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate_level_two extends Model
{
    protected $fillable=['level_student_id','level_course_id','Grammar & Writing','Reading & Vocabulary','Speech & Listening','status'];
    use HasFactory;
}

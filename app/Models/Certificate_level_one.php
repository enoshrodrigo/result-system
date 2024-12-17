<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate_level_one extends Model
{
    
    protected $fillable = ['level_student_id','level_course_id','language_paper','Speech_and_listening','status'];

    use HasFactory;
}

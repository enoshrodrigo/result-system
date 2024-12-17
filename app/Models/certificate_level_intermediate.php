<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class certificate_level_intermediate extends Model
{
    protected $fillable = ['level_student_id','level_course_id','Grammar','Compostion','Comprehesion','Speech','status'];
    use HasFactory;
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class short_course_statu extends Model
{
    protected $fillable=['status_batch_course_id','status_student_id','status'];
    use HasFactory;
}

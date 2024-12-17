<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class assign_short_course_subject extends Model
{
    protected $fillable=['course_batch_id','short_subject_id'];

    use HasFactory;
}

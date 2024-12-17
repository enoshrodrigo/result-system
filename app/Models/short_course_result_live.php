<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class short_course_result_live extends Model
{
    protected $fillable=['short_batch_course_id','live'];
    use HasFactory;
}

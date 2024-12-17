<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class department_course extends Model
{
    protected $fillable=['course_name','department_code_course','course_code'];

    use HasFactory;
}

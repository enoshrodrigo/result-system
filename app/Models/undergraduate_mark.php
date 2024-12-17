<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class undergraduate_mark extends Model
{
    protected $fillable=['assign_undergraduate_subjects_id','undergraduate_students_id ','marks','grade'];

    use HasFactory;
}

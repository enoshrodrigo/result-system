<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class assign_undergraduate_subject extends Model
{
    protected $fillable=['assign_subject_id','assign_semester_id'];

    use HasFactory;
}

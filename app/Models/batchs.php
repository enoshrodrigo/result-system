<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class batchs extends Model
{
    protected $fillable=['batch_course_id','batch_name','batch_year','batch_code'];
    use HasFactory;
}

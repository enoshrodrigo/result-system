<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class semester_undergraduate extends Model
{
    protected $fillable=['semester name','semester_code','semester_year','batch_semester_code','undergraduate_live'];

    use HasFactory;
}

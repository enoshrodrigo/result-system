<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class undergraduate_student extends Model
{
    protected $fillable=['student_id','first_name','last_name','NIC_PO'];

    use HasFactory;
}

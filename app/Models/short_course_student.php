<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class short_course_student extends Model
{
    // protected $fillable=['NIC_PO','first_name','last_name','email'];
    protected $fillable=['first_name','NIC_PO'];


    use HasFactory;
}

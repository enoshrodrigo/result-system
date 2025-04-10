<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class short_course_student extends Model
{
    // protected $fillable=['NIC_PO','first_name','last_name','email'];
    protected $fillable=['first_name','NIC_PO','email','profile_image','password'];


    use HasFactory;
    public function setPasswordAttribute($value)
{
    $this->attributes['password'] = Hash::make($value);
}
}

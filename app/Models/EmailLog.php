<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'student_id',
        'student_name',
        'nic',
        'email',
        'subject',
        'batch_code',
        'batch_name',
        'email_type',
        'status',
        'tracking_id',
        'opened',
        'opened_at',
        'ip_address',
        'opened_ip_address',
        'user_agent',
        'opened_user_agent',
        'error',
    ];
    
    protected $casts = [
        'opened' => 'boolean',
        'opened_at' => 'datetime',
    ];
}
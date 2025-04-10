<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailOperation extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'operation_type',
        'batch_id',
        'subject',
        'batch_code',
        'email_count',
        'progress',
        'ip_address',
        'user_agent',
        'stopped',
        'stopped_at',
    ];
    
    protected $casts = [
        'progress' => 'array',
        'stopped' => 'boolean',
        'stopped_at' => 'datetime',
    ];
}
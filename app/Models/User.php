<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
    public function hasRole($roleToCheck)
    {
        // No role assigned to user
        if (empty($this->role)) {
            return false;
        }
        
        // Convert user's role to array (in case it's a comma-separated list)
        $userRoles = explode(',', $this->role);
        $userRoles = array_map('trim', $userRoles);
        
        // Check if the requested role is in the user's roles
        return in_array(trim($roleToCheck), $userRoles);
    }

public function isAdmin()
{
    return $this->role === 'admin';
}
}

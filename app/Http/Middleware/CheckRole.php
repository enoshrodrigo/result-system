<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next,  $roles)
    {
        // No authenticated user
        if (!$request->user()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Convert comma-separated string to array
        $allowedRoles = explode(',', $roles);
        
        // Check if user has any of the allowed roles
        foreach ($allowedRoles as $role) {
            if ($request->user()->hasRole(trim($role))) {
                return $next($request);
            }
        }
        
        abort(403, 'Unauthorized action.');
    }
}

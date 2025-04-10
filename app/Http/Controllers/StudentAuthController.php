<?php

namespace App\Http\Controllers;

use App\Models\short_course_student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class StudentAuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('StudentView/Login');
    }
    
    public function login(Request $request)
    {
        $request->validate([
            'nic' => 'required',
            'password' => 'required',
        ]);
        
        $student = short_course_student::where('NIC_PO', $request->nic)->first();
        
        if (!$student || !Hash::check($request->password, $student->password)) {
            return back()->withErrors([
                'nic' => 'The provided credentials are incorrect.',
            ]);
        }
        
        // Store student info in session
        session(['student_id' => $student->id]);
        session(['student_nic' => $student->NIC_PO]);
        session(['student_authenticated' => true]);
        
        return redirect()->route('student.profile');
    }
    
    public function logout(Request $request)
    {
        $request->session()->forget(['student_id', 'student_nic', 'student_authenticated']);
        return redirect()->route('student.login');
    }
}
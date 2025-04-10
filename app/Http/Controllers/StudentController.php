<?php

namespace App\Http\Controllers;

use App\Mail\StudentEmail;
use App\Models\short_course_student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;

class StudentController extends Controller
{
    /**
     * Display a listing of students with pagination and hierarchical filtering
     */
    public function index(Request $request)
    {
        // Get all filters
        $search = $request->input('search');
        $departmentFilter = $request->input('department');
        $courseFilter = $request->input('course');
        $batchFilter = $request->input('batch');
        $subjectFilter = $request->input('subject');
        $sortField = $request->input('sortField', 'first_name');
        $sortDirection = $request->input('sortDirection', 'asc');
        $perPage = 10; // Items per page
        
        // Base query for students
        $query = short_course_student::query();
        
        // Apply text search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('NIC_PO', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        // Apply department filter (students in batches that belong to courses in this department)
        if ($departmentFilter) {
            $query->whereExists(function ($query) use ($departmentFilter) {
                $query->select(DB::raw(1))
                    ->from('short_course_students as scs')
                    ->join('short_course_status', 'scs.id', '=', 'short_course_status.status_student_id')
                    ->join('batchs', 'short_course_status.status_batch_course_id', '=', 'batchs.id')
                    ->join('department_courses', 'batchs.batch_course_id', '=', 'department_courses.id')
                    ->where('department_courses.department_code_course', $departmentFilter)
                    ->whereRaw('short_course_students.NIC_PO = scs.NIC_PO');
            });
        }
        
        // Apply course filter
        if ($courseFilter) {
            $query->whereExists(function ($query) use ($courseFilter) {
                $query->select(DB::raw(1))
                    ->from('short_course_students as scs')
                    ->join('short_course_status', 'scs.id', '=', 'short_course_status.status_student_id')
                    ->join('batchs', 'short_course_status.status_batch_course_id', '=', 'batchs.id')
                    ->where('batchs.batch_course_id', $courseFilter)
                    ->whereRaw('short_course_students.NIC_PO = scs.NIC_PO');
            });
        }
        
        // Apply batch filter
        if ($batchFilter) {
            $query->whereExists(function ($query) use ($batchFilter) {
                $query->select(DB::raw(1))
                    ->from('short_course_students as scs')
                    ->join('short_course_status', 'scs.id', '=', 'short_course_status.status_student_id')
                    ->where('short_course_status.status_batch_course_id', $batchFilter)
                    ->whereRaw('short_course_students.NIC_PO = scs.NIC_PO');
            });
        }
        
        // Apply subject filter
        if ($subjectFilter) {
            $query->whereExists(function ($query) use ($subjectFilter) {
                $query->select(DB::raw(1))
                    ->from('short_course_students as scs')
                    ->join('short_course_marks', 'scs.id', '=', 'short_course_marks.short_course_student_id')
                    ->join('assign_short_course_subjects', 'short_course_marks.assign_short_course_subjects_id', '=', 'assign_short_course_subjects.id')
                    ->where('assign_short_course_subjects.short_subject_id', $subjectFilter)
                    ->whereRaw('short_course_students.NIC_PO = scs.NIC_PO');
            });
        }
        
        // Apply sorting
        $query->orderBy($sortField, $sortDirection);
        
        // Get paginated results
        $students = $query->paginate($perPage)->withQueryString();
        
        // Get batch data for each student
        foreach ($students as $student) {
            // Get batches the student is enrolled in with course information
            $student->batches = DB::table('short_course_students')
                ->join('short_course_status', 'short_course_students.id', '=', 'short_course_status.status_student_id')
                ->join('batchs', 'batchs.id', '=', 'short_course_status.status_batch_course_id')
                ->join('department_courses', 'batchs.batch_course_id', '=', 'department_courses.id')
                ->join('departments', 'department_courses.department_code_course', '=', 'departments.id')
                ->where('short_course_students.NIC_PO', $student->NIC_PO)
                ->select(
                    'batchs.id',
                    'batchs.batch_name', 
                    'batchs.batch_code', 
                    'batchs.batch_year',
                    'department_courses.id as course_id',
                    'department_courses.course_name',
                    'department_courses.department_code_course',
                    'departments.id as department_code_course',
                    'departments.department_name',
                    'departments.department_code'
                )
                ->get();
            
            // Get subjects the student is studying
            $student->subjects = DB::table('short_course_marks')
                ->join('short_course_students', 'short_course_students.id', '=', 'short_course_marks.short_course_student_id')
                ->join('assign_short_course_subjects', 'assign_short_course_subjects.id', '=', 'short_course_marks.assign_short_course_subjects_id')
                ->join('subjects', 'subjects.id', '=', 'assign_short_course_subjects.short_subject_id')
                ->where('short_course_students.NIC_PO', $student->NIC_PO)
                ->select('subjects.id', 'subjects.subject_name', 'subjects.subject_code')
                ->distinct()
                ->get();
        }
        
        // Get all departments for dropdown
        $departments = DB::table('departments')
            ->select('id', 'department_name', 'department_code')
            ->orderBy('department_name', 'asc')
            ->get();
        
        // Get all courses for dropdown (optionally filtered by department)
        $coursesQuery = DB::table('department_courses')
            ->join('departments', 'department_courses.department_code_course', '=', 'departments.id')
            ->select(
                'department_courses.id', 
                'department_courses.course_name', 
                'department_courses.department_code_course', 
                'department_courses.course_code',
                'department_courses.department_code_course',
                'departments.department_name',
                'departments.department_code'
            );
            
        if ($departmentFilter) {
            $coursesQuery->where('department_courses.department_code_course', $departmentFilter);
        }
        
        $courses = $coursesQuery->orderBy('department_courses.course_name', 'asc')->get();
        
        // Get all batches for dropdown (optionally filtered by course or department)
        $batchesQuery = DB::table('batchs')
            ->join('department_courses', 'batchs.batch_course_id', '=', 'department_courses.id')
            ->select(
                'batchs.id', 
                'batchs.batch_name', 
                'batchs.batch_code', 
                'batchs.batch_year', 
                'batchs.batch_course_id',
                'department_courses.course_name',
                'department_courses.department_code_course',
                'department_courses.department_code_course'
            );
            
        if ($courseFilter) {
            $batchesQuery->where('batchs.batch_course_id', $courseFilter);
        } elseif ($departmentFilter) {
            $batchesQuery->where('department_courses.department_code_course', $departmentFilter);
        }
        
        $batches = $batchesQuery->orderBy('batchs.batch_name', 'asc')->get();
        
        // Get all subjects for dropdown (optionally filtered by batch)
        $subjectsQuery = DB::table('subjects')
            ->select('subjects.id', 'subjects.subject_name', 'subjects.subject_code');
            
        if ($batchFilter) {
            $subjectsQuery->join('assign_short_course_subjects', 'subjects.id', '=', 'assign_short_course_subjects.short_subject_id')
                ->where('assign_short_course_subjects.course_batch_id', $batchFilter)
                ->distinct();
        }
        
        $subjects = $subjectsQuery->orderBy('subjects.subject_name', 'asc')->get();
        
        // Get statistics
        $statistics = [
            'totalStudents' => short_course_student::count(),
            'totalBatches' => DB::table('batchs')->count(),
            'recentlyAdded' => short_course_student::where('created_at', '>=', Carbon::now()->subMonth())->count(),
            'withEmail' => short_course_student::whereNotNull('email')->where('email', '!=', '')->count(),
        ];
        
        return Inertia::render('StudentManagement/Index', [
            'students' => $students,
            'departments' => $departments,
            'courses' => $courses,
            'batches' => $batches,
            'subjects' => $subjects,
            'statistics' => $statistics,
            'filters' => [
                'search' => $search,
                'department' => $departmentFilter,
                'course' => $courseFilter,
                'batch' => $batchFilter,
                'subject' => $subjectFilter,
                'sortField' => $sortField,
                'sortDirection' => $sortDirection,
            ],
            'pagination' => [
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
                'per_page' => $students->perPage(),
                'total' => $students->total(),
                'from' => $students->firstItem() ?? 0,
                'to' => $students->lastItem() ?? 0,
            ],
        ]);
    }
    
    /**
     * Store a newly created student
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'NIC_PO' => 'required|string|unique:short_course_students,NIC_PO|max:50',
            'email' => 'nullable|email|max:255',
            'mobile_number' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6',
        ]);
           // Hash password if provided
    if (isset($validated['password']) && !empty($validated['password'])) {
        $validated['password'] = $validated['password'];
    }
        short_course_student::create($validated);
        
        return redirect()->route('students.index')->with('success', 'Student added successfully!');
    }
    
    /**
     * Update the specified student
     */
    public function update(Request $request, short_course_student $student)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'NIC_PO' => "required|string|max:50|unique:short_course_students,NIC_PO,{$student->id}",
            'email' => 'nullable|email|max:255',
            'mobile_number' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6',
        ]);
            
    // Only update password if provided
    if (isset($validated['password']) && !empty($validated['password'])) {
        $validated['password'] = $validated['password'];
    } else {
        // Don't update the password if not provided
        unset($validated['password']);
    }
        
        $student->update($validated);
        
        return redirect()->route('students.index')->with('success', 'Student updated successfully!');
    }
    
    /**
     * Remove the specified student
     */
    public function destroy(short_course_student $student)
    {
        $hasEnrollments = DB::table('short_course_students')
            ->join('short_course_status', 'short_course_students.id', '=', 'short_course_status.status_student_id')
            ->where('short_course_students.NIC_PO', $student->NIC_PO)
            ->exists();
            
        if ($hasEnrollments) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete student as they are enrolled in one or more batches'
            ], 400);
        }
        
        $student->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Student deleted successfully'
        ]);
    }

    // Add these methods to your StudentController class

/**
 * Export students data to CSV
 */
public function export(Request $request)
{
    // Get all filters
    $search = $request->input('search');
    $departmentFilter = $request->input('department');
    $courseFilter = $request->input('course');
    $batchFilter = $request->input('batch');
    $subjectFilter = $request->input('subject');
    $sortField = $request->input('sortField', 'first_name');
    $sortDirection = $request->input('sortDirection', 'asc');
    
    // Base query for students (reusing the same filtering logic from index method)
    $query = short_course_student::query();
    
    // Apply text search filter
    if ($search) {
        $query->where(function($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('NIC_PO', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }
    
    // Apply department filter (students in batches that belong to courses in this department)
    if ($departmentFilter) {
        $query->whereExists(function ($query) use ($departmentFilter) {
            $query->select(DB::raw(1))
                ->from('short_course_students as scs')
                ->join('short_course_status', 'scs.id', '=', 'short_course_status.status_student_id')
                ->join('batchs', 'short_course_status.status_batch_course_id', '=', 'batchs.id')
                ->join('department_courses', 'batchs.batch_course_id', '=', 'department_courses.id')
                ->where('department_courses.department_code_course', $departmentFilter)
                ->whereRaw('short_course_students.NIC_PO = scs.NIC_PO');
        });
    }
    
    // Apply course filter
    if ($courseFilter) {
        $query->whereExists(function ($query) use ($courseFilter) {
            $query->select(DB::raw(1))
                ->from('short_course_students as scs')
                ->join('short_course_status', 'scs.id', '=', 'short_course_status.status_student_id')
                ->join('batchs', 'short_course_status.status_batch_course_id', '=', 'batchs.id')
                ->where('batchs.batch_course_id', $courseFilter)
                ->whereRaw('short_course_students.NIC_PO = scs.NIC_PO');
        });
    }
    
    // Apply batch filter
    if ($batchFilter) {
        $query->whereExists(function ($query) use ($batchFilter) {
            $query->select(DB::raw(1))
                ->from('short_course_students as scs')
                ->join('short_course_status', 'scs.id', '=', 'short_course_status.status_student_id')
                ->where('short_course_status.status_batch_course_id', $batchFilter)
                ->whereRaw('short_course_students.NIC_PO = scs.NIC_PO');
        });
    }
    
    // Apply subject filter
    if ($subjectFilter) {
        $query->whereExists(function ($query) use ($subjectFilter) {
            $query->select(DB::raw(1))
                ->from('short_course_students as scs')
                ->join('short_course_marks', 'scs.id', '=', 'short_course_marks.short_course_student_id')
                ->join('assign_short_course_subjects', 'short_course_marks.assign_short_course_subjects_id', '=', 'assign_short_course_subjects.id')
                ->where('assign_short_course_subjects.short_subject_id', $subjectFilter)
                ->whereRaw('short_course_students.NIC_PO = scs.NIC_PO');
        });
    }
    
    // Apply sorting
    $query->orderBy($sortField, $sortDirection);
    
    // Get all results (no pagination for export)
    $students = $query->get();
    
    // Get batch data for each student
    foreach ($students as $student) {
        // Get batches the student is enrolled in
        $student->batches = DB::table('short_course_students')
            ->join('short_course_status', 'short_course_students.id', '=', 'short_course_status.status_student_id')
            ->join('batchs', 'batchs.id', '=', 'short_course_status.status_batch_course_id')
            ->join('department_courses', 'batchs.batch_course_id', '=', 'department_courses.id')
            ->where('short_course_students.NIC_PO', $student->NIC_PO)
            ->select('batchs.batch_name', 'batchs.batch_code', 'batchs.batch_year')
            ->get();
        
        // Convert batches to comma-separated string
        $student->batch_names = $student->batches->pluck('batch_name')->implode(', ');
        $student->batch_codes = $student->batches->pluck('batch_code')->implode(', ');
    }
    
    // Set CSV headers
    $headers = [
        'Content-Type' => 'text/csv',
        'Content-Disposition' => 'attachment; filename="students-export-' . date('Y-m-d') . '.csv"',
        'Pragma' => 'no-cache',
        'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
        'Expires' => '0'
    ];
    
    // Create CSV file
    $callback = function() use ($students) {
        $file = fopen('php://output', 'w');
        
        // Add header row
        fputcsv($file, [
            'ID',
            'First Name',
            'Last Name',
            'NIC/Passport',
            'Email',
            'Mobile Number',
            'Batch Codes',
            'Batch Names',
            'Created At',
            'Updated At'
        ]);
        
        // Add data rows
        foreach ($students as $student) {
            fputcsv($file, [
                $student->id,
                $student->first_name,
                $student->last_name,
                $student->NIC_PO,
                $student->email,
                $student->mobile_number,
                $student->batch_codes ?? '',
                $student->batch_names ?? '',
                $student->created_at,
                $student->updated_at
            ]);
        }
        
        fclose($file);
    };
    
    return response()->stream($callback, 200, $headers);
}

/**
 * Send email to a student
 */
public function email(Request $request)
{
    $validated = $request->validate([
        'student_id' => 'required|exists:short_course_students,id',
        'subject' => 'required|string|max:255',
        'body' => 'required|string'
    ]);
    
    $student = short_course_student::findOrFail($validated['student_id']);
    
    // Check if student has email
    if (empty($student->email)) {
        return response()->json([
            'success' => false,
            'message' => 'Student does not have an email address.'
        ], 400);
    }
    
    try {
        // Send email
        Mail::to($student->email)->send(new StudentEmail(
            $student,
            $validated['subject'],
            $validated['body']
        ));
        
        return response()->json([
            'success' => true,
            'message' => 'Email sent successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to send email: ' . $e->getMessage()
        ], 500);
    }
}
}
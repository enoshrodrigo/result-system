<?php

namespace App\Http\Controllers;

use App\Models\department;
use App\Models\department_course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DepartmentController extends Controller
{
    /**
     * Display the department management page
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $type = $request->input('type', 'departments'); // 'departments' or 'courses'
        $departmentFilter = $request->input('department');
        $sortField = $request->input('sortField', 'created_at');
        $sortDirection = $request->input('sortDirection', 'desc');
        $perPage = 10;
        
        // Get departments with student counts
        $departmentsQuery = department::query()
            ->select('departments.*')
            ->selectRaw('(
                SELECT COUNT(DISTINCT scs.id) 
                FROM short_course_students scs
                JOIN short_course_status scs_status ON scs.id = scs_status.status_student_id
                JOIN batchs b ON scs_status.status_batch_course_id = b.id
                JOIN department_courses dc ON b.batch_course_id = dc.id
                WHERE dc.department_code_course = departments.id
            ) as student_count');
            
        if ($search && $type === 'departments') {
            $departmentsQuery->where(function($q) use ($search) {
                $q->where('department_name', 'like', "%{$search}%")
                  ->orWhere('department_code', 'like', "%{$search}%");
            });
        }
        
        // Only allow valid columns for departments table
if (in_array($sortField, ['department_name', 'department_code', 'created_at', 'id'])) {
    $departmentsQuery->orderBy($sortField, $sortDirection);
} else {
    // Default to created_at if an invalid column is requested
    $departmentsQuery->orderBy('created_at', $sortDirection);
}
        $departments = $departmentsQuery->paginate($perPage)->withQueryString();
        
        // Get courses with student counts
        $coursesQuery = department_course::query()
            ->join('departments', 'department_courses.department_code_course', '=', 'departments.id')
            ->select(
                'department_courses.*',
                'departments.department_name',
                'departments.department_code'
            )
            ->selectRaw('(
                SELECT COUNT(DISTINCT scs.id) 
                FROM short_course_students scs
                JOIN short_course_status scs_status ON scs.id = scs_status.status_student_id
                JOIN batchs b ON scs_status.status_batch_course_id = b.id
                WHERE b.batch_course_id = department_courses.id
            ) as student_count');
            
        if ($search && $type === 'courses') {
            $coursesQuery->where(function($q) use ($search) {
                $q->where('department_courses.course_name', 'like', "%{$search}%")
                  ->orWhere('department_courses.course_code', 'like', "%{$search}%");
            });
        }
        
        if ($departmentFilter && $type === 'courses') {
            $coursesQuery->where('department_courses.department_code_course', $departmentFilter);
        }
        
        if ($sortField === 'department_code') {
            $coursesQuery->orderBy('departments.department_code', $sortDirection);
        } else if ($sortField === 'department_name') {
            $coursesQuery->orderBy('departments.department_name', $sortDirection);
        } else if (in_array($sortField, ['course_name', 'course_code', 'created_at', 'id'])) {
            $coursesQuery->orderBy('department_courses.' . $sortField, $sortDirection);
        } else {
            // Default to created_at if an invalid column is requested
            $coursesQuery->orderBy('department_courses.created_at', $sortDirection);
        }
        $courses = $coursesQuery->paginate($perPage)->withQueryString();
        
        // Get statistics
        $statistics = [
            'totalDepartments' => department::count(),
            'totalCourses' => department_course::count(),
            'recentlyAdded' => ($type === 'departments' ? 
                department::where('created_at', '>=', Carbon::now()->subMonth())->count() :
                department_course::where('created_at', '>=', Carbon::now()->subMonth())->count()
            ),
            'totalStudents' => DB::table('short_course_students')->count(),
        ];
        
        return Inertia::render('DepartmentManagement/Index', [
            'departments' => $type === 'departments' ? $departments : null,
            'courses' => $type === 'courses' ? $courses : null,
            'departmentsList' => department::select('id', 'department_name', 'department_code')->get(),
            'statistics' => $statistics,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'department' => $departmentFilter,
                'sortField' => $sortField,
                'sortDirection' => $sortDirection,
            ]
        ]);
    }
    
    /**
     * Store a new department
     */
    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'department_name' => 'required|string|max:255',
            'department_code' => 'required|string|max:50|unique:departments,department_code'
        ]);
        
        department::create($validated);
        
        return redirect()->back()->with('success', 'Department created successfully');
    }
    
    /**
     * Update an existing department
     */
    public function updateDepartment(Request $request, $id)
    {
        $department = department::findOrFail($id);
        
        $validated = $request->validate([
            'department_name' => 'required|string|max:255',
            'department_code' => 'required|string|max:50|unique:departments,department_code,' . $id
        ]);
        
        $department->update($validated);
        
        return redirect()->back()->with('success', 'Department updated successfully');
    }
    
    /**
     * Delete a department
     */
    public function destroyDepartment($id)
    {
        $department = department::findOrFail($id);
        
        // Check if department has associated courses
        $hasAssociatedCourses = department_course::where('department_code_course', $id)->exists();
        
        if ($hasAssociatedCourses) {
            return redirect()->back()->with('error', 'Cannot delete department with associated courses');
        }
        
        $department->delete();
        
        return redirect()->back()->with('success', 'Department deleted successfully');
    }
    
    /**
     * Store a new course
     */
    public function storeCourse(Request $request)
    {
        $validated = $request->validate([
            'course_name' => 'required|string|max:255',
            'course_code' => 'required|string|max:50|unique:department_courses,course_code',
            'department_code_course' => 'required|exists:departments,id'
        ]);
        
        department_course::create($validated);
        
        return redirect()->back()->with('success', 'Course created successfully');
    }
    
    /**
     * Update an existing course
     */
    public function updateCourse(Request $request, $id)
    {
        $course = department_course::findOrFail($id);
        
        $validated = $request->validate([
            'course_name' => 'required|string|max:255',
            'course_code' => 'required|string|max:50|unique:department_courses,course_code,' . $id,
            'department_code_course' => 'required|exists:departments,id'
        ]);
        
        $course->update($validated);
        
        return redirect()->back()->with('success', 'Course updated successfully');
    }
    
    /**
     * Delete a course
     */
    public function destroyCourse($id)
    {
        $course = department_course::findOrFail($id);
        
        // Check if course has associated batches
        $hasAssociatedBatches = DB::table('batchs')->where('batch_course_id', $id)->exists();
        
        if ($hasAssociatedBatches) {
            return redirect()->back()->with('error', 'Cannot delete course with associated batches');
        }
        
        $course->delete();
        
        return redirect()->back()->with('success', 'Course deleted successfully');
    }
}
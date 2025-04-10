<?php

namespace App\Http\Controllers;

use App\Models\short_course_student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StudentProfile extends Controller
{
    //

    public function show()
    {
        $studentId = session('student_id');
        if (!$studentId) {
            return redirect()->route('student.login');
        }
        
        $student = short_course_student::findOrFail($studentId);
        
        // Get student's batches with course and department info
        $studentBatches = DB::table('short_course_students')
            ->join('short_course_status', 'short_course_students.id', '=', 'short_course_status.status_student_id')
            ->join('batchs', 'batchs.id', '=', 'short_course_status.status_batch_course_id')
            ->join('department_courses', 'batchs.batch_course_id', '=', 'department_courses.id')
            ->join('departments', 'department_courses.department_code_course', '=', 'departments.id')
            ->join('short_course_result_lives', 'batchs.id', '=', 'short_course_result_lives.short_batch_course_id')
            ->where('short_course_result_lives.profile_view', true)
            ->where('short_course_status.student_profile_view', true)
            ->where('short_course_students.id', $studentId)
            ->select(
                'batchs.id as batch_id',
                'batchs.batch_name', 
                'batchs.batch_code', 
                'batchs.batch_year',
                'department_courses.id as course_id',
                'department_courses.course_name',
                'department_courses.department_code_course',
                'departments.id as department_id',
                'departments.department_name',
                'departments.department_code',
                'short_course_status.id as status_id',
                'short_course_status.status',
                
            )->orderBy('batchs.created_at', 'desc')
            ->get();
        
        // Get results and calculate statistics (reuse your existing code)
        $results = [];
        $resultStats = $this->calculateGradeStats($studentId);
        
        // Loop through batches to get marks
        $batches = [];
        foreach ($studentBatches as $batch) {
            // Get subjects and marks (from your existing code)
            $subjects = DB::table('assign_short_course_subjects')
                ->join('subjects', 'subjects.id', '=', 'assign_short_course_subjects.short_subject_id')
                ->where('assign_short_course_subjects.course_batch_id', $batch->batch_id)
                ->select(
                    'subjects.id as subject_id',
                    'subjects.subject_name',
                    'subjects.subject_code',
                    'assign_short_course_subjects.id as assign_id',
                )
                ->get();
            
            $subjectsWithMarks = [];
            foreach ($subjects as $subject) {
                $marks = DB::table('short_course_marks')
                    ->where('short_course_marks.short_course_student_id', $studentId)
                    ->where('short_course_marks.assign_short_course_subjects_id', $subject->assign_id)
                    ->select(
                        'short_course_marks.id as mark_id',
                        'short_course_marks.marks',
                        'short_course_marks.grade',
                        'short_course_marks.created_at',
                        'short_course_marks.updated_at'
                    )
                    ->first();
                
                if ($marks) {
                    $results[] = [
                        'subject_name' => $subject->subject_name,
                        'subject_code' => $subject->subject_code,
                        'batch_code' => $batch->batch_code,
                        'grade' => $marks->grade,
                        'marks' => $marks->marks,
                        'exam_date' => $marks->created_at
                    ];
                }
                
                $subjectsWithMarks[] = [
                    'subject_id' => $subject->subject_id,
                    'subject_name' => $subject->subject_name,
                    'subject_code' => $subject->subject_code,
                    'marks' => $marks ? $marks->marks : null,
                    'grade' => $marks ? $marks->grade : null,
                    'mark_id' => $marks ? $marks->mark_id : null,
                    'exam_date' => $marks ? $marks->created_at : null
                ];
            }
            
            // Calculate batch statistics
            $totalMarks = 0;
            $totalSubjects = count($subjectsWithMarks);
            $passedSubjects = 0;
            $gradePoints = 0;
            
            foreach ($subjectsWithMarks as $subject) {
                if ($subject['marks']) {
                    $totalMarks += $subject['marks'];
                    
                    // Grade calculation as in your existing code
                    if ($subject['grade']) {
                        switch ($subject['grade']) {
                            case 'A+': $gradePoints += 4.0; $passedSubjects++; break;
                            case 'A': $gradePoints += 4.0; $passedSubjects++; break;
                            case 'A-': $gradePoints += 3.7; $passedSubjects++; break;
                            case 'B+': $gradePoints += 3.3; $passedSubjects++; break;
                            case 'B': $gradePoints += 3.0; $passedSubjects++; break;
                            case 'B-': $gradePoints += 2.7; $passedSubjects++; break;
                            case 'C+': $gradePoints += 2.3; $passedSubjects++; break;
                            case 'C': $gradePoints += 2.0; $passedSubjects++; break;
                            default: break;
                        }
                    }
                }
            }
            
            $averageGPA = $totalSubjects > 0 ? ($gradePoints / $totalSubjects) : 0;
            $averageMarks = $totalSubjects > 0 ? ($totalMarks / $totalSubjects) : 0;
            $passRate = $totalSubjects > 0 ? (($passedSubjects / $totalSubjects) * 100) : 0;
            
            $batches[] = [
                'batch_id' => $batch->batch_id,
                'batch_name' => $batch->batch_name,
                'batch_code' => $batch->batch_code,
                'batch_year' => $batch->batch_year,
                'course_name' => $batch->course_name,
                'department_name' => $batch->department_name,
                'department_code' => $batch->department_code,
                'status' => $batch->status,
                'performance_score' => round($passRate),
                'completion_percentage' => $totalSubjects > 0 ? 
                    round(count(array_filter($subjectsWithMarks, function($s) { 
                        return $s['marks'] !== null; 
                    })) / $totalSubjects * 100) : 0
            ];
        }
        
        // Check if the student has a profile image
        $imageUrl = null;
        if ($student->profile_image) {
            $imageUrl = route('student.image', ['path' => $student->profile_image]);
        }
        
        // Pass data to the Inertia view
        return Inertia::render('StudentView/StudentProfile', [
            'student' => [
                'id' => $student->id,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'NIC_PO' => $student->NIC_PO,
                'email' => $student->email,
                'mobile_number' => $student->mobile_number,
                'address' => $student->address,
                'profile_image' => $imageUrl,
                'created_at' => $student->created_at
            ],
            'results' => $results,
            'batches' => $batches,
            'resultStats' => $resultStats
        ]);
    }
    
    public function uploadProfileImage(Request $request)
    {
        $request->validate([
            'profile_image' => 'required|image|max:2048',
        ]);
        
        $studentId = session('student_id');
        if (!$studentId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $student = short_course_student::findOrFail($studentId);
        
        // Delete old image if exists
        if ($student->profile_image && Storage::disk('private')->exists($student->profile_image)) {
            Storage::disk('private')->delete($student->profile_image);
        }
        
        // Store the file in private storage
        $file = $request->file('profile_image');
        $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = 'profile-images/' . $fileName;
        
        Storage::disk('private')->put($path, file_get_contents($file));
        
        // Update student record
        $student->profile_image = $path;
        $student->save();
        
        // Return the image URL using our protected route
        return response()->json([
            'success' => true,
            'message' => 'Profile image updated successfully',
            'image_url' => route('student.image', ['path' => $path])
        ]);
    }
    
    // Method to serve protected images
    public function getImage($path)
    {
        // Only allow authenticated students to access images
        if (!session('student_authenticated')) {
            abort(403);
        }
        
        // Security: Prevent directory traversal
        $path = str_replace('..', '', $path);
        
        // Get the file path in private storage
        if (!Storage::disk('private')->exists($path)) {
            abort(404);
        }
        
        $file = Storage::disk('private')->get($path);
        $type = Storage::disk('private')->mimeType($path);
        
        return response($file)->header('Content-Type', $type);
    }
    
    // Calculate grade statistics
    private function calculateGradeStats($studentId)
    {
        $results = DB::table('short_course_marks')
            ->where('short_course_student_id', $studentId)
            ->get();
            
        if ($results->isEmpty()) {
            return [
                'passedCount' => 0,
                'failedCount' => 0,
                'passRate' => 0,
                'aPlusCount' => 0,
                'aCount' => 0,
                'aMinusCount' => 0,
                'bPlusCount' => 0,
                'bCount' => 0,
                'bMinusCount' => 0,
                'cPlusCount' => 0,
                'cCount' => 0,
                'cMinusCount' => 0,
                'dPlusCount' => 0,
                'dCount' => 0,
                'dMinusCount' => 0,
                'fCount' => 0,
                'status' => 'No Results',
                'averageGrade' => 'N/A',
                'gradePercentage' => 0,
                'completionRate' => 0,
                'bestGrade' => 'N/A'
            ];
        }
        
        $stats = [
            'aPlusCount' => 0,
            'aCount' => 0,
            'aMinusCount' => 0,
            'bPlusCount' => 0,
            'bCount' => 0,
            'bMinusCount' => 0,
            'cPlusCount' => 0,
            'cCount' => 0,
            'cMinusCount' => 0,
            'dPlusCount' => 0,
            'dCount' => 0,
            'dMinusCount' => 0,
            'fCount' => 0,
        ];
        
        $passedCount = 0;
        $bestGrade = 'F';
        
        foreach ($results as $result) {
            switch ($result->grade) {
                case 'A+': $stats['aPlusCount']++; $passedCount++; $bestGrade = 'A+'; break;
                case 'A': $stats['aCount']++; $passedCount++; break;
                case 'A-': $stats['aMinusCount']++; $passedCount++; break;
                case 'B+': $stats['bPlusCount']++; $passedCount++; break;
                case 'B': $stats['bCount']++; $passedCount++; break;
                case 'B-': $stats['bMinusCount']++; $passedCount++; break;
                case 'C+': $stats['cPlusCount']++; $passedCount++; break;
                case 'C': $stats['cCount']++; $passedCount++; break;
                case 'C-': $stats['cMinusCount']++; break;
                case 'D+': $stats['dPlusCount']++; break;
                case 'D': $stats['dCount']++; break;
                case 'D-': $stats['dMinusCount']++; break;
                case 'F': $stats['fCount']++; break;
            }
        }
        
        $totalResults = $results->count();
        $passRate = $totalResults > 0 ? round(($passedCount / $totalResults) * 100) : 0;
        
        return array_merge($stats, [
            'passedCount' => $passedCount,
            'failedCount' => $totalResults - $passedCount,
            'passRate' => $passRate,
            'status' => $passRate >= 70 ? 'Good Standing' : 'Needs Improvement',
            'averageGrade' => $this->calculateAverageGrade($stats, $totalResults),
            'gradePercentage' => 70, // You can adjust this calculation
            'completionRate' => $passRate,
            'bestGrade' => $bestGrade
        ]);
    }
    
    private function calculateAverageGrade($stats, $totalResults)
    {
        if ($totalResults === 0) return 'N/A';
        
        $gradePoints = 
            ($stats['aPlusCount'] * 4.0) +
            ($stats['aCount'] * 4.0) +
            ($stats['aMinusCount'] * 3.7) +
            ($stats['bPlusCount'] * 3.3) +
            ($stats['bCount'] * 3.0) +
            ($stats['bMinusCount'] * 2.7) +
            ($stats['cPlusCount'] * 2.3) +
            ($stats['cCount'] * 2.0) +
            ($stats['cMinusCount'] * 1.7) +
            ($stats['dPlusCount'] * 1.3) +
            ($stats['dCount'] * 1.0) +
            ($stats['dMinusCount'] * 0.7);
            
        $gpa = $gradePoints / $totalResults;
        
        // Convert GPA back to letter grade
        if ($gpa >= 3.9) return 'A+';
        if ($gpa >= 3.7) return 'A';
        if ($gpa >= 3.5) return 'A-';
        if ($gpa >= 3.3) return 'B+';
        if ($gpa >= 3.0) return 'B';
        if ($gpa >= 2.7) return 'B-';
        if ($gpa >= 2.3) return 'C+';
        if ($gpa >= 2.0) return 'C';
        if ($gpa >= 1.7) return 'C-';
        if ($gpa >= 1.3) return 'D+';
        if ($gpa >= 1.0) return 'D';
        if ($gpa >= 0.7) return 'D-';
        return 'F';
    }


    public function updatePassword(Request $request)
{
    $studentId = session('student_id');
    if (!$studentId) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized'
        ], 401);
    }
    
    // Validate request data
    $validated = $request->validate([
        'current_password' => 'required',
        'password' => 'required|min:6|confirmed',
    ]);
    
    $student = short_course_student::findOrFail($studentId);
    
    // Check if current password matches
    if (!$student->password || !Hash::check($request->current_password, $student->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Current password is incorrect'
        ], 422);
    }
    
    // Update the password
    $student->password = $request->password;
    $student->save();
    
    return response()->json([
        'success' => true,
        'message' => 'Password updated successfully'
    ]);
}
}

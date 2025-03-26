<?php

namespace App\Http\Controllers;

use App\Models\assign_short_course_subject;
use App\Models\batchs;
use App\Models\department_course;
use App\Models\short_course_statu;
use App\Models\subject;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Pest\Expectation;

class AddBatchsAndSubs extends Controller
{
    //
    public function addShortCourse(Request $request){
        // dd($request);
       try{
         $mainCourse=$request->mainCourse;
        $batchName=$request->batchName;
        $batchCode=$request->batchCode;
        $batchYear=intval($request->batchYear);
        if($request->subjects==null || count($request->subjects)<=0){
            return "empty subjects";
        }
        $subjects=array_unique($request->subjects);
        // dd($subjects);
        
try{
    $department_course=department_course::where('course_code',$mainCourse)->first();
    // dd($department_course);
    DB::beginTransaction();

 $addCourse= batchs::create([
        "batch_course_id"=>$department_course->id,
        "batch_name"=>$batchName,
        "batch_year"=>$batchYear,
        "batch_code"=>$batchCode
        ]);
    
        foreach($subjects as $subs){
            $subject_id=subject::where('subject_code',$subs)->first();

$assignSubject=assign_short_course_subject::create([
    "course_batch_id"=>$addCourse->id,
    "short_subject_id"=> $subject_id->id
  ]);
  
        }
        if($assignSubject){
         DB::commit();

   return to_route('dashboard');     
        }

 

}catch(Exception $e)
{
    DB::rollBack();
    dd( $e);
    // return "Something wrong";
}
      
}catch(Expectation $e){
    return "Something wrong";
}


}

public function addSubject(Request $request){
$subject_name=$request->input('subjectName');
$subject_code=$request->input('subjectCode');
$undergraduate_subject=$request->input('undergraduate_subject');

try{

    DB::beginTransaction();
    $addSubject=subject::create([

        "subject_name"=>$subject_name,
        "subject_code"=>$subject_code,
        "undergraduate_subject"=>$undergraduate_subject
    ]);
    if( !$addSubject){
        return "Duplicate Entry";
    }

    DB::commit();
   
}catch(Expectation $e){
    DB::rollBack();
    return $e;
}

}

public function addStudentBatch(Request $request){
    try {
        // Extract data from the request
        $first_name = $request->input('first_name');
        $NIC = $request->input('NIC');
        $subjects = $request->input('subjects');
        $batch_code = $request->input('batch_code');
        $short_course_status = $request->input('status'); 
        
        // Start a database transaction
        DB::beginTransaction();
        
        // Find the batch by batch code
        $batch = batchs::where('batch_code', $batch_code)->first();
        if(!$batch) {
            return response()->json(['message' => 'Batch not found'], 404);
        }
        
        // Check if student with this NIC already exists
        $existingStudent = DB::table('short_course_students')
            ->where('NIC_PO', $NIC)
            ->first();
            
        if($existingStudent) {
            // If student exists, use their ID
            $student_id = $existingStudent->id;
        } else {
            // Create a new student
            $student_id = DB::table('short_course_students')->insertGetId([
                'first_name' => $first_name,
                'NIC_PO' => $NIC,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        
        // Process each subject and add grades
        foreach($subjects as $subject) {
            $subject_obj = subject::where('subject_code', $subject['subject_code'])->first();
            if(!$subject_obj) {
                DB::rollBack();
                return response()->json(['message' => 'Subject not found: ' . $subject['subject_code']], 404);
            }
            
            // Find the assignment ID for this subject-batch combination
            $assign_subject = DB::table('assign_short_course_subjects')
                ->where('course_batch_id', $batch->id)
                ->where('short_subject_id', $subject_obj->id)
                ->first();
                
            if(!$assign_subject) {
                DB::rollBack();
                return response()->json(['message' => 'Subject not assigned to this batch'], 404);
            }
            
            // Check if a grade already exists for this student-subject
            $existingGrade = DB::table('short_course_marks')
                ->where('short_course_student_id', $student_id)
                ->where('assign_short_course_subjects_id', $assign_subject->id)
                ->first();
                
            if($existingGrade) {
                // Update existing grade
                DB::table('short_course_marks')
                    ->where('id', $existingGrade->id)
                    ->update([
                        'grade' => $subject['grade'],
                        'updated_at' => now()
                    ]);
            } else {
                // Insert new grade
                DB::table('short_course_marks')->insert([
                    'short_course_student_id' => $student_id,
                    'assign_short_course_subjects_id' => $assign_subject->id,
                    'grade' => $subject['grade'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
            
            short_course_statu::updateOrCreate([
                'status_batch_course_id' => $batch->id,
                'status_student_id' => $student_id,  
                'status' => $short_course_status ? $short_course_status : '-',
                'created_at' => now(),
                'updated_at' => now()
            ]);

        }
        
        // Commit the transaction
        DB::commit();
        
        // Return success response
        return response()->json([
            'success' => true,
            'message' => 'Student and grades added successfully'
        ]);
        
    } catch (Exception $e) {
        // If something goes wrong, rollback the transaction
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Failed to add student: ' . $e->getMessage()
        ], 500);
    }
}



 
 
public function verifySubjects(Request $request) {
    try {
        // Validate input
        if (!$request->has('subject_codes') || !is_array($request->input('subject_codes'))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid input: subject_codes array is required',
                'verified_subjects' => [],
                'missing_subjects' => []
            ], 400);
        }
        
        $subjectCodes = $request->input('subject_codes');
        
        // Handle empty array case
        if (empty($subjectCodes)) {
            return response()->json([
                'success' => true,
                'message' => 'No subjects to verify',
                'verified_subjects' => [],
                'missing_subjects' => []
            ]);
        }
        
        // Get all subjects from the database in a single query
        $allSubjects = DB::table('subjects')
            ->whereIn('subject_code', $subjectCodes)
            ->select('id', 'subject_name as name', 'subject_code as code')
            ->get();
        
        // Create a lookup map for faster access
        $subjectMap = [];
        foreach ($allSubjects as $subject) {
            $subjectMap[$subject->code] = $subject;
        }
        
        $verifiedSubjects = [];
        $missingSubjects = [];
        
        // Check each subject code against our map
        foreach ($subjectCodes as $code) {
            if (isset($subjectMap[$code])) {
                $verifiedSubjects[] = [
                    'code' => $code,
                    'name' => $subjectMap[$code]->name
                ];
            } else {
                $missingSubjects[] = [
                    'code' => $code
                ];
            }
        }

        return response()->json([
            'success' => true,
            'verified_subjects' => $verifiedSubjects,
            'missing_subjects' => $missingSubjects
        ]);
        
    } catch (\Exception $e) {
        // Log the error for debugging
        \Log::error('Subject verification error: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Error while verifying subjects: ' . $e->getMessage(),
            'verified_subjects' => [],
            'missing_subjects' => []
        ], 500);
    }
}

public function updateSubject(Request $request)
{
    // Validate incoming request data
    $validated = $request->validate([
        'subject_code' => 'required|string|exists:subjects,subject_code', // Original subject code
        'subject_name' => 'sometimes|required|string|max:255',
        'subject_code' => 'sometimes|required|string', // Allow any value here
        'undergraduate_subject' => 'sometimes|boolean',
        'original_subject_code' => 'required|string' // Added this for clarity
    ]);
    
    \Log::info('Update subject request: ', $request->all());
    
    try {
        // Find the subject by the original subject_code
        $subject = Subject::where('subject_code', $validated['original_subject_code'])->first();
        
        if (!$subject) {
            return response()->json([
                'status' => 'error',
                'message' => 'Subject not found'
            ], 404);
        }

        // Update only the fields that were provided
        if (isset($validated['subject_name'])) {
            $subject->subject_name = $validated['subject_name'];
        }
        
        // Handle subject code update separately
        // This checks if we're trying to update the subject code itself
        if (isset($validated['subject_code']) && 
            $validated['subject_code'] !== $subject->subject_code &&
            isset($validated['original_subject_code'])) {
            
            // Check if the new code already exists in other subjects
            $existingSubject = Subject::where('subject_code', $validated['subject_code'])
                ->where('id', '!=', $subject->id)
                ->first();
                
            if ($existingSubject) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Subject code already exists'
                ], 422);
            }
            
            $subject->subject_code = $validated['subject_code'];
        }
        
        if (isset($validated['undergraduate_subject'])) {
            $subject->undergraduate_subject = $validated['undergraduate_subject'];
        }
        
        // Save the updated subject
        $subject->save();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Subject updated successfully',
            'subject' => $subject
        ]);
    } catch (\Exception $e) {
        // Log the error for debugging
        \Log::error('Subject update error: ' . $e->getMessage());
        
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to update subject',
            'error' => $e->getMessage()
        ], 500);
    }
}

}

<?php

namespace App\Http\Controllers;

use App\Models\batchs;
use App\Models\short_course_result_live;
use App\Models\short_course_statu;
use App\Models\subject;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Mockery\Expectation; 

use function Pest\Laravel\json;
use function PHPUnit\Framework\throwException;

class Axios extends Controller
{
    public function getAllShortCourses(){
         $allCourse=DB::table('department_courses')
        // ->where('degree','=',0)
        ->select('department_courses.course_name','department_courses.course_code','department_courses.degree')
        ->get();
        return response()->json(["allcourses"=>$allCourse]);
    }
    public function Shortsubjects(){
        $allsubjects=DB::table('subjects')
       // ->where('undergraduate_subject','=',0)
       ->select('subjects.subject_name','subjects.subject_code')
       ->get();
    //    dd($allsubjects);
       return response()->json(["subjects"=>$allsubjects]);
   }

    //
    public function getCourses(){
        // $allCourse=DB::table('department_courses')
        // ->select('department_courses.course_name','department_courses.course_code')
        // ->get();

        $allCourse=  DB::table('department_courses') 
        ->select('department_courses.course_name','department_courses.course_code') 
        ->get();
        return response()->json(["courses"=>$allCourse]);
    }
    public function getLevels(Request $course_code){

        $course= $course_code->input('course_id');
//this get the only subbjects assign batches in assign_short_course_subjects batch details
        $Batches=DB::table('batchs')
        ->join('department_courses','department_courses.id','=','batchs.batch_course_id')
        ->join('assign_short_course_subjects','assign_short_course_subjects.course_batch_id','=','batchs.id')
        ->where('department_courses.course_code','=',$course)
        ->select('batchs.batch_name','batchs.batch_code')
        ->distinct()
        ->get();

        return response()->json(["batchs"=>$Batches ]);
    }

    public function semorintake(Request $batch_code){
        $batchCode= $batch_code->input('batch_code');
        //checking its shortcourse or semsester wise course
        $batch=DB::table('semester_undergraduates')
        ->join('batchs','batchs.id','=','semester_undergraduates.batch_semester_code')
        ->where('batchs.batch_code','=',$batchCode)
        ->select('semester_undergraduates.semester_name','semester_undergraduates.semester_code','semester_undergraduates.semester_year','semester_undergraduates.undergraduate_live')
        ->get();
       
        if(count($batch)<=0){
        //     $batch=DB::table('assign_short_course_subjects')
        // ->join('batchs','batchs.id','=','assign_short_course_subjects.course_batch_id')
        // ->join('subjects','subjects.id','=','assign_short_course_subjects.short_subject_id')
        // ->where('batchs.batch_code','=',$batchCode)
        // ->select('subjects.*')
        // ->get();
        
        
        if(count($batch)<=0){
        return response()->json(['semesterOrIntake'=>false]);
        }
        // return response()->json(['intake'=>$batch]);
        }
        return response()->json(['semesterOrIntake'=>$batch]);


    }


    public function getsubjects(Request $request){
        


        $batch_code = $request->input('batch_code');
        if($batch_code){

     
        $subjects=DB::table('assign_short_course_subjects')
        ->join('batchs','batchs.id','=','assign_short_course_subjects.course_batch_id')
        ->join('subjects','subjects.id','=','assign_short_course_subjects.short_subject_id')
        ->where('batchs.batch_code','=',$batch_code)
        ->select('subjects.subject_name','subjects.subject_code')
        ->get();
        // dd($subjects);
        if($subjects) {

            return response()->json(["subjects"=>$subjects]);
        }else{
            return null;
        }
       
   }

    }


  public function get_short_course_result_lives()
{
    $resultLive = DB::table('short_course_result_lives')
        ->join('batchs', 'batchs.id', '=', 'short_course_result_lives.short_batch_course_id')
        ->select('short_course_result_lives.live', 'batchs.batch_name', 'batchs.batch_code', 'batchs.batch_year')
        ->orderBy('batchs.created_at', 'desc')
        ->paginate(200); // Paginate with 10 items per page

    return response()->json($resultLive); // Directly return the paginated response
}

public function getStatistics()
{
    try {
        // Count live and offline courses
        $liveCount = DB::table('short_course_result_lives')
            ->where('live', 1)
            ->count();

        $offlineCount = DB::table('short_course_result_lives')
            ->where('live', 0)
            ->count();

        // Get total count of courses
        $totalCourses = DB::table('short_course_result_lives')
            ->count();
        $totalStudents = DB::table('short_course_students')
            ->count(); 
        return response()->json([
            'totalStudents' => $totalStudents,
            'liveCount' => $liveCount,
            'offlineCount' => $offlineCount,
            'totalCourses' => $totalCourses,
        ]);
    } catch (Exception $e) {
        return response()->json(['error' => 'Something went wrong'], 500);
    }
}

public function ShortCourseUpdateLive(Request $request){
   
    try{

$batch = $request->input('batch');
$livecode =$request->input('livecode');
DB::beginTransaction();
$batch_id=batchs::where('batch_code',$batch)->first();
$id=short_course_result_live::where('short_batch_course_id',$batch_id->id)->first();
$id->live=!($id->live);
 
if($id->save()){
DB::commit();
$dd=Axios::get_short_course_result_lives( );
 
    return Axios::get_short_course_result_lives( ); 
}else{
    DB::rollBack();
    return response()->json(["error"=>"something went wrong"],417);
     
}
     
 }catch(Expectation $e){
    DB::rollBack();
    return response()->json(["error"=>"something went wrong"],417);
 }
}


 
public function viewAllBatchResult(Request $request)
{
    try {
        // Get batch information
        $batch_code = $request->input('batch');
        $batch = batchs::where('batch_code', $batch_code)->first();
        
        if (!$batch) {
            return response()->json(['error' => 'Batch not found'], 404);
        }
        
        $status = short_course_result_live::where('short_batch_course_id', $batch->id)->first();
        $released_date = $batch->created_at;

        // Get subjects for this batch
        $batchSubjects = DB::table('assign_short_course_subjects')
            ->join('subjects', 'subjects.id', '=', 'assign_short_course_subjects.short_subject_id')
            ->where('assign_short_course_subjects.course_batch_id', $batch->id)
            ->select('subjects.subject_name', 'subjects.subject_code')
            ->get();

        // Get students with their status in a single query to improve performance
        $students = DB::table('short_course_students')
            ->join('short_course_status', function ($join) use ($batch) {
                $join->on('short_course_students.id', '=', 'short_course_status.status_student_id')
                    ->where('short_course_status.status_batch_course_id', '=', $batch->id);
            })
            ->select('short_course_students.id', 'short_course_students.first_name', 'short_course_students.NIC_PO', 'short_course_status.status')
            ->get();

        $studentAndSubject = [];

        // Process each student
        foreach ($students as $student) {
            // Get subjects and grades for this student in a single query
            $subjects = DB::table('short_course_marks')
                ->join('assign_short_course_subjects', 'assign_short_course_subjects.id', '=', 'short_course_marks.assign_short_course_subjects_id')
                ->join('subjects', 'subjects.id', '=', 'assign_short_course_subjects.short_subject_id')
                ->where('assign_short_course_subjects.course_batch_id', '=', $batch->id)
                ->where('short_course_marks.short_course_student_id', '=', $student->id)
                ->select('short_course_marks.grade', 'subjects.subject_name', 'subjects.subject_code')
                ->get();

            $array = [
                "NIC" => $student->NIC_PO,
                "first_name" => $student->first_name,
                "subjects" => $subjects,
                "status" => $student->status
            ];

            $studentAndSubject[] = $array;
        }

        /* Get students count based on allBatch */
        $total_students = count($studentAndSubject);

        return Inertia::render('StudentView/ViewAllBatch', [
            "allBatch" => $studentAndSubject,
            "batch_code" => $batch_code,
            "batch_name" => $batch->batch_name,
            "batch_year" => $batch->batch_year,
            "status" => $status ? $status->live : false,
            "batchSubjects" => $batchSubjects,
            "total_students" => $total_students,
            "released_date" => $released_date
        ]);

    } catch (Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

public function allsubjectsStatus(Request $request){
    
    try{
       
    
        $all_subjects=DB::table('subjects')
        ->select('subjects.subject_name','subjects.subject_code','subjects.undergraduate_subject') 
        ->get();
    
    return response()->json(['all_subjects'=>$all_subjects]);
    

    }catch(Exception $e){
        return $e;
    }
    
    }

public function UndergraduateSubjectstatus(Request $request){
    
    try{
        
         
    
    
        $undergraduate_subjects=DB::table('subjects')
        // ->join('assign_short_course_subjects','assign_short_course_subjects.short_subject_id','=','subjects.id')
        ->join('assign_undergraduate_subjects','assign_undergraduate_subjects.assign_subject_id','=','subjects.id')
        ->join('semester_undergraduates','semester_undergraduates.id','=','assign_undergraduate_subjects.assign_semester_id' )
        ->join('batchs','semester_undergraduates.batch_semester_code','=','batchs.id')
        ->where('subjects.undergraduate_subject','=',1)
        ->select('subjects.subject_name','subject_code','batchs.batch_name','batchs.batch_code','batchs.batch_year','semester_undergraduates.semester_name','semester_undergraduates.semester_name','semester_undergraduates.semester_code','semester_undergraduates.semester_year') 
        ->get();
    
        $all_subjects=DB::table('subjects')
        ->select('subjects.subject_name','subject_code') 
        ->get();
    
    return response()->json(['undergraduate_subjects'=>$undergraduate_subjects ]);
    

    }catch(Exception $e){
        return $e;
    }
    
    }





        public function shortSubjectstatus(Request $request){
    
            try{
                $short_subjects=DB::table('subjects')
                ->join('assign_short_course_subjects','assign_short_course_subjects.short_subject_id','=','subjects.id')
                ->join('batchs','assign_short_course_subjects.course_batch_id','=','batchs.id')
                ->where('undergraduate_subject','=',0)
                ->select('subjects.subject_name','subject_code','batchs.batch_name','batchs.batch_code','batchs.batch_year')
                
                ->get();
                 
             
            
            return response()->json(['short_subjects'=>$short_subjects]);
            
        
            }catch(Exception $e){
                return $e;
            }
            
            }



    public function updatesubject(Request $request){
    
    

    }

  
    
//check batchcode avaliility

public function checkBatchCode(Request $request){

    $batch_code = $request->input('batch_code');
  
    $batch=batchs::where('batch_code',$batch_code)->first();
    if($batch){
        return response()->json(['batch_code'=>false]);
    }else{
        return response()->json(['batch_code'=>true]);
    }


}

public function updateGrade(Request $request){

    $grade = $request->input('grade');
    $student_id = $request->input('student_id');
    $subject_code = $request->input('subject_code');
    $batch_code = $request->input('batch_code');
    $batch=batchs::where('batch_code',$batch_code)->first();
    $subject=subject::where('subject_code',$subject_code)->first();
    $student=DB::table('short_course_students')->where('NIC_PO',$student_id)->first();
    $student_id=$student->id;
    $subject_id=$subject->id;
    $batch_id=$batch->id;
    $assign_subject=DB::table('assign_short_course_subjects')->where('course_batch_id',$batch_id)->where('short_subject_id',$subject_id)->first();
    $assign_subject_id=$assign_subject->id;
    $grade=DB::table('short_course_marks')->where('assign_short_course_subjects_id',$assign_subject_id)->where('short_course_student_id',$student_id)->update(['grade'=>$grade]);
    if($grade){
        return response()->json(['grade'=>true]);
    }else{
        return response()->json(['grade'=>false]);
    }

}
 
public function updateStatus(Request $request) {
    $status = $request->input('status');
    $student_id = $request->input('student_id');
    $batch_code = $request->input('batch_code');
    
    $batch = batchs::where('batch_code', $batch_code)->first();
    $student = DB::table('short_course_students')->where('NIC_PO', $student_id)->first();
    
    if (!$batch || !$student) {
        return response()->json(['success' => false, 'message' => 'Batch or student not found']);
    }
    
    $updated = DB::table('short_course_status')
        ->where('status_student_id', $student->id)
        ->where('status_batch_course_id', $batch->id)
        ->update(['status' => $status]);
    
    if ($updated) {
        return response()->json(['success' => true]);
    } else {
        return response()->json(['success' => false]);
    }
}


}

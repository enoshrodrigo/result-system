<?php

namespace App\Http\Controllers;

use App\Models\assign_short_course_subject;
use App\Models\batchs;
use App\Models\department_course;
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
}

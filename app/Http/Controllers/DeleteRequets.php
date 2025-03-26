<?php

namespace App\Http\Controllers;

use App\Models\batchs;
use App\Models\subject;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Mockery\Expectation;

class DeleteRequets extends Controller
{
    //
    public function deleteBatch(Request $request){
        try{
         $batch_code=  $request->input('batch'); 
        if(batchs::where('batch_code',$batch_code)->delete()){
            $get_short_course_result_lives = new Axios;
            return $get_short_course_result_lives->get_short_course_result_lives( );
        }    
        }catch(Expectation $e){
return "error";
        }
     



    }

    public function deletesubject(Request $request){
    
    try{
     $subject_code= $request->input('subject_code');
     $delete=subject::where('subject_code',$subject_code)->delete();


    }catch(Exception $e)
    {
return $e;
    }

    }


    public function deleteResult(Request $request){
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
        $isDelete=DB::table('short_course_marks')->where('assign_short_course_subjects_id',$assign_subject_id)->where('short_course_student_id',$student_id)->delete();
        /* If  short_course_status available delete*/
        $deleteStaus=DB::table('short_course_status')->where('status_batch_course_id',$batch_id)->where('status_student_id',$student_id)->get();
        if($deleteStaus){
            DB::table('short_course_status')->where('status_batch_course_id',$batch_id)->where('status_student_id',$student_id)->delete();
        }


        if($isDelete){
 
            return response()->json(['delete'=>  true]);
       

        }else{
            return response()->json(['delete'=>false]);
        }
    
        
    }
}

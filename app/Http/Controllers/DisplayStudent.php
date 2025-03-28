<?php

namespace App\Http\Controllers;

use App\Models\batchs;
use App\Models\department_course;
use App\Models\short_course_statu;
use App\Models\short_course_student;
use App\Models\short_ourse_statu;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class DisplayStudent extends Controller
{
    // 
      public function DisplayResult(Request $request){
    try{
 
        $batch_code=$request->input('batch_code');
        $batch=batchs::where('batch_code',$batch_code)->first(); 
        $NIC=$request->input('nic');
        $allresults=DB::table('short_course_students') 
        ->where('NIC_PO',$NIC)
        ->select('short_course_students.*')
        // ->take(10)
        ->get();
        if(count($allresults)<=0){
            return Inertia::render('StudentView/Display_result',[
                "result"=>[],
                'status'=>"Invalid ID",
                'batch_name'=>"Inalid ID"
             ]);
        }
        // dd($allresults);
        // return $allresults;
           $studentAndSubject=[];
    foreach($allresults as $key =>$data){
       $student_id= intval($data->id);
    
       $subjects=DB::table('short_course_marks')
       ->join('assign_short_course_subjects','assign_short_course_subjects.id','=','short_course_marks.assign_short_course_subjects_id') 
       ->join('subjects','subjects.id','=','assign_short_course_subjects.short_subject_id')
       ->where('assign_short_course_subjects.course_batch_id','=',$batch->id)
       ->where('short_course_marks.short_course_student_id','=',$student_id)
        ->select('short_course_marks.grade','subjects.subject_name','subjects.subject_code')
        ->get();
    if(count($subjects)<=0){
         continue;
    }
        $array=[
            
                "id" => $data->id,
                "NIC"=>$data->NIC_PO,
                "first_name"=>$data->first_name,
                "subjects"=>$subjects,
                "email" => $data->email,
    
            
        ];
            
        
    
        array_push($studentAndSubject,$array);
        
    
    }
    $studenId=short_course_student::where('NIC_PO',$NIC)->first();

    $short_course_status =short_course_statu::where('status_batch_course_id',$batch->id)
                                                ->where('status_student_id',$studenId->id)->first();
if($short_course_status==null ){
            return Inertia::render('StudentView/Display_result',[
                "result"=>[],
                'status'=>"Invalid ID",
                'batch_name'=>"Inalid ID"
             ]);
        }
    $department_name=department_course::where('id',$batch->batch_course_id)->first();
                                             
        //   return $studentAndSubject; 
    
           return Inertia::render('StudentView/Display_result',[
           "result"=>$studentAndSubject,
           'status'=>$short_course_status->status,
           'batch_name'=>$department_name->course_name,
           'result_batch' =>$batch->batch_name,
              'batch_code'=>$batch->batch_code,
           
        ]);
    
        }catch(Exception $e){
        return $e;
          
        }
    


    }

    public function getresult(){
        return Redirect::route('ViewResult');
    }
}
 
 
    
   
   
  
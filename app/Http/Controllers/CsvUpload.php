<?php

namespace App\Http\Controllers;

use App\Models\batchs;
use App\Models\short_course_mark;
use App\Models\short_course_result_live;
use App\Models\short_course_statu;
use App\Models\short_course_student;
 
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class CsvUpload extends Controller
{
    //
    public function uploadcsv(Request $request){
        // return response()->json(['success' => true]);
        // return Inertia::render('AddResult', [
        //                     'result' => ["nnn"]
        //                 ]);

$file = $request->file('fileresult');
$course = $request->input('course');
$batch_code = $request->input('level');

 //verify validity



 

 $subjects=DB::table('assign_short_course_subjects')
        ->join('batchs','batchs.id','=','assign_short_course_subjects.course_batch_id')
        ->join('subjects','subjects.id','=','assign_short_course_subjects.short_subject_id')
        ->where('batchs.batch_code','=',$batch_code)
        ->select('subjects.subject_name','subjects.subject_code','batchs.batch_code')
        ->get();

//  dd($subjects);
$batch_id=batchs::where('batchs.batch_code',$batch_code)->first();
if(count($subjects)>0){


try{

    if($file->isValid() && $file->extension()=='csv'){
        $handle =fopen($file->path(),'r');
        
        $batch =array(fgetcsv($handle));//batch code

         if(!(rtrim($batch[0][0])==$batch_code)){
            // dd("Invalid batch code");
            return "Invalid batch code";
         }


        $verify_first_row =array(fgetcsv($handle));
        
        DB::beginTransaction();
        try{
            $assign_short_course_subjects_id=[];

            for($i=2;$i<count($verify_first_row[0]);$i++){
              $id=DB::table('assign_short_course_subjects')
              ->join('batchs','batchs.id','=','assign_short_course_subjects.course_batch_id')
              ->join('subjects','subjects.id','=','assign_short_course_subjects.short_subject_id')
              ->where('subjects.subject_code','=',rtrim($verify_first_row[0][$i]))
              ->where('batchs.batch_code','=',rtrim($batch_code))
              ->select('assign_short_course_subjects.id','subjects.subject_code')
              ->get(); 
              $assign_short_course_subjects_id =array_merge($assign_short_course_subjects_id,$id->toArray());
              
            }
            // dd($assign_short_course_subjects_id);
            
            
            while(($row = fgetcsv($handle))!==false){
                 $csv_column=0;
                if (empty(array_filter($row))) {
                    break; // Exit the loop if the row is empty
                }
                //  if($row[++$csv_column])
                $isStudentAvalable=short_course_student::where('NIC_PO',rtrim($row[1]))->first();
                // dd($isStudentAvalable->id);
                
            if(!($isStudentAvalable)){

                $short_course_student=short_course_student::create([
                   "first_name"=>$row[$csv_column],
                    "NIC_PO"=>rtrim($row[++$csv_column]),
                    "last_name"=>null,
                    "email"=>null,
                  ]);
                }
                else{
                    $csv_column=1;
                    $short_course_student=$isStudentAvalable;
                }

                foreach($assign_short_course_subjects_id as $key => $subjectAssign){

                    short_course_mark::create([
                        'short_course_student_id'=>$short_course_student->id,
                        'assign_short_course_subjects_id'=>$subjectAssign->id,
                        'marks'=>0,
                        'grade'=>$row[++$csv_column]
                    ]);
                }
                 
                
                // $key++;
                short_course_statu::create([
                    "status_batch_course_id"=>$batch_id->id,
                    "status_student_id"=>$short_course_student->id,
                    "status"=>$row[++$csv_column],
                ]);
            }
            short_course_result_live::create([
                 "short_batch_course_id"=>$batch_id->id,
                 "live"=>0,
            ]);
 

            DB::commit();
        return to_route('dashboard');

        }catch(Exception $e){
            DB::rollback();
            dd($e);
        }
    }
}
catch (Exception $e){

}

}
        return 0;
    }
    public function getCourse(Request $request){
        dd("Hello");
 
        return 0;
    }
}

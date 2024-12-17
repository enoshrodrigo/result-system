<?php

namespace App\Http\Controllers;

use App\Models\batchs;
use App\Models\subject;
use Exception;
use Illuminate\Http\Request;
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
}

<?php

namespace App\Http\Controllers;

use App\Models\short_course_result_live;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Mockery\Expectation;

class ViewResult extends Controller
{
    //
    public function get(Request $view)
    {
          
        try{
          $live_result=DB::table('short_course_result_lives')
        ->join('batchs','batchs.id','=','short_course_result_lives.short_batch_course_id')
        ->where('short_course_result_lives.live',1)
        ->select('batch_name','batch_year','batch_code')
        ->orderBy('short_course_result_lives.updated_at','desc')
        ->get();
        return response()->json(["live_result"=>$live_result]);   
        }catch(Expectation $e){
            return "Error";
        }
       
    // return Redirect::route('ViewResult'); 
    }

    public function show(){
        return Redirect::route('ViewResult');
    }
}

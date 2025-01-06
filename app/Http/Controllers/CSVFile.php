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
use Illuminate\Support\Facades\Storage;

class CSVFile extends Controller
{
    public function uploadjson(Request $request){ 
   try {
    DB::beginTransaction(); 
        $jsonData = $request->input('jsonData');
        $CSVFile = $request->file('CSVFile'); 
        $directory = 'protected/csv';
        if (!Storage::exists($directory)) {
            Storage::makeDirectory($directory);
        }
        // Check if jsonData is already an array
        if (!is_array($jsonData)) {
            $jsonData = json_decode($jsonData, true);
        } 
        $course_code = $jsonData['course_code'];
        $batch_code = $jsonData['batch_code'];
        $exam_name = $jsonData['exam_name'];
        //check is code course is already in the database
        $course = DB::table('department_courses')->where('course_code', '=', $course_code)->first();

        if (!$course) {
            return 'Course code does not exist';
        }
          //check if the batch code is already in the database
        $batch = batchs::where('batch_code', $batch_code)->first();
        if ($batch) {
            return 'Batch code already exists';
        }
        // Insert batch_code and exam_name into the relevant tables
        DB::table('batchs')->insert([
            'batch_course_id' => $course->id,
            'batch_code' => $batch_code,
            'batch_name' => $exam_name,
            'batch_year' => 2021,
            'created_at' => now(),
            'updated_at' => now()
        ]);
        $batch_id = batchs::where('batchs.batch_code', $batch_code)->first();
   // Extract subjects from JSON data
   $subjectCodes = $jsonData['subject_codes'];
   $assign_short_course_subjects_id = [];

   foreach ($subjectCodes as $subjectCode) {
    //if its status its not the subject 
     
       $subject = DB::table('subjects')->where('subject_code', '=', rtrim($subjectCode))->first();
       if ($subject) {
           $assignSubject = DB::table('assign_short_course_subjects')->insertGetId([
               'course_batch_id' => $batch_id->id,
               'short_subject_id' => $subject->id,
                'created_at' => now(),
                'updated_at' => now()

           ]);
           $assign_short_course_subjects_id[] = $assignSubject;
       }else{
        DB::rollback();
        return 'Subject code does not exist';
       }
   }
        // Verify validity
        $subjects = DB::table('assign_short_course_subjects')
            ->join('batchs','batchs.id','=','assign_short_course_subjects.course_batch_id')
            ->join('subjects','subjects.id','=','assign_short_course_subjects.short_subject_id')
            ->where('batchs.batch_code','=',$batch_code)
            ->select('subjects.subject_name','subjects.subject_code','batchs.batch_code','assign_short_course_subjects.id')
            ->get();

      

        if (count($subjects) > 0) {
                try {
                    $assign_short_course_subjects_id = [];
                    $subjectCodes = $jsonData['subject_codes'];

                    foreach ($subjectCodes as $subjectCode) {
                        $id = DB::table('assign_short_course_subjects')
                            ->join('batchs','batchs.id','=','assign_short_course_subjects.course_batch_id')
                            ->join('subjects','subjects.id','=','assign_short_course_subjects.short_subject_id')
                            ->where('subjects.subject_code', '=', rtrim($subjectCode))
                            ->where('batchs.batch_code', '=', rtrim($batch_code))
                            ->select('assign_short_course_subjects.id','subjects.subject_code')
                            ->get();
                        $assign_short_course_subjects_id = array_merge($assign_short_course_subjects_id, $id->toArray());
                    }

                    foreach ($jsonData['data'] as $row) {
                        $isStudentAvailable = short_course_student::where('NIC_PO', rtrim($row['NIC_PO']))->first();

                        if (!$isStudentAvailable) {
                            $short_course_student = short_course_student::create([
                                'first_name' => $row['first_name'],
                                'NIC_PO' => rtrim($row['NIC_PO']),
                                'last_name' => null,
                                'email' => null,
                                'created_at' => now(),
                                'updated_at' => now()
                            ]);
                        } else {
                            $short_course_student = $isStudentAvailable;
                        }
          
                        foreach ($subjects as $subjectAssign) {
                            $subjectCode = $subjectAssign->subject_code;
                            short_course_mark::create([
                                'short_course_student_id' => $short_course_student->id,
                                'assign_short_course_subjects_id' => $subjectAssign->id,
                                'marks' => 0,
                                'grade' => $row['subjects'][$subjectCode] ?? 'N/A',
                                'created_at' => now(),
                                'updated_at' => now()
                            ]);
                        }

                        short_course_statu::create([
                            'status_batch_course_id' => $batch_id->id,
                            'status_student_id' => $short_course_student->id,
                            'status' => $row['status'],
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }

                    short_course_result_live::create([
                        'short_batch_course_id' => $batch_id->id,
                        'live' => 0,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);

                    DB::commit();
                  
                    
                    // Save the CSV file in the protected/csv directory
                    $CSVFile->storeAs($directory, $batch_code . '.csv'); 
                    return response()->json(['message' => 'success'], 200);

                } catch (Exception $e) {
                    DB::rollback();
                    
                }
           
        }
        return 'sss';
     } catch (Exception $e) {
                // Handle exception

                DB::rollback();
                return  $e;
            }
    }

    public function getCourse(Request $request){
        dd("Hello");
        return 0;
    }
}
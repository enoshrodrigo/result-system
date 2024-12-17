<?php

namespace App\Http\Controllers;

use App\Models\certificate_level_final;
use App\Models\certificate_level_intermediate;
use App\Models\Certificate_level_one;
use App\Models\certificate_level_three;
use App\Models\Certificate_level_two;
use App\Models\Students;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use function PHPUnit\Framework\isEmpty;
use function PHPUnit\Framework\isNull;

class UploadResult extends Controller
{
    //
    public function store(Request  $request){
    //   dd($request->course);

    // return Students::all();
    // return false;
    try{
//     $students=Students::create([
//         // 'student_level_id'=>$request->level,
//         'first_name'=>"Enosh rodrigo",
//         'NIC'=>"200122100685"
//     ]);
//     if($students){
//         // return back();
// if($request->level=='1'){
//     $Certificate_level_one=Certificate_level_one::create([
//             // 'student_level_id'=>$request->level,
//             'level_student_id'=>$students->id,
//             'level_course_id'=>$request->level,
//             'language_paper'=>"B",
//             'Speech_and_listening'=>"A",

//         ]);
//         if($Certificate_level_one){
//             return back();
//         }
// }
        
//     }
$file = $request->file('fileresult');

            // Check if the file is valid
            if ($file->isValid() && $file->extension() == 'csv') {
                // Read the CSV file
                // $csvData = array_map('str_getcsv', file($file->path()));

                $handle = fopen($file->path(), 'r');

                // Start a database transaction to ensure data consistency
                DB::beginTransaction();

                try {
                    // Skip the first row (header)
                    // array_shift($csvData);
                    fgetcsv($handle);
                    // Loop through each row in the CSV data
                    while (($row = fgetcsv($handle)) !== false) {
                        // Assuming CSV format: first_name, NIC, level_course_id, language_paper, Speech_and_listening
                        if (empty(array_filter($row))) {
                            break; // Exit the loop if the row is empty
                        }
                        // Create a new student
                        $student = Students::create([
                            'first_name' => $row[0], // assuming first column is first_name
                            'NIC' =>(string) $row[1], // assuming second column is NIC
                        ]);

                        // Create a new Certificate_level_one record
                        if($request->level==1){
                        Certificate_level_one::create([
                            'level_student_id' => $student->id,
                            'level_course_id' => $request->level, // assuming third column is level_course_id
                            'language_paper' => $row[2], // assuming fourth column is language_paper
                            'Speech_and_listening' => $row[3],
                            'status' => $row[4],  
                        ]);
                    }elseif($request->level==2){
                        Certificate_level_two::create([
                            'level_student_id' => $student->id,
                            'level_course_id' => $request->level, // assuming third column is level_course_id
                            'Grammar & Writing' => $row[2], // assuming fourth column is language_paper
                            'Reading & Vocabulary' => $row[3],
                            'Speech & Listening' => $row[4],
                            'status' => $row[5]  
                        ]);
                    }elseif($request->level==3){
                        certificate_level_three::create([
                            'level_student_id' => $student->id,
                            'level_course_id' => $request->level, // assuming third column is level_course_id
                            'Grammar & Writing' => $row[2], // assuming fourth column is language_paper
                            'Reading & Vocabulary' => $row[3],
                            'Speech & Listening' => $row[4],
                            'status' => $row[5]  
                        ]);
                    }elseif($request->level==4){
                        certificate_level_intermediate::create([
                            'level_student_id' => $student->id,
                            'level_course_id' => $request->level, // assuming third column is level_course_id
                            'Grammar' => $row[2], // assuming fourth column is language_paper
                            'Compostion' => $row[3],
                            'Comprehesion' => $row[4],
                            'Speech' => $row[5],
                            'status' =>$row[6]
                        ]);
                    }elseif($request->level==5){
                        certificate_level_final::create([
                            'level_student_id' => $student->id,
                            'level_course_id' => $request->level, // assuming third column is level_course_id
                            'Grammar' => $row[2], // assuming fourth column is language_paper
                            'Compostion' => $row[3],
                            'Comprehesion' => $row[4],
                            'Speech' => $row[5],
                            'Literature' => $row[6], 
                            'status' => $row[7],
                        ]);
                    }
                    }

                    // Commit the transaction if all data is saved successfully
                    DB::commit();

                    return back()->with('success', 'CSV data processed successfully.');
                } catch (Exception $e) {
                    // Rollback the transaction in case of an exception
                    DB::rollback();
                    dd( $e);
                }
            } else {
                return back()->with('error', 'Invalid CSV file.');
            }

    }catch (Exception $e){
        dd($e);
    }
    }
    public function storea( ){
        //   redirect('/add-result');
        return Students::all();
        }

}


// To handle large amount of data

// $file = $request->file('fileresult');

// if ($file->isValid() && $file->extension() == 'csv') {
//     // Open the file for reading
//     $handle = fopen($file->path(), 'r');

//     // Start a database transaction
//     DB::beginTransaction();

//     try {
//         // Skip the header
//         fgetcsv($handle);

//         // Loop through each line in the CSV file
//         while (($row = fgetcsv($handle)) !== false) {
//             // Process and save the data here

//             // Example:
//             $student = Students::create([
//                 'first_name' => $row[0],
//                 'NIC' => $row[1],
//             ]);

//             Certificate_level_one::create([
//                 'level_student_id' => $student->id,
//                 'level_course_id' => $row[2],
//                 'language_paper' => $row[3],
//                 'Speech_and_listening' => $row[4],
//             ]);
//         }

//         // Commit the transaction
//         DB::commit();

//         // Close the file handle
//         fclose($handle);

//         return back()->with('success', 'CSV data processed successfully.');
//     } catch (Exception $e) {
//         // Rollback the transaction in case of an exception
//         DB::rollback();

//         // Close the file handle
//         fclose($handle);

//         return back()->with('error', 'Error processing CSV data.');
//     }
// } else {
//     return back()->with('error', 'Invalid CSV file.');
// }


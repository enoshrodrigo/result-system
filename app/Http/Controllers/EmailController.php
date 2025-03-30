<?php
// app/Http/Controllers/EmailController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\StudentResult;
use App\Models\short_course_student;
use App\Models\Student;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Jobs\SendResultEmail;
use Inertia\Inertia;

class EmailController extends Controller
{
    public function sendResultEmail(Request $request)
    {
        // Validate the request
        $request->validate([
            'subject' => 'required|string',
            'batchCode' => 'required|string',
            'emails' => 'required|array',
            'emails.*.studentId' => 'required|string',
            'emails.*.studentName' => 'required|string',
            'emails.*.email' => 'required|email',
            'emails.*.content' => 'required|string',
        ]);

        $subject = $request->subject;
        $emails = $request->emails;
        $batchCode = $request->batchCode;
        
        // Generate a unique batch ID
        $batchId = (string) Str::uuid();
        
        // Initialize the batch progress
        Cache::put("email_batch_{$batchId}", [
            'total' => count($emails),
            'sent' => 0,
            'failed' => 0,
            'completed' => false,
            'currentStudent' => null,
            'failedEmails' => []
        ], now()->addDay());
        
        // Dispatch jobs for each email
        foreach ($emails as $index => $emailData) {
            SendResultEmail::dispatch(
                $emailData, 
                $subject, 
                $batchId, 
                $index + 1, 
                count($emails)
            )->delay(now()->addSeconds($index * 1)); // Add small delay between jobs
        }
        $this->logEmailOperation('sendResultEmail', [
            'batchId' => $batchId,
            'subject' => $subject,
            'batchCode' => $batchCode,
            'emailCount' => count($emails),
            'ipAddress' => $request->ip(),
            'userAgent' => $request->header('User-Agent')
        ]);
        // Return the batch ID for tracking
        return response()->json([
            'success' => true,
            'batchId' => $batchId,
            'message' => 'Email sending process started in the background'
        ]);
    }
    
    // API endpoint to check progress
    public function checkEmailProgress($batchId)
    {
        $progress = Cache::get("email_batch_{$batchId}");
        
        if (!$progress) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found'
            ], 404);
        }
        $this->logEmailOperation('checkEmailProgress', [
            'batchId' => $batchId,
            'progress' => $progress,
            'ipAddress' => request()->ip(),
            'userAgent' => request()->header('User-Agent')
        ]);
        return response()->json([
            'success' => true,
            'progress' => $progress
        ]);
    }

    public function stopEmailProcess(Request $request)
    {
        $request->validate([
            'batchId' => 'required|string',
        ]);
        
        $batchId = $request->input('batchId');
        
        // Get current progress
        $progress = Cache::get("email_batch_{$batchId}");
        
        if (!$progress) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found'
            ], 404);
        }
        
        // Mark as completed to stop further processing
        $progress['completed'] = true;
        
        // Add a special flag for stopping
        $progress['stopped'] = true;
        $progress['stoppedAt'] = now()->toIso8601String();
        
        // Store the updated progress
        Cache::put("email_batch_{$batchId}", $progress, now()->addDay());
        
        // If you're using database queue, you can also attempt to remove pending jobs
        if (config('queue.default') === 'database') {
            try {
                // This will only work with database queue
                \DB::table('jobs')
                    ->where('payload', 'like', '%' . $batchId . '%')
                    ->delete();
            } catch (\Exception $e) {
                // Log but continue - this is a best-effort approach
                Log::error('Could not clear queue jobs: ' . $e->getMessage());
            }
        }
        $this->logEmailOperation('stopEmailProcess', [
            'batchId' => $batchId,
            'progress' => $progress,
            'ipAddress' => $request->ip(),
            'userAgent' => $request->header('User-Agent')
        ]);
        return response()->json([
            'success' => true,
            'message' => 'Email process stopped successfully',
            'progress' => $progress
        ]);
    }

 
public function sendStudentResult(Request $request)
{
    // Validate the request
 /* log the request */
    Log::info('Received request to send student result email', [
        'studentId' => $request->studentId,
        'studentName' => $request->studentName,
        'NIC' => $request->NIC,
        'email' => $request->email,
        'saveEmail' => $request->saveEmail,
        'captchaToken' => $request->captchaToken,
        'batchCode' => $request->batchCode,
        'batchName' => $request->batchName,
    ]);
    $request->validate([
        'studentId' => 'required',
        'studentName' => 'required|string',
        'NIC' => 'required|string',
        'email' => 'required|email',
        'saveEmail' => 'boolean',
        'captchaToken' => 'required|string',
        'batchCode' => 'required|string',
        'batchName' => 'required|string',
    ]);

    // Verify reCAPTCHA
    $recaptchaResponse = $this->verifyRecaptcha($request->captchaToken);
    if (!$recaptchaResponse['success']) {
        return response()->json([
            'success' => false,
            'message' => 'reCAPTCHA verification failed'
        ], 400);
    }

    // Find the student
    $student = short_course_student::where('id', $request->studentId)
        ->where('NIC_PO', $request->NIC)
        ->first();

    if (!$student) {
        return response()->json([
            'success' => false,
            'message' => 'Student not found'
        ], 404);
    }
/* find batch id by batch code */
    $batch = \DB::table('batchs')->where('batch_code', $request->batchCode)->first();
    if (!$batch) {
        return response()->json([
            'success' => false,
            'message' => 'Batch not found'
        ], 404);
    }
    // If student already has an email, don't let them change it unless explicitly authorized
    if ($student->email && $student->email !== $request->email && $request->saveEmail) {
        return response()->json([
            'success' => false,
            'message' => 'Cannot change your registered email. Please contact the Result Department.'
        ], 422);
    }

    // Get student data and subjects
    $subjects = \DB::table('short_course_marks')
    ->join('assign_short_course_subjects', 'assign_short_course_subjects.id', '=', 'short_course_marks.assign_short_course_subjects_id')
    ->join('subjects', 'subjects.id', '=', 'assign_short_course_subjects.short_subject_id')
    ->where('short_course_marks.short_course_student_id', $student->id)
    ->where('assign_short_course_subjects.course_batch_id','=', $batch->id)
    ->select('subjects.subject_name', 'subjects.subject_code', 'short_course_marks.grade')
    ->get();

    // Get student status
    $status = \DB::table('short_course_status')
        ->join('batchs', 'short_course_status.status_batch_course_id', '=', 'batchs.id')
        ->where('short_course_status.status_student_id', $student->id)
        ->where('batchs.batch_code', $request->batchCode)

        ->select('short_course_status.status')
        ->first();

    // Build email content
    $content = view('emails.student-result-individual', [
        'student' => $student, 
        'email' => $request->email,
        'subjects' => $subjects,
        'status' => $status ? $status->status : 'N/A',
        'batchName' => $request->batchName,
        'batchCode' => $request->batchCode
    ])->render();

    // Log the email content for debugging
    Log::info('Email content generated', [
        'subjects' => $subjects,
    ]);
    // Get client IP address
    $ipAddress = $request->ip();

    // Send email
    try {
        Mail::to($request->email)
            ->send(new StudentResult("Your BCI Campus Result: {$request->batchName}", $content));

        // Only update email if sending was successful
        if ($request->saveEmail && (!$student->email || $student->email === $request->email)) {
            $student->email = $request->email;
            $student->save();
        }

        // Log the email request
        $this->logEmailRequest([
            'student_id' => $student->id,
            'student_name' => $student->first_name,
            'opened' => false,
            'nic' => $student->NIC_PO,
            'email' => $request->email,
            'batch_code' => $request->batchCode,
            'batch_name' => $request->batchName,
            'ip_address' => $ipAddress,
            'timestamp' => now()->toDateTimeString(),
            'user_agent' => $request->header('User-Agent'),
            "email_type" => "result",
            'status' => 'success'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Result email sent successfully'
        ]);
    } catch (\Exception $e) {
        // Log error with details for debugging
        Log::error('Failed to send student result email: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
        
        // Log the failed attempt
        $this->logEmailRequest([
            'student_id' => $student->id,
            'student_name' => $student->first_name,
            'opened' => false,
            'nic' => $student->NIC_PO,
            'email' => $request->email,
            'batch_code' => $request->batchCode,
            'batch_name' => $request->batchName,
            'ip_address' => $ipAddress,
            'timestamp' => now()->toDateTimeString(),
            'user_agent' => $request->header('User-Agent'),
             "email_type" => "result",
            'status' => 'failed',
            'error' => $e->getMessage()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to send email. Please try again later or contact support.'
        ], 500);
    }
}

private function verifyRecaptcha($token)
{
    $client = new \GuzzleHttp\Client();
    $response = $client->post('https://www.google.com/recaptcha/api/siteverify', [
        'form_params' => [
            'secret' => env('NOCAPTCHA_SECRET'),
            'response' => $token
        ]
    ]);
    
    return json_decode((string) $response->getBody(), true);
}

private function logEmailRequest($data)
{
    // Create logs directory if it doesn't exist
    $logsDir = storage_path('logs/email-requests');
    if (!file_exists($logsDir)) {
        mkdir($logsDir, 0755, true);
    }
    
    // Format for log file - one per day
    $filename = $logsDir . '/email-requests-' . now()->format('Y-m-d') . '.log';
    
    // Format the log entry
    $logEntry = json_encode($data) . "\n";
    
    // Append to log file
    file_put_contents($filename, $logEntry, FILE_APPEND);
    
    
/*     \DB::table('email_logs')->insert([
        'student_id' => $data['student_id'],
        'student_name' => $data['student_name'],
        'nic' => $data['nic'],
        'email' => $data['email'],
        'batch_code' => $data['batch_code'],
        'batch_name' => $data['batch_name'],
        'ip_address' => $data['ip_address'],
        'user_agent' => $data['user_agent'],
        'created_at' => now(),
        'updated_at' => now()
    ]); */
}

// Add this method to your EmailController class
public function viewLogs(Request $request)
{
    // Get the date parameter (optional)
    $date = $request->input('date');
   
 
    
    // Build the logs directory path
    $logsDir = storage_path('logs/email-requests');
    
    // Get available log dates
    $availableDates = collect(glob($logsDir . '/email-requests-*.log'))
        ->map(function ($file) {
            preg_match('/email-requests-(\d{4}-\d{2}-\d{2})\.log$/', $file, $matches);
            return $matches[1] ?? null;
        })
        ->filter()
        ->values()
        ->toArray();
    
    // Determine which log file to read
    $logFile = $date 
        ? $logsDir . '/email-requests-' . $date . '.log'
        : $logsDir . '/email-requests-' . now()->format('Y-m-d') . '.log';
    
    // Read and parse the log file
    $logs = [];
 
    if (file_exists($logFile)) {
        $content = file_get_contents($logFile);
        $lines = explode("\n", $content);
        
        foreach ($lines as $line) {
            if (trim($line) !== '') {
                try {
                    $logs[] = json_decode($line, true);
                } catch (\Exception $e) {
                    // Skip invalid JSON lines
                    continue;
                }
            }
        }
    }
       return Inertia::render('Admin/Logs/EmailLogsViewer', [
        'logs' => $logs,
        'availableDates' => $availableDates,
    ]);
}


// Add this method to your EmailController class for AJAX requests
public function getLogsApi(Request $request)
{
    // Get the date parameter (optional)
    $date = $request->input('date');
    
    // Build the logs directory path
    $logsDir = storage_path('logs/email-requests');
    
    // Get available log dates
    $availableDates = collect(glob($logsDir . '/email-requests-*.log'))
        ->map(function ($file) {
            preg_match('/email-requests-(\d{4}-\d{2}-\d{2})\.log$/', $file, $matches);
            return $matches[1] ?? null;
        })
        ->filter()
        ->sort()
        ->values()
        ->toArray();
    
    // Determine which log file to read
    $logFile = $date 
        ? $logsDir . '/email-requests-' . $date . '.log'
        : $logsDir . '/email-requests-' . now()->format('Y-m-d') . '.log';
    
    // Read and parse the log file
    $logs = [];
    
    if (file_exists($logFile)) {
        $content = file_get_contents($logFile);
        $lines = explode("\n", $content);
        
        foreach ($lines as $line) {
            if (trim($line) !== '') {
                try {
                    $logs[] = json_decode($line, true);
                } catch (\Exception $e) {
                    // Skip invalid JSON lines
                    continue;
                }
            }
        }
    }
    
    return response()->json([
        'logs' => $logs,
        'availableDates' => $availableDates,
    ]);
}



private function logEmailOperation($operation, $data)
{
    // Create logs directory if it doesn't exist
    $logsDir = storage_path("logs/email-operations/{$operation}");
    if (!file_exists($logsDir)) {
        mkdir($logsDir, 0755, true);
    }
    
    // Format for log file - one per day
    $filename = $logsDir . '/' . $operation . '-' . now()->format('Y-m-d') . '.log';
    
    // Add timestamp to the log entry
    $data['logged_at'] = now()->toDateTimeString();
    
    // Format the log entry
    $logEntry = json_encode($data) . "\n";
    
    // Append to log file
    file_put_contents($filename, $logEntry, FILE_APPEND);
}


public function getOperationLogs(Request $request, $operation)
{
    // Validate operation
    $validOperations = ['sendResultEmail', 'checkEmailProgress', 'stopEmailProcess'];
    if (!in_array($operation, $validOperations)) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid operation'
        ], 400);
    }
    
    // Get the date parameter (optional)
    $date = $request->input('date', now()->format('Y-m-d'));
    
    // Build the logs directory path
    $logsDir = storage_path("logs/email-operations/{$operation}");
    
    // Get available log dates
    $availableDates = collect(glob($logsDir . "/{$operation}-*.log"))
        ->map(function ($file) use ($operation) {
            preg_match("/{$operation}-(\d{4}-\d{2}-\d{2})\.log$/", $file, $matches);
            return $matches[1] ?? null;
        })
        ->filter()
        ->sort()
        ->values()
        ->toArray();
    
    // Determine which log file to read
    $logFile = $logsDir . "/{$operation}-{$date}.log";
    
    // Read and parse the log file
    $logs = [];
    
    if (file_exists($logFile)) {
        $content = file_get_contents($logFile);
        $lines = explode("\n", $content);
        
        foreach ($lines as $line) {
            if (trim($line) !== '') {
                try {
                    $logs[] = json_decode($line, true);
                } catch (\Exception $e) {
                    // Skip invalid JSON lines
                    continue;
                }
            }
        }
    }
    
    return response()->json([
        'success' => true,
        'operation' => $operation,
        'date' => $date,
        'logs' => $logs,
        'availableDates' => $availableDates,
    ]);
}
}
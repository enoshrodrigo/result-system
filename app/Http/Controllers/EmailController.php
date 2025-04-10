<?php
// app/Http/Controllers/EmailController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\StudentResult;
use App\Models\short_course_student;
use App\Models\Student;
use App\Models\EmailLog;
use App\Models\EmailOperation;
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
        
        // Create a record of this email batch operation in the database
        EmailOperation::create([
            'operation_type' => 'sendResultEmail',
            'batch_id' => $batchId,
            'subject' => $subject,
            'batch_code' => $batchCode,
            'email_count' => count($emails),
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
            'progress' => [
                'total' => count($emails),
                'sent' => 0,
                'failed' => 0,
                'completed' => false
            ]
        ]);
        
        // Dispatch jobs for each email
        foreach ($emails as $index => $emailData) {
            // Generate a tracking ID for each email
            $trackingId = Str::uuid();
            
            // Store the tracking ID with the email data
            $emailData['trackingId'] = $trackingId;
            
            // Log the email in the database before sending
            EmailLog::create([
                'student_id' => $emailData['studentId'] ?? null,
                'student_name' => $emailData['studentName'] ?? null,
                'email' => $emailData['email'],
                'subject' => $subject,
                'batch_code' => $batchCode,
                'email_type' => 'batch',
                'tracking_id' => $trackingId,
                'status' => 'queued',
                'ip_address' => $request->ip(),
                'user_agent' => $request->header('User-Agent')
            ]);
            
            SendResultEmail::dispatch(
                $emailData, 
                $subject, 
                $batchId, 
                $index + 1, 
                count($emails)
            )->delay(now()->addSeconds($index * 1)); // Add small delay between jobs
        }
        
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
        
        // Log this check operation
        EmailOperation::create([
            'operation_type' => 'checkEmailProgress',
            'batch_id' => $batchId,
            'progress' => $progress,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent')
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
        
        // Log this stop operation
        EmailOperation::create([
            'operation_type' => 'stopEmailProcess',
            'batch_id' => $batchId,
            'progress' => $progress,
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
            'stopped' => true,
            'stopped_at' => now()
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
        
        // Find batch by code
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

        // Generate tracking ID
        $trackingId = Str::uuid();
        
        // Create a record for this email in the database
        $emailLog = EmailLog::create([
            'student_id' => $student->id,
            'student_name' => $student->first_name,
            'nic' => $student->NIC_PO,
            'email' => $request->email,
            'subject' => "Your BCI Campus Result: {$request->batchName}",
            'batch_code' => $request->batchCode,
            'batch_name' => $request->batchName,
            'email_type' => 'result',
            'tracking_id' => $trackingId,
            'status' => 'pending',
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent')
        ]);

        // Build email content with tracking pixel
        $content = view('emails.student-result-individual', [
            'student' => $student, 
            'email' => $request->email,
            'subjects' => $subjects,
            'status' => $status ? $status->status : 'N/A',
            'batchName' => $request->batchName,
            'batchCode' => $request->batchCode,
            'trackingId' => $trackingId
        ])->render();

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

            // Update the email log status
            $emailLog->status = 'sent';
            $emailLog->save();

            return response()->json([
                'success' => true,
                'message' => 'Result email sent successfully'
            ]);
        } catch (\Exception $e) {
            // Log error with details for debugging
            Log::error('Failed to send student result email: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            
            // Update the email log with the error
            $emailLog->status = 'failed';
            $emailLog->error = $e->getMessage();
            $emailLog->save();
            
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
    
    // Track email opens
    public function trackEmailOpen($trackingId)
    {
        // Find the email log by tracking ID
        $emailLog = EmailLog::where('tracking_id', $trackingId)->first();
        
        if ($emailLog) {
            // Only update if this is the first time it's opened
            if (!$emailLog->opened) {
                $emailLog->opened = true;
                $emailLog->opened_at = now();
                $emailLog->opened_ip_address = request()->ip();
                $emailLog->opened_user_agent = request()->header('User-Agent');
                $emailLog->save();
            }
        }
        
        // Return a tiny transparent 1x1 pixel GIF image
        $transparentPixel = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        return response($transparentPixel)->header('Content-Type', 'image/gif');
    }

    // View email logs
    public function viewLogs(Request $request)
    {
        $query = EmailLog::query();
        
        // Apply filters if provided
        if ($request->has('date')) {
            $date = $request->input('date');
            $query->whereDate('created_at', $date);
        }
        
        if ($request->has('status')) {
            $status = $request->input('status');
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }
        
        if ($request->has('opened')) {
            $opened = $request->input('opened');
            if ($opened === 'opened') {
                $query->where('opened', true);
            } elseif ($opened === 'unopened') {
                $query->where('opened', false);
            }
        }
        
        // Get the logs
        $logs = $query->latest()->paginate(50);
        
        // Get available dates for filtering
        $availableDates = EmailLog::selectRaw('DATE(created_at) as date')
            ->distinct()
            ->orderBy('date', 'desc')
            ->pluck('date')
            ->toArray();
        
        return Inertia::render('Admin/Logs/EmailLogsViewer', [
            'logs' => $logs,
            'availableDates' => $availableDates,
        ]);
    }

    // API endpoint for logs
    public function getLogsApi(Request $request)
    {
        $query = EmailLog::query();
        
        // Apply filters if provided
        if ($request->has('date')) {
            $date = $request->input('date');
            if ($date) {
                $query->whereDate('created_at', $date);
            }
        }
        
        if ($request->has('status')) {
            $status = $request->input('status');
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }
        
        if ($request->has('opened')) {
            $opened = $request->input('opened');
            if ($opened === 'opened') {
                $query->where('opened', true);
            } elseif ($opened === 'unopened') {
                $query->where('opened', false);
            }
        }
        
        if ($request->has('type') && $request->input('type') !== 'all') {
            $query->where('email_type', $request->input('type'));
        }
        
        // Get the logs
        $logs = $query->latest()->get();
        
        // Get available dates for filtering
        $availableDates = EmailLog::selectRaw('DATE(created_at) as date')
            ->distinct()
            ->orderBy('date', 'desc')
            ->pluck('date')
            ->toArray();
        
        return response()->json([
            'logs' => $logs,
            'availableDates' => $availableDates,
        ]);
    }

    // API endpoint for operation logs
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
        
        $query = EmailOperation::where('operation_type', $operation);
        
        // Apply date filter if provided
        if ($request->has('date')) {
            $date = $request->input('date');
            if ($date) {
                $query->whereDate('created_at', $date);
            }
        }
        
        // Get the logs
        $logs = $query->latest()->get();
        
        // Get available dates for filtering
        $availableDates = EmailOperation::where('operation_type', $operation)
            ->selectRaw('DATE(created_at) as date')
            ->distinct()
            ->orderBy('date', 'desc')
            ->pluck('date')
            ->toArray();
        
        return response()->json([
            'success' => true,
            'operation' => $operation,
            'date' => $request->input('date'),
            'logs' => $logs,
            'availableDates' => $availableDates,
        ]);
    }
}
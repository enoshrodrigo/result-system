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
        
        return response()->json([
            'success' => true,
            'message' => 'Email process stopped successfully',
            'progress' => $progress
        ]);
    }
}
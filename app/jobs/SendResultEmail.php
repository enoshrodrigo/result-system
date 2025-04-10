<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use App\Mail\StudentResult;
use App\Models\EmailLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class SendResultEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $emailData;
    protected $subject;
    protected $batchId;
    protected $index;
    protected $total;

    public function __construct($emailData, $subject, $batchId, $index, $total)
    {
        $this->emailData = $emailData;
        $this->subject = $subject;
        $this->batchId = $batchId;
        $this->index = $index;
        $this->total = $total;
    }

    public function handle()
    {
        // Get the current progress
        $progress = Cache::get("email_batch_{$this->batchId}");
        
        // If the batch is marked as completed or not found, don't process this job
        if (!$progress || isset($progress['completed']) && $progress['completed']) {
            Log::info("Skipping email job - batch {$this->batchId} is marked as completed or not found");
            return;
        }
        
        // Update current student information in the cache
        $progress['currentStudent'] = [
            'name' => $this->emailData['studentName'],
            'index' => $this->index,
            'total' => $this->total
        ];
        Cache::put("email_batch_{$this->batchId}", $progress, now()->addDay());
        
        // Find or create the email log entry
        $emailLog = EmailLog::firstOrCreate(
            ['tracking_id' => $this->emailData['trackingId']],
            [
                'student_id' => $this->emailData['studentId'] ?? null,
                'student_name' => $this->emailData['studentName'] ?? null,
                'email' => $this->emailData['email'],
                'subject' => $this->subject,
                'status' => 'processing',
            ]
        );
        
        // Add tracking pixel to email content
        $trackingPixel = '<img src="' . route('track.email', $this->emailData['trackingId']) . '" width="1" height="1" alt="" />';
        $content = $this->emailData['content'] . $trackingPixel;
        
        try {
            // Send the email
            Mail::to($this->emailData['email'])
                ->send(new StudentResult($this->subject, $content));
            
            // Update the email log
            $emailLog->status = 'sent';
            $emailLog->save();
            
            // Update the batch progress in cache
            $this->updateProgress(true);
            
            Log::info("Email sent to {$this->emailData['studentName']} ({$this->emailData['email']})");
            
        } catch (\Exception $e) {
            // Update the email log
            $emailLog->status = 'failed';
            $emailLog->error = $e->getMessage();
            $emailLog->save();
            
            // Update the batch progress with failure info
            $this->updateProgress(false, $e->getMessage());
            
            Log::error("Failed to send email: {$e->getMessage()}");
        }
    }
    
    private function updateProgress($success, $errorMessage = null)
    {
        // Get current progress
        $progress = Cache::get("email_batch_{$this->batchId}");
        
        if (!$progress) return;
        
        // Update progress
        if ($success) {
            $progress['sent']++;
        } else {
            $progress['failed']++;
            $progress['failedEmails'][] = [
                'studentId' => $this->emailData['studentId'],
                'name' => $this->emailData['studentName'],
                'email' => $this->emailData['email'],
                'trackingId' => $this->emailData['trackingId'],
                'error' => $errorMessage
            ];
        }
        
        // Update current student
        $progress['currentStudent'] = [
            'name' => $this->emailData['studentName'],
            'index' => $this->index,
            'total' => $this->total
        ];
        
        // Check if complete
        if ($progress['sent'] + $progress['failed'] >= $progress['total']) {
            $progress['completed'] = true;
        }
        
        // Store updated progress
        Cache::put("email_batch_{$this->batchId}", $progress, now()->addDay());
        
        // Update the operation record in the database
        try {
            \App\Models\EmailOperation::where('batch_id', $this->batchId)
                ->where('operation_type', 'sendResultEmail')
                ->update([
                    'progress' => $progress
                ]);
        } catch (\Exception $e) {
            Log::error("Error updating email operation record: {$e->getMessage()}");
        }
    }
}
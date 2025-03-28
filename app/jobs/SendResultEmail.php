<?php
// app/Jobs/SendResultEmail.php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use App\Mail\StudentResult;
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
        
        try {
            // Send the email
            Mail::to($this->emailData['email'])
                ->send(new StudentResult($this->subject, $this->emailData['content']));
            
            // Update the batch progress in cache
            $this->updateProgress(true);
            
            Log::info("Email sent to {$this->emailData['studentName']} ({$this->emailData['email']})");
            
        } catch (\Exception $e) {
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
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResultEmail; // Assuming you have a Mailable class for sending emails
use App\Mail\StudentResult;
use App\Models\short_course_student;
use App\Models\Student; // Assuming you have a Student model
use App\Models\Students;
use Illuminate\Support\Facades\Log;

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
        
        $sent = 0;
        $failed = 0;
        $failedEmails = [];

        // Process each email in the batch
        foreach ($emails as $emailData) {
            try {
                // Send the email
                Mail::to($emailData['email'])
                    ->send(new StudentResult($subject, $emailData['content']));
                
                // Log successful send
                Log::info("Result email sent to student: {$emailData['studentId']} ({$emailData['email']})");
                
                $sent++;
                
                // Small delay to avoid overwhelming the mail server
                usleep(100000); // 100ms delay
                
            } catch (\Exception $e) {
                // Log failure
                Log::error("Failed to send result email to {$emailData['studentId']}: {$e->getMessage()}");
                
                // Track failed email
                $failed++;
                $failedEmails[] = [
                    'studentId' => $emailData['studentId'],
                    'name' => $emailData['studentName'],
                    'email' => $emailData['email'],
                    'error' => $e->getMessage()
                ];
            }
        }

        // Return batch results
        return response()->json([
            'success' => true,
            'sent' => $sent,
            'failed' => $failed,
            'failedEmails' => $failedEmails,
            'message' => "Processed {$sent} emails successfully, {$failed} failed."
        ]);
    }

    public function sendEmails(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'recipients' => 'required|array',
            'recipients.*' => 'exists:students,NIC',
        ]);

        $recipients = $validated['recipients'];
        $subject = $validated['subject'];
        $content = $validated['content'];

        $totalRecipients = count($recipients);
        $sentCount = 0;
        $failedCount = 0;
        $failedRecipients = [];

        foreach ($recipients as $recipient) {
            try {
                $student = short_course_student::where('NIC_PO', $recipient)->first();
                Mail::to($student->email)->send(new StudentResult($subject, $content));
                $sentCount++;
            } catch (\Exception $e) {
                Log::error("Failed to send email to {$recipient}: " . $e->getMessage());
                $failedCount++;
                $failedRecipients[] = $recipient;
            }
        }

        return response()->json([
            'success' => true,
            'total' => $totalRecipients,
            'sent' => $sentCount,
            'failed' => $failedCount,
            'failed_recipients' => $failedRecipients,
        ]);
    }
}
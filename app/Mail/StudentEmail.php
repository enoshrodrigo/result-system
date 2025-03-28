<?php

namespace App\Mail;

use App\Models\short_course_student;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class StudentEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $student;
    public $emailSubject;
    public $emailBody;

    /**
     * Create a new message instance.
     */
    public function __construct(short_course_student $student, string $subject, string $body)
    {
        $this->student = $student;
        $this->emailSubject = $subject;
        $this->emailBody = $body;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject($this->emailSubject)
                    ->view('emails.student')
                    ->with([
                        'student' => $this->student,
                        'subject' => $this->emailSubject,
                        'content' => $this->emailBody

                    ]);
    }
}
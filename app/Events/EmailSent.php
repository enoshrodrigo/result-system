<?php
// app/Events/EmailSent.php
 

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EmailSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $batchId;
    public $success;
    public $emailData;
    public $error;
    public $currentIndex;
    public $totalEmails;
    
    public function __construct($batchId, $success, $emailData, $error, $currentIndex, $totalEmails)
    {
        $this->batchId = $batchId;
        $this->success = $success;
        $this->emailData = $emailData;
        $this->error = $error;
        $this->currentIndex = $currentIndex;
        $this->totalEmails = $totalEmails;
    }

    public function broadcastOn()
    {
        return new Channel('email-progress.' . $this->batchId);
    }
}
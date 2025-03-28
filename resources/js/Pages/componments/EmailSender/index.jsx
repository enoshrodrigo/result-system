import React, { useState, useRef, useEffect } from 'react';
import { 
  MdClose, 
  MdSend, 
  MdStop, 
  MdCheckBox, 
  MdCheckBoxOutlineBlank,
  MdError
} from 'react-icons/md';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EmailSender = ({ students, batch, onClose }) => {
  // State for the email form
  const [subject, setSubject] = useState(`Results for ${batch.name} - ${batch.year}`);
  const [emailContent, setEmailContent] = useState(
    `<p>Dear Student,</p>
     <p>We are pleased to inform you that your results for <strong>${batch.name}</strong> are now available.</p>
     <p>Your results are as follows:</p>
     <p>[STUDENT_RESULTS]</p>
     <p>Please get in touch with the administration office if you have any questions regarding your results.</p>
     <p>Best regards,<br/>BCI Administration</p>`
  );
  
// State for recipient selection
const [recipients, setRecipients] = useState(
  students.map(student => ({
    ...student,
    selected: student.email && student.email.trim() !== "" && student.email.includes('@'),
    email: student.email
  }))
);
  // Add near the top of the component with other state declarations
const [showFailedEmails, setShowFailedEmails] = useState(false);
const [completedBatchId, setCompletedBatchId] = useState(null);
// Add after your other state declarations (around line 95)
const [isStopping, setIsStopping] = useState(false);
// Add these functions before the return statement
// Retry a single failed email
const retryEmail = async (failedEmail) => {
  try {
    toast('Retrying email to ' + failedEmail.email);
    
    const emailToRetry = {
      subject: subject,
      batchCode: batch.code,
      emails: [{
        studentId: failedEmail.studentId,
        studentName: failedEmail.name || failedEmail.studentId,
        email: failedEmail.email,
        content: failedEmail.content
      }]
    };
    
    const response = await axios.post(route('retrySendEmail'), emailToRetry);
    
    if (response.data.success) {
      toast.success('Email retry initiated');
      // Remove this email from the failed emails list
      setProgress(prev => ({
        ...prev,
        failedEmails: prev.failedEmails.filter(email => 
          email.studentId !== failedEmail.studentId || email.email !== failedEmail.email
        )
      }));
    } else {
      toast.error('Failed to retry email');
    }
  } catch (error) {
    console.error('Error retrying email:', error);
    toast.error('Error retrying email: ' + (error.response?.data?.message || 'Unknown error'));
  }
};

// Retry all failed emails
const retryAllFailedEmails = async () => {
  if (!progress.failedEmails || progress.failedEmails.length === 0) return;
  
  try {
    toast('Retrying all failed emails');
    
    const emailsToRetry = {
      subject: subject,
      batchCode: batch.code,
      emails: progress.failedEmails.map(failedEmail => ({
        studentId: failedEmail.studentId,
        studentName: failedEmail.name || failedEmail.studentId,
        email: failedEmail.email,
        content: failedEmail.content
      }))
    };
    
    const response = await axios.post(route('retrySendEmail'), emailsToRetry);
    
    if (response.data.success) {
      toast.success('Retry initiated for all failed emails');
      setCurrentBatchId(response.data.batchId);
      localStorage.setItem('currentEmailBatchId', response.data.batchId);
      setIsSending(true);
      setShowFailedEmails(false);
    } else {
      toast.error('Failed to retry emails');
    }
  } catch (error) {
    console.error('Error retrying emails:', error);
    toast.error('Error retrying emails: ' + (error.response?.data?.message || 'Unknown error'));
  }
};
  // State for email sending process
  const [isSending, setIsSending] = useState(false);
  const [currentBatchId, setCurrentBatchId] = useState(null);
  const [progress, setProgress] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    currentStudent: null,
    failedEmails: []
  });
  
  // Ref for polling interval
  const pollingIntervalRef = useRef(null);
  
  // Toggle selection for a single recipient
  const toggleRecipient = (nic) => {
    setRecipients(prev => 
      prev.map(recipient => 
        recipient.NIC === nic 
          ? { ...recipient, selected: !recipient.selected } 
          : recipient
      )
    );
  };
  
  // Toggle selection for all recipients
  const toggleAllRecipients = () => {
    const allSelected = recipients.every(r => r.selected);
    setRecipients(prev => 
      prev.map(recipient => ({ ...recipient, selected: !allSelected }))
    );
  };
  
  // Set up polling when a batch is being processed
  useEffect(() => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // If we have a batch ID and we're sending, start polling
    if (currentBatchId && isSending) {
      pollingIntervalRef.current = setInterval(() => {
        checkBatchProgress();
      }, 2000); // Check every 2 seconds
      
      // Initial check
      checkBatchProgress();
    }
    
    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [currentBatchId, isSending]);
  
  // Check for existing batch on component mount
  useEffect(() => {
    const storedBatchId = localStorage.getItem('currentEmailBatchId');
    if (storedBatchId) {
      // Check if this batch is still in progress
      checkStoredBatchProgress(storedBatchId);
    }
  }, []);
  
// Function to check a stored batch progress
const checkStoredBatchProgress = async (batchId) => {
  try {
    const response = await axios.get(route('checkEmailProgress', batchId));
   
    if (response.data.success) {
      const batchProgress = response.data.progress;
      
      if (!batchProgress.completed) {
        // Resume tracking this batch
        setCurrentBatchId(batchId);
        setProgress(batchProgress);
        setIsSending(true);
        toast('Reconnected to email sending process');
      } else if (batchProgress.failedEmails && batchProgress.failedEmails.length > 0) {
        // Batch is complete but has failed emails
        setShowFailedEmails(true);
        setProgress(batchProgress);
        setCompletedBatchId(batchId);
        toast('Email sending completed with failed emails');
      } else {
        // Batch is complete with no issues
        localStorage.removeItem('currentEmailBatchId');
      }
    }
  } catch (error) {
    // Batch not found or other error, clear from localStorage
    localStorage.removeItem('currentEmailBatchId');
  }
};
  
  // Function to check batch progress via API
  const checkBatchProgress = async () => {
    if (!currentBatchId) return;
    
    try {
      const response = await axios.get(route('checkEmailProgress', currentBatchId));
      if (response.data.success) {
        const serverProgress = response.data.progress;
        
        // Update progress from server
        setProgress(serverProgress);
        
        // If completed, stop polling and show message
        if (serverProgress.completed && isSending) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          
          // Show completion message
          if (serverProgress.failed === 0) {
            toast.success('All emails sent successfully!');
          } else {
            toast.success(`Email sending completed. ${serverProgress.sent} sent, ${serverProgress.failed} failed.`);
          }
          
          // Clear from localStorage
          localStorage.removeItem('currentEmailBatchId');
          
          // Keep UI in "sending" state so user can see results
          // They can manually close the dialog
        }
      }
    } catch (error) {
      console.error('Error checking batch progress:', error);
    }
  };
  
  // Start sending emails
  const handleSendEmails = async () => {
    const selectedRecipients = recipients.filter(r => r.selected);
    
    if (selectedRecipients.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }
    
    if (!subject.trim()) {
      toast.error('Please enter an email subject');
      return;
    }
    
    if (!emailContent.trim() || emailContent === '<p><br></p>') {
      toast.error('Please enter email content');
      return;
    }
    
    // Confirm before sending
    if (!window.confirm(`You are about to send emails to ${selectedRecipients.length} students. Continue?`)) {
      return;
    }
    
    setIsSending(true);
    setProgress({
      total: selectedRecipients.length,
      sent: 0,
      failed: 0,
      currentStudent: null,
      failedEmails: []
    });
    
    try {
      // Create an array of personalized content for each recipient
      const emailsToSend = selectedRecipients.map(student => {
        // Prepare personalized content
        let personalizedContent = emailContent.replace(
          '[STUDENT_RESULTS]',
          `<table border="1" cellpadding="5" style="border-collapse: collapse;">
            <tr>
              <th>Subject</th>
              <th>Grade</th>
            </tr>
            ${student.subjects
              .filter(subject => subject.grade && subject.grade.trim() !== "" && subject.grade !== "-")
              .map(subject => `
                <tr>
                  <td>${subject.subject_name} (${subject.subject_code})</td>
                  <td>${subject.grade}</td>
                </tr>
              `).join('')}
          </table>`
        );
        
        return {
          studentId: student.NIC,
          studentName: student.first_name,
          email: student.email,
          content: personalizedContent
        };
      });
      
      // Start the batch email process
      const response = await axios.post(
        route('sendResultEmail'), 
        {
          subject: subject,
          batchCode: batch.code,
          emails: emailsToSend
        }
      );
      
      if (response.data.success) {
        // Store the batch ID for tracking
        setCurrentBatchId(response.data.batchId);
        toast.success('Email sending process started in the background');
        
        // Store batch ID in localStorage for reconnection after page navigation
        localStorage.setItem('currentEmailBatchId', response.data.batchId);
      } else {
        toast.error('Failed to start email sending process');
        setIsSending(false);
      }
    } catch (error) {
      console.error('Error starting email process:', error);
      toast.error('Error starting email process: ' + (error.response?.data?.message || 'Unknown error'));
      setIsSending(false);
    }
  };
  
// Action when user closes the form while sending
const handleCloseWhileSending = () => {
  console.log("Close button clicked");
  toast('Email sending will continue in the background', {
    duration: 5000
  });
 
  // Add a small delay before calling onClose
  setTimeout(() => {
    console.log("Executing onClose");
    onClose();
  }, 100);
};
 // Add before the return statement (around line 340)
 const handleStopSending = async () => {
  if (!currentBatchId) return;
  
  if (!window.confirm('Are you sure you want to stop sending emails? This cannot be undone.')) {
    return;
  }
  
  setIsStopping(true);
  
  try {
    const response = await axios.post(route('stopEmailProcess'), {
      batchId: currentBatchId
    });
    
    if (response.data.success) {
      toast.success('Email sending process stopped');
      
      // Update progress with final status
      if (response.data.progress) {
        setProgress(response.data.progress);
      }
      
      // Clean up
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      localStorage.removeItem('currentEmailBatchId');
      
      // Show completion even though it was stopped
      setProgress(prev => ({
        ...prev,
        completed: true
      }));
    } else {
      toast.error('Failed to stop email process');
    }
  } catch (error) {
    console.error('Error stopping email process:', error);
    toast.error('Error stopping email process: ' + (error.response?.data?.message || 'Unknown error'));
  } finally {
    setIsStopping(false);
  }
};
  // React Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };
  
  return (
    <div className="email-sender">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Send Results Emails
        </h3>
        <button
          onClick={isSending ? handleCloseWhileSending : onClose}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <MdClose size={24} />
        </button>
      </div>
      
      {!isSending ? (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">
              Content
            </label>
            <div className="bg-white">
              <ReactQuill 
                theme="snow" 
                value={emailContent}
                onChange={setEmailContent}
                modules={modules}
                className="min-h-[200px]"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Use [STUDENT_RESULTS] to include personalized results in each email.
            </p>
          </div>
          
          {/* Recipients Selection */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-gray-700 dark:text-gray-300">
                Recipients ({recipients.filter(r => r.selected).length} selected)
              </label>
              <button
                onClick={toggleAllRecipients}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {recipients.every(r => r.selected) ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="border border-gray-300 rounded-md max-h-[200px] overflow-y-auto p-1">
              {recipients.length > 0 ? (
                recipients.map((recipient) => (
                  <div 
                    key={recipient.NIC}
                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <button
                      onClick={() => toggleRecipient(recipient.NIC)}
                      className="mr-2 text-blue-600"
                    >
                      {recipient.selected ? (
                        <MdCheckBox size={20} />
                      ) : (
                        <MdCheckBoxOutlineBlank size={20} />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="font-medium">{recipient.first_name}</div>
                      <div className="text-sm text-gray-500">{recipient.email}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-gray-500">No recipients available</p>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border bg-gray-700 rounded-md  text-slate-100 hover:bg-gray-50 hover:text-gray-700  "
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmails}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md shadow transition duration-200"
              disabled={recipients.filter(r => r.selected).length === 0}
            >
              <MdSend className="mr-1" /> Send Emails
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-gray-300 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
            <h4 className="font-semibold mb-2">Sending Progress</h4>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${(progress.sent + progress.failed) / progress.total * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <span className="text-green-600 font-medium">{progress.sent}</span> sent,
                <span className="text-red-600 font-medium ml-1">{progress.failed}</span> failed
              </div>
              <div>{Math.round((progress.sent + progress.failed) / progress.total * 100)}%</div>
            </div>
            
            {progress.currentStudent && (
  <div className="mt-2 text-sm">
    <div className="flex justify-between items-center">
      <p>Currently sending to: {progress.currentStudent.name} 
        {progress.currentStudent.index && 
        ` (${progress.currentStudent.index} of ${progress.currentStudent.total})`}
      </p>
      
  
    </div>
  </div>
)}
            
            {/* Failed Emails Section */}
            {progress.failedEmails && progress.failedEmails.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-red-600 flex items-center">
                  <MdError className="mr-1" /> Failed Emails ({progress.failedEmails.length})
                </h5>
                <div className="mt-2 max-h-[120px] overflow-y-auto bg-white border border-red-200 rounded-md">
                  {progress.failedEmails.map((failed, idx) => (
                    <div key={idx} className="p-2 border-b border-red-100 text-xs">
                      <div className="font-medium">{failed.name || failed.studentId}</div>
                      <div className="text-gray-600">{failed.email}</div>
                      <div className="text-red-500 mt-1">{failed.error}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4 text-sm  text-red-600">
              <p>This process will continue in the background even if you close this window.</p>
              <p>You can check the progress by returning to this page.</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
  {!progress.completed && (
    <button
      onClick={handleStopSending}
      disabled={isStopping}
      className="flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md shadow transition duration-200"
    >
      <MdStop className="mr-1" />
      {isStopping ? 'Stopping...' : 'Stop Process'}
    </button>
  )}<button
              onClick={handleCloseWhileSending}
              className="px-4 py-2 border bg-gray-700 rounded-md  text-slate-100 hover:bg-gray-50 hover:text-gray-700"
            >
              Close (Process Will Continue)
            </button>
          </div>
        </div>
      )}
 

 
{showFailedEmails && !isSending && (
  <div className="space-y-4 mt-4">
    <div className="border border-gray-300 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
      <h4 className="font-semibold mb-2 flex items-center text-red-600">
        <MdError className="mr-1" /> Failed Emails from Previous Sending
      </h4>
      
      <div className="mt-2 max-h-[200px] overflow-y-auto bg-white border border-red-200 rounded-md">
        {progress.failedEmails.map((failed, idx) => (
          <div key={idx} className="p-2 border-b border-red-100 text-xs flex justify-between items-center">
            <div>
              <div className="font-medium">{failed.name || failed.studentId}</div>
              <div className="text-gray-600">{failed.email}</div>
              <div className="text-red-500 mt-1">{failed.error}</div>
            </div>
            <button
              onClick={() => retryEmail(failed)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
            >
              Retry
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-3 flex justify-end space-x-3">
        <button
          onClick={() => setShowFailedEmails(false)}
          className="px-3 py-1 border rounded-md text-gray-600"
        >
          Close
        </button>
        <button
          onClick={retryAllFailedEmails}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
        >
          Retry All Failed
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default EmailSender;
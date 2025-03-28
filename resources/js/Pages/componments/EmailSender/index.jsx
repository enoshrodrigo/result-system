import React, { useState, useRef, useEffect } from 'react';
import { 
  MdClose, 
  MdSend, 
  MdStop, 
  MdCheckBox, 
  MdCheckBoxOutlineBlank,
  MdOutlineWarning,
  MdOutlineMailOutline,
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
     <p>If you have any questions regarding your results, please contact the administration office.</p>
     <p>Best regards,<br/>BCI Administration</p>`
  );
  
  // State for recipient selection
  const [recipients, setRecipients] = useState(
    students.map(student => ({
      ...student,
      selected: true, // by default all are selected
      /* email: `${student.NIC.toLowerCase()}@example.com` */ // default email generation
      email: "enoshrodrigo930@gmail.com" // default email generation
    }))
  );
  
  // State for email sending process
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    currentStudent: null,
    failedEmails: [] // Track failed emails with reasons
  });
  
  // Ref to store cancellation token
  const cancelTokenRef = useRef(null);
  
  // Update recipients when students prop changes
  useEffect(() => {
    if (students) {
      setRecipients(
        students.map(student => ({
          ...student,
          selected: true,
          email: "enoshrodrigo930@gmail.com"  // default email generation
        }))
      );
    }
  }, [students]);
  
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
    
    // Create cancellation token
    const cancelToken = axios.CancelToken.source();
    cancelTokenRef.current = cancelToken;
    
    try {
      // Create a batch of recipients to send (max 10 at a time)
      const batchSize = 10;
      for (let i = 0; i < selectedRecipients.length; i += batchSize) {
        // Check if we should cancel
        if (cancelTokenRef.current === null) {
          break;
        }
        
        const currentBatch = selectedRecipients.slice(i, i + batchSize);
        
        // Create an array of personalized content for each recipient
        const emailsToSend = currentBatch.map(student => {
          // Prepare personalized content
          let personalizedContent = emailContent.replace(
            '[STUDENT_RESULTS]',
            `<table border="1" cellpadding="5" style="border-collapse: collapse;">
              <tr>
                <th>Subject</th>
                <th>Grade</th>
              </tr>
              ${student.subjects.map(subject => `
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
        
        // Update progress to show current batch being processed
        setProgress(prev => ({
          ...prev,
          currentStudent: currentBatch[0]
        }));
        
        try {
          // Make the actual API call to send batch of emails
          const response = await axios.post(
            route('sendResultEmail'), 
            {
              subject: subject,
              batchCode: batch.code,
              emails: emailsToSend
            },
            { cancelToken: cancelToken.token }
          );
          
          // Update progress based on response
          setProgress(prev => ({
            ...prev,
            sent: prev.sent + response.data.sent,
            failed: prev.failed + response.data.failed,
            failedEmails: [...prev.failedEmails, ...response.data.failedEmails || []]
          }));
          
        } catch (error) {
          if (axios.isCancel(error)) {
            toast.error('Email sending was cancelled');
            break;
          }
          
          // Generic error handling for the batch
          console.error('Error sending email batch:', error);
          
          // Assume all in the batch failed
          setProgress(prev => ({
            ...prev,
            failed: prev.failed + currentBatch.length,
            failedEmails: [
              ...prev.failedEmails,
              ...currentBatch.map(student => ({
                studentId: student.NIC, 
                email: student.email,
                name: student.first_name,
                error: error.response?.data?.message || 'Network error'
              }))
            ]
          }));
        }
      }
      
      // All done
      if (cancelTokenRef.current !== null) {
        toast.success('Email sending completed');
      }
      
    } catch (error) {
      console.error('Error in email sending process:', error);
      toast.error('There was an error in the email sending process');
    } finally {
      cancelTokenRef.current = null;
      setIsSending(false);
    }
  };
  
  // Cancel sending emails
  const handleCancelSending = () => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Operation cancelled by user');
      cancelTokenRef.current = null;
      toast.error('Email sending cancelled');
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
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          disabled={isSending}
        >
          <MdClose size={24} />
        </button>
      </div>
      
      {/* Email Form */}
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
            disabled={isSending}
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
              readOnly={isSending}
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
              disabled={isSending}
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
                    disabled={isSending}
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
        
        {/* Progress Tracker (shown only when sending) */}
        {isSending && (
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
                <p>Currently sending to: {progress.currentStudent.first_name}</p>
              </div>
            )}
            
            {/* Failed Emails Section */}
            {progress.failedEmails.length > 0 && (
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
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          {isSending ? (
            <button
              onClick={handleCancelSending}
              className="flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md shadow transition duration-200"
            >
              <MdStop className="mr-1" /> Stop Sending
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailSender;
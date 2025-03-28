import React, { useState } from 'react';
import axios from 'axios';
import ProgressTracker from './ProgressTracker';
import RecipientSelector from './RecipientSelector';

const EmailForm = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [progress, setProgress] = useState({ sent: 0, failed: 0 });
  const [isSending, setIsSending] = useState(false);
  const [isStopped, setIsStopped] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setIsStopped(false);
    setProgress({ sent: 0, failed: 0 });

    try {
      const response = await axios.post('/api/send-emails', {
        subject,
        content,
        recipients,
      });

      if (response.data.success) {
        // Handle successful email sending
        console.log('Emails sent successfully');
      }
    } catch (error) {
      console.error('Error sending emails:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleStop = () => {
    setIsStopped(true);
    // Logic to stop sending emails if needed
  };

  return (
    <div className="email-form">
      <h2>Send Email to Students</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <RecipientSelector recipients={recipients} setRecipients={setRecipients} />
        <button type="submit" disabled={isSending}>
          {isSending ? 'Sending...' : 'Send Email'}
        </button>
        {isSending && (
          <button type="button" onClick={handleStop}>
            Stop
          </button>
        )}
      </form>
      <ProgressTracker progress={progress} isSending={isSending} isStopped={isStopped} />
    </div>
  );
};

export default EmailForm;
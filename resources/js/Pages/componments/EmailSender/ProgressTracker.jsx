import React, { useState, useEffect } from 'react';

const ProgressTracker = ({ totalRecipients, onCancel }) => {
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    if (isCancelled) {
      // Reset counts if cancelled
      setSentCount(0);
      setFailedCount(0);
      setProgress(0);
      setIsSending(false);
    }
  }, [isCancelled]);

  const handleSendEmails = async () => {
    setIsSending(true);
    setIsCancelled(false);
    setSentCount(0);
    setFailedCount(0);
    setProgress(0);

    for (let i = 0; i < totalRecipients; i++) {
      if (isCancelled) break;

      // Simulate sending email
      const success = await sendEmail(i); // Replace with actual email sending logic
      if (success) {
        setSentCount(prev => prev + 1);
      } else {
        setFailedCount(prev => prev + 1);
      }

      setProgress(((i + 1) / totalRecipients) * 100);
    }

    setIsSending(false);
  };

  const sendEmail = (index) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate success/failure
        resolve(Math.random() > 0.1); // 90% chance of success
      }, 500);
    });
  };

  return (
    <div className="progress-tracker">
      <h3>Email Sending Progress</h3>
      <div className="progress-bar" style={{ width: `${progress}%` }} />
      <p>Sent: {sentCount} / {totalRecipients}</p>
      <p>Failed: {failedCount}</p>
      <button onClick={handleSendEmails} disabled={isSending}>
        {isSending ? 'Sending...' : 'Send Emails'}
      </button>
      <button onClick={() => setIsCancelled(true)} disabled={!isSending}>
        Cancel
      </button>
    </div>
  );
};

export default ProgressTracker;
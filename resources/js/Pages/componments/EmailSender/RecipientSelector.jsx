import React, { useState, useEffect } from 'react';

const RecipientSelector = ({ students, selectedRecipients, setSelectedRecipients }) => {
  const [excludeRecipients, setExcludeRecipients] = useState([]);

  const handleRecipientChange = (studentNIC) => {
    setSelectedRecipients((prev) => {
      if (prev.includes(studentNIC)) {
        return prev.filter((nic) => nic !== studentNIC);
      } else {
        return [...prev, studentNIC];
      }
    });
  };

  const handleExcludeChange = (studentNIC) => {
    setExcludeRecipients((prev) => {
      if (prev.includes(studentNIC)) {
        return prev.filter((nic) => nic !== studentNIC);
      } else {
        return [...prev, studentNIC];
      }
    });
  };

  return (
    <div className="recipient-selector">
      <h3 className="text-lg font-semibold mb-4">Select Recipients</h3>
      <div className="flex flex-col">
        {students.map((student) => (
          <div key={student.NIC} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={selectedRecipients.includes(student.NIC)}
              onChange={() => handleRecipientChange(student.NIC)}
              className="mr-2"
            />
            <label>{student.first_name} ({student.NIC})</label>
            <input
              type="checkbox"
              checked={excludeRecipients.includes(student.NIC)}
              onChange={() => handleExcludeChange(student.NIC)}
              className="ml-4"
            />
            <label className="ml-1">Exclude</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipientSelector;
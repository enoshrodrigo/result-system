import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { MdSave, MdClose,MdContentCopy, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import toast from 'react-hot-toast';

const StudentForm = ({ student, isEditing, batches, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    NIC_PO: '',
    email: '',
    mobile_number: '',
  });
  // Inside StudentForm.jsx, add these state variables at the top
const [showPassword, setShowPassword] = useState(false);
const [password, setPassword] = useState('');
const [hasExistingPassword, setHasExistingPassword] = useState(false);
const [maskedPassword, setMaskedPassword] = useState('');
// Add this function to generate a random password
// Add this function to copy password
const copyPasswordToClipboard = () => {
  if (password) {
    navigator.clipboard.writeText(password)
      .then(() => toast.success('Password copied to clipboard!'))
      .catch(() => toast.error('Failed to copy password'));
  } else if (hasExistingPassword) {
    toast.error("Can't copy existing password. Generate a new one first.");
  }
};
const generatePassword = () => {
  // Create a random password with 8-12 characters including lowercase, uppercase, numbers and symbols
  const length = Math.floor(Math.random() * 5) + 8; // Random length between 8-12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let newPassword = '';
  
  for (let i = 0; i < length; i++) {
    newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  setPassword(newPassword);
  // Also update the formData
  handleChange({ target: { name: 'password', value: newPassword } });
  
  // Show a success toast
  toast.success('New password generated');
};
  // Populate form if editing
  useEffect(() => {
    if (isEditing && student) {
      setFormData({
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        NIC_PO: student.NIC_PO || '', // Changed from NIC to NIC_PO
        email: student.email || '',
        mobile_number: student.mobile_number || '',
      });
       // Password handling
    if (student.password) {
      setHasExistingPassword(true);
      // Create masked version - we don't know actual length, so use 8 dots
      setMaskedPassword('••••••••');
    } else {
      setHasExistingPassword(false);
      setMaskedPassword('');
    }
       setPassword(''); // Reset password field when editing
    }else {
      // Clear form for new student
      setFormData({
        first_name: '',
        last_name: '',
        NIC_PO: '',
        email: '',
        password: ''
      });
      setPassword('');
      setHasExistingPassword(false);
      setMaskedPassword('');
    }
   
  }, [isEditing, student]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
      // If editing and password is empty, don't send password update
  const dataToSubmit = { ...formData };
  if (isEditing && !password) {
    delete dataToSubmit.password;
  }
    const url = isEditing 
      ? route('students.update', student.id) 
      : route('students.store');
    
    const method = isEditing ? 'put' : 'post';
    
    router[method](url, formData, {
      onSuccess: () => {
        toast.success(isEditing ? 'Student updated successfully' : 'Student added successfully');
        onClose();
      },
      onError: (errors) => {
        // Show errors
        Object.values(errors).forEach(error => {
          toast.error(error);
        });
      }
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Student' : 'Add New Student'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <MdClose size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-gray-700 dark:text-gray-300 mb-1">
              First Name*
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              value={formData.first_name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          
          <div>
            <label htmlFor="last_name" className="block text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          
          <div>
  <label htmlFor="NIC_PO" className="block text-gray-700 dark:text-gray-300 mb-1">
    NIC/Passport*
  </label>
  <input
    id="NIC_PO"
    name="NIC_PO"
    type="text"
    required
    value={formData.NIC_PO}
    onChange={handleChange}
    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
  />
</div>
          
          <div>
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          
          <div>
            <label htmlFor="mobile_number" className="block text-gray-700 dark:text-gray-300 mb-1">
              Mobile Number
            </label>
            <input
              id="mobile_number"
              name="mobile_number"
              type="text"
              value={formData.mobile_number}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
{/* Password field - Replace your existing password field with this */}
<div className="col-span-1 md:col-span-2">
  <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 mb-1">
    Password {isEditing && <span className="text-xs text-gray-500">(Leave empty to keep current password)</span>}
  </label>
  <div className="relative">
    <input
      id="password"
      name="password"
      type={showPassword ? "text" : "password"}
      value={password || (hasExistingPassword && !showPassword ? maskedPassword : '')}
      onChange={(e) => {
        setPassword(e.target.value);
        handleChange(e);
      }}
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 pr-24"
      placeholder={isEditing ? 
        (hasExistingPassword ? "Existing password (masked)" : "Enter new password") : 
        "Enter password"}
      readOnly={hasExistingPassword && !password}
    />
    <div className="absolute right-2 top-2 flex">
      {/* Copy button */}
      <button
        type="button"
        onClick={copyPasswordToClipboard}
        disabled={!(password || hasExistingPassword)}
        className={`p-1 ${(password || hasExistingPassword) ? 'text-gray-400 hover:text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
        title="Copy password"
      >
        <MdContentCopy className="h-5 w-5" />
      </button>

      {/* Show/Hide button */}
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="p-1 text-gray-400 hover:text-gray-600 ml-1"
        title={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <MdVisibility className="h-5 w-5" />
        ) : (
          <MdVisibilityOff className="h-5 w-5" />
        )}
      </button>

      {/* Generate button */}
      <button
        type="button"
        onClick={generatePassword}
        className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        title="Generate random password"
      >
        Generate
      </button>
    </div>
  </div>
</div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-100 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <MdSave className="mr-1" /> {isEditing ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
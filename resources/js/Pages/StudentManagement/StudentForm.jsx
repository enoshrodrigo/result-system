import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { MdSave, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';

const StudentForm = ({ student, isEditing, batches, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    NIC_PO: '',
    email: '',
    mobile_number: '',
  });
  
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
    }
  }, [isEditing, student]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
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
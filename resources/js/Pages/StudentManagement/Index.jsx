import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { 
  MdPeople, MdSchool, MdDateRange, MdAdd, MdDelete, 
  MdEdit, MdChevronLeft, MdChevronRight, MdRefresh, 
  MdSearch, MdFilterList, MdCheck, MdClose,
  MdMenuBook, MdClass
} from "react-icons/md";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import StudentForm from "./StudentForm";
  import { MdEmail, MdDownload } from "react-icons/md";
import { Dialog } from '@headlessui/react';
const Index = ({ auth, students, batches, departments, courses, subjects, statistics, filters, pagination }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [isLoading, setIsLoading] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState(filters.department || "");
  const [filterCourse, setFilterCourse] = useState(filters.course || "");
  const [filterBatch, setFilterBatch] = useState(filters.batch || "");
  const [filterSubject, setFilterSubject] = useState(filters.subject || "");
  const [sortField, setSortField] = useState(filters.sortField || "first_name");
  const [sortDirection, setSortDirection] = useState(filters.sortDirection || "asc");
  // Add these states near your other state declarations
const [isEmailSending, setIsEmailSending] = useState(false);
const [emailSendingForId, setEmailSendingForId] = useState(null);


// Add state for email dialog
const [emailModalOpen, setEmailModalOpen] = useState(false);
const [selectedStudentForEmail, setSelectedStudentForEmail] = useState(null);
const [emailSubject, setEmailSubject] = useState('');
const [emailBody, setEmailBody] = useState('');

// Add this function to handle CSV export
const handleExportCSV = () => {
  axios.get(route('students.export', {
    search: searchQuery,
    department: filterDepartment,
    course: filterCourse,
    batch: filterBatch,
    subject: filterSubject,
    sortField: sortField,
    sortDirection: sortDirection,
  }), {
    responseType: 'blob'
  })
  .then(response => {
    // Create a blob from the response
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `students-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  })
  .catch(error => {
    toast.error('Failed to export data');
    console.error('Export error:', error);
  });
};

// Add this function to handle email
const handleSendEmail = (student) => {
  if (isEmailSending) return; // Prevent multiple clicks
  
  // Check if student has an email
  if (!student.email) {
    toast.error('This student does not have an email address');
    return;
  }
  
  setSelectedStudentForEmail(student);
  setEmailSubject(`Information for ${student.first_name}${student.last_name? ' ' + student.last_name : ''}`);
  setEmailBody(`<p>Dear ${student.first_name},</p><p>This is regarding your courses at our institution.</p><p>Regards,<br>Administration</p>`);
  setEmailModalOpen(true);
};

// Add this function to submit the email
const submitEmail = () => {
  setIsEmailSending(true);
  setEmailSendingForId(selectedStudentForEmail.id);
  
  axios.post(route('students.email'), {
    student_id: selectedStudentForEmail.id,
    subject: emailSubject,
    body: emailBody
  })
  .then(response => {
    toast.success('Email sent successfully');
    setEmailModalOpen(false);
  })
  .catch(error => {
    toast.error('Failed to send email: ' + (error.response?.data?.message || 'Unknown error'));
  })
  .finally(() => {
    setIsEmailSending(false);
    setEmailSendingForId(null);
  });
};
  // Handle showing the add student form
  const handleShowForm = () => {
    setCurrentStudent(null);
    setIsEditing(false);
    setIsFormVisible(true);
  };
  
  // Handle showing the edit student form
  const handleEditStudent = (student) => {
    setCurrentStudent(student);
    setIsEditing(true);
    setIsFormVisible(true);
  };
  
  // Handle form close
  const handleCloseForm = () => {
    setIsFormVisible(false);
    setCurrentStudent(null);
  };
  
  // Handle delete student
  const handleDeleteStudent = (student) => {
    // Check if student is involved in any batch
    if (student.batches && student.batches.length > 0) {
      toast.error(`Cannot delete ${student.first_name} as they are enrolled in ${student.batches.length} batch(es)`);
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${student.first_name}?`)) {
      axios.delete(route('students.destroy', student.id))
        .then(response => {
          toast.success('Student deleted successfully');
          // Refresh the page to get updated data
          router.reload();
        })
        .catch(error => {
          console.error('Error deleting student:', error);
          toast.error('Failed to delete student. ' + (error.response?.data?.message || 'Please try again.'));
        });
    }
  };
  
  // Handle sorting
  const handleSort = (field, direction) => {
    router.get(route('students.index'), {
      search: searchQuery,
      department: filterDepartment,
      course: filterCourse,
      batch: filterBatch,
      subject: filterSubject,
      sortField: field,
      sortDirection: direction,
      page: 1 // Reset to first page when sorting changes
    }, {
      preserveState: true,
      replace: true
    });
  };
  
  // Handle search with all filters
  const handleSearch = (e) => {
    e.preventDefault();
    
    router.get(route('students.index'), { 
      search: searchQuery,
      department: filterDepartment,
      course: filterCourse,
      batch: filterBatch,
      subject: filterSubject,
      sortField: sortField,
      sortDirection: sortDirection,
      page: 1 // Reset to first page when searching
    }, {
      preserveState: true,
      replace: true
    });
  };
  
  // Handle page change with all filters
  const handlePageChange = (page) => {
    router.get(route('students.index'), {
      search: searchQuery,
      department: filterDepartment,
      course: filterCourse,
      batch: filterBatch,
      subject: filterSubject,
      sortField: sortField,
      sortDirection: sortDirection,
      page
    }, {
      preserveState: true,
      replace: true
    });
  };
  
  // Reset dependent filters when parent filter changes
  useEffect(() => {
    if (filterDepartment === '') {
      setFilterCourse('');
      setFilterBatch('');
      setFilterSubject('');
    }
  }, [filterDepartment]);
  
  useEffect(() => {
    if (filterCourse === '') {
      setFilterBatch('');
      setFilterSubject('');
    }
  }, [filterCourse]);
  
  useEffect(() => {
    if (filterBatch === '') {
      setFilterSubject('');
    }
  }, [filterBatch]);
  
  return (
    <AuthenticatedLayout
      auth={auth}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Student Management
        </h2>
      }
    >
      <Head title="Student Management" />
      <Toaster position="top-right" />
      
      <div className="py-12">
    
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
            {/* Header / Summary */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Student Management System
              </h3>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
                <div className="flex items-center justify-center mb-2">
                  <MdPeople className="text-3xl mr-2" />
                  <p className="text-2xl font-bold">{statistics.totalStudents}</p>
                </div>
                <p className="text-sm font-medium">Total Students</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
                <div className="flex items-center justify-center mb-2">
                  <MdSchool className="text-3xl mr-2" />
                  <p className="text-2xl font-bold">{statistics.totalBatches}</p>
                </div>
                <p className="text-sm font-medium">Active Batches</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
                <div className="flex items-center justify-center mb-2">
                  <MdDateRange className="text-3xl mr-2" />
                  <p className="text-2xl font-bold">{statistics.recentlyAdded}</p>
                </div>
                <p className="text-sm font-medium">Added This Month</p>
              </div>
              
              <div className="bg-gradient-to-br from-violet-400 to-purple-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
                <div className="flex items-center justify-center mb-2">
                  <MdPeople className="text-3xl mr-2" />
                  <p className="text-2xl font-bold">{statistics.withEmail}</p>
                </div>
                <p className="text-sm font-medium">With Email Address</p>
              </div>
            </div>
            
            {/* Search, Filters and Action Buttons */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search input */}
                <div className="lg:col-span-1">
                <label className="block text-xs font-medium text-gray-700  dark:text-gray-100 mb-1">Search</label>
                  <div className="flex items-center ">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by Name, NIC or Email"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    />
                    <button
                      type="submit"
                      className="ml-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      title="Search"
                    >
                      <MdSearch className="w-5 h-5" />
                    </button>
                    {searchQuery && (
                      <button 
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          router.get(route('students.index'));
                        }}
                        className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                        title="Clear search"
                      >
                        <MdRefresh className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Department filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700  dark:text-gray-100 mb-1">Department</label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => {
                      setFilterDepartment(e.target.value);
                      setFilterCourse('');
                      setFilterBatch('');
                      setFilterSubject('');
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  >
                    <option value="">All Departments</option>
                    {departments && departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.department_name} ({dept.department_code})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Course filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700  dark:text-gray-100 mb-1">Course</label>
                  <select
                    value={filterCourse}
                    onChange={(e) => {
                      setFilterCourse(e.target.value);
                      setFilterBatch('');
                      setFilterSubject('');
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  >
                    <option value="">All Courses</option>
                    {courses && courses.map(course => (
                      <option 
                        key={course.id} 
                        value={course.id}
                        disabled={filterDepartment && course.department_id != filterDepartment}
                      >
                        {course.course_name} ({course.department_code_course})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Batch filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-100 mb-1">Batch</label>
                  <select
                    value={filterBatch}
                    onChange={(e) => {
                      setFilterBatch(e.target.value);
                      setFilterSubject('');
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  >
                    <option value="">All Batches</option>
                    {batches && batches.map(batch => (
                      <option 
                        key={batch.id} 
                        value={batch.id}
                        disabled={filterCourse && batch.department_course_id != filterCourse}
                      >
                        {batch.batch_code} - {batch.batch_name} ({batch.batch_year})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Subject filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700  dark:text-gray-100 mb-1">Subject</label>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  >
                    <option value="">All Subjects</option>
                    {subjects && subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.subject_code} - {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Apply filters button */}
                <div className="lg:col-span-5 flex justify-between items-center mt-2">
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md shadow transition duration-200"
                    >
                      <MdFilterList className="mr-1" /> Apply Filters
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setFilterDepartment('');
                        setFilterCourse('');
                        setFilterBatch('');
                        setFilterSubject('');
                        setSortField('first_name');
                        setSortDirection('asc');
                        router.get(route('students.index'));
                      }}
                      className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-md shadow transition duration-200"
                    >
                      <MdRefresh className="mr-1" /> Reset
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleShowForm}
                    className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-md shadow transition duration-200"
                  >
                    <MdAdd className="mr-1" /> Add Student
                  </button>
                </div>
              </form>
            </div>
            
            {/* Sorting Options */}
            <div className="mb-4 flex justify-between items-center">
  <div className="flex items-center">
    <span className="mr-2 text-gray-700 dark:text-gray-300">Sort by:</span>
    <select
      value={sortField}
      onChange={(e) => {
        setSortField(e.target.value);
        handleSort(e.target.value, sortDirection);
      }}
      className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 mr-2 rounded-md p-1"
    >
      <option value="first_name">First Name</option>
      <option value="last_name">Last Name</option>
      <option value="NIC_PO">NIC</option>
      <option value="email">Email</option>
      <option value="created_at">Date Added</option>
    </select>
    
    <button
      type="button"
      onClick={() => {
        const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        setSortDirection(newDirection);
        handleSort(sortField, newDirection);
      }}
      className="p-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md"
      title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
    >
      {sortDirection === 'asc' ? 
        <span className="text-lg">↑</span> : 
        <span className="text-lg">↓</span>}
    </button>
  </div>
  
  {/* Export CSV Button */}
  <button
    onClick={handleExportCSV}
    className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md shadow transition duration-200"
  >
    <MdDownload className="mr-1" /> Export CSV
  </button>
</div>
            
            {/* Student Form */}
            {isFormVisible && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                <StudentForm
                  student={currentStudent}
                  isEditing={isEditing}
                  batches={batches}
                  onClose={handleCloseForm}
                />
              </div>
            )}
            
            {/* Student List */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">NIC</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Batches</th>
                    <th scope="col" className="px-6 py-3">Subjects</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.data.map((student) => (
                    <tr 
                      key={student.id} 
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="px-6 py-4">{student.NIC_PO}</td>
                      <td className="px-6 py-4">{student.email || "N/A"}</td>
                      <td className="px-6 py-4">
                        {student.batches && student.batches.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {student.batches.map((batch, index) => (
                              <span 
                                key={index}
                                title={`${batch.batch_name} - ${batch.course_name} (${batch.batch_year})`}
                                className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:underline cursor-pointer"
                                // Add onClick to open batch results in a new tab
                              onClick={()=> {
                                const batchCode = batch.batch_code;
                                const url = route('viewAllBatchResult', { batch:batchCode });
                                window.open(url, '_blank');
                                  toast.success(`Viewing results for ${batch.batch_code}`);

                              }
                              }
                              >
                                {batch.batch_code}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">No batches</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {student.subjects && student.subjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {student.subjects.map((subject, index) => (
                              <span 
                                key={index}
                                title={subject.subject_name}
                                className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              >
                                {subject.subject_code}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">No subjects</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
  <div className="flex space-x-2">
  <button
  onClick={() => handleSendEmail(student)}
  disabled={isEmailSending && emailSendingForId === student.id}
  className={`font-medium hover:underline ${
    !student.email 
      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
      : isEmailSending && emailSendingForId === student.id
        ? 'text-yellow-500 dark:text-yellow-400 animate-pulse'
        : 'text-green-600 dark:text-green-500'
  }`}
  title={!student.email ? "No email address available" : "Send email"}
>
  {isEmailSending && emailSendingForId === student.id ? (
    <div className="animate-spin">
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  ) : (
    <MdEmail size={20} />
  )}
</button>
    <button
      onClick={() => handleEditStudent(student)}
      className="font-medium text-blue-600 hover:underline dark:text-blue-500"
      title="Edit student"
    >
      <MdEdit size={20} />
    </button>
    <button
      onClick={() => handleDeleteStudent(student)}
      className={`font-medium text-red-600 hover:underline dark:text-red-500 ${
        student.batches && student.batches.length > 0 ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={student.batches && student.batches.length > 0}
      title={student.batches && student.batches.length > 0 ? "Cannot delete student enrolled in batches" : "Delete student"}
    >
      <MdDelete size={20} />
    </button>
  </div>
</td>
                    </tr>
                  ))}
                  
                  {students.data.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">No students found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className={`px-3 py-1 rounded-md ${
                      pagination.current_page === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <MdChevronLeft size={20} />
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(pagination.last_page)].map((_, index) => {
                    const page = index + 1;
                    // Only show current page, first, last, and 1 page before/after current
                    if (
                      page === 1 ||
                      page === pagination.last_page ||
                      (page >= pagination.current_page - 1 && page <= pagination.current_page + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md ${
                            pagination.current_page === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      (page === 2 && pagination.current_page > 3) ||
                      (page === pagination.last_page - 1 && pagination.current_page < pagination.last_page - 2)
                    ) {
                      // Show ellipsis
                      return <span key={page}>...</span>;
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className={`px-3 py-1 rounded-md ${
                      pagination.current_page === pagination.last_page
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <MdChevronRight size={20} />
                  </button>
                </nav>
              </div>
            )}
            
            {/* Pagination Info */}
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Showing {students.from} to {students.to} of {students.total} students
            </div>
          </div>
        </div>
        {/* Email Modal */}
        {emailModalOpen && (
  <Dialog 
    open={emailModalOpen} 
    onClose={() => setEmailModalOpen(false)}
    className="fixed inset-0 z-50 overflow-y-auto"
  >
    <div className="flex items-center justify-center min-h-screen p-4">
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
      
      {/* Increased max-width from max-w-md to max-w-2xl for more space */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-auto p-6 shadow-xl">
        <Dialog.Title className="text-xl font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          Send Email to {selectedStudentForEmail?.first_name} {selectedStudentForEmail?.last_name}
        </Dialog.Title>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject
          </label>
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600  dark:text-gray-700 rounded-md"
          />
        </div>
        
        <div className="mb-16"> {/* Increased margin-bottom to account for editor toolbar */}
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message
          </label>
          <div className="h-64"> {/* Set a fixed height for the editor container */}
            <ReactQuill
              theme="snow"
              value={emailBody}
              onChange={setEmailBody}
              className="h-full bg-white rounded-md  "
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'header': [1, 2, 3, false] }],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  [{ 'color': [] }, { 'background': [] }],
                  ['link', 'image'],
                  ['clean']
                ],
              }}
            />
          </div>
          {/* Add utility classes for dark mode styles */}
          <style jsx global>{`
            /* These minimal styles are necessary for ReactQuill */
            .dark .ql-toolbar.ql-snow {
              border-color: #4B5563;
              background-color: #374151;
            }
            .dark .ql-container.ql-snow {
              border-color: #4B5563;
            }
            .dark .ql-editor {
              color: #F3F4F6;
              background-color: #1F2937;
            }
            .dark .ql-snow .ql-stroke {
              stroke: #E5E7EB;
            }
            .dark .ql-snow .ql-fill {
              fill: #E5E7EB;
            }
            .dark .ql-toolbar.ql-snow .ql-picker {
              color: #E5E7EB;
            }
          `}</style>
        </div>
        
        <div className="flex justify-end space-x-3 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
  type="button"
  onClick={() => setEmailModalOpen(false)}
  disabled={isEmailSending}
  className={`bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-md transition duration-150 ${
    isEmailSending ? 'opacity-50 cursor-not-allowed' : ''
  }`}
>
  Cancel
</button>
          <button
  type="button"
  onClick={submitEmail}
  disabled={isEmailSending}
  className={`flex items-center justify-center px-5 py-2 rounded-md transition duration-150 ${
    isEmailSending
      ? 'bg-blue-400 cursor-wait'
      : 'bg-blue-600 hover:bg-blue-700'
  } text-white`}
>
  {isEmailSending ? (
    <>
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Sending...
    </>
  ) : (
    'Send Email'
  )}
</button>
        </div>
      </div>
    </div>
  </Dialog>
)}
      </div>
    </AuthenticatedLayout>
  );
};

export default Index;
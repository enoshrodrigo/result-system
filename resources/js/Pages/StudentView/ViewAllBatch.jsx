import React, { useState, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { 
  MdPeople, 
  MdSchool, 
  MdDateRange, 
  MdOnlinePrediction, 
  MdOfflineBolt,
  MdDelete,
  MdAdd
} from "react-icons/md";
import axios from "axios";
/* Import toast */
import toast, { Toaster } from "react-hot-toast";

export default function ViewAllBatch(props) {
  // Helper function to get color based on grade
  function getGradeColor(grade) {
    switch (grade) {
      case "A+":
      case "A":
        return "#10B981";
      case "A-":
      case "B+":
      case "B":
        return "#3B82F6";
      case "B-":
      case "C+":
      case "C":
        return "#8B5CF6";
      case "C-":
      case "D":
        return "#F59E0B";
      case "F":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  }

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  // State for inline grade editing (keyed by student NIC + subject code)
  const [editingGrades, setEditingGrades] = useState({});
  // State to control showing the add student form
  const [isAdding, setIsAdding] = useState(false);
  // Separate states for the new student's name and NIC.
  const [studentName, setStudentName] = useState("");
  const [studentNIC, setStudentNIC] = useState("");
  const [studentStatus, setStatus] = useState(""); 
const [editingStatus, setEditingStatus] = useState({});
  const [batchData, setBatchData] = useState(props.allBatch || []);
  // State for the new student's subject grades.
  const [studentSubjects, setStudentSubjects] = useState(
    (props.batchSubjects || []).map((subject) => ({
      subject_name: subject.subject_name,
      subject_code: subject.subject_code,
      grade: ""
    }))
  );

  const [isUpdating, setIsUpdating] = useState(false);
  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    return batchData
      ? batchData.filter(student => 
          student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.NIC.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];
  }, [batchData, searchQuery]);

 

  // When "Add Student" is clicked, show the inline form and initialize subject list
  const handleShowAddForm = () => {
    setStudentName("");
    setStudentNIC("");
    setStudentSubjects(
      (props.batchSubjects || []).map((subject) => ({
        subject_name: subject.subject_name,
        subject_code: subject.subject_code,
        grade: ""
      }))
    );
    setIsAdding(true);
  };

// Update the addStudent function to call the backend API
const addStudent = (newData) => {
  // Show loading toast
  const loadingToast = toast.loading('Adding new student...');
  
  // Post data to the backend
  axios.post(route('addStudentBatch'), newData)
    .then((response) => {
      if (response.data.success) {
        // Create a new student object to match the structure expected by the UI
        const newStudent = {
          first_name: newData.first_name,
          NIC: newData.NIC,
          status: newData.status,
          subjects: newData.subjects
        };
        
        // Update the local state by adding the new student
        setBatchData(current => [...current, newStudent]);
        
        // Dismiss loading toast and show success message
        toast.dismiss(loadingToast);
        toast.success(response.data.message || 'Student added successfully');
      } else {
        // Show error if the backend returned success: false
        toast.dismiss(loadingToast);
        toast.error(response.data.message || 'Failed to add student');
      }
    })
    .catch((error) => {
      console.error('Error adding student:', error);
      toast.dismiss(loadingToast);
      
      // Display the error message from the backend or a default message
      const errorMessage = error.response?.data?.message || 'Error adding student. Please try again.';
      toast.error(errorMessage);
    });
};

// Handle the inline form submission
const handleAddStudentSubmit = (e) => {
  e.preventDefault();
  
  // Validate the form (this is a basic validation, you might want to add more)
  if (!studentName.trim()) {
    toast.error('Student name is required');
    return;
  }
  
  if (!studentNIC.trim()) {
    toast.error('NIC is required');
    return;
  }
  
  // Check if all subjects have grades
  const hasEmptyGrades = studentSubjects.some(subject => !subject.grade.trim());
  if (hasEmptyGrades) {
    toast.error('All subjects must have grades');
    return;
  }
  
  // Call addStudent with the form data
  addStudent({
    first_name: studentName,
    NIC: studentNIC,
    status: studentStatus,
    subjects: studentSubjects,
    batch_code: props.batch_code
  });
  
  // Close the form
  setIsAdding(false);
};

// Handle inline grade update (for editing existing student cards)
const updateGrade = (student, subject, newGrade) => {
  // Show loading indicator or disable inputs if needed
  setIsUpdating(true); // You'll need to add this state

  // Prepare the data for the API request
  const updateData = {
    grade: newGrade,
    student_id: student.NIC, // The backend expects NIC_PO
    subject_code: subject.subject_code,
    batch_code: props.batch_code // From props
  };
  
  axios.post(route('updateGrade'), updateData)
    .then((response) => {
      if (response.data.grade === true) {
        // Success! Update the local state to reflect the change
        batchData.forEach(s => {
          if (s.NIC === student.NIC) {
            s.subjects.forEach(sub => {
              if (sub.subject_code === subject.subject_code) {
                sub.grade = newGrade;
              }
            });
          }
        });
        
        // Show success notification
        toast.success(`Grade updated successfully for ${student.first_name}`);
      } else {
        // Backend returned false
        toast.error("Failed to update grade. Please try again.");
      }
    })
    .catch((error) => {
      console.error("Error updating grade:", error);
      toast.error("Error updating grade. Please try again.");
    })
    .finally(() => {
      setIsUpdating(false); // Clear loading state
    });
};

  // When an inline grade input loses focus, update the grade if changed.
  const handleGradeBlur = (student, subject, key, e) => {
    const newGrade = e.target.value;
    setEditingGrades((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
    if (newGrade !== subject.grade) {
      updateGrade(student, subject, newGrade);
    }
  };

  // On double-click, enable inline editing for a grade.
  const handleGradeEdit = (student, subject) => {
    const key = `${student.NIC}-${subject.subject_code}`;
    setEditingGrades((prev) => ({ ...prev, [key]: subject.grade }));
  };

  // Placeholder for deleting a student
// Handle student deletion
const handleDeleteStudent = (student) => {
  if (
    window.confirm(`Are you sure you want to delete ${student.first_name}?`) &&
    window.confirm("This action cannot be undone. Confirm delete?")
  ) {
    // To delete an entire student, we need to delete all their results
    const deletePromises = student.subjects.map(subject => {
      // Prepare data for each subject deletion
      const deleteData = {
        student_id: student.NIC,
        subject_code: subject.subject_code,
        batch_code: props.batch_code
      };
       
      // Return the promise from each axios call
      return axios.post(route('deleteResult'), deleteData);
    });
    
    // Show loading state
    toast.loading('Deleting student records...');
    
    // Use Promise.all to wait for all deletion operations to complete
    Promise.all(deletePromises)
      .then(responses => {
       
        // Check if all deletions were successful
        const allSuccessful = responses.every(res => res.data.delete === true);
        
        if (allSuccessful) {
          // Update the state with the filtered data
          setBatchData(current => current.filter(s => s.NIC !== student.NIC));
          
          toast.dismiss(); // Remove loading toast
          toast.success(`${student.first_name}'s records deleted successfully`);
        } else {
          toast.dismiss();
          toast.error('Some records could not be deleted. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error deleting student:', error);
        toast.dismiss();
        toast.error('Error deleting student records. Please try again.');
      });
  }
};


// On double-click, enable inline editing for status
const handleStatusEdit = (student) => {
  const key = student.NIC;
  setEditingStatus((prev) => ({ ...prev, [key]: student.status }));
};

// When an inline status input loses focus, update if changed
const handleStatusBlur = (student, key, e) => {
  const newStatus = e.target.value;
  setEditingStatus((prev) => {
    const newState = { ...prev };
    delete newState[key];
    return newState;
  });
  
  if (newStatus !== student.status) {
    updateStatus(student, newStatus);
  }
};

// Function to update student status
const updateStatus = (student, newStatus) => {
  // Show loading indicator
  setIsUpdating(true);

  // Prepare the data for the API request
  const updateData = {
    status: newStatus,
    student_id: student.NIC,
    batch_code: props.batch_code
  };
  
  axios.post(route('updateStatus'), updateData)
    .then((response) => {
      if (response.data.success) {
        // Update the local state to reflect the change
        setBatchData(current => 
          current.map(s => 
            s.NIC === student.NIC 
              ? {...s, status: newStatus} 
              : s
          )
        );
        
        // Show success notification
        toast.success(`Status updated successfully for ${student.first_name}`);
      } else {
        // Backend returned false
        toast.error("Failed to update status. Please try again.");
      }
    })
    .catch((error) => {
      console.error("Error updating status:", error);
      toast.error("Error updating status. Please try again.");
    })
    .finally(() => {
      setIsUpdating(false);
    });
};

  return (
    <AuthenticatedLayout
      auth={props.auth}
      errors={props.errors}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Result Management System
        </h2>
      }
    >
      <Head title="Dashboard" />

      <div className="py-12">
      <Toaster />
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
            {/* Header / Summary */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome to BCI Result Management System
              </h3>
            </div>
            <div className="text-gray-900 dark:text-gray-100 mb-6">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4  justify-center">
                <div className="md:col-span-3 bg-yellow-500 text-white p-6 rounded-lg shadow-md flex flex-col items-center">
                  <div className="flex items-center justify-center mb-2">
                    <MdPeople className="text-3xl mr-2" />
                    <p className="text-2xl font-bold">{props.batch_name}</p>
                  </div>
                  <p className="text-sm font-medium">Examination Batch</p>
                </div>
                {/* total students */}
                <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md flex flex-col items-center">
                  <div className="flex items-center justify-center mb-2">
                    <MdPeople className="text-3xl mr-2" />
                    <p className="text-2xl font-bold">{props.total_students}</p>
                  </div>
                  <p className="text-sm font-medium">Total Students</p>
                </div>
                <div className="bg-green-500 text-white p-6 rounded-lg shadow-md flex flex-col items-center">
                  <div className="flex items-center justify-center mb-2">
                    <MdSchool className="text-3xl mr-2" />
                    <p className="text-2xl font-bold">{props.batch_code}</p>
                  </div>
                  <p className="text-sm font-medium">Batch Code</p>
                </div>
                {/* releaded date */}
                 
                <div className="bg-indigo-500 text-white p-6 rounded-lg shadow-md flex flex-col items-center">
  <div className="flex items-center justify-center mb-2">
    <MdDateRange className="text-3xl mr-2" />
    {props.released_date ? (
      <div className="text-center">
        <p className="text-xl font-bold">
          {new Date(props.released_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}  
            {
          <span className=" text-sm"> {' '}
          {new Date(props.released_date).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
          })}
        </span>
    }
        </p>
    
      </div>
    ) : (
      <p className="text-2xl font-bold">Not Released</p>
    )}
  </div>
  <p className="text-sm font-medium">Created Date

  </p>
</div>
                
                <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md flex flex-col items-center">
                  <div className="flex items-center justify-center mb-2">
                    <MdDateRange className="text-3xl mr-2" />
                    <p className="text-2xl font-bold">{props.batch_year}</p>
                  </div>
                  <p className="text-sm font-medium">Academic Year</p>
                </div>
                <div className="bg-purple-500 text-white p-6 rounded-lg shadow-md flex flex-col items-center">
                  <div className="flex items-center justify-center mb-2">
                    {props.status ? (
                      <MdOnlinePrediction className="text-3xl mr-2" />
                    ) : (
                      <MdOfflineBolt className="text-3xl mr-2" />
                    )}
                    <p className="text-2xl font-bold">
                      {props.status ? (
                        <span className="text-green-300">Online</span>
                      ) : (
                        <span className="text-red-300">Offline</span>
                      )}
                    </p>
                  </div>
                  <p className="text-sm font-medium">Result Status</p>
                </div>
              </div>
            </div>

            {/* Search and Add Student */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name or NIC"
                className="w-full sm:w-1/2 p-2 mb-4 sm:mb-0 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
              <button
                onClick={handleShowAddForm}
                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow"
              >
                <MdAdd className="mr-1" /> Add Student
              </button>
            </div>

            {/* Inline Add Student Form */}
            {isAdding && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Add New Student
                </h3>
                <form onSubmit={handleAddStudentSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-1">
                      Student Name
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-1">
                      NIC
                    </label>
                    <input
                      type="text"
                      value={studentNIC}
                      onChange={(e) => setStudentNIC(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <input
                      type="text"
                      value={studentStatus}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                      Subjects & Grades
                    </h4>
                    {studentSubjects && studentSubjects.length > 0 ? (
                      studentSubjects.map((subject, idx) => (
                        <div key={idx} className="mb-2">
                          <label className="block text-gray-700 dark:text-gray-300">
                            {subject.subject_name} ({subject.subject_code})
                          </label>
                          <input
                            type="text"
                            value={subject.grade}
                            onChange={(e) => {
                              const updatedSubjects = [...studentSubjects];
                              updatedSubjects[idx].grade = e.target.value;
                              setStudentSubjects(updatedSubjects);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                            required
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No subjects available.</p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="mr-4 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                    >
                      Add Student
                    </button>
                  </div>
                </form>
              </div>
            )}

        {/* Student Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredStudents.map((data, index) => (
    <div 
      key={index} 
      className="relative bg-white dark:bg-gray-800 border-t-4 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 max-w-sm mx-auto flex flex-col"
      style={{ 
        borderTopColor: ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"][index % 4] 
      }}
    >
      <button
        onClick={() => handleDeleteStudent(data)}
        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
        title="Delete Student"
      >
        <MdDelete size={20} />
      </button>
      <div className="p-4 flex-grow flex flex-col">
        {/* Student Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-1"
          title={data.first_name}>
            {data.first_name}
          </h3>
        
        </div>
        {/* Fix size for Nic */}
        <div className="mb-4 text-gray-500 dark:text-gray-400 text-sm min-h-[60px] flex items-center">
          <div className="w-full">
            <div className="line-clamp-1">NIC : {data.NIC}</div>
          </div>
        </div>
    {/* Status Badge - Fixed Height */}
<div className="mb-4 min-h-[60px] flex items-center">
  {editingStatus[data.NIC] !== undefined ? (
    <input
      type="text"
      value={editingStatus[data.NIC]}
      onChange={(e) =>
        setEditingStatus((prev) => ({
          ...prev,
          [data.NIC]: e.target.value,
        }))
      }
      onBlur={(e) => handleStatusBlur(data, data.NIC, e)}
      className="w-full p-2 border border-gray-300 rounded text-center"
      autoFocus
    />
  ) : (
    <div 
      className={`
        w-full py-2 px-3 rounded text-white text-sm font-medium cursor-pointer
        ${data.status?.toLowerCase().includes('pass') ? 'bg-green-500' : 
          data.status?.toLowerCase().includes('fail') ? 'bg-red-500' : 
          data.status?.toLowerCase().includes('pend') ? 'bg-yellow-500' : 'bg-blue-500'}
      `}
      onDoubleClick={() => handleStatusEdit(data)}
      title="Double click to edit status"
    >
      <div className="font-semibold mb-1">Status:</div>
      <div className="line-clamp-2" title={data.status}>{data.status || 'No Status'}</div>
    </div>
  )}
</div>
        
        {/* Subjects List */}
        <div className="space-y-2">
          {data.subjects &&
            data.subjects.map((subData, subIndex) => {
              const editKey = `${data.NIC}-${subData.subject_code}`;
              return (
                <div 
                  key={subIndex} 
                  className="p-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {subData.subject_name}
                      </span> 
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                        ({subData.subject_code})
                      </span>
                    </div>
                    {editingGrades[editKey] !== undefined ? (
                      <input
                        type="text"
                        value={editingGrades[editKey]}
                        onChange={(e) =>
                          setEditingGrades((prev) => ({
                            ...prev,
                            [editKey]: e.target.value,
                          }))
                        }
                        onBlur={(e) => handleGradeBlur(data, subData, editKey, e)}
                        className="w-16 p-1 border border-gray-300 rounded text-center"
                      />
                    ) : (
                      <span 
                        className="font-bold px-2 py-1 rounded text-white cursor-pointer"
                        style={{ backgroundColor: getGradeColor(subData.grade) }}
                        onDoubleClick={() => handleGradeEdit(data, subData)}
                        title="Double click to edit grade"
                      >
                        {subData.grade}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  ))}
  {filteredStudents.length === 0 && (
    <p className="text-center col-span-full text-gray-500">
      No records found.
    </p>
  )}
</div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

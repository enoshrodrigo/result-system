import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { 
  MdPeople, MdSchool, MdDateRange, MdAdd, MdDelete, 
  MdEdit, MdChevronLeft, MdChevronRight, MdRefresh, 
  MdSearch, MdFilterList, MdCheck, MdClose, MdDashboard, 
  MdMenuBook, MdClass, MdOutlineStackedBarChart
} from "react-icons/md";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Dialog } from '@headlessui/react';

const Index = ({ auth, departments, courses, departmentsList, statistics, filters }) => {
  const [activeTab, setActiveTab] = useState(filters.type || 'departments');
  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [isLoading, setIsLoading] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState(filters.department || "");
  const [sortField, setSortField] = useState(filters.sortField || "created_at");
  const [sortDirection, setSortDirection] = useState(filters.sortDirection || "desc");
  
  // Department form state
  const [isDepartmentFormVisible, setIsDepartmentFormVisible] = useState(false);
  const [isEditingDepartment, setIsEditingDepartment] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [departmentFormData, setDepartmentFormData] = useState({
    department_name: "",
    department_code: ""
  });
  
  // Course form state
  const [isCourseFormVisible, setIsCourseFormVisible] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [courseFormData, setCourseFormData] = useState({
    course_name: "",
    course_code: "",
    department_code_course: ""
  });
  
  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilterDepartment("");
    setSortField("created_at");
    setSortDirection("desc");
    router.get(route('departments.index'), { type: tab }, { preserveState: true });
  };

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('departments.index'), {
      search: searchQuery,
      type: activeTab,
      department: filterDepartment,
      sortField: sortField,
      sortDirection: sortDirection
    }, {
      preserveState: true
    });
  };
  
  // Department filter handler
  const handleDepartmentFilter = (departmentId) => {
    setFilterDepartment(departmentId);
    router.get(route('departments.index'), {
      search: searchQuery,
      type: activeTab,
      department: departmentId,
      sortField: sortField,
      sortDirection: sortDirection
    }, {
      preserveState: true
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterDepartment("");
    router.get(route('departments.index'), {
      type: activeTab
    });
  };

  // Sort handler
  const handleSort = (field) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    router.get(route('departments.index'), {
      search: searchQuery,
      type: activeTab,
      department: filterDepartment,
      sortField: field,
      sortDirection: newDirection
    }, {
      preserveState: true
    });
  };

  // Department form handlers
  const handleShowDepartmentForm = (department = null) => {
    if (department) {
      setIsEditingDepartment(true);
      setCurrentDepartment(department);
      setDepartmentFormData({
        department_name: department.department_name,
        department_code: department.department_code
      });
    } else {
      setIsEditingDepartment(false);
      setCurrentDepartment(null);
      setDepartmentFormData({
        department_name: "",
        department_code: ""
      });
    }
    setIsDepartmentFormVisible(true);
  };

  const handleDepartmentFormSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (isEditingDepartment) {
      router.put(route('departments.update', currentDepartment.id), departmentFormData, {
        onSuccess: () => {
          setIsDepartmentFormVisible(false);
          setIsLoading(false);
          toast.success('Department updated successfully');
        },
        onError: (errors) => {
          setIsLoading(false);
          Object.keys(errors).forEach(key => {
            toast.error(errors[key]);
          });
        }
      });
    } else {
      router.post(route('departments.store'), departmentFormData, {
        onSuccess: () => {
          setIsDepartmentFormVisible(false);
          setIsLoading(false);
          toast.success('Department created successfully');
        },
        onError: (errors) => {
          setIsLoading(false);
          Object.keys(errors).forEach(key => {
            toast.error(errors[key]);
          });
        }
      });
    }
  };

  // Course form handlers
  const handleShowCourseForm = (course = null) => {
    if (course) {
      setIsEditingCourse(true);
      setCurrentCourse(course);
      setCourseFormData({
        course_name: course.course_name,
        course_code: course.course_code,
        department_code_course: course.department_code_course
      });
    } else {
      setIsEditingCourse(false);
      setCurrentCourse(null);
      setCourseFormData({
        course_name: "",
        course_code: "",
        department_code_course: filterDepartment || ""
      });
    }
    setIsCourseFormVisible(true);
  };

  const handleCourseFormSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (isEditingCourse) {
      router.put(route('courses.update', currentCourse.id), courseFormData, {
        onSuccess: () => {
          setIsCourseFormVisible(false);
          setIsLoading(false);
          toast.success('Course updated successfully');
        },
        onError: (errors) => {
          setIsLoading(false);
          Object.keys(errors).forEach(key => {
            toast.error(errors[key]);
          });
        }
      });
    } else {
      router.post(route('courses.store'), courseFormData, {
        onSuccess: () => {
          setIsCourseFormVisible(false);
          setIsLoading(false);
          toast.success('Course created successfully');
        },
        onError: (errors) => {
          setIsLoading(false);
          Object.keys(errors).forEach(key => {
            toast.error(errors[key]);
          });
        }
      });
    }
  };

  // Delete handlers
  const handleShowDeleteDialog = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    setIsLoading(true);
    if (deleteType === 'department') {
      router.delete(route('departments.destroy', itemToDelete.id), {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setIsLoading(false);
          toast.success('Department deleted successfully');
        },
        onError: (error) => {
          setIsDeleteDialogOpen(false);
          setIsLoading(false);
          toast.error(error.message || 'Failed to delete department');
        }
      });
    } else if (deleteType === 'course') {
      router.delete(route('courses.destroy', itemToDelete.id), {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setIsLoading(false);
          toast.success('Course deleted successfully');
        },
        onError: (error) => {
          setIsDeleteDialogOpen(false);
          setIsLoading(false);
          toast.error(error.message || 'Failed to delete course');
        }
      });
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    router.get(route('departments.index', {
      page: page,
      search: searchQuery,
      type: activeTab,
      department: filterDepartment,
      sortField: sortField,
      sortDirection: sortDirection
    }));
  };

  return (
    <AuthenticatedLayout
      auth={auth}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Department Management
        </h2>
      }
    >
      <Head title="Department Management" />
      <Toaster position="top-right" />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
            {/* Header / Summary */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Department & Course Management
              </h3>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => handleTabChange('departments')}
                className={`py-2 px-4 font-medium text-sm rounded-t-lg ${
                  activeTab === 'departments'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center">
                  <MdSchool className="mr-1" size={20} />
                  Departments
                </div>
              </button>
              <button
                onClick={() => handleTabChange('courses')}
                className={`py-2 px-4 font-medium text-sm rounded-t-lg ml-2 ${
                  activeTab === 'courses'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center">
                  <MdMenuBook className="mr-1" size={20} />
                  Courses
                </div>
              </button>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
                <div className="flex items-center justify-center mb-2">
                  <MdSchool className="text-3xl mr-2" />
                  <p className="text-2xl font-bold">{statistics.totalDepartments}</p>
                </div>
                <p className="text-sm font-medium">Total Departments</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
                <div className="flex items-center justify-center mb-2">
                  <MdMenuBook className="text-3xl mr-2" />
                  <p className="text-2xl font-bold">{statistics.totalCourses}</p>
                </div>
                <p className="text-sm font-medium">Total Courses</p>
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
                  <p className="text-2xl font-bold">{statistics.totalStudents}</p>
                </div>
                <p className="text-sm font-medium">Total Students</p>
              </div>
            </div>
            
           {/* Search and filters */}
<div className="mb-6">
  <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-100 mb-1">Search</label>
      <div className="flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search by ${activeTab === 'departments' ? 'Department' : 'Course'} Name or Code`}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring focus:border-blue-300"
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
              router.get(route('departments.index'), {
                type: activeTab,
                department: filterDepartment,
                sortField,
                sortDirection
              });
            }}
            className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Clear search"
          >
            <MdRefresh className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
    
    {activeTab === 'courses' && (
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-100 mb-1">Department</label>
        <select
          value={filterDepartment}
          onChange={(e) => handleDepartmentFilter(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="">All Departments</option>
          {departmentsList && departmentsList.map(dept => (
            <option key={dept.id} value={dept.id}>
              {dept.department_name} ({dept.department_code})
            </option>
          ))}
        </select>
      </div>
    )}
    
    {/* Replace the current button group with this improved version */}
    <div className={`flex flex-col ${activeTab === 'courses' ? 'md:flex-row' : 'md:flex-row md:justify-end'} gap-2 md:items-end`}>
      <button
        type="submit"
        className=" h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow transition duration-200"
      >
        <MdFilterList className="mr-2" /> 
        <span>Apply Filters</span>
      </button>
      
      <button
        type="button"
        onClick={handleResetFilters}
        className="h-12 flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-md shadow transition duration-200"
      >
        <MdRefresh className="mr-2" /> 
        <span>Reset</span>
      </button>
      
      <button
        type="button"
        onClick={() => activeTab === 'departments' ? handleShowDepartmentForm() : handleShowCourseForm()}
        className="h-12 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-md shadow transition duration-200"
      >
        <MdAdd className="mr-2" /> 
        <span>Add {activeTab === 'departments' ? 'Department' : 'Course'}</span>
      </button>
    </div>
  </form>
</div>
            
            {/* Sorting */}
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2 text-gray-700 dark:text-gray-300">Sort by:</span>
                <select
                  value={sortField}
                  onChange={(e) => handleSort(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 mr-2 rounded-md p-1"
                >
            {activeTab === 'departments' ? (
  <>
    <option value="department_name">Department Name</option>
    <option value="department_code">Department Code</option>
    <option value="created_at">Date Added</option>
  </>
) : (
  <>
    <option value="course_name">Course Name</option>
    <option value="course_code">Course Code</option>
    <option value="department_name">Department Name</option>
    <option value="department_code">Department Code</option>
    <option value="created_at">Date Added</option>
  </>
)}
                </select>
                
                <button
                  type="button"
                  onClick={() => handleSort(sortField)}
                  className="p-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md"
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? 
                    <span className="text-lg">↑</span> : 
                    <span className="text-lg">↓</span>}
                </button>
              </div>
            </div>
            
            {/* Departments Table */}
            {activeTab === 'departments' && departments && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">Department Name</th>
                      <th scope="col" className="px-6 py-3">Department Code</th>
                      <th scope="col" className="px-6 py-3">Students</th>
                      <th scope="col" className="px-6 py-3">Created At</th>
                      <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.data.map((department) => (
                      <tr 
                        key={department.id} 
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {department.department_name}
                        </td>
                        <td className="px-6 py-4">{department.department_code}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {department.student_count}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(department.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleShowDepartmentForm(department)}
                              className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                              title="Edit department"
                            >
                              <MdEdit size={20} />
                            </button>
                            <button
                              onClick={() => handleShowDeleteDialog(department, 'department')}
                              className={`font-medium text-red-600 hover:underline dark:text-red-500 ${
                                department.student_count > 0 ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              disabled={department.student_count > 0}
                              title={department.student_count > 0 ? "Cannot delete department with students" : "Delete department"}
                            >
                              <MdDelete size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {departments.data.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center">No departments found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Courses Table */}
            {activeTab === 'courses' && courses && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">Course Name</th>
                      <th scope="col" className="px-6 py-3">Course Code</th>
                      <th scope="col" className="px-6 py-3">Department</th>
                      <th scope="col" className="px-6 py-3">Students</th>
                      <th scope="col" className="px-6 py-3">Created At</th>
                      <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.data.map((course) => (
                      <tr 
                        key={course.id} 
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {course.course_name}
                        </td>
                        <td className="px-6 py-4">{course.course_code}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                            {course.department_name} ({course.department_code})
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {course.student_count}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(course.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleShowCourseForm(course)}
                              className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                              title="Edit course"
                            >
                              <MdEdit size={20} />
                            </button>
                            <button
                              onClick={() => handleShowDeleteDialog(course, 'course')}
                              className={`font-medium text-red-600 hover:underline dark:text-red-500 ${
                                course.student_count > 0 ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              disabled={course.student_count > 0}
                              title={course.student_count > 0 ? "Cannot delete course with students" : "Delete course"}
                            >
                              <MdDelete size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {courses.data.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center">No courses found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {(activeTab === 'departments' && departments && departments.last_page > 1) || 
             (activeTab === 'courses' && courses && courses.last_page > 1) ? (
              <div className="mt-6 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(activeTab === 'departments' ? departments.current_page - 1 : courses.current_page - 1)}
                    disabled={activeTab === 'departments' ? departments.current_page === 1 : courses.current_page === 1}
                    className={`px-3 py-1 rounded-md ${
                      (activeTab === 'departments' ? departments.current_page === 1 : courses.current_page === 1)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <MdChevronLeft size={20} />
                  </button>
                  
                  {[...Array(activeTab === 'departments' ? departments.last_page : courses.last_page)].map((_, index) => {
                    const page = index + 1;
                    const currentPage = activeTab === 'departments' ? departments.current_page : courses.current_page;
                    const lastPage = activeTab === 'departments' ? departments.last_page : courses.last_page;
                    
                    if (
                      page === 1 ||
                      page === lastPage ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      (page === 2 && currentPage > 3) ||
                      (page === lastPage - 1 && currentPage < lastPage - 2)
                    ) {
                      return <span key={page}>...</span>;
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(activeTab === 'departments' ? departments.current_page + 1 : courses.current_page + 1)}
                    disabled={activeTab === 'departments' ? departments.current_page === departments.last_page : courses.current_page === courses.last_page}
                    className={`px-3 py-1 rounded-md ${
                      (activeTab === 'departments' ? departments.current_page === departments.last_page : courses.current_page === courses.last_page)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <MdChevronRight size={20} />
                  </button>
                </nav>
              </div>
            ) : null}
            
            {/* Pagination Info */}
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              {activeTab === 'departments' && departments ? (
                <>Showing {departments.from} to {departments.to} of {departments.total} departments</>
              ) : activeTab === 'courses' && courses ? (
                <>Showing {courses.from} to {courses.to} of {courses.total} courses</>
              ) : null}
            </div>
          </div>
        </div>
        
        {/* Department Form Modal */}
        {isDepartmentFormVisible && (
          <Dialog
            open={isDepartmentFormVisible}
            onClose={() => setIsDepartmentFormVisible(false)}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
              
              <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
                <Dialog.Title className="text-xl font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  {isEditingDepartment ? 'Edit Department' : 'Add Department'}
                </Dialog.Title>
                
                <form onSubmit={handleDepartmentFormSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Department Name
                    </label>
                    <input
                      type="text"
                      value={departmentFormData.department_name}
                      onChange={(e) => setDepartmentFormData({...departmentFormData, department_name: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Department Code
                    </label>
                    <input
                      type="text"
                      value={departmentFormData.department_code}
                      onChange={(e) => setDepartmentFormData({...departmentFormData, department_code: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsDepartmentFormVisible(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          {isEditingDepartment ? 'Update' : 'Save'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Dialog>
        )}
        
        {/* Course Form Modal */}
        {isCourseFormVisible && (
          <Dialog
            open={isCourseFormVisible}
            onClose={() => setIsCourseFormVisible(false)}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
              
              <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
                <Dialog.Title className="text-xl font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  {isEditingCourse ? 'Edit Course' : 'Add Course'}
                </Dialog.Title>
                
                <form onSubmit={handleCourseFormSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Department
                    </label>
                    <select
                      value={courseFormData.department_code_course}
                      onChange={(e) => setCourseFormData({...courseFormData, department_code_course: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      required
                    >
                      <option value="">Select Department</option>
                      {departmentsList && departmentsList.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.department_name} ({dept.department_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Course Name
                    </label>
                    <input
                      type="text"
                      value={courseFormData.course_name}
                      onChange={(e) => setCourseFormData({...courseFormData, course_name: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Course Code
                    </label>
                    <input
                      type="text"
                      value={courseFormData.course_code}
                      onChange={(e) => setCourseFormData({...courseFormData, course_code: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsCourseFormVisible(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          {isEditingCourse ? 'Update' : 'Save'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Dialog>
        )}
        
        {/* Delete Confirmation Dialog */}
        {isDeleteDialogOpen && (
          <Dialog
            open={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
              
              <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
                <Dialog.Title className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                  Confirm Deletion
                </Dialog.Title>
                
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Are you sure you want to delete this {deleteType}? This action cannot be undone.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>Delete</>
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
import React, { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { 
  MdFilterList, 
  MdSearch, 
  MdRefresh, 
  MdOutlineCheckCircle, 
  MdErrorOutline,
  MdOutlineCalendarToday,
  MdDownload,
  MdChevronLeft,
  MdChevronRight,
  MdPersonOutline,
  MdEmail,
  MdAccessTime,
  MdInfo,
  MdSchool,
  MdDevices,
  MdExpandMore,
  MdExpandLess,
  MdLocationOn,
  MdDateRange,
  MdArrowUpward,
  MdArrowDownward,
  MdSort
} from 'react-icons/md';

export default function EmailLogsViewer({ auth, logs = [], availableDates = [] }) {
  // State variables
  const [emailLogs, setEmailLogs] = useState(logs || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [datesList, setDatesList] = useState(availableDates || []);  
  const [filters, setFilters] = useState({
    status: 'all',
    batchCode: '',
    studentId: '',
    email: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showDebug, setShowDebug] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [sortDirection, setSortDirection] = useState('desc'); // Default sort: newest first
  const logsPerPage = 10;

  // Format date for display
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (dateTimeString) => {
    try {
      if (!dateTimeString) return 'N/A';
      
      const timePart = dateTimeString.split(' ')[1];
      if (!timePart) return 'N/A';
      
      const [hours, minutes] = timePart.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return 'N/A';
    }
  };

  // Toggle expanded card
  const toggleCardExpand = (logId) => {
    setExpandedCards(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Fetch logs data
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const dateParam = selectedDate || '';
      
      const response = await axios.get(route('admin.email-logs.api', {
        date: dateParam
      }));

      console.log('API response:', response.data);

      if (response.data.logs) {
        setEmailLogs(response.data.logs);
        
        if (response.data.availableDates) {
          setDatesList(response.data.availableDates);
        }
      }
    } catch (error) {
      console.error('Error fetching email logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load logs when component mounts or when selected date changes
  useEffect(() => {
    if (selectedDate) {
      fetchLogs();
    }
  }, [selectedDate]);

  // Load initial data - select most recent date by default
  useEffect(() => {
    if (datesList.length > 0) {
      // Sort dates in descending order to get the latest first
      const sortedDates = [...datesList].sort((a, b) => new Date(b) - new Date(a));
      const latestDate = sortedDates[0];
      setSelectedDate(latestDate);
    } else {
      fetchLogs();
    }
  }, [datesList.length]);

  // Filter logs based on search and filter criteria
  const filteredLogs = useMemo(() => {
    // First filter the logs
    const filtered = emailLogs.filter(log => {
      if (!log) return false;
      
      // Search term filter
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm || 
        (log.student_name && log.student_name.toLowerCase().includes(searchTermLower)) ||
        (log.email && log.email.toLowerCase().includes(searchTermLower)) ||
        (log.batch_code && log.batch_code.toLowerCase().includes(searchTermLower)) ||
        (log.batch_name && log.batch_name.toLowerCase().includes(searchTermLower));

      // Status filter
      const matchesStatus = 
        filters.status === 'all' || 
        log.status === filters.status;

      // Batch code filter
      const matchesBatchCode = 
        !filters.batchCode || 
        (log.batch_code && log.batch_code.includes(filters.batchCode));

      // Student ID filter
      const matchesStudentId = 
        !filters.studentId || 
        (log.student_id && log.student_id.toString() === filters.studentId);

      // Email filter
      const matchesEmail = 
        !filters.email || 
        (log.email && log.email.includes(filters.email));

      return matchesSearch && matchesStatus && matchesBatchCode && 
             matchesStudentId && matchesEmail;
    });
    
    // Then sort according to the current sort direction
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      
      if (sortDirection === 'asc') {
        return dateA - dateB; // Ascending: oldest first
      } else {
        return dateB - dateA; // Descending: newest first
      }
    });
  }, [emailLogs, searchTerm, filters, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const currentPageLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage, 
    currentPage * logsPerPage
  );

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      batchCode: '',
      studentId: '',
      email: '',
    });
    setCurrentPage(1);
  };

  // Export logs to CSV
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "Date,Time,Student ID,Student Name,Email,Batch Code,Batch Name,Status,IP Address\n";
    
    filteredLogs.forEach(log => {
      if (!log || !log.timestamp) return;
      
      const [date, time] = log.timestamp.split(' ');
      csvContent += `${date},${time},${log.student_id || ''},"${log.student_name || ''}",${log.email || ''},${log.batch_code || ''},"${log.batch_name || ''}",${log.status || ''},${log.ip_address || ''}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `email-logs-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AuthenticatedLayout auth={auth} header={
      <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
        Email Logs Dashboard
      </h2>
    }>
      <Head title="Email Logs" />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Debug Info - Toggleable */}
          <div className="mb-6">
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <MdInfo className="h-5 w-5" />
              <span>{showDebug ? 'Hide Debug Info' : 'Show Debug Info'}</span>
            </button>
            
            {showDebug && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 shadow-sm border border-blue-100">
                  <h3 className="font-bold text-blue-800 flex items-center mb-2">
                    <MdOutlineCalendarToday className="mr-2" /> Date Information
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-blue-700">Available dates: <span className="font-mono bg-white px-2 py-0.5 rounded">{datesList.length}</span></p>
                    <p className="text-sm text-blue-700">Selected date: <span className="font-mono bg-white px-2 py-0.5 rounded">{selectedDate || 'None'}</span></p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 shadow-sm border border-green-100">
                  <h3 className="font-bold text-green-800 flex items-center mb-2">
                    <MdEmail className="mr-2" /> Log Counts
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-green-700">Initial logs: <span className="font-mono bg-white px-2 py-0.5 rounded">{logs.length}</span></p>
                    <p className="text-sm text-green-700">Current logs: <span className="font-mono bg-white px-2 py-0.5 rounded">{emailLogs.length}</span></p>
                    <p className="text-sm text-green-700">Filtered logs: <span className="font-mono bg-white px-2 py-0.5 rounded">{filteredLogs.length}</span></p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 shadow-sm border border-purple-100">
                  <h3 className="font-bold text-purple-800 flex items-center mb-2">
                    <MdFilterList className="mr-2" /> Filter Status
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-purple-700">Status: <span className="font-mono bg-white px-2 py-0.5 rounded">{filters.status}</span></p>
                    <p className="text-sm text-purple-700">Search term: <span className="font-mono bg-white px-2 py-0.5 rounded">{searchTerm || 'None'}</span></p>
                    <p className="text-sm text-purple-700">Sort direction: <span className="font-mono bg-white px-2 py-0.5 rounded">{sortDirection}</span></p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 shadow-sm border border-yellow-100 md:col-span-3">
                  <h3 className="font-bold text-amber-800 flex items-center mb-2">
                    <MdInfo className="mr-2" /> Raw Log Data
                  </h3>
                  <div className="bg-white p-2 rounded-md overflow-auto max-h-60">
                    <pre className="text-xs text-gray-700">
                      {JSON.stringify(currentPageLogs, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Container */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header with Search and Filters */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <MdEmail className="mr-2 text-blue-500" /> 
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Email Delivery Logs</span>
                </h3>
                
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={fetchLogs}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 flex items-center"
                    title="Refresh logs"
                  >
                    <MdRefresh className="w-5 h-5 mr-1" />
                    Refresh
                  </button>
                  
                  <button 
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150 flex items-center"
                    title="Export to CSV"
                  >
                    <MdDownload className="w-5 h-5 mr-1" />
                    Export
                  </button>
                </div>
              </div>
              
              {/* Date Selector and Sort Order */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Date to View Logs:
                    </label>
                    <select
                      className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-auto"
                      value={selectedDate || ""}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    >
                      <option value="">-- Select a date --</option>
                      {datesList.map(date => (
                        <option key={date} value={date}>
                          {date}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Sort Order Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time Sort Order:
                    </label>
                    <button
                      onClick={toggleSortDirection}
                      className="flex items-center space-x-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <MdSort className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}
                      </span>
                      {sortDirection === 'desc' ? (
                        <MdArrowDownward className="w-5 h-5 text-blue-500" />
                      ) : (
                        <MdArrowUpward className="w-5 h-5 text-blue-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student name, email, batch code..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                />
              </div>
              
              {/* Filters */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <MdFilterList className="mr-2 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Advanced Filters:</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  
                  {/* Batch Code Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch Code</label>
                    <input
                      type="text"
                      value={filters.batchCode}
                      onChange={(e) => setFilters({...filters, batchCode: e.target.value})}
                      placeholder="Enter batch code"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Student ID Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID</label>
                    <input
                      type="text"
                      value={filters.studentId}
                      onChange={(e) => setFilters({...filters, studentId: e.target.value})}
                      placeholder="Enter student ID"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Email Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="text"
                      value={filters.email}
                      onChange={(e) => setFilters({...filters, email: e.target.value})}
                      placeholder="Enter email"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Reset Filters Button */}
                <button
                  onClick={resetFilters}
                  className="mt-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-medium flex items-center"
                >
                  <MdRefresh className="mr-1" /> Reset All Filters
                </button>
              </div>
            </div>
            
            {/* Logs Display - Card Based Layout */}
            <div className="p-6">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading logs...</p>
                </div>
              ) : currentPageLogs.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center mb-4">
                    <MdOutlineCalendarToday className="w-5 h-5 mr-2 text-blue-500" />
                    {selectedDate ? formatDate(selectedDate) : 'All Logs'}
                    <span className="ml-3 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {filteredLogs.length} total logs
                    </span>
                    <span className="ml-2 text-gray-500 text-sm">
                      ({sortDirection === 'desc' ? 'Newest first' : 'Oldest first'})
                    </span>
                  </h3>

                  {/* Log Cards */}
                  {currentPageLogs.map((log, index) => {
                    const logId = `log-${index}-${log.student_id || ''}`;
                    const isExpanded = expandedCards[logId] || false;

                    return (
                      <div 
                        key={logId}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        {/* Card Header */}
                        <div 
                          className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer ${
                            isExpanded ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                          }`}
                          onClick={() => toggleCardExpand(logId)}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                              log.status === 'success' 
                                ? 'bg-green-100 text-green-600 dark:bg-green-800/30 dark:text-green-300'
                                : 'bg-red-100 text-red-600 dark:bg-red-800/30 dark:text-red-300'
                            }`}>
                              {log.status === 'success' ? (
                                <MdOutlineCheckCircle className="w-6 h-6" />
                              ) : (
                                <MdErrorOutline className="w-6 h-6" />
                              )}
                            </div>
                            
                            <div>
                              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{log.student_name || 'Unknown'}</h4>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <MdEmail className="mr-1" />
                                {log.email || 'N/A'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-5">
                            <div className="text-right">
                              <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                <MdDateRange className="mr-1" />
                                {log.timestamp ? log.timestamp.split(' ')[0] : 'N/A'}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <MdAccessTime className="mr-1" />
                                {formatTime(log.timestamp)}
                              </div>
                            </div>
                            
                            <button
                              className={`p-1 rounded-full ${
                                isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                              }`}
                              aria-label={isExpanded ? "Collapse details" : "Expand details"}
                            >
                              {isExpanded ? <MdExpandLess className="w-5 h-5" /> : <MdExpandMore className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        
                        {/* Card Details (Expanded) */}
                        {isExpanded && (
                          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h5 className="font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2">
                                  <MdPersonOutline className="mr-1 text-blue-500" /> Student Information
                                </h5>
                                <div className="space-y-1 text-sm">
                                  <p className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Name:</span> {log.student_name || 'N/A'}
                                  </p>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">ID:</span> {log.student_id || 'N/A'}
                                  </p>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">NIC:</span> {log.nic || 'N/A'}
                                  </p>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Email:</span> {log.email || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h5 className="font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2">
                                  <MdSchool className="mr-1 text-blue-500" /> Batch Information
                                </h5>
                                <div className="space-y-1 text-sm">
                                  <p className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Name:</span> {log.batch_name || 'N/A'}
                                  </p>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Code:</span> {log.batch_code || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h5 className="font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2">
                                  <MdInfo className="mr-1 text-blue-500" /> Delivery Information
                                </h5>
                                <div className="space-y-1 text-sm">
                                  <p className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Time:</span> {log.timestamp || 'N/A'}
                                  </p>
                                  <p className="text-gray-600 dark:text-gray-400 flex items-center">
                                    <span className="font-medium mr-1">Status:</span> 
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                      log.status === 'success' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' 
                                        : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                                    }`}>
                                      {log.status === 'success' ? (
                                        <><MdOutlineCheckCircle className="mr-1" /> Success</>
                                      ) : (
                                        <><MdErrorOutline className="mr-1" /> Failed</>
                                      )}
                                    </span>
                                  </p>
                                  <p className="text-gray-600 dark:text-gray-400 flex items-center">
                                    <span className="font-medium mr-1">IP:</span>
                                    <span className="flex items-center">
                                      <MdLocationOn className="mr-1 text-gray-400" />
                                      {log.ip_address || 'N/A'}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                              <h5 className="font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2">
                                <MdDevices className="mr-1 text-blue-500" /> Device Information
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">
                                {log.user_agent || 'N/A'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="flex justify-center mb-4">
                      <MdEmail className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No logs found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No email logs matching your current filters were found. Try selecting a different date or adjusting your search filters.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <MdRefresh className="mr-1" /> Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{(currentPage - 1) * logsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * logsPerPage, filteredLogs.length)}
                  </span> of{' '}
                  <span className="font-medium">{filteredLogs.length}</span> logs
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-white bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <MdChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-white bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <MdChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
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
  MdSort,
  MdMarkEmailRead,
  MdMarkEmailUnread,
  MdClass,
  MdPersonalInjury,
  MdSyncAlt,
  MdTimeline,
  MdStop,
  MdPause,
  MdSend,
  MdPieChart,
  MdInsertDriveFile,
  MdCode,
  MdAssignment,
  MdGroup,
  MdTrackChanges,
  MdAutoAwesomeMotion,
  MdAssessment,
  MdDonutLarge
} from 'react-icons/md';

// Define tab types for easy reference
const TAB_TYPES = {
  DELIVERY: 'delivery',
  OPERATIONS: 'operations',
  TRACKING: 'tracking'
};

// Define operation types
const OPERATION_TYPES = {
  SEND: 'sendResultEmail',
  CHECK: 'checkEmailProgress',
  STOP: 'stopEmailProcess'
};

export default function EmailLogsViewer({ auth, logs = [], availableDates = [] }) {
  // State variables
  const [activeTab, setActiveTab] = useState(TAB_TYPES.DELIVERY);
  const [activeOperation, setActiveOperation] = useState(OPERATION_TYPES.SEND);
  const [emailLogs, setEmailLogs] = useState(logs || []);
  const [operationLogs, setOperationLogs] = useState([]);
  const [operationDates, setOperationDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [datesList, setDatesList] = useState(availableDates || []);
  const [trackingType, setTrackingType] = useState('all'); // 'all', 'batch', 'result', 'personal'
  const [filters, setFilters] = useState({
    status: 'all',
    opened: 'all',
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

  // Format relative time (e.g., 2 hours ago)
  const formatRelativeTime = (dateTimeString) => {
    try {
      if (!dateTimeString) return 'N/A';
      
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return dateTimeString;
      
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      
      if (diffSec < 60) return `${diffSec} seconds ago`;
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
      if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} days ago`;
      
      return formatDate(dateTimeString);
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

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      opened: 'all',
      batchCode: '',
      studentId: '',
      email: '',
    });
    setCurrentPage(1);
  };

  // Get operation icon
  const getOperationIcon = (operation) => {
    switch(operation) {
      case OPERATION_TYPES.SEND:
        return <MdSend className="w-5 h-5 text-blue-500" />;
      case OPERATION_TYPES.CHECK:
        return <MdSyncAlt className="w-5 h-5 text-green-500" />;
      case OPERATION_TYPES.STOP:
        return <MdStop className="w-5 h-5 text-red-500" />;
      default:
        return <MdInfo className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get tracking type icon
  const getEmailTypeIcon = (type) => {
    switch(type) {
      case 'batch':
        return <MdClass className="w-5 h-5 text-blue-500" />;
      case 'result':
        return <MdSchool className="w-5 h-5 text-green-500" />;
      case 'personal':
        return <MdPersonalInjury className="w-5 h-5 text-purple-500" />;
      default:
        return <MdEmail className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get readable email type name
  const getEmailTypeName = (type) => {
    switch(type) {
      case 'batch':
        return 'Batch Result';
      case 'result':
        return 'Student Result';
      case 'personal':
        return 'Personal Email';
      default:
        return 'Unknown';
    }
  };

  // Fetch email delivery logs
  const fetchEmailLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(route('admin.email-logs.api', {
        date: selectedDate || '',
        type: trackingType !== 'all' ? trackingType : undefined
      }));

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

  // Fetch operation logs
  const fetchOperationLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(route('admin.email-operations.logs', {
        operation: activeOperation,
        date: selectedDate || ''
      }));

      if (response.data.success) {
        setOperationLogs(response.data.logs || []);
        setOperationDates(response.data.availableDates || []);
      }
    } catch (error) {
      console.error(`Error fetching ${activeOperation} logs:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when tab, operation, or date changes
  useEffect(() => {
    if (selectedDate) {
      if (activeTab === TAB_TYPES.DELIVERY) {
        fetchEmailLogs();
      } else if (activeTab === TAB_TYPES.OPERATIONS) {
        fetchOperationLogs();
      } else if (activeTab === TAB_TYPES.TRACKING) {
        fetchEmailLogs(); // Re-use the same endpoint but we'll process the data differently
      }
    }
  }, [selectedDate, activeTab, activeOperation, trackingType]);

  // Set the latest date when dates list changes
  useEffect(() => {
    // Only set if we don't already have a selected date
    if (!selectedDate && datesList.length > 0) {
      // Sort dates in descending order to get the latest first
      const sortedDates = [...datesList].sort((a, b) => new Date(b) - new Date(a));
      const latestDate = sortedDates[0];
      setSelectedDate(latestDate);
    }
  }, [datesList]);

  // Initial data load
  useEffect(() => {
    if (activeTab === TAB_TYPES.DELIVERY) {
      fetchEmailLogs();
    } else if (activeTab === TAB_TYPES.OPERATIONS) {
      fetchOperationLogs();
    }
  }, []);

  // Filter logs based on search and filter criteria
  const filteredEmailLogs = useMemo(() => {
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
        
      // Opened status filter
      const matchesOpened = 
        filters.opened === 'all' || 
        (filters.opened === 'opened' && log.opened === true) ||
        (filters.opened === 'unopened' && log.opened === false);

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
        
      // Email type filter (for tracking tab)
      const matchesType = 
        trackingType === 'all' || 
        (log.email_type === trackingType);

      return matchesSearch && matchesStatus && matchesOpened &&
             matchesBatchCode && matchesStudentId && matchesEmail && matchesType;
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
  }, [emailLogs, searchTerm, filters, sortDirection, trackingType]);

  // Filter operation logs based on search
  const filteredOperationLogs = useMemo(() => {
    if (!operationLogs || operationLogs.length === 0) return [];
    
    const filtered = operationLogs.filter(log => {
      if (!log) return false;
      
      // Simple search on any field
      const searchTermLower = searchTerm.toLowerCase();
      if (!searchTerm) return true;
      
      // Convert entire log to string and search
      const logString = JSON.stringify(log).toLowerCase();
      return logString.includes(searchTermLower);
    });
    
    // Sort by logged_at timestamp
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.logged_at || 0);
      const dateB = new Date(b.logged_at || 0);
      
      if (sortDirection === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }, [operationLogs, searchTerm, sortDirection]);

  // Email tracking statistics
  const trackingStats = useMemo(() => {
    const stats = {
      total: filteredEmailLogs.length,
      opened: filteredEmailLogs.filter(log => log.opened).length,
      unopened: filteredEmailLogs.filter(log => !log.opened).length,
      
      // Stats by email type
      batch: {
        total: filteredEmailLogs.filter(log => log.email_type === 'batch').length,
        opened: filteredEmailLogs.filter(log => log.email_type === 'batch' && log.opened).length
      },
      result: {
        total: filteredEmailLogs.filter(log => log.email_type === 'result').length,
        opened: filteredEmailLogs.filter(log => log.email_type === 'result' && log.opened).length
      },
      personal: {
        total: filteredEmailLogs.filter(log => log.email_type === 'personal').length,
        opened: filteredEmailLogs.filter(log => log.email_type === 'personal' && log.opened).length
      }
    };
    
    // Calculate open rates
    stats.openRate = stats.total > 0 ? (stats.opened / stats.total * 100).toFixed(1) : 0;
    stats.batch.openRate = stats.batch.total > 0 ? (stats.batch.opened / stats.batch.total * 100).toFixed(1) : 0;
    stats.result.openRate = stats.result.total > 0 ? (stats.result.opened / stats.result.total * 100).toFixed(1) : 0;
    stats.personal.openRate = stats.personal.total > 0 ? (stats.personal.opened / stats.personal.total * 100).toFixed(1) : 0;
    
    return stats;
  }, [filteredEmailLogs]);

  // Pagination logic
  const paginatedEmailLogs = useMemo(() => {
    const totalPages = Math.ceil(filteredEmailLogs.length / logsPerPage);
    
    // Ensure current page is valid
    const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }
    
    return filteredEmailLogs.slice(
      (validCurrentPage - 1) * logsPerPage, 
      validCurrentPage * logsPerPage
    );
  }, [filteredEmailLogs, currentPage, logsPerPage]);

  const paginatedOperationLogs = useMemo(() => {
    const totalPages = Math.ceil(filteredOperationLogs.length / logsPerPage);
    
    // Ensure current page is valid
    const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }
    
    return filteredOperationLogs.slice(
      (validCurrentPage - 1) * logsPerPage, 
      validCurrentPage * logsPerPage
    );
  }, [filteredOperationLogs, currentPage, logsPerPage]);

  // Total pages calculation
  const totalPages = useMemo(() => {
    if (activeTab === TAB_TYPES.DELIVERY || activeTab === TAB_TYPES.TRACKING) {
      return Math.max(1, Math.ceil(filteredEmailLogs.length / logsPerPage));
    } else {
      return Math.max(1, Math.ceil(filteredOperationLogs.length / logsPerPage));
    }
  }, [activeTab, filteredEmailLogs, filteredOperationLogs, logsPerPage]);

  // Export logs to CSV
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = '';
    
    if (activeTab === TAB_TYPES.DELIVERY) {
      csvContent += "Date,Time,Student ID,Student Name,Email,Batch Code,Batch Name,Status,Email Type,Opened,Opened At,IP Address\n";
      
      filteredEmailLogs.forEach(log => {
        if (!log || !log.timestamp) return;
        
        const [date, time] = log.timestamp.split(' ');
        const openedAt = log.opened_at ? formatDate(log.opened_at) + ' ' + formatTime(log.opened_at) : 'N/A';
        csvContent += `${date},${time},${log.student_id || ''},"${log.student_name || ''}",${log.email || ''},${log.batch_code || ''},"${log.batch_name || ''}",${log.status || ''},${log.email_type || 'N/A'},${log.opened ? 'Yes' : 'No'},${openedAt},${log.ip_address || ''}\n`;
      });
      
      filename = `email-delivery-logs-${selectedDate || new Date().toISOString().split('T')[0]}.csv`;
    } 
    else if (activeTab === TAB_TYPES.OPERATIONS) {
      // Headers depend on operation type
      if (activeOperation === OPERATION_TYPES.SEND) {
        csvContent += "Timestamp,Batch ID,Subject,Batch Code,Email Count,IP Address\n";
        
        filteredOperationLogs.forEach(log => {
          if (!log || !log.logged_at) return;
          
          csvContent += `${log.logged_at},${log.batchId || ''},"${log.subject || ''}",${log.batchCode || ''},${log.emailCount || ''},${log.ipAddress || ''}\n`;
        });
      } 
      else if (activeOperation === OPERATION_TYPES.CHECK) {
        csvContent += "Timestamp,Batch ID,Progress Total,Progress Sent,Progress Failed,Completed,IP Address\n";
        
        filteredOperationLogs.forEach(log => {
          if (!log || !log.logged_at) return;
          
          const progress = log.progress || {};
          csvContent += `${log.logged_at},${log.batchId || ''},${progress.total || 0},${progress.sent || 0},${progress.failed || 0},${progress.completed ? 'Yes' : 'No'},${log.ipAddress || ''}\n`;
        });
      }
      else if (activeOperation === OPERATION_TYPES.STOP) {
        csvContent += "Timestamp,Batch ID,Stopped At,Progress Total,Progress Sent,Progress Failed,IP Address\n";
        
        filteredOperationLogs.forEach(log => {
          if (!log || !log.logged_at) return;
          
          const progress = log.progress || {};
          csvContent += `${log.logged_at},${log.batchId || ''},${progress.stoppedAt || ''},${progress.total || 0},${progress.sent || 0},${progress.failed || 0},${log.ipAddress || ''}\n`;
        });
      }
      
      filename = `email-operation-${activeOperation}-${selectedDate || new Date().toISOString().split('T')[0]}.csv`;
    }
    else if (activeTab === TAB_TYPES.TRACKING) {
      csvContent += "Date,Time,Student ID,Student Name,Email,Email Type,Opened,Opened At,IP Address\n";
      
      filteredEmailLogs.forEach(log => {
        if (!log || !log.timestamp) return;
        
        const [date, time] = log.timestamp.split(' ');
        const openedAt = log.opened_at ? formatDate(log.opened_at) + ' ' + formatTime(log.opened_at) : 'N/A';
        csvContent += `${date},${time},${log.student_id || ''},"${log.student_name || ''}",${log.email || ''},${log.email_type || 'N/A'},${log.opened ? 'Yes' : 'No'},${openedAt},${log.ip_address || ''}\n`;
      });
      
      filename = `email-tracking-${trackingType}-${selectedDate || new Date().toISOString().split('T')[0]}.csv`;
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
  };

  // Switch tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm('');
    setExpandedCards({});
  };

  // Switch operation types
  const handleOperationChange = (operation) => {
    setActiveOperation(operation);
    setCurrentPage(1);
    setSearchTerm('');
    setExpandedCards({});
  };

  // Switch tracking types
  const handleTrackingTypeChange = (type) => {
    setTrackingType(type);
    setCurrentPage(1);
  };

  return (
    <AuthenticatedLayout auth={auth} header={
      <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
        Email Analytics Dashboard
      </h2>
    }>
      <Head title="Email Analytics" />
      
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
                    <MdOutlineCalendarToday className="mr-2" /> State Information
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-blue-700">Active Tab: <span className="font-mono bg-white px-2 py-0.5 rounded">{activeTab}</span></p>
                    <p className="text-sm text-blue-700">Active Operation: <span className="font-mono bg-white px-2 py-0.5 rounded">{activeOperation}</span></p>
                    <p className="text-sm text-blue-700">Tracking Type: <span className="font-mono bg-white px-2 py-0.5 rounded">{trackingType}</span></p>
                    <p className="text-sm text-blue-700">Selected Date: <span className="font-mono bg-white px-2 py-0.5 rounded">{selectedDate || 'None'}</span></p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 shadow-sm border border-green-100">
                  <h3 className="font-bold text-green-800 flex items-center mb-2">
                    <MdEmail className="mr-2" /> Log Counts
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-green-700">Email Logs: <span className="font-mono bg-white px-2 py-0.5 rounded">{emailLogs.length}</span></p>
                    <p className="text-sm text-green-700">Filtered Email Logs: <span className="font-mono bg-white px-2 py-0.5 rounded">{filteredEmailLogs.length}</span></p>
                    <p className="text-sm text-green-700">Operation Logs: <span className="font-mono bg-white px-2 py-0.5 rounded">{operationLogs.length}</span></p>
                    <p className="text-sm text-green-700">Current Page: <span className="font-mono bg-white px-2 py-0.5 rounded">{currentPage} of {totalPages}</span></p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 shadow-sm border border-purple-100">
                  <h3 className="font-bold text-purple-800 flex items-center mb-2">
                    <MdFilterList className="mr-2" /> Filter Status
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-purple-700">Status: <span className="font-mono bg-white px-2 py-0.5 rounded">{filters.status}</span></p>
                    <p className="text-sm text-purple-700">Opened: <span className="font-mono bg-white px-2 py-0.5 rounded">{filters.opened}</span></p>
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
                      {activeTab === TAB_TYPES.OPERATIONS
                        ? JSON.stringify(paginatedOperationLogs, null, 2)
                        : JSON.stringify(paginatedEmailLogs, null, 2)
                      }
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Container */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Tab Navigation */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTabChange(TAB_TYPES.DELIVERY)}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center transition-colors ${
                    activeTab === TAB_TYPES.DELIVERY
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <MdEmail className="mr-2 text-current" />
                  Email Delivery Logs
                </button>
                
                <button
                  onClick={() => handleTabChange(TAB_TYPES.OPERATIONS)}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center transition-colors ${
                    activeTab === TAB_TYPES.OPERATIONS
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <MdAutoAwesomeMotion className="mr-2 text-current" />
                  Email Operations
                </button>
                
                <button
                  onClick={() => handleTabChange(TAB_TYPES.TRACKING)}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center transition-colors ${
                    activeTab === TAB_TYPES.TRACKING
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <MdTrackChanges className="mr-2 text-current" />
                  Email Open Tracking
                </button>
              </div>
            </div>
            
            {/* Tab Content Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  {activeTab === TAB_TYPES.DELIVERY && (
                    <>
                      <MdEmail className="mr-2 text-blue-500" /> 
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Email Delivery Logs</span>
                    </>
                  )}
                  {activeTab === TAB_TYPES.OPERATIONS && (
                    <>
                      <MdAutoAwesomeMotion className="mr-2 text-green-500" /> 
                      <span className="bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">Email Operations</span>
                    </>
                  )}
                  {activeTab === TAB_TYPES.TRACKING && (
                    <>
                      <MdTrackChanges className="mr-2 text-purple-500" /> 
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">Email Open Tracking</span>
                    </>
                  )}
                </h3>
                
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={activeTab === TAB_TYPES.OPERATIONS ? fetchOperationLogs : fetchEmailLogs}
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
              
              {/* Operation Type Tabs - Only shown for Operations tab */}
              {activeTab === TAB_TYPES.OPERATIONS && (
                <div className="flex border-b border-gray-200 dark:border-gray-700 -mb-px overflow-x-auto">
                  <button
                    onClick={() => handleOperationChange(OPERATION_TYPES.SEND)}
                    className={`py-3 px-6 font-medium text-sm focus:outline-none whitespace-nowrap ${
                      activeOperation === OPERATION_TYPES.SEND
                        ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <MdSend className="mr-1.5" />
                      <span>Send Result Email</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleOperationChange(OPERATION_TYPES.CHECK)}
                    className={`py-3 px-6 font-medium text-sm focus:outline-none whitespace-nowrap ${
                      activeOperation === OPERATION_TYPES.CHECK
                        ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <MdSyncAlt className="mr-1.5" />
                      <span>Check Progress</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleOperationChange(OPERATION_TYPES.STOP)}
                    className={`py-3 px-6 font-medium text-sm focus:outline-none whitespace-nowrap ${
                      activeOperation === OPERATION_TYPES.STOP
                        ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <MdStop className="mr-1.5" />
                      <span>Stop Process</span>
                    </div>
                  </button>
                </div>
              )}
              
              {/* Tracking Type Tabs - Only shown for Tracking tab */}
              {activeTab === TAB_TYPES.TRACKING && (
                <div className="flex border-b border-gray-200 dark:border-gray-700 -mb-px overflow-x-auto">
                  <button
                    onClick={() => handleTrackingTypeChange('all')}
                    className={`py-3 px-6 font-medium text-sm focus:outline-none whitespace-nowrap ${
                      trackingType === 'all'
                        ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <MdEmail className="mr-1.5" />
                      <span>All Emails</span>
                    </div>
                  </button>
                  
                {/*   <button
                    onClick={() => handleTrackingTypeChange('batch')}
                    className={`py-3 px-6 font-medium text-sm focus:outline-none whitespace-nowrap ${
                      trackingType === 'batch'
                        ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <MdClass className="mr-1.5" />
                      <span>Batch Results</span>
                    </div>
                  </button> */}
                  
                  <button
                    onClick={() => handleTrackingTypeChange('result')}
                    className={`py-3 px-6 font-medium text-sm focus:outline-none whitespace-nowrap ${
                      trackingType === 'result'
                        ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <MdSchool className="mr-1.5" />
                      <span>Student Results</span>
                    </div>
                  </button>
                  
            {/*       <button
                    onClick={() => handleTrackingTypeChange('personal')}
                    className={`py-3 px-6 font-medium text-sm focus:outline-none whitespace-nowrap ${
                      trackingType === 'personal'
                        ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <MdPersonalInjury className="mr-1.5" />
                      <span>Personal Emails</span>
                    </div>
                  </button> */}
                </div>
              )}
              
              {/* Stats Section - Different for each tab */}
              {activeTab === TAB_TYPES.TRACKING && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Emails</h4>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{trackingStats.total}</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Opened Emails</h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{trackingStats.opened}</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Open Rate</h4>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{trackingStats.openRate}%</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Not Opened</h4>
                    <p className="text-2xl font-bold text-red-500 dark:text-red-400">{trackingStats.unopened}</p>
                  </div>
                </div>
              )}
              
              {/* Type-specific stats for tracking tab */}
              {activeTab === TAB_TYPES.TRACKING && trackingType === 'all' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
           {/*        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg shadow-sm border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center mb-2">
                      <MdClass className="text-blue-600 dark:text-blue-400 mr-2" />
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Batch Results</h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{trackingStats.batch.total} emails</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">{trackingStats.batch.opened} opened ({trackingStats.batch.openRate}%)</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-blue-200 dark:bg-blue-700 flex items-center justify-center">
                        <span className="text-blue-800 dark:text-blue-200 font-bold">{trackingStats.batch.openRate}%</span>
                      </div>
                    </div>
                  </div> */}
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg shadow-sm border border-green-200 dark:border-green-700">
                    <div className="flex items-center mb-2">
                      <MdSchool className="text-green-600 dark:text-green-400 mr-2" />
                      <h4 className="text-sm font-medium text-green-700 dark:text-green-300">Student Results</h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-green-800 dark:text-green-200">{trackingStats.result.total} emails</p>
                        <p className="text-sm text-green-600 dark:text-green-400">{trackingStats.result.opened} opened ({trackingStats.result.openRate}%)</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-200 dark:bg-green-700 flex items-center justify-center">
                        <span className="text-green-800 dark:text-green-200 font-bold">{trackingStats.result.openRate}%</span>
                      </div>
                    </div>
                  </div>
                  
        {/*           <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 rounded-lg shadow-sm border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center mb-2">
                      <MdPersonalInjury className="text-purple-600 dark:text-purple-400 mr-2" />
                      <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300">Personal Emails</h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-purple-800 dark:text-purple-200">{trackingStats.personal.total} emails</p>
                        <p className="text-sm text-purple-600 dark:text-purple-400">{trackingStats.personal.opened} opened ({trackingStats.personal.openRate}%)</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-purple-200 dark:bg-purple-700 flex items-center justify-center">
                        <span className="text-purple-800 dark:text-purple-200 font-bold">{trackingStats.personal.openRate}%</span>
                      </div>
                    </div>
                  </div> */}
                </div>
              )}
              
              {/* Date and Sort Controls */}
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm mt-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Date to View Logs:
                    </label>
                    <select
                      className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-auto"
                      value={selectedDate || ""}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">-- Select a date --</option>
                      {activeTab === TAB_TYPES.OPERATIONS 
                        ? operationDates.map(date => (
                            <option key={date} value={date}>{date}</option>
                          ))
                        : datesList.map(date => (
                            <option key={date} value={date}>{date}</option>
                          ))
                      }
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
                      disabled={loading}
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
              <div className="relative mt-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={activeTab === TAB_TYPES.OPERATIONS 
                    ? "Search operation logs..." 
                    : "Search by student name, email, batch code..."}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  disabled={loading}
                />
              </div>
              
              {/* Filters - Only for Email Delivery and Tracking tabs */}
              {(activeTab === TAB_TYPES.DELIVERY || activeTab === TAB_TYPES.TRACKING) && (
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm mt-4">
                  <div className="flex items-center mb-3">
                    <MdFilterList className="mr-2 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Advanced Filters:</span>
                    
                    <button
                      onClick={resetFilters}
                      className="ml-auto text-blue-600 dark:text-blue-400 text-sm hover:underline flex items-center"
                      disabled={loading}
                    >
                      Reset Filters
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      >
                        <option value="all">All Statuses</option>
                        <option value="sent">Sent</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    
                    {/* Opened Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opened Status</label>
                      <select
                        value={filters.opened}
                        onChange={(e) => setFilters({...filters, opened: e.target.value})}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      >
                        <option value="all">All</option>
                        <option value="opened">Opened</option>
                        <option value="unopened">Not Opened</option>
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
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Main Content Area with Logs */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : activeTab === TAB_TYPES.OPERATIONS ? (
                // Operations Logs Display
                operationLogs.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                    <MdInfo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No operation logs found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      No logs were found for {activeOperation} on the selected date.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedOperationLogs.map((log, index) => (
                      <div 
                        key={index}
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${
                          expandedCards[index] ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                        }`}
                      >
                        <div 
                          className="p-4 cursor-pointer flex justify-between items-center"
                          onClick={() => toggleCardExpand(index)}
                        >
                          <div className="flex items-center space-x-4">
                            {getOperationIcon(activeOperation)}
                            <div>
                              <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                {activeOperation === OPERATION_TYPES.SEND ? log.subject || 'Send Email Operation' : 
                                 activeOperation === OPERATION_TYPES.CHECK ? `Progress Check (${log.batchId || 'Unknown'})` :
                                 activeOperation === OPERATION_TYPES.STOP ? `Stop Process (${log.batchId || 'Unknown'})` : 
                                 'Email Operation'}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {log.logged_at ? formatRelativeTime(log.logged_at) : 'Unknown time'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {activeOperation === OPERATION_TYPES.SEND && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {log.emailCount || 0} emails
                              </span>
                            )}
                            {activeOperation === OPERATION_TYPES.CHECK && log.progress && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {log.progress.sent || 0}/{log.progress.total || 0} sent
                              </span>
                            )}
                            {activeOperation === OPERATION_TYPES.STOP && log.progress && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Stopped
                              </span>
                            )}
                            {expandedCards[index] ? <MdExpandLess /> : <MdExpandMore />}
                          </div>
                        </div>
                        
                        {expandedCards[index] && (
                          <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 overflow-auto max-h-80">
                              <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {JSON.stringify(log, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                // Email Delivery or Tracking Logs Display
                filteredEmailLogs.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                    <MdInfo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No email logs found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Try adjusting your filters or selecting a different date.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedEmailLogs.map((log, index) => (
                      <div 
                        key={index}
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                          log.opened 
                            ? 'border-green-200 dark:border-green-800' 
                            : 'border-gray-200 dark:border-gray-700'
                        } overflow-hidden transition-all duration-200 ${
                          expandedCards[index] ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                        }`}
                      >
                        <div 
                          className="p-4 cursor-pointer"
                          onClick={() => toggleCardExpand(index)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex space-x-3">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                log.opened 
                                  ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' 
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                              }`}>
                                {log.opened 
                                  ? <MdMarkEmailRead className="h-5 w-5" /> 
                                  : <MdMarkEmailUnread className="h-5 w-5" />
                                }
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
                                  {log.student_name || 'Unknown Student'}
                                  {log.email_type && (
                                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                      {getEmailTypeName(log.email_type)}
                                    </span>
                                  )}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {log.email || 'No email'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {log.timestamp ? formatDate(log.timestamp.split(' ')[0]) : 'Unknown date'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {log.timestamp ? formatTime(log.timestamp) : 'Unknown time'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex flex-wrap gap-2">
                            {log.batch_code && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                <MdClass className="mr-1" /> {log.batch_code}
                              </span>
                            )}
                            {log.status && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                log.status === 'sent' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {log.status === 'sent' 
                                  ? <MdOutlineCheckCircle className="mr-1" /> 
                                  : <MdErrorOutline className="mr-1" />
                                }
                                {log.status}
                              </span>
                            )}
                            {log.opened && log.opened_at && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <MdAccessTime className="mr-1" /> Opened: {formatRelativeTime(log.opened_at)}
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-1 flex justify-end">
                            {expandedCards[index] ? <MdExpandLess /> : <MdExpandMore />}
                          </div>
                        </div>
                        
                        {expandedCards[index] && (
                          <div className="px-4 pb-4 pt-0 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Student Information</h5>
                                <ul className="space-y-1">
                                  <li className="flex items-center text-sm">
                                    <MdPersonOutline className="mr-2 text-gray-500" />
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">ID:</span>
                                    <span className="ml-1 text-gray-600 dark:text-gray-300">{log.student_id || 'N/A'}</span>
                                  </li>
                                  <li className="flex items-center text-sm">
                                    <MdEmail className="mr-2 text-gray-500" />
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">Email:</span>
                                    <span className="ml-1 text-gray-600 dark:text-gray-300">{log.email || 'N/A'}</span>
                                  </li>
                                  {log.batch_name && (
                                    <li className="flex items-center text-sm">
                                      <MdSchool className="mr-2 text-gray-500" />
                                      <span className="text-gray-800 dark:text-gray-200 font-medium">Batch:</span>
                                      <span className="ml-1 text-gray-600 dark:text-gray-300">{log.batch_name}</span>
                                    </li>
                                  )}
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Details</h5>
                                <ul className="space-y-1">
                                  <li className="flex items-center text-sm">
                                    <MdOutlineCheckCircle className={`mr-2 ${log.opened ? 'text-green-500' : 'text-gray-500'}`} />
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">Status:</span>
                                    <span className={`ml-1 ${log.opened ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                      {log.opened ? 'Opened' : 'Not opened'}
                                    </span>
                                  </li>
                                  {log.opened_at && (
                                    <li className="flex items-center text-sm">
                                      <MdAccessTime className="mr-2 text-green-500" />
                                      <span className="text-gray-800 dark:text-gray-200 font-medium">Opened at:</span>
                                      <span className="ml-1 text-green-600 dark:text-green-400">{formatDate(log.opened_at)} {formatTime(log.opened_at)}</span>
                                    </li>
                                  )}
                                  {log.ip_address && (
                                    <li className="flex items-center text-sm">
                                      <MdDevices className="mr-2 text-gray-500" />
                                      <span className="text-gray-800 dark:text-gray-200 font-medium">IP Address:</span>
                                      <span className="ml-1 text-gray-600 dark:text-gray-300">{log.ip_address}</span>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Raw Log Data</h5>
                              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 overflow-auto max-h-32">
                                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                  {JSON.stringify(log, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
              
              {/* Pagination */}
              {(activeTab === TAB_TYPES.DELIVERY || activeTab === TAB_TYPES.TRACKING 
                  ? filteredEmailLogs.length > logsPerPage 
                  : filteredOperationLogs.length > logsPerPage) && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{((currentPage - 1) * logsPerPage) + 1}</span> to <span className="font-medium">
                      {Math.min(currentPage * logsPerPage, 
                        activeTab === TAB_TYPES.OPERATIONS 
                          ? filteredOperationLogs.length 
                          : filteredEmailLogs.length)}
                    </span> of <span className="font-medium">
                      {activeTab === TAB_TYPES.OPERATIONS 
                        ? filteredOperationLogs.length 
                        : filteredEmailLogs.length}
                    </span> results
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } border border-gray-300 dark:border-gray-600`}
                    >
                      <MdChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <span className="relative inline-flex items-center px-4 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {currentPage} / {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } border border-gray-300 dark:border-gray-600`}
                    >
                      <MdChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
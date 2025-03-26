import React, { useState, useEffect } from 'react';
import { 
    TrashIcon, 
    MagnifyingGlassIcon, 
    ArrowDownTrayIcon, 
    ArrowDownIcon ,
    ArrowUpIcon , 
} from '@heroicons/react/24/outline';

export default function SubjectTable({ subjects, onDelete, onUpdate }) {
    const [editingCell, setEditingCell] = useState({ id: null, field: null });
    const [editValue, setEditValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('all'); 
   // Default sort by created_at in descending order (newest first)
   const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
   const itemsPerPage = 50;
   
   // Handle column sorting
   const requestSort = (key) => {
       let direction = 'ascending';
       if (sortConfig.key === key && sortConfig.direction === 'ascending') {
           direction = 'descending';
       }
       setSortConfig({ key, direction });
   };
   
   // Reset to default sort (by created_at)
   const resetSort = () => {
       setSortConfig({ key: 'created_at', direction: 'descending' });
       setSearchTerm('');
       setSearchField('all');
   };
   
   // Filter and sort subjects whenever search changes
   useEffect(() => {
       if (!subjects) return;
       
       let filtered = [...subjects];
       
       // Apply search filters
       if (searchTerm.trim() !== '') {
           const term = searchTerm.toLowerCase();
           filtered = filtered.filter(subject => {
               if (searchField === 'name' || searchField === 'all') {
                   if (subject.subject_name.toLowerCase().includes(term)) return true;
               }
               if (searchField === 'code' || searchField === 'all') {
                   if (subject.subject_code.toLowerCase().includes(term)) return true;
               }
               return false;
           });
       }
       
       // Sort data based on sortConfig
       filtered.sort((a, b) => {
           // Handle date sorting specifically for created_at
           if (sortConfig.key === 'created_at') {
               const dateA = new Date(a.created_at || 0);
               const dateB = new Date(b.created_at || 0);
               return sortConfig.direction === 'ascending' 
                   ? dateA - dateB 
                   : dateB - dateA;
           }
           
           // Handle regular string/number sorting
           if (a[sortConfig.key] < b[sortConfig.key]) {
               return sortConfig.direction === 'ascending' ? -1 : 1;
           }
           if (a[sortConfig.key] > b[sortConfig.key]) {
               return sortConfig.direction === 'ascending' ? 1 : -1;
           }
           return 0;
       });
       
       setFilteredSubjects(filtered);
       setCurrentPage(1); // Reset to first page on filter change
   }, [subjects, searchTerm, searchField, sortConfig]);

    const handleDoubleClick = (e, subject, field) => {
        e.preventDefault();
        e.stopPropagation();
        
        const id = subject.id || subject.subject_code;
        setEditingCell({ id, field });
        setEditValue(subject[field]);
    };

    const handleBlur = (subject) => {
        if (editingCell.id && (editValue !== subject[editingCell.field])) {
            const updatedData = { 
                [editingCell.field]: editValue,
                original_subject_code: subject.subject_code
            };
            onUpdate(subject.subject_code, updatedData);
        }
        setEditingCell({ id: null, field: null });
    };

    const handleKeyDown = (e, subject) => {
        if (e.key === 'Enter') {
            e.target.blur();
        } else if (e.key === 'Escape') {
            setEditingCell({ id: null, field: null });
        }
    };
    
    // Calculate pagination values
    const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSubjects.slice(indexOfFirstItem, indexOfLastItem);
    
    // Page navigation
    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    
    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    
    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    // Export to CSV
    const exportToCSV = () => {
        // Format data for CSV
        const csvContent = [
            ['Subject Name', 'Subject Code', 'Type'], // Header row
            ...filteredSubjects.map(subject => [
                subject.subject_name,
                subject.subject_code,
                subject.undergraduate_subject ? 'Undergraduate' : 'Graduate'
            ])
        ].map(row => row.join(',')).join('\n');
        
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `subjects_export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Show a window of pages around current page
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            // Adjust window if at boundaries
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            // Add first page and ellipsis if needed
            if (startPage > 1) {
                pageNumbers.push(1);
                if (startPage > 2) pageNumbers.push('...');
            }
            
            // Add page numbers
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
            
            // Add last page and ellipsis if needed
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }
        
        return pageNumbers;
    };

    return (
        <div className="overflow-x-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white font-bold text-lg flex justify-between items-center">
                <span>Subject List</span>
                <div className="flex space-x-2">
                    <button 
                        onClick={resetSort}
                        className="bg-white/20 text-white px-3 py-1 rounded-md flex items-center text-sm font-medium hover:bg-white/30 transition-colors"
                    >
                        Reset Sort
                    </button>
                    <button 
                        onClick={exportToCSV}
                        className="bg-white text-indigo-700 px-3 py-1 rounded-md flex items-center text-sm font-medium hover:bg-indigo-100 transition-colors"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Export to CSV
                    </button>
                </div>
            </div>
            
            {/* Search and filter bar */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
                        />
                    </div>
                    <select
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 min-w-[140px]"
                    >
                        <option value="all">All Fields</option>
                        <option value="name">Subject Name</option>
                        <option value="code">Subject Code</option>
                    </select>
                </div>
            </div>
            
            <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                            onClick={() => requestSort('subject_name')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Subject Name</span>
                                {sortConfig.key === 'subject_name' && (
                                    sortConfig.direction === 'ascending' 
                                        ? <ArrowUpIcon className="h-4 w-4" />
                                        : <ArrowDownIcon className="h-4 w-4" />
                                )}
                            </div>
                        </th>
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                            onClick={() => requestSort('subject_code')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Subject Code</span>
                                {sortConfig.key === 'subject_code' && (
                                    sortConfig.direction === 'ascending' 
                                        ? <ArrowUpIcon className="h-4 w-4" />
                                        : <ArrowDownIcon className="h-4 w-4" />
                                )}
                            </div>
                        </th>
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                            onClick={() => requestSort('undergraduate_subject')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Subject Type</span>
                                {sortConfig.key === 'undergraduate_subject' && (
                                    sortConfig.direction === 'ascending' 
                                        ? <ArrowUpIcon className="h-4 w-4" />
                                        : <ArrowDownIcon className="h-4 w-4" />
                                )}
                            </div>
                        </th>
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                            onClick={() => requestSort('created_at')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Created Date</span>
                                {sortConfig.key === 'created_at' && (
                                    sortConfig.direction === 'ascending' 
                                        ? <ArrowUpIcon className="h-4 w-4" />
                                        : <ArrowDownIcon className="h-4 w-4" />
                                )}
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-gray-700 dark:text-gray-300 text-center">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                {currentItems.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                {searchTerm ? (
                                    <div className="flex flex-col items-center">
                                        <MagnifyingGlassIcon className="h-8 w-8 mb-2" />
                                        <p>No subjects match your search criteria.</p>
                                    </div>
                                ) : (
                                    <p>No subjects available.</p>
                                )}
                            </td>
                        </tr>
                    ) : (
                        currentItems.map((subject) => {
                            const subjectId = subject.id || subject.subject_code;
                            
                            return (
                                <tr 
                                    key={subjectId} 
                                    className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {editingCell.id === subjectId && editingCell.field === 'subject_name' ? (
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => handleBlur(subject)}
                                                onKeyDown={(e) => handleKeyDown(e, subject)}
                                                autoFocus
                                                className="w-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 p-1 rounded"
                                            />
                                        ) : (
                                            <div 
                                                onDoubleClick={(e) => handleDoubleClick(e, subject, 'subject_name')}
                                                className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                            >
                                                {subject.subject_name}
                                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    Double-click to edit
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                                        {editingCell.id === subjectId && editingCell.field === 'subject_code' ? (
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => handleBlur(subject)}
                                                onKeyDown={(e) => handleKeyDown(e, subject)}
                                                autoFocus
                                                className="w-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 p-1 rounded"
                                            />
                                        ) : (
                                            <div 
                                                onDoubleClick={(e) => handleDoubleClick(e, subject, 'subject_code')}
                                                className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                            >
                                                {subject.subject_code}
                                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    Double-click to edit
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            subject.undergraduate_subject 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                            {subject.undergraduate_subject ? 'Undergraduate' : 'Graduate'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                                        {subject.created_at ? new Date(subject.created_at).toLocaleDateString() : 'N/A'}
                                    </td> 
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => onDelete(subject.subject_code)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Delete subject"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
            
            {/* Pagination controls */}
            {totalPages > 1 && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button 
                            onClick={prevPage} 
                            disabled={currentPage === 1}
                            className={`${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'} relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 text-sm font-medium rounded-md`}
                        >
                            Previous
                        </button>
                        <button 
                            onClick={nextPage} 
                            disabled={currentPage === totalPages}
                            className={`${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'} ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 text-sm font-medium rounded-md`}
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredSubjects.length)}</span> of <span className="font-medium">{filteredSubjects.length}</span> subjects
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className={`${currentPage === 1 ? 'cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400`}
                                >
                                    <span className="sr-only">Previous</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                
                                {getPageNumbers().map((page, index) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-400">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={`page-${page}`}
                                            onClick={() => goToPage(page)}
                                            className={`${
                                                currentPage === page
                                                    ? 'z-10 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))}
                                
                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    className={`${currentPage === totalPages ? 'cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400`}
                                >
                                    <span className="sr-only">Next</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
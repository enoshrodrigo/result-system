import React, { useState, useEffect } from "react";
import Loading from "./Loading";
import { 
    MdChevronLeft,
    MdChevronRight,
    MdDelete, 
    MdVisibility,
    MdLightbulb,
    MdLightbulbOutline,
    MdSearch,
    MdFilterList,
    MdSort,
    MdCheck,
    MdClose,
    MdRefresh
} from "react-icons/md";

export default function ResultStatus(props) {
    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Filter and sort states
    const [statusFilter, setStatusFilter] = useState("all"); // "all", "online", "offline"
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("desc"); // "asc", "desc"
    const [showFilters, setShowFilters] = useState(false);
    
    // Filtered and sorted items
    const [filteredItems, setFilteredItems] = useState([]);

    // Update the status filter logic in the useEffect hook
    useEffect(() => {
        if (!props.shortLive) return;
        
        let filtered = [...props.shortLive];
        
        // Apply status filter - fixed to handle different data types
        if (statusFilter !== "all") {
            const isOnline = statusFilter === "online";
            filtered = filtered.filter(item => {
                // Convert item.live to boolean to ensure consistent comparison
                const itemIsLive = Boolean(item.live);
                return itemIsLive === isOnline;
            });
        }
        
        // Apply search filter (on batch_name and batch_code)
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                (item.batch_name && item.batch_name.toLowerCase().includes(term)) || 
                (item.batch_code && item.batch_code.toLowerCase().includes(term))
            );
        }
        
        // Apply sorting by creation date
        filtered.sort((a, b) => {
            // Handle cases where created_date might be missing
            if (!a.created_date) return sortOrder === "asc" ? -1 : 1;
            if (!b.created_date) return sortOrder === "asc" ? 1 : -1;
            
            const dateA = new Date(a.created_date);
            const dateB = new Date(b.created_date);
            
            if (sortOrder === "asc") {
                return dateA - dateB;  // Oldest first
            } else {
                return dateB - dateA;  // Newest first
            }
        });
        
        setFilteredItems(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [props.shortLive, statusFilter, searchTerm, sortOrder]);

    // Calculate the total number of pages
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
 
    // Get the items to display on the current page
    const currentItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset all filters
    const resetFilters = () => {
        setStatusFilter("all");
        setSearchTerm("");
        setSortOrder("desc");
    };

    // Function to go to the next page
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Function to go to the previous page
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Function to get a random gradient background
    const getRandomGradient = (index) => {
        const gradients = [
            "from-blue-400 to-indigo-500",
            "from-purple-400 to-indigo-500",
            "from-cyan-400 to-blue-500",
            "from-emerald-400 to-teal-500",
            "from-amber-400 to-orange-500",
            "from-pink-400 to-rose-500",
            "from-violet-400 to-purple-500",
            "from-sky-400 to-cyan-500"
        ];
        return gradients[index % gradients.length];
    };

    return (
        <div className="p-4">
            {/* Filters Section */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                    {/* Search Input */}
                    <div className="relative flex-grow max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MdSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by batch name or code..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm("")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <MdClose className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    
                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            showFilters 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        <MdFilterList className="h-5 w-5" />
                        Filters
                        {(statusFilter !== "all" || sortOrder !== "desc") && (
                            <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
                                {statusFilter !== "all" ? 1 : 0 + (sortOrder !== "desc" ? 1 : 0)}
                            </span>
                        )}
                    </button>
                    
                    {/* Reset Filters Button */}
                    {(statusFilter !== "all" || searchTerm || sortOrder !== "desc") && (
                        <button
                            onClick={resetFilters}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <MdRefresh className="h-5 w-5" />
                            Reset
                        </button>
                    )}
                </div>
                
                {/* Advanced Filter Options */}
                {showFilters && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStatusFilter("all")}
                                    className={`px-4 py-2 rounded-lg ${
                                        statusFilter === "all"
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setStatusFilter("online")}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                        statusFilter === "online"
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
                                    }`}
                                >
                                    <MdLightbulb className={statusFilter === "online" ? "text-yellow-300" : ""} />
                                    Online
                                </button>
                                <button
                                    onClick={() => setStatusFilter("offline")}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                        statusFilter === "offline"
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
                                    }`}
                                >
                                    <MdLightbulbOutline />
                                    Offline
                                </button>
                            </div>
                        </div>
                        
                        {/* Sort by Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Sort by Creation Date
                            </label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSortOrder("desc")}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                        sortOrder === "desc"
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
                                    }`}
                                >
                                    <MdSort className="rotate-180" />
                                    Newest First
                                </button>
                                <button
                                    onClick={() => setSortOrder("asc")}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                        sortOrder === "asc"
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
                                    }`}
                                >
                                    <MdSort />
                                    Oldest First
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Results Count */}
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    {filteredItems.length === 0 && props.shortLive?.length > 0 ? (
                        <p>No results match your filters. <button onClick={resetFilters} className="text-indigo-600 hover:underline">Reset filters</button></p>
                    ) : (
                        <p>Showing {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'} {props.shortLive?.length !== filteredItems.length ? `(filtered from ${props.shortLive?.length} total)` : ''}</p>
                    )}
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center mb-8">
                    <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1 || props.loading}
                            className={`relative inline-flex items-center px-3 py-2 rounded-l-md border ${
                                currentPage === 1 || props.loading
                                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <span className="sr-only">Previous</span>
                            <MdChevronLeft className="h-5 w-5" />
                        </button>
                        
                        {/* Page Numbers */}
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    disabled={props.loading}
                                    className={`relative inline-flex items-center px-4 py-2 border ${
                                        currentPage === pageNum
                                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        
                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages || props.loading}
                            className={`relative inline-flex items-center px-3 py-2 rounded-r-md border ${
                                currentPage === totalPages || props.loading
                                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <span className="sr-only">Next</span>
                            <MdChevronRight className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            )}

            {/* Batch Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {props.loading ? (
                    <div className="col-span-full flex justify-center">
                        <Loading />
                    </div>
                ) : currentItems.length > 0 ? (
                    currentItems.map((data, index) => (
                        <div
                            className={`bg-gradient-to-br ${getRandomGradient(index)} rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-xl flex flex-col min-h-[200px]`}
                            key={index}
                        >
                            {/* Card Header */}
                            <div className="p-6 flex-grow">
                                <h5 
                                    className="mb-3 text-xl font-bold text-white tracking-tight line-clamp-4"
                                    title={data.batch_name}
                                >
                                    {data.batch_name}
                                </h5>
                            </div>
                            <div className="bg-black/5 p-4 flex items-center justify-center">
                                <div className={`relative inline-flex ${props.loading ? "cursor-not-allowed" : "cursor-pointer"}`}>
                                    {/* Batch Information - Grid ensures consistent positioning */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <span className="text-sm text-white/80 bg-white/20 rounded-full px-3 py-1 text-center truncate" title={data.batch_code}>
                                            {data.batch_code}
                                        </span>
                                        <span className="text-sm text-white/80 bg-white/20 rounded-full px-3 py-1 text-center">
                                            {data.created_date ? new Date(data.created_date).toLocaleDateString() : "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Status Toggle and Action Buttons */}
                            <div className="bg-black/10 p-4 flex items-center justify-between">
                                {/* Toggle Switch */}
                                <label className={`relative inline-flex items-center ${props.loading ? "cursor-not-allowed" : "cursor-pointer"}`}>
                                    <input
                                        type="checkbox"
                                        value={data.batch_code}
                                        disabled={props.loading}
                                        className="sr-only peer"
                                        checked={data.live}
                                        onChange={(e) =>
                                            // Call the dashboard's toggle function to update the status
                                            props.toogleFunction(e, !data.live)
                                        }
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                    <span className="ml-3 text-sm font-medium text-white flex items-center">
                                        {data.live ? (
                                            <>
                                                <MdLightbulb className="mr-1 text-yellow-300" /> Online
                                            </>
                                        ) : (
                                            <>
                                                <MdLightbulbOutline className="mr-1" /> Offline
                                            </>
                                        )}
                                    </span>
                                </label>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            if (
                                                window.confirm(
                                                    "Are you sure you want to delete this batch? This action cannot be undone."
                                                )
                                            ) {
                                                props.deleteBatch(data.batch_code);
                                            }
                                        }}
                                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                        title="Delete Batch"
                                    >
                                        <MdDelete className="h-5 w-5" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            props.searchResult(data.batch_code);
                                        }}
                                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                        title="View Batch Results"
                                    >
                                        <MdVisibility className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">No batches found</p>
                    </div>
                )}
            </div>
        </div>
    );
}

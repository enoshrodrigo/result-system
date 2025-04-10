import React, { useState, useEffect, useRef } from "react";
import { 
  MdAddCircle, 
  MdRemoveCircle, 
  MdFileDownload, 
  MdRefresh, 
  MdSubject, 
  MdCheck,
  MdPreview,
  MdSearch,
  MdClear,
  MdErrorOutline
} from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import { debounce } from "lodash";

const TemplateGenerator = ({ batchCode, onClose }) => {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [customSubject, setCustomSubject] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  
  // Search related states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axios.post(route("searchSubjects"), {
          query,
          batch_code: batchCode
        });
        
        if (response.data.subjects) {
          setSearchResults(response.data.subjects);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error searching subjects:", error);
        toast.error("Failed to search subjects");
      } finally {
        setIsSearching(false);
      }
    }, 300)
  ).current;

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      debouncedSearch(query);
    } else {
      setSearchResults([]);
    }
  };

  // Handle click outside search results to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchResultsRef.current && 
        searchInputRef.current &&
        !searchResultsRef.current.contains(event.target) &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add a subject from search results
  const addSubjectFromSearch = (subject) => {
    // Check if already in selected subjects
    if (selectedSubjects.some(s => s.code === subject.subject_code)) {
      toast.error("Subject already added");
      return;
    }

    const newSubject = {
      id: subject.id || `search-${Date.now()}`,
      code: subject.subject_code,
      name: subject.subject_name,
      custom: false
    };

    setSelectedSubjects(prev => [...prev, newSubject]);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    toast.success("Subject added");
  };

  // Add custom subject
  const addCustomSubject = () => {
    if (!customSubject.trim()) {
      toast.error("Please enter a subject code");
      return;
    }

    // Check if already in the list
    if (selectedSubjects.some(s => s.code === customSubject.trim())) {
      toast.error("Subject already added");
      return;
    }

    const newSubject = {
      id: `custom-${Date.now()}`,
      code: customSubject.trim(),
      name: `Custom: ${customSubject.trim()}`,
      custom: true
    };

    setSelectedSubjects(prev => [...prev, newSubject]);
    setCustomSubject("");
    toast.success("Custom subject added");
  };

  // Remove a subject
  const removeSubject = (subjectId) => {
    setSelectedSubjects(prev => prev.filter(s => s.id !== subjectId));
  };

  // Generate CSV template
  const generateCSV = () => {
    if (selectedSubjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    // Generate headers
    const headers = ["first_name", "NIC_PO"];
    selectedSubjects.forEach(subject => {
      headers.push(subject.code);
    });
    headers.push("status");

    // Generate sample rows
    const rows = [
      ["John Doe", "NIC123456", ...selectedSubjects.map(() => "A"), "PASS"],
      ["Jane Smith", "NIC789012", ...selectedSubjects.map(() => "B+"), "PASS"],
      ["Bob Brown", "NIC345678", ...selectedSubjects.map(() => "C"), "FAIL"]
    ];

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${batchCode ? batchCode + '_' : ''}template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Template CSV generated and downloaded");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Generate Result Upload Template
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            Create a template CSV file with the exact format needed for uploading results.
            The template will include <strong>first_name</strong>, <strong>NIC_PO</strong>,
            your selected subjects, and <strong>status</strong> columns.
          </p>
        </div>

        {/* Subject Selection Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <MdSearch className="mr-1" /> Search Subjects
            </h4>

            {/* Search Input */}
            <div className="relative">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowResults(true)}
                  placeholder="Search by subject name or code"
                  className="w-full p-2 pl-8 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <MdSearch className="absolute left-2.5 top-3 text-gray-400" />
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <MdClear size={18} />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && (searchResults.length > 0 || isSearching) && (
                <div 
                  ref={searchResultsRef}
                  className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto"
                >
                  {isSearching ? (
                    <div className="p-3 text-center text-gray-500 dark:text-gray-400 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </div>
                  ) : (
                    <ul className="py-1">
                      {searchResults.map(subject => (
                        <li 
                          key={subject.id || subject.subject_code} 
                          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                          onClick={() => addSubjectFromSearch(subject)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {subject.subject_code}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {subject.subject_name}
                              </p>
                            </div>
                            <button 
                              className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
                              title="Add subject"
                            >
                              <MdAddCircle size={20} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* No Results Message */}
              {showResults && searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="mt-1 p-3 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 shadow-md rounded-md border border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col items-center">
                    <MdErrorOutline className="text-amber-500 mb-1" size={24} />
                    <p>No subjects found</p>
                    <p className="text-xs mt-1">Try a different search term or add as custom subject</p>
                  </div>
                </div>
              )}
            </div>

            {/* Search Tips */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              <p>Type at least 2 characters to search</p>
              <p>Search by subject name (e.g., "Math") or code (e.g., "MTH101")</p>
            </div>

            {/* Custom Subject Input */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Add Custom Subject</h4>
              <div className="flex">
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Enter subject code"
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={addCustomSubject}
                  className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-md"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              Selected Subjects ({selectedSubjects.length})
            </h4>

            <div className="bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md p-1 max-h-60 overflow-y-auto">
              {selectedSubjects.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                  {selectedSubjects.map((subject, index) => (
                    <li key={subject.id} className="py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 rounded-full text-xs font-medium mr-2">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{subject.code}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {subject.name}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeSubject(subject.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                        >
                          <MdRemoveCircle size={20} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                  No subjects selected yet
                </div>
              )}
            </div>

            {/* Preview toggle */}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="mt-4 flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <MdPreview className="mr-1" />
              {previewMode ? "Hide Preview" : "Show CSV Preview"}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        {previewMode && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">CSV Template Preview</h4>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-left text-xs font-medium text-indigo-800 dark:text-indigo-300 uppercase tracking-wider rounded-tl-md">
                      first_name
                    </th>
                    <th className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-left text-xs font-medium text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                      NIC_PO
                    </th>
                    {selectedSubjects.map(subject => (
                      <th key={subject.id} className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-left text-xs font-medium text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                        {subject.code}
                      </th>
                    ))}
                    <th className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-left text-xs font-medium text-indigo-800 dark:text-indigo-300 uppercase tracking-wider rounded-tr-md">
                      status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-3 py-2 text-gray-900 dark:text-gray-300">John Doe</td>
                    <td className="px-3 py-2 text-gray-900 dark:text-gray-300">NIC123456</td>
                    {selectedSubjects.map((subject, idx) => (
                      <td key={idx} className="px-3 py-2 text-gray-900 dark:text-gray-300">A</td>
                    ))}
                    <td className="px-3 py-2 text-gray-900 dark:text-gray-300">PASS</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-900 dark:text-gray-300">Jane Smith</td>
                    <td className="px-3 py-2 text-gray-900 dark:text-gray-300">NIC789012</td>
                    {selectedSubjects.map((subject, idx) => (
                      <td key={idx} className="px-3 py-2 text-gray-900 dark:text-gray-300">B+</td>
                    ))}
                    <td className="px-3 py-2 text-gray-900 dark:text-gray-300">PASS</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => {
              setSelectedSubjects([]);
              setSearchQuery("");
              setSearchResults([]);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center"
          >
            <MdRefresh className="mr-1" /> Reset
          </button>
          <button
            onClick={generateCSV}
            disabled={selectedSubjects.length === 0}
            className={`px-4 py-2 rounded-md flex items-center ${
              selectedSubjects.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400'
            }`}
          >
            <MdFileDownload className="mr-1" /> Download Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateGenerator;
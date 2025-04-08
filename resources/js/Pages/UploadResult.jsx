import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import Papa from 'papaparse';
import axios from "axios";
import VerifyMark from "./componments/VerifyMark";
import toast, { Toaster } from "react-hot-toast";
import { 
    MdCloudUpload, 
    MdCheckCircle, 
    MdWarning, 
    MdInfo,
    MdPeople,
    MdMenuBook,
    MdFileDownload,
    MdHelpOutline,
    MdErrorOutline
} from "react-icons/md";

function UploadResult(props) { 
    const [LoadingLogo, setLoading] = useState(false); 
    const [courses, setCourses] = useState(undefined);
    const [isValid, setIsValid] = useState(null);
    const [jsonData, setJsonData] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [fileSelected, setFileSelected] = useState(false);
    
    // State for subject verification
    const [subjectVerification, setSubjectVerification] = useState({
        isVerifying: false,
        verifiedSubjects: [],
        missingSubjects: [],
        verified: false
    });

    const handleFileUpload = async (file, course_code, batch_code, exam_name, batch_year) => {
        if (file) {
            setIsUploading(true);
            toast.loading('Processing your file...');
            
            Papa.parse(file, {
                complete: (result) => {
                    const rows = result.data;
                    const header = rows[0];
                    const firstNameIndex = 0;
                    const nicPoIndex = 1;
                    const statusIndex = header.indexOf('status');
                    const subjectCodes = header.slice(2, statusIndex).filter(subject => subject.trim() !== '');

                    const data = [];
                    for (let i = 1; i < rows.length; i++) {
                        const row = rows[i];
                        if (row[firstNameIndex] === '' || row[nicPoIndex] === '') break;
                        const student = {
                            first_name: row[firstNameIndex],
                            NIC_PO: row[nicPoIndex], 
                            status: row[statusIndex],
                            subjects: {},
                        };
                        subjectCodes.forEach((subject, index) => {
                            student.subjects[subject] = row[2 + index];
                        });
                        data.push(student);
                    }

                    const finalJson = {
                        course_code,
                        batch_code,
                        exam_name,
                        batch_year,
                        subject_codes: subjectCodes,
                        data,
                    };

                    setJsonData(finalJson); 
                    uploadJSON(finalJson);
                    setIsUploading(false);
                },
                header: false,
                error: (error) => {
                    toast.dismiss();
                    toast.error('Error parsing CSV file: ' + error.message);
                    setIsUploading(false);
                }
            });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileSelected(true);
            toast.loading('Analyzing file...');
            
            Papa.parse(file, {
                complete: (result) => {
                    toast.dismiss();
                    
                    const rows = result.data;
                    const header = rows[0];
                    const firstNameIndex = 0;
                    const nicPoIndex = 1;
                    
                    // Validate header format
                    if (!header.includes('status')) {
                        toast.error('CSV file must include a "status" column');
                        return;
                    }
                    
                    const statusIndex = header.indexOf('status');
                    const subjectCodes = header.slice(2, statusIndex).filter(subject => subject.trim() !== '');

                    if (subjectCodes.length === 0) {
                        toast.error('No subject codes found in CSV');
                        return;
                    }

                    const data = [];
                    for (let i = 1; i < rows.length; i++) {
                        const row = rows[i];
                        if (row[firstNameIndex] === '' || row[nicPoIndex] === '') break;
                        const student = {
                            first_name: row[firstNameIndex],
                            NIC_PO: row[nicPoIndex], 
                            status: row[statusIndex],
                            subjects: {},
                        };
                        subjectCodes.forEach((subject, index) => {
                            student.subjects[subject] = row[2 + index];
                        });
                        data.push(student);
                    }
                   
                    // Preview data
                    const previewData = data.slice(0, 5); // Show only 5 rows for preview
                    setPreviewData({ data: previewData, subjectCodes, totalStudents: data.length });
                    
                    toast.success(`Found ${data.length} students and ${subjectCodes.length} subjects`);

                    // Verify subject codes if batch code is valid
                    const batchCode = document.getElementById("batch_code").value;
                    if (batchCode && isValid) {
                        verifySubjects(subjectCodes, batchCode);
                    }
                },
                header: false,
                error: (error) => {
                    toast.dismiss();
                    toast.error('Error parsing CSV file: ' + error.message);
                }
            });
        } else {
            setFileSelected(false);
        }
    };

    // Verify subjects with the backend
    const verifySubjects = async (subjectCodes, batchCode) => {
        setSubjectVerification(prev => ({ ...prev, isVerifying: true, verified: false }));
        
        try {
            const response = await axios.post(route("verifySubjects"), {
                subject_codes: subjectCodes,
                batch_code: batchCode
            });
            
            setSubjectVerification({
                isVerifying: false,
                verifiedSubjects: response.data.verified_subjects || [],
                missingSubjects: response.data.missing_subjects || [],
                verified: true
            });
            
            // If there are missing subjects, show a warning toast
            if (response.data.missing_subjects?.length > 0) {
                toast.error(`${response.data.missing_subjects.length} subject(s) not found in this batch`);
            } else {
                toast.success('All subjects verified successfully!');
            }
        } catch (error) {
            console.error("Error verifying subjects:", error);
            toast.error("Failed to verify subjects");
            setSubjectVerification({
                isVerifying: false,
                verifiedSubjects: [],
                missingSubjects: subjectCodes.map(code => ({ code })),
                verified: true
            });
        }
    };

    const uploadJSON = async (jsonData) => {
         //send the csv data to the server  
         const file = document.getElementById("file").files[0];
         const formData = new FormData();
         formData.append('jsonData', JSON.stringify(jsonData));
         formData.append('CSVFile', file);
       
         toast.loading('Uploading results...');
         
         await axios.post(route("uploadjson"), formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((res) => {
            toast.dismiss();
            if(res.data.message === "success"){
                toast.success("Results uploaded successfully");
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                console.log(res.data);
                toast.error('Failed to upload results');
            }
        })
        .catch((error) => {
            toast.dismiss();
            toast.error('Error uploading: ' + (error.response?.data?.message || 'Unknown error'));
        });
    };

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            await axios
                .post(route("getcourses"))
                .then((res) => {
                    setCourses(res.data.courses);
                    setLoading(false);        
                })
                .catch((err) => console.log(err));
        };
        fetch();
    }, []);

    const { data, setData, post, errors } = useForm({
        course: 123,
        level: 1,
        fileresult: null,
        semseter: null,
    });

    const submit = async (e) => {
        e.preventDefault();
        const course_code = document.getElementById("course").value;
        const batch_code = document.getElementById("batch_code").value;
        const exam_name = document.getElementById("batch_name").value;
        const batch_year = document.getElementById("batch_year").value; 
        const file = document.getElementById("file").files[0];
        
        if(course_code === "Select Course" || batch_code === "" || exam_name === "" || batch_year === "" || file === null){
            toast.error("Please fill all fields");
            return;
        } 
        
        await handleFileUpload(file, course_code, batch_code, exam_name, batch_year);
    };

    const isBatchCodeAvailable = async (batch_code) => {
        if(batch_code.length < 6 || batch_code.length > 18){
            setIsValid(false);
            setSubjectVerification({
                isVerifying: false,
                verifiedSubjects: [],
                missingSubjects: [],
                verified: false
            });
            return;
        }
        await axios.post(route("checkBatchCode"), { batch_code: batch_code })
        .then((res) => {
            setIsValid(res.data.batch_code);
            
            // If we have subject codes from a file and batch code is valid, verify them
            if (res.data.batch_code && previewData?.subjectCodes) {
                verifySubjects(previewData.subjectCodes, batch_code);
            }
        })
        .catch((err) => console.log(err));
    };

    // Sample CSV download
    const downloadSampleCSV = () => {
        const sampleContent = 
`first_name,NIC_PO,SUB001,SUB002,SUB003,status
John Doe,NIC123456,A,B+,C,PASS
Jane Smith,NIC789012,A+,A,B+,PASS
Adam Jones,NIC345678,C+,B,D,FAIL`;

        const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'sample_results.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AuthenticatedLayout auth={props.auth} errors={props.errors} header={
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                BCI Result Management System
            </h2>
        }>
            <Head title="Upload Results" />
            <div className="py-12">
                <Toaster position="top-right" />
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Card */}
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-lg shadow-lg mb-6 overflow-hidden">
                        <div className="px-6 py-8 sm:px-10">
                            <div className="flex flex-col sm:flex-row items-center justify-between">
                                <div className="mb-4 sm:mb-0">
                                    <h2 className="text-3xl font-bold text-white">Upload Exam Results</h2>
                                    <p className="mt-2 text-indigo-100">Import results from CSV file and assign them to students</p>
                                </div>
                                <button 
                                    onClick={() => setShowInstructions(!showInstructions)}
                                    className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md text-white transition"
                                >
                                    <MdInfo className="mr-2" />
                                    {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CSV Instructions Card */}
                    {showInstructions && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                                    <MdHelpOutline className="mr-2 text-indigo-600 dark:text-indigo-400" />
                                    CSV File Format Instructions
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                                        <h4 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">File Structure</h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Your CSV file should have columns in this order:
                                        </p>
                                        <ol className="mt-2 list-decimal list-inside text-sm text-gray-700 dark:text-gray-300">
                                            <li>first_name(Student Name)</li>
                                            <li>NIC_PO (ID Number)</li>
                                            <li>Subject Grades (one column per subject code)</li>
                                            <li>Status (PASS/FAIL or MESSAGE)</li>
                                        </ol>
                                    </div>
                                    
                                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                        <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Important Notes</h4>
                                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                            <li>The file must include a <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">status</code> column</li>
                                            <li>Subject codes must match the batch subjects</li>
                                            <li>Each student must have a unique NIC/PO number</li>
                                            <li>All subject grades are required if not fill as -</li>
                                            <li> Format NIC/PO numbers as text strings to prevent scientific notation conversion (e.g., "2e+23").</li>
                                        </ul>
                                    </div>
                                    
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                        <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Example Format</h4>
                                        <div className="text-xs overflow-auto bg-white dark:bg-gray-900 rounded border p-2 text-gray-800 dark:text-gray-200">
                                            <pre>Student Name,NIC_PO,SUB001,SUB002,status
John Doe,NIC123456,A,B+,PASS
Jane Smith,NIC789012,A+,B,PASS</pre>
                                        </div>
                                        <button 
                                            onClick={downloadSampleCSV}
                                            className="mt-3 flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            <MdFileDownload className="mr-1" />
                                            Download Sample CSV
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Form Card */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form className="text-gray-900 dark:text-gray-200" onSubmit={submit} method="post">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Course Selection */}
                                    <div>
                                        <label htmlFor="course" className="block mb-2 text-sm font-medium">
                                            Select Course
                                        </label>
                                        <select 
                                            required 
                                            id="course" 
                                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 transition-colors"
                                        >
                                            {courses ? (
                                                <>
                                                    <option>Select Course</option>
                                                    {courses.map((data, index) => (
                                                        <option key={index} value={data.course_code}>{data.course_name}</option>
                                                    ))}
                                                </>
                                            ) : (
                                                <option>Loading courses...</option>
                                            )}
                                        </select>
                                    </div>
                                    
                                    {/* Batch Code */}
                                    <div>
                                        <label htmlFor="batch_code" className="block mb-2 text-sm font-medium">
                                            Batch Code
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                placeholder="Enter Batch Code" 
                                                required 
                                                id="batch_code" 
                                                onChange={(e) => isBatchCodeAvailable(e.target.value)} 
                                                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 transition-colors pr-10"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <VerifyMark isValid={isValid} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Examination Batch Name */}
                                    <div>
                                        <label htmlFor="batch_name" className="block mb-2 text-sm font-medium">
                                            Examination Batch Name
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Enter Examination Batch Name" 
                                            required 
                                            id="batch_name" 
                                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 transition-colors"
                                        />
                                    </div>
                                    
                                    {/* Batch Year */}
                                    <div>
                                        <label htmlFor="batch_year" className="block mb-2 text-sm font-medium">
                                            Batch Year
                                        </label>
                                        <input 
                                            type="number" 
                                            placeholder="Enter Batch Year" 
                                            required 
                                            min={2015} 
                                            max={2040} 
                                            id="batch_year" 
                                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 transition-colors"
                                        />
                                    </div>
                                </div>
                                
                                {/* File Upload */}
                                <div className="mb-6">
                                    <label htmlFor="file" className="block mb-2 text-sm font-medium">
                                        Upload Results CSV File
                                    </label>
                                    <div className={`border-2 border-dashed rounded-lg ${fileSelected ? 'border-green-400 bg-green-50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} transition-colors p-6 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50`}>
                                        <input 
                                            type="file" 
                                            id="file" 
                                            accept=".csv" 
                                            required 
                                            onChange={handleFileChange} 
                                            className="hidden"
                                        />
                                        <label htmlFor="file" className="cursor-pointer flex flex-col items-center justify-center">
                                            {fileSelected ? (
                                                <>
                                                    <MdCheckCircle className="w-10 h-10 mb-3 text-green-500" />
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">File selected! Click to change.</p>
                                                </>
                                            ) : (
                                                <>
                                                    <MdCloudUpload className="w-10 h-10 mb-3 text-gray-400" />
                                                    <p className="mb-2 text-sm text-gray-700 dark:text-gray-300"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">CSV file only</p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                                
                                {/* Subject verification results */}
                                {subjectVerification.isVerifying && (
                                    <div className="mb-6 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-lg">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying subjects...
                                    </div>
                                )}

                                {subjectVerification.verified && !subjectVerification.isVerifying && (
                                    <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Subject Verification Results:</h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Verified subjects */}
                                            <div className={`rounded-lg p-3 ${subjectVerification.verifiedSubjects.length > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-600'}`}>
                                                <h5 className="text-green-600 dark:text-green-400 flex items-center mb-2">
                                                    <MdCheckCircle className="h-5 w-5 mr-1" />
                                                    {subjectVerification.verifiedSubjects.length} Found Subjects
                                                </h5>
                                                {subjectVerification.verifiedSubjects.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {subjectVerification.verifiedSubjects.map((subject, idx) => (
                                                            <div 
                                                                key={idx} 
                                                                className="text-xs rounded-full bg-green-100 dark:bg-green-800/40 text-green-800 dark:text-green-300 px-2 py-1 flex items-center"
                                                            >
                                                                <span className="font-medium mr-1">{subject.code}</span>
                                                                <span className="opacity-70">({subject.name})</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No subjects found in batch</p>
                                                )}
                                            </div>
                                            
                                            {/* Missing subjects */}
                                            <div className={`rounded-lg p-3 ${subjectVerification.missingSubjects.length > 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-gray-100 dark:bg-gray-600'}`}>
                                                <h5 className={`flex items-center mb-2 ${subjectVerification.missingSubjects.length > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {subjectVerification.missingSubjects.length > 0 ? (
                                                        <MdWarning className="h-5 w-5 mr-1" />
                                                    ) : (
                                                        <MdCheckCircle className="h-5 w-5 mr-1" />
                                                    )}
                                                    {subjectVerification.missingSubjects.length} Missing Subjects
                                                </h5>
                                                {subjectVerification.missingSubjects.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {subjectVerification.missingSubjects.map((subject, idx) => (
                                                            <div 
                                                                key={idx} 
                                                                className="text-xs rounded-full bg-red-100 dark:bg-red-800/40 text-red-800 dark:text-red-300 px-2 py-1"
                                                            >
                                                                {subject.code}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">All subjects verified</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {subjectVerification.missingSubjects.length > 0 && (
                                            <div className="mt-4 flex items-start bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-sm text-amber-800 dark:text-amber-300">
                                                <MdErrorOutline className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-medium">Warning: Missing subjects detected!</p>
                                                    <p className="mt-1">Some subject codes in your CSV file don't exist in the selected batch. Please verify your CSV file or add these subjects to the batch before uploading.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Submit button */}
                                <button 
                                    type="submit" 
                                    className={`mt-2 flex items-center px-6 py-3 rounded-lg font-bold text-white shadow-md ${
                                        isValid === false || isValid === null 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                                    } transition-all`} 
                                    disabled={isValid === false || isValid === null || isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <MdCloudUpload className="mr-2 h-5 w-5" />
                                            Upload Results
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    {/* Preview Card */}
                    {previewData && (
                        <div className="mt-8 bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
                                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                                        Data Preview
                                    </span>
                                </h3>
                                
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {/* Students card */}
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-4 text-white flex items-center">
                                        <div className="rounded-full bg-white/20 p-3 mr-4">
                                            <MdPeople className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-white/80 text-sm font-medium">Total Students</p>
                                            <p className="text-2xl font-bold">{previewData.totalStudents}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Subjects card */}
                                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-4 text-white flex items-center">
                                        <div className="rounded-full bg-white/20 p-3 mr-4">
                                            <MdMenuBook className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-white/80 text-sm font-medium">Total Subjects</p>
                                            <p className="text-2xl font-bold">{previewData.subjectCodes.length}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Preview table */}
                                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">NIC/PO</th>
                                                {previewData.subjectCodes.map((subject, index) => (
                                                    <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                                                        <div className="flex flex-col">
                                                            <span>{subject}</span>
                                                            <span className="text-[10px] font-normal normal-case text-gray-400 dark:text-gray-500">
                                                                Grade
                                                            </span>
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {previewData.data.map((student, index) => (
                                                <tr 
                                                    key={index}
                                                    className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        {student.first_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-300">
                                                        {student.NIC_PO}
                                                    </td>
                                                    {previewData.subjectCodes.map((subject, subIndex) => (
                                                        <td 
                                                            key={subIndex} 
                                                            className="px-6 py-4 whitespace-nowrap text-sm"
                                                        >
                                                            <span 
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    student.subjects[subject] === 'A' || student.subjects[subject] === 'A+' 
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                                                                        : student.subjects[subject] === 'F'
                                                                        ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                                                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300'
                                                                }`}
                                                            >
                                                                {student.subjects[subject]}
                                                            </span>
                                                        </td>
                                                    ))}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span 
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                student.status?.toUpperCase().includes('PASS')
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                                                            }`}
                                                        >
                                                            {student.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Preview notice */}
                                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                                    Showing preview of {previewData.data.length} out of {previewData.totalStudents} students
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default UploadResult;
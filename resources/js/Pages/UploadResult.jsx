import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import Papa from 'papaparse';
import axios from "axios";
import VerifyMark from "./componments/VerifyMark";
import toast, { Toaster } from "react-hot-toast";

function UploadResult(props) { 
    const [LoadingLogo, setLoading] = useState(false); 
    const [courses, setCourses] = useState(undefined);
    const [isValid, setIsValid] = useState(null);
    const [jsonData, setJsonData] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    // New state for subject verification
    const [subjectVerification, setSubjectVerification] = useState({
        isVerifying: false,
        verifiedSubjects: [],
        missingSubjects: [],
        verified: false
    });

    const handleFileUpload = async (file, course_code, batch_code, exam_name, batch_year) => {
        if (file) {
            setIsUploading(true);
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
            });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
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
                   
                    // Preview data
                    const previewData = data.slice(0, 10);
                    setPreviewData({ data: previewData, subjectCodes, totalStudents: data.length });

                    // Verify subject codes if batch code is valid
                    const batchCode = document.getElementById("batch_code").value;
                    if (batchCode && isValid) {
                        verifySubjects(subjectCodes, batchCode);
                    }
                },
                header: false,
            });
        }
    };

    // New function to verify subjects with the backend
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
       
         await axios.post(route("uploadjson"), formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((res) => {
            console.log(res);
            if(res.data.message === "success"){
              //display success message wih toast  few seconds
              
                toast.success("Results uploaded successfully");
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                toast.error('Failed to upload results');
            }
        
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
            alert("Please fill all fields")
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

    return (
        <AuthenticatedLayout auth={props.auth} errors={props.errors} header={
            <h2 className="font-semibold text-xl text-gray-800  dark:text-gray-200 leading-tight">
                BCI Result Management System
            </h2>
        }>
            <Head title="Add results" />
            <div className="py-12">
                <Toaster />
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form className="text-gray-900 dark:text-gray-200" onSubmit={submit} method="post">  
                            <label htmlFor="course" className="block mb-2 text-sm font-medium">Select course</label>
                            <select required id="course" className="bg-gray-50 dark:bg-gray-700 border mb-5 border-gray-300 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5">
                                {courses ? (
                                    <>
                                        <option>Select Course</option>
                                        {courses.map((data, index) => (
                                            <option key={index} value={data.course_code}>{data.course_name}</option>
                                        ))}
                                    </>) : (<option>Loading</option>)}
                            </select>
                            <div className=" flex justify-between items-center">
                                <input type="text" placeholder="Enter Batch Code" required id="batch_code" onChange={(e) => isBatchCodeAvailable(e.target.value)} className="bg-gray-50 dark:bg-gray-700 border mb-5 border-gray-300 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5" />
                                <div className="flex justify-between items-center  right-0"> 
                            <VerifyMark isValid={isValid} />
                                </div>
                            </div>
                            <input type="text" placeholder="Enter Examination Batch Name" required id="batch_name" className="bg-gray-50 dark:bg-gray-700 border mb-5 border-gray-300 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5" />
                            <input type="number" placeholder="Enter Batch Year" required min={2015} max={2040} id="batch_year" className="bg-gray-50 dark:bg-gray-700 border mb-5 border-gray-300 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5" />
                            <label htmlFor="file" className="block mb-2 text-sm font-medium">Upload result</label>
                            <input type="file" id="file" accept=".csv" required onChange={handleFileChange} className="bg-gray-50 dark:bg-gray-700 border mb-5 border-gray-300 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5" />
                            
                            {/* Subject verification results */}
                            {subjectVerification.isVerifying && (
                                <div className="flex items-center text-blue-500 dark:text-blue-300 mb-4">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying subjects...
                                </div>
                            )}

                            {subjectVerification.verified && !subjectVerification.isVerifying && (
                                <div className="mb-5 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Subject Verification Results:</h4>
                                    
                                    {/* Verified subjects */}
                                    {subjectVerification.verifiedSubjects.length > 0 && (
                                        <div className="mb-3">
                                            <h5 className="text-green-600 dark:text-green-400 flex items-center">
                                                <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                                </svg>
                                                {subjectVerification.verifiedSubjects.length} Found Subjects:
                                            </h5>
                                            <div className="grid grid-cols-2 gap-2 mt-1">
                                                {subjectVerification.verifiedSubjects.map((subject, idx) => (
                                                    <div key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                                                        <span className="font-medium">{subject.name}</span>
                                                        <span className="ml-2 text-xs text-gray-500">({subject.code})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Missing subjects */}
                                    {subjectVerification.missingSubjects.length > 0 && (
                                        <div className="mb-2">
                                            <h5 className="text-yellow-500 dark:text-yellow-400 flex items-center">
                                                <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                                </svg>
                                                {subjectVerification.missingSubjects.length} Missing Subjects:
                                            </h5>
                                            <div className="grid grid-cols-2 gap-2 mt-1">
                                                {subjectVerification.missingSubjects.map((subject, idx) => (
                                                    <div key={idx} className="text-sm text-red-600 dark:text-red-400">
                                                        {subject.code}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={isValid === false || isValid === null}>{isUploading ? "Uploading..." : "Upload"}</button>
                        </form>
                        {previewData && (
                            <div className="mt-5">
                            <h3 className="text-lg font-semibold mb-4  text-indigo-100" >Preview</h3>
  
  {/* Stats Cards in a grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    {/* Students card */}
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-4 text-white flex items-center">
      <div className="rounded-full bg-white/20 p-3 mr-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <div>
        <p className="text-white/80 text-sm font-medium">Total Students</p>
        <p className="text-2xl font-bold">{previewData.totalStudents}</p>
      </div>
    </div>
    
    {/* Subjects card */}
    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-4 text-white flex items-center">
      <div className="rounded-full bg-white/20 p-3 mr-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <div>
        <p className="text-white/80 text-sm font-medium">Total Subjects</p>
        <p className="text-2xl font-bold">{previewData.subjectCodes.length}</p>
      </div>
    </div>
  </div>
                                {/* Preview table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">NIC/PO</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Status</th>
                                                {previewData.subjectCodes.map((subject, index) => (
                                                    <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">{subject}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {previewData.data.map((student, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{student.first_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">{student.NIC_PO}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">{student.status}</td>
                                                    {previewData.subjectCodes.map((subject, subIndex) => (
                                                        <td key={subIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">{student.subjects[subject]}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default UploadResult;
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
                   
                    //split the preview data into 5 students
                    const previewData = data.slice(0, 5);
                    setPreviewData({ data: previewData, subjectCodes });

                },
                header: false,
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
            return;
        }
        await axios.post(route("checkBatchCode"), { batch_code: batch_code })
        .then((res) => {
            setIsValid(res.data.batch_code);
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
                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={isValid === false || isValid === null}>{isUploading ? "Uploading..." : "Upload"}</button>
                        </form>
                        {previewData && (
                            <div className="mt-5">
                                <h3 className="text-lg font-semibold">Preview</h3>
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
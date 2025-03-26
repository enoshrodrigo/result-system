import { Head, router, useForm } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Loading from "./componments/Loading";
import SubjectTable from "./componments/SubjectTable";

export default function AddSubject(props) {
    const { data, setData, post, errors, progress, recentlySucces } = useForm({
        subjectName: "",
        subjectCode: "",
        undergraduate_subject: false
    });
    
    const [LoadingLogo, setLoading] = useState(false);
    const [text, setText] = useState("Loading...");
    const [allsubjects, setAllsubjects] = useState(undefined);

    const fetchSubjects = async () => {
        setLoading(true);
        setText("Loading subjects...")
        await axios
            .post(route("allsubjectstatus"))
            .then((res) => {
                setAllsubjects(res.data.all_subjects);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
                setText("Failed to load subjects");
            });
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const deleteSubject = async (subject_code) => {
        setLoading(true);
        setText("Deleting subject...")
        await axios
            .post(route("deletesubject"), { 'subject_code': subject_code })
            .then((res) => {
                fetchSubjects();
                setText("Subject deleted successfully");
                setTimeout(() => setLoading(false), 1000);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
                setText("Failed to delete subject");
            });
    };

    const updateSubject = async (subject_code, updatedData) => {
        setLoading(true);
        setText("Updating subject...")
        await axios
            .post(route("updatesubject"), { 
                'subject_code': subject_code,  // Original subject code
                ...updatedData
            })
            .then((res) => {
                fetchSubjects();
                setText("Subject updated successfully");
                setTimeout(() => setLoading(false), 1000);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
                setText("Failed to update subject");
            });
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setText("Adding new subject...")
        
        router.post(route('addSubject'), data, {
            onStart: () => setLoading(true),
            onSuccess: () => {
                fetchSubjects();
                setData({
                    subjectName: "",
                    subjectCode: "",
                    undergraduate_subject: false
                });
                setLoading(false);
            },
            onError: () => {
                alert("Something went wrong");
                setLoading(false);
            }
        });
    };

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Subject Management
                </h2>
            }
        >
            <Head title="Manage Subjects" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1 rounded-lg shadow-lg mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                            <div className="max-w-3xl mx-auto">
                                <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                                    BCI Subject Management Portal
                                </h1>
                                
                                <div className="relative p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
                                    <Loading loading={LoadingLogo} text={text} />
                                    
                                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2">
                                        Add New Subject
                                    </h2>
                                    
                                    <form 
                                        className="text-gray-900 dark:text-white" 
                                        method="post"  
                                        onSubmit={handleSubmit}
                                    >
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    Subject Name
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                                                        e.g. Fundamentals of Programming
                                                    </span>
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={data.subjectName}
                                                    onChange={(e) => setData('subjectName', e.target.value)}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                                                    placeholder="Enter subject name"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    Subject Code
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                                                        e.g. BSIT_11024(Dont use any spaces)
                                                    </span>
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={data.subjectCode}
                                                    onChange={(e) => setData('subjectCode', e.target.value)}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                                                    placeholder="Enter subject code"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center mt-4 hidden">
                                            <input 
                                                id="undergraduate-checkbox" 
                                                type="checkbox" 
                                                checked={data.undergraduate_subject}
                                                onChange={(e) => setData('undergraduate_subject', e.target.checked)} 
                                                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600   " 
                                            />
                                            <label htmlFor="undergraduate-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                Undergraduate Subject
                                            </label>
                                        </div>

                                        <div className="flex justify-end mt-6 space-x-3">
                                            <button
                                                type="reset"
                                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors duration-200"
                                                onClick={() => {
                                                    setData({
                                                        subjectName: "",
                                                        subjectCode: "",
                                                        undergraduate_subject: false
                                                    });
                                                }}
                                            >
                                                Reset
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={LoadingLogo}
                                                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-70"
                                            >
                                                Add Subject
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    {allsubjects && (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg">
                            <SubjectTable 
                                subjects={allsubjects} 
                                onDelete={deleteSubject}
                                onUpdate={updateSubject}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
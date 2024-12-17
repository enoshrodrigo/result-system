import React, { useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router } from "@inertiajs/react";
import axios from "axios";
import { useState } from "react"; 
export default function AddNewIntake(props) {
    const { data, setData, post, errors, progress, recentlySucces } = useForm({
        mainCourse: null,
        batchName: null,
        batchCode: null,
        batchYear: null,
        subjects: [], // Array to store selected subjects
      });

const [allCourses,setallCourses]=useState(undefined)
const [allSubjects,setallSubjects]=useState(undefined)
const [degree,setDegree]=useState(undefined)


    useEffect(() => {
        const fetch = async () => {
            await axios
                .post(route("allShortcourses"))
                .then(async(resCourse) => {
                    
                    
                        setallCourses(resCourse.data.allcourses);
                        
                   
                })
                .catch((err) => console.log(err));
        };
        const fetchSubs = async () => { 
             await axios .post(route('reqsubjects'))
                    .then((res)=>{ 
                        setallSubjects(res.data.subjects)
                        console.log(res.data)
                    }).catch((e)=>console.log(e))
                
        };
        fetch();
        fetchSubs();
    }, []);

    const addSubject = () => {
        setData("subjects", [...data.subjects, null]);
      };
    
      const handleSubjectChange = (index, value) => {
        const updatedSubjects = [...data.subjects];
        updatedSubjects[index] = value;
        setData("subjects", updatedSubjects);
      };
    
      const handleSubmit = async(e) => {
        e.preventDefault();
        //  setData('subjects',Array.from(new Set(data.subjects)))
        // Your submit logic here
        console.log("Form Data:", data);
        router.post(route('addShortCourse', data));

      };
      const deleteSubject = (index) => {
        const updatedSubjects = [...data.subjects];
        updatedSubjects.splice(index, 1);
        setData("subjects", updatedSubjects);
      };

      
    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    BCI Result Management System
                </h2>
            }
        >
            <Head title="Add reults" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form
                                className="max-w-sm mx-auto"
                                onSubmit={handleSubmit}
                                method="post"
                            >
                              
                                <label
                                    htmlFor="selectCourse"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Select Course
                                </label>

                                <select 
                                // value=""
                                required
                                onChange={(e)=>{setData('mainCourse',e.target.value)}}
                                className="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    {
                                        allCourses?
                                        <>
                                        <option value={""}>Select Short Course</option>
                                        {allCourses.map((data,index)=>(
                                           <option key={index} value={data.course_code} >{data.course_name}</option> 
                                        ))}
                                        
                                        </>:<option>Loading</option>
                                    }
                                    
                                </select>


                                <label
                                    htmlFor="batchName"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Batch Name <div className="text-gray-800 dark:text-gray-500">eg-2023 intake 1 Aquinas Diploma in English Level 2</div>
                                </label>

                                 <input
                                 required
                                 type="text"
                                  onChange={(e)=>{setData('batchName',e.target.value)}}
                                className="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />  


                                 <label
                                htmlFor="batchCode"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                Batch Code<div className="text-gray-800 dark:text-gray-500">eg-AA2321</div>
                            </label>

                             <input
                             required
                             type="text"
                             onChange={(e)=>{setData('batchCode',e.target.value)}}
                            className="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />

                                   <label
                                    htmlFor="batchYear"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Batch Year<div className="text-gray-800 dark:text-gray-500">eg-2023</div>
                                </label>

                                 <input
                                 required
                                 type="number"
                                 min={2015}
                                 max={2040}
                                  onChange={(e)=>{setData('batchYear',e.target.value)}}
                                className="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />

 

<label
                  htmlFor="selectCourse"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Select Subjects<div className="text-gray-800 dark:text-gray-400">Duplicate Values Will Remove</div>
                </label>
    
                {data.subjects.map((subject, index) => (
              <>    <button
      type="button"
      onClick={() => deleteSubject(index)}
      className="bg-gray-500 hover:bg-red-700 text-whitescale-100   font-bold    pr-2 pl-2 float-right mb-1  rounded"
    >
      X
    </button>
    <div key={index} className="mb-5  ">
                   
                        <select
                          required
                          value={subject || ""}
                          onChange={(e) => handleSubjectChange(index, e.target.value)}
                          className="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                          {allSubjects ? (
                            <>
                              <option value="">Select Subject</option>
                              {allSubjects.map((data, index) => (
                                <option key={index} value={data.subject_code}>
                                  {data.subject_name} ({data.subject_code})
                                </option>
                              ))}
                            </>
                          ) : (
                            <option>Loading</option>
                          )}
                        </select>
                  
               
      </div>
      </>     ))}

                {/* Add Subject Button */}
                <button
                  type="button"
                  onClick={addSubject}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-5"
                >
                  Add Subject
                </button>
                                   <div className="flex justify-end mt-2">
                                    <button
                                        type="submit"
                                        className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        disabled={progress}
                                    >
                                        Submit
                                    </button>
                                    <button
                                    // disabled={levels}
                                       type="reset"
                                        className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
                                        onClick={()=>{
                                             
                                        }}
                                       
                                    >
                                        Reset
                                    </button>

                                    
                                </div>
                                
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
 
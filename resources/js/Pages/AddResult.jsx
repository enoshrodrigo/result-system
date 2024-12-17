import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router } from "@inertiajs/react";
// import { useForm } from '@inertiajs/react/types';
// import { useForm } from '@inertiajs/react/types';
import axios from "axios";
import SubjectVerifyBox from "./componments/SubjectVerifyBox";
import { unary } from "lodash";
import Loading from "./componments/Loading";
function AddResult(props) {
    const [courses, setCourses] = useState(undefined);
    const [levels, setLevels] = useState(true);
    const [batch, setBatch] = useState(undefined);
    const [LoadingLogo, setLoading] = useState(undefined);
    const [subjects, setsubjects] = useState(undefined);
    const [text,setText]=useState("Loading...")

   
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

    const onchangeCourse = async (e) => {
        document.getElementById('level').value="end"
        setsubjects(undefined)
        await axios
            .post(route("getlevels"), { course_id: e.target.value })
            .then( async(res) => {
                  
                setBatch(res.data.batchs);

                // console.log(res.data);
            })
            .catch(err=> console.log(err));
    };

    const onchangelevel =async (e)=>{
        setLoading(true)
        await axios
        .post(route("subjects"),{batch_code: e.target.value})
        .then(async (res)=>{
            // setBatch(res.data.batchs);
         
        setsubjects(res.data.subjects)
        setLoading(false);

            // setLoading(res.data.semesterOrIntake)

            // console.log(res.data)

        }).catch((err)=>console.log(err));
    };
 


    
    const { data, setData, post, errors, progress, recentlySucces } = useForm({
        course: 123,
        level: 1,
        fileresult: null,
        semseter:null,
    });

    const submit = async (e) => {
        e.preventDefault();
        const course = document.getElementById("course").value
        const level  = document.getElementById("level").value
        const file   = document.getElementById("file").files[0]
          console.log(document.getElementById("file").files[0]);
          setData('course',course);
          setData('level',level)
          setData('fileresult',file)
        router.post(route("uploadcsv"),data,{
                onStart:()=>setLoading(true),
                onSuccess:()=>setLoading(false)
             })

        // axios.post(router(uploadcsv),{"level":document.getElementById("course").value,"course":document.getElementById("level").value,fileresult:document.getElementById("file").files[0]})
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
                        <div className={!LoadingLogo?" mx-auto  max-w-md p-4  relative items-center block    bg-white border border-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-800":"mx-auto relative items-center block  max-w-md p-4   bg-white border border-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-800  dark:hover:bg-gray-700"}  >
                            <form
                                className={"text-gray-900 dark:text-white"}
                                onSubmit={submit}
                                method="post"
                               
                            >
                               <Loading loading={LoadingLogo} text={text}/> 
                               
                                <label
                                    htmlFor="course"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Select course
                                </label>
                               { <select
                            required
                                    id="course"
                                    onChange={(e) => {
                                        setData("course", e.target.value),
                                            onchangeCourse(e);
                                          
                                              
                                             
                                    }}
                                    className="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                >
                                    
                                    {courses ? (
                                    <>
                                    <option value="end">Select Course</option>
                                       { courses.map((data, index) => (
                                            <option
                                                key={index}
                                                value={data.course_code}
                                            >
                                                {data.course_name}
                                            </option>
                                        ))}
                                   </> ) : (
                                        <option selected>Loading</option>
                                    )}

                                </select>}
                                <label
                                    htmlFor="level"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Select Batch
                                </label>
                               <select
                               required
                                    id="level"
                                   
                                    onChange={(e) => {
                                        setData("level", e.target.value);
                                        onchangelevel(e);
                                    }}
                                    className="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                >
                                    
                                    {batch ? (
                                      <> 
                                      <option selected={true} value="end">Select Batch</option>
                                      {  batch.map((data, index) => (
                                        
                                            <option 
                                            key={index}
                                            value={data.batch_code}
                                            >
                                                {data.batch_name} ({data.batch_code})
                                            </option>
                                         
                                        ))}

                                   </>  ) : (
                                        <option selected={false}>
                                            First select courses
                                        </option>
                                    )}
                                </select> 
                                
                                <div className="mb-1">Required subjects</div>

                  <SubjectVerifyBox subjects={subjects} />
 

                                <label
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    for="file"
                                >
                                    Upload file
                                </label>
                                <input
                                    onChange={(e) => {
                                        setData(
                                            "fileresult",
                                            e.target.files[0]
                                        );
                                    }}
                                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                    aria-describedby="file_help"
                                    id="file"
                                    type="file"
                                    required
                                />
                                <div
                                    className="mt-1 text-sm text-gray-500 dark:text-gray-300"
                                    id="file_help"
                                >
                                    Add CSV File
                                </div>

                                <div className="flex justify-end mt-2">
                                    <button
                                        type="submit"
                                        className={!LoadingLogo?" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded":" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-not-allowed" }
                                        disabled={LoadingLogo}
                                    >
                                        Submit
                                    </button>
                                    <button
                                    // disabled={levels}
                                       type="reset"
                                        className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
                                        onClick={()=>{
                                            setsubjects(false)
                                            setLoading(false);
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

export default AddResult;

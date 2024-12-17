import { Head, router, useForm } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
 import Loading from "./componments/Loading";
import AllTable from "./componments/allTable";

export default function AddSubject(props) {
    const { data, setData, post, errors, progress, recentlySucces } = useForm({
        subjectName: null,
        subjectCode: null,
        undergraduate_subject:false
      
      });
      const [LoadingLogo, setLoading] = useState(undefined);
      const [text,setText]=useState("Loading...")
      const [allsubjects,setAllsubjects]=useState(undefined);
  
      const [getSubjectLoading, setSubjectLoading] = useState(undefined);
   
      const fetch = async () => {
        setLoading(true);
        setText("Loading")
        await axios
            .post(route("allsubjectstatus"))
            .then((res) => {
                 setAllsubjects(res.data.all_subjects);
                setLoading(false);
                // console.log(res.data);
            })
            .catch((err) => console.log(err));
    };
      useEffect(()=>{
     
        fetch();
        
      },[])

 const delete_subject =async(subject_code)=>{
    setLoading(true);
    setText("Deleteing")
    await axios
    .post(route("deletesubject"),{'subject_code':subject_code})
    .then((res) => {
       fetch();
        setLoading(false);
        setText("Delete Sucsessfully Deleted")
        // console.log(res.data);
    })
    .catch((err) => console.log(err));
console.log(subject_code)
 }
      const handleSubmit = async(e) => {
        e.preventDefault();
        setText("Submiting")
        // console.log("Form Data:", data.undergraduate_subject);
        
    router.post(route('addSubject'),data,{
        onStart:()=>setLoading(true),
        onSuccess:()=>(window.location.reload()),
        onError:()=>alert("Something wrong")
    })

      };

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Result Management System
                </h2>
            }
            >
            <Head title="Add Subject" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 ">
                    <div className="bg-white mb-2 dark:bg-gray-800  overflow-hidden shadow-sm sm:rounded-lg p-2">
                        <center>
                       
                            <div className="p-6 text-gray-900 dark:text-gray-100">
                                Welcome to BCI Result Management System
                            </div>
                        </center>
                        <div className={!LoadingLogo?" mx-auto  max-w-md p-4  relative items-center block    bg-white border border-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-800":"mx-auto relative items-center block  max-w-md p-4   bg-white border border-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-800  dark:hover:bg-gray-700"}  > 
                                   <form
                                className={"text-gray-900 dark:text-white max-w-sm mx-auto"} 
                                 method="post"  
                                 onSubmit={handleSubmit}
                                  >
            <Loading loading={LoadingLogo} text={text}/> 
                                <label
                                    htmlFor="subjectName"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Subject Name <div className="text-gray-800 dark:text-gray-500">eg-Fundamentals of Programming</div>
                                </label>

                                 <input
                                 required
                                 type="text"
                                  onChange={(e)=>{setData('subjectName',e.target.value)}}
                                className="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />  
                                    <label
                                    htmlFor="subjectCode"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Subject Code <div className="text-gray-800 dark:text-gray-500">eg-BSIT 11024</div>
                                </label>

                                 <input
                                 required
                                 type="text"
                                  onChange={(e)=>{setData('subjectCode',e.target.value)}}
                                className="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                /> 
                                <div class="flex items-center">
    <input id="link-checkbox" type="checkbox" onClick={(e)=>setData('undergraduate_subject',!(data.undergraduate_subject))} value={data.undergraduate_subject}  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
    <label for="link-checkbox" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Undergraduate Subject.</label>
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
                                            setLoading(false);
                                            setData('undergraduate_subject',false)
                                        }}
                                       
                                    >
                                        Reset
                                    </button>

                                    
                                </div>
                            </form>
                            
                            </div>
                            
                    </div>
                    {/* <div className=' scale-50  '><Loading loading={LoadingLogo}   text=""/>  </div>  */}
                  {allsubjects &&  <AllTable allsubs={allsubjects}  delete={delete_subject} />} 



                </div>
            </div>
        </AuthenticatedLayout>
    );
}

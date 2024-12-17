import React, { useState } from 'react'

export default function AllTable(props) {
  

  return (
       <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3 dark:text-white">
                    Subject name
                </th>
                <th scope="col" class="px-6 py-3 dark:text-white">
                    Subject Code
                </th>
                <th scope="col" class="px-6 py-3 dark:text-white">
                    Status
                </th>
               
                <th scope="col" class="px-6 py-3 dark:text-white">
                    Delete
                </th>
            </tr>
        </thead>
        <tbody>
            {
                props.allsubs.map((data,index)=>(
                     <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {data.subject_name}
                </th>
                <td class="px-6 py-4 dark:text-white">
                 {data.subject_code}
                </td>
                <td class="px-6 py-4 dark:text-white ">
                    {data.undergraduate_subject==0?"Course":"Degree"}
                </td>
                <td class="px-6 py-4">
                    <button className=' bg-red-900 p-2 rounded hover:bg-red-600 hover:text-white' onClick={()=>{(window.confirm(`are you sure delete ${data.subject_name}`)?props.delete(data.subject_code):null)}}>Delete</button>
                </td>
                
            </tr>
                ))
            }
           
            
        </tbody>
    </table>
</div>
  )
}

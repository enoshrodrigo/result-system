import React from "react";

export default function SubjectVerifyBox(props) {
    return (
        <div className="flex flex-wrap gap-2  w-auto  text-gray-900  mb-2">
            {props.subjects && props.subjects.length > 0
                ? props.subjects.map((data, index) => (
               <div className=" bg-slate-300 p-3 rounded border-gray-900  items-center text-center text-wrap "  key={index}>
                        {data.subject_name}
                          <br />({data.subject_code})</div> 
                  

 
                  ))
                : ""}
        </div>
    );
}

import React, { useRef } from 'react';
import NavBar from './NavBar';
import { Head } from '@inertiajs/react';
import Footer from '@/Components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import SeasonalSnowfall from '../componments/SeasonalSnowfall';

export default function Display_result(props) {
  const notify = () => toast('BCI Campus', { icon: "🎓" });
  const notify2 = () => toast('ASPIRE TO INSPIRE', { icon: "🪄" });

  const componentRef = useRef();

  const handleDownload = () => {
    const element = componentRef.current;
    const opt = {
      margin: 0.5,
      filename: 'BCI_Campus_Result.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait',  },
      
    };
    
    // Generate the PDF
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => toast('PDF downloaded!'));
  };

  const Printinglogic = ({ isPrinting }) => { 
  
    return (
      <div style={{ display: isPrinting ? 'none' : 'block' }}>
          <SeasonalSnowfall />
        <div ref={isPrinting ? componentRef : null}>
   
          <div
            style={{
              display: isPrinting ? 'block' : 'none',
            }}
          >
            <div className="bg-gradient-to-r mb-4 from-indigo-600 via-blue-700 to-indigo-600 p-6 text-white text-center font-bold text-3xl md:text-3xl rounded-t-lg shadow-md">
              <div className="uppercase mt-1" onClick={notify2}>
                BCI Campus Result Managment System
              </div>
             {/*  <p className="text-sm md:text-lg italic mt-2">"Aspire to Inspire"</p> */}
            </div>
          </div>
  
          {/* Main Content */}
          <div className="text-center text-gray-900 font-bold text-2xl md:text-2xl md:pt-5 md:p-6 mb-6 bg-white p-4 border-4 border-indigo-50 rounded-xl shadow-lg w-11/12 m-auto">
            <div className="uppercase mt-2" onClick={notify}>
              {isPrinting ?props.result_batch:props.batch_name}
            </div>
          </div>
  
          {/* Result table */}
          <div className="overflow-x-auto shadow-md rounded-lg mb-6">
            <table className="w-full text-sm text-left text-gray-600 border-separate border-spacing-2">
              <tbody>
                {props.result.map((data, index) => (
                  <React.Fragment key={index}>
                    <tr className="bg-white border-b hover:bg-gray-100">
                      <th className="px-6 py-4 font-bold text-gray-900">Name</th>
                      <td className="px-6 py-4 font-bold text-gray-900">{data.first_name}</td>
                    </tr>
                    <tr className="bg-white border-b hover:bg-gray-100">
                      <th className="px-6 py-4 font-bold text-gray-900">NIC/Passport</th>
                      <td className="px-6 py-4 font-bold text-gray-900">{data.NIC}</td>
                    </tr>
                    <tr className="bg-white border-b hover:bg-gray-100">
                      <th className="px-6 py-4 font-bold text-gray-900">Status</th>
                      <td className="px-6 py-4 font-bold text-gray-900">{props.status}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
  
          {/* Subjects table with premium look */}
          <div className="overflow-x-auto shadow-md rounded-lg mb-6">
            <table className="w-full text-sm text-left text-blue-900 border-separate border-spacing-2">
              <thead
                className="text-white uppercase"
                style={{
                  backgroundColor: "#1E3A8A", // Dark indigo
                  color: "white",
                }}
              >
                <tr>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Grade</th>
                </tr>
              </thead>
              <tbody>
                {props.result.map((data, index) =>
                  data.subjects.map((subject, idx) => ( 
                      /* Render the subjects */
                      ! (subject.grade === "-" || subject.grade === "" || subject.grade === null || subject.grade === undefined )  
                       
                      ? (  <tr
                      key={idx}
                      className="border-b hover:bg-indigo-100"
                      style={{ backgroundColor: "#F1F5F9" }} // Light grayish-blue
                    >
                      <th className="px-6 py-4 font-bold text-black">{subject.subject_name}</th>
                      <td className="px-6 py-4 font-bold text-black">{subject.grade}</td>
                    </tr>
                      ):""

                  
                 
                  ))
                )}
              </tbody>
            </table>
          </div>
  
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <Head title="Your result" />
      <Toaster />
 
      <div className="flex-1 mt-4 flex items-center justify-center p-4"> 
        <div className="w-full max-w-4xl p-6 bg-white shadow-lg rounded-lg">
          {props.result ? (!(props.result.length === 0) ? (
            <>
           
            <Printinglogic isPrinting={false}/>
            <Printinglogic isPrinting={true}/>

              <div className="flex justify-center space-x-4">
                <a className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" href={route('ViewResult')}>
                  Go Back
                </a>
                <button onClick={handleDownload} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  Download PDF
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-end">
                <a className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" href={route('ViewResult')}>
                  Go Back
                </a>
              </div>
              <div className="hidden">
                {alert("Invalid ID")}
                {window.location.href = route('ViewResult')}
              </div>
            </>
          )) : ""}
        </div>
      </div>

      <Footer />
    </div>
  );
}

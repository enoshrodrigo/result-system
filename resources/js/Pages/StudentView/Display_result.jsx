import React, { useEffect, useRef, useState } from 'react';
import NavBar from './NavBar';
import { Head } from '@inertiajs/react';
import Footer from '@/Components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import SeasonalSnowfall from '../componments/SeasonalSnowfall';
import { MdCheck } from 'react-icons/md';
import { Dialog } from '@headlessui/react';
import ReCAPTCHA from "react-google-recaptcha"; 
import axios from 'axios';
export default function Display_result(props) {
  const notify = () => toast('BCI Campus', { icon: "🎓" });
  const notify2 = () => toast('ASPIRE TO INSPIRE', { icon: "🪄" });
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [saveEmail, setSaveEmail] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
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
 
  
  // Add this useEffect to load the student's email if available
  useEffect(() => {
    if (props.result && props.result.length > 0) {
      // If student has email, populate it
      if (props.result[0].email) {
        setEmail(props.result[0].email);
      }
    }
  }, [props.result]);
  
// Replace the existing handleSendEmailRequest function with this improved version
const handleSendEmailRequest = async () => {
  if (!captchaToken) {
    toast.error("Please complete the reCAPTCHA verification");
    return;
  }
  
  if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
    toast.error("Please enter a valid email address");
    return;
  }
  
  setIsSubmitting(true);
  
  // Determine if we should save the email
  // Only save if:
  // 1. User doesn't have an email and they checked the box, OR
  // 2. User is using their existing email (don't allow changing to different email)
  const shouldSaveEmail = 
    (!props.result[0]?.email && saveEmail) || 
    (email === props.result[0]?.email);
  
  const loadingToast = toast.loading("Sending result to your email...");
  
  try {
    console.log("Sending email with data:", {
      studentId: props.result[0]?.id,
      studentName: props.result[0]?.first_name,
      NIC: props.result[0]?.NIC,
      email,
      batchCode: props.batch_code,
      batchName: props.batch_name,
      saveEmail: shouldSaveEmail,
      captchaToken ,

    });

    const response = await axios.post(route('sendStudentResult'), {
      studentId: props.result[0].id,
      studentName: props.result[0].first_name,
      NIC: props.result[0].NIC,
      email: email,
      saveEmail: shouldSaveEmail,
      captchaToken: captchaToken,
      batchCode: props.batch_code,
      batchName: props.batch_name
    });
    
    toast.dismiss(loadingToast);
    
    if (response.data.success) {
      toast.success("Result sent to your email!");
      setEmailSent(true);
      
      // Close modal after 3 seconds
      setTimeout(() => {
        setIsEmailModalOpen(false);
        setEmailSent(false);
      }, 3000);
    } else {
      console.error("Error sending email:", response.data);  
      toast.error(response.data.message || "Failed to send email");
    }
  } catch (error) {
    console.error("Error sending email:", error);
    toast.dismiss(loadingToast);
    toast.error(error.response?.data?.message || "An error occurred");
  } finally {
    setIsSubmitting(false);
  }
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
               {/* Verification Stamp (only for PDF) */}
         {/*  {isPrinting && (
            <div className="mt-8 border-t pt-4 text-center">
              <p className="text-sm text-gray-500">This is a computer-generated document. No signature required.</p>
              <div className="flex justify-center items-center mt-2">
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg inline-block">
                  <MdCheck className="text-green-500 text-4xl" />
                  <p className="text-xs font-bold mt-1">VERIFIED</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Issued on: {new Date().toLocaleDateString()}
              </p>
            </div>
          )} */}
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
                <button 
    onClick={() => setIsEmailModalOpen(true)} 
    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
  >
    Email Results
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
      {isEmailModalOpen && (
  <Dialog 
    open={isEmailModalOpen} 
    onClose={() => setIsEmailModalOpen(false)}
    className="fixed inset-0 z-50 overflow-y-auto"
  >
    <div className="flex items-center justify-center min-h-screen p-4">
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
      
      <div className="relative bg-white w-full max-w-md p-6 rounded-lg shadow-xl">
        <Dialog.Title className="text-lg font-bold text-gray-900 mb-4">
          Get Results via Email
        </Dialog.Title>
        
        {emailSent ? (
          <div className="text-center py-6">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <p className="text-gray-700 mb-2">Email sent successfully!</p>
            <p className="text-gray-500 text-sm">Check your inbox for your results.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-2 border rounded-md focus:ring focus:ring-blue-300 ${
                  props.result[0]?.email && props.result[0].email !== email 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
                required
              />
              
              {/* Warning message when changing existing email */}
              {props.result[0]?.email && props.result[0].email !== email && (
                <div className="mt-2 text-yellow-600 text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
                  <strong>Warning:</strong> You're changing your registered email address. 
                  If you need to permanently change it, please contact the Result Department.
                </div>
              )}
            </div>
            
            {/* Only show save checkbox if there's no existing email */}
         {/* Only show save checkbox if there's no existing email */}
{(!props.result[0]?.email) && (
  <div className="mb-6">
    <label className="flex items-center">
      <input
        type="checkbox"
        checked={saveEmail}
        onChange={(e) => setSaveEmail(e.target.checked)}
        className="mr-2"
      />
      <span className="text-sm text-gray-700">Save this email for future use</span>
    </label>
    
    {/* Add warning message when checkbox is checked */}
 {/*    {saveEmail && (
      <div className="mt-2 text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
        <strong>Important:</strong> Once saved, this email address cannot be changed without contacting the Result Department. 
        <p className="mt-1">If this is just for one-time use, uncheck the box above.</p>
      </div>
    )} */}
  </div>
)}
            
            <div className="mb-4 flex justify-center">
              <ReCAPTCHA
                sitekey="6LfUttsqAAAAAEDzxi_fsJ0QMhfjbR1sMIwQH2iQ"
                onChange={setCaptchaToken}
                onExpired={() => setCaptchaToken(null)}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-2 rounded-md"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmailRequest}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md flex items-center"
                disabled={isSubmitting || !captchaToken}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Results"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  </Dialog>
)}
      <Footer />
    </div>
  );
}

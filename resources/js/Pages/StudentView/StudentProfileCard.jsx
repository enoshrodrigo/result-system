import React from 'react';
import { FaUserCircle, FaEdit } from 'react-icons/fa';
import { MdAccountBox, MdCallMade, MdCreditScore, MdDateRange, MdEmail, MdLeaderboard, MdOutlineDomainVerification, MdPhone, MdSchool, MdSegment, MdStairs } from 'react-icons/md';
import NavBar from './NavBar';
import Footer from '@/Components/Footer';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Title);

const StudentProfileCard = () => {
  const studentData = {
    name: 'John Doe',
    dob: '01/01/2000',
    gpa: 3.5,
    email: 'johndoe@example.com',
    phone: '+1234567890',
    totalCredits: 120,
    currentSemester: 7,
    completedCourses: 40,
    activities: [
      { activity: 'Exam Results Updated', time: '2 hours ago' },
      { activity: 'New Course Enrolled', time: '1 day ago' },
      { activity: 'Profile Updated', time: '3 days ago' },
    ],
    skills: {
      '1st Year 1st semester': 3.33, 
      '1st Year 2nd semester': 2.67,
      '2nd Year 1st semester': 3.67,
      '2nd Year 2nd semester': 3.00,
      '3rd Year 1st semester': 3.33,
      '3rd Year 2nd semester': 3.67,
      '4th Year 1st semester': 3.00,
      '4th Year 2nd semester': 3.33,
    },
  };

  const gpaData = {
    labels: ["GPA", "Remaining"],
    datasets: [
      {
        data: [studentData.gpa, 4 - studentData.gpa],
        backgroundColor: ["#3b82f6", "#e5e7eb"],
        hoverBackgroundColor: ["#2563eb", "#d1d5db"],
      },
    ],
  };

  const skillsData = {
    labels: Object.keys(studentData.skills),
    datasets: [
      {
        label: 'Skill Level (Out of 5)',
        data: Object.values(studentData.skills),
        borderColor: '#1E90FF', // Blue color for line
        backgroundColor: 'rgba(30, 144, 255, 0.2)', // Light blue background
        tension: 0.4,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Soft Skills',
        color: '#1f1f1f', // Dark text for readability
        font: {
          size: 18,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 4,
        ticks: {
          color: '#333333', // Darker ticks for contrast
        },
      },
    },
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
        {/* Main Container */}
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-5xl w-full">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <FaUserCircle className="mr-2 text-blue-500" /> STUDENT PROFILE
            </h1>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
              <FaEdit className="mr-2" /> Edit
            </button>
          </div>

          {/* Student Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 bg-blue-100 rounded-full shadow-md flex justify-center items-center text-blue-600 text-4xl mb-3">
                JD
              </div>
              <h2 className="text-xl font-semibold text-gray-800">{studentData.name}</h2>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <MdDateRange className="text-blue-500 text-2xl" />
                <div>
                  <h3 className="text-sm text-gray-500">Date of Birth</h3>
                  <p className="font-medium text-gray-700">{studentData.dob}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <MdSchool className="text-blue-500 text-2xl" />
                <div>
                  <h3 className="text-sm text-gray-500">GPA</h3>
                  <p className="font-medium text-gray-700">{studentData.gpa}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <MdEmail className="text-blue-500 text-2xl" />
                <div>
                  <h3 className="text-sm text-gray-500">Email</h3>
                  <p className="font-medium text-gray-700">{studentData.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <MdPhone className="text-blue-500 text-2xl" />
                <div>
                  <h3 className="text-sm text-gray-500">Phone</h3>
                  <p className="font-medium text-gray-700">{studentData.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-gray-100 text-gray-700 rounded-xl p-6 shadow-md">
              <h3 className="text-sm font-medium">Total Credits</h3>
              <p className="text-2xl font-bold">{studentData.totalCredits}</p>
            </div>
            <div className="bg-gray-100 text-gray-700 rounded-xl p-6 shadow-md">
              <h3 className="text-sm font-medium">Current Semester</h3>
              <p className="text-2xl font-bold">{studentData.currentSemester}</p>
            </div>
            <div className="bg-gray-100 text-gray-700 rounded-xl p-6 shadow-md">
              <h3 className="text-sm font-medium">Completed Courses</h3>
              <p className="text-2xl font-bold">{studentData.completedCourses}</p>
            </div>
          </div>

          {/* Bottom Section: GPA and Soft Skills */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-6 bg-white rounded-lg shadow-md">
            <div className="mb-4">
              <h3 className="text-2xl font-semibold text-[#33CCFF]">GPA: {studentData.gpa}</h3>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-[#333333]">Soft Skills</h3>
              <Line data={skillsData} options={chartOptions} />
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
            <div className="bg-gray-100 rounded-xl p-6 shadow-md">
              <ul className="divide-y divide-gray-200">
                {studentData.activities.map((activity, index) => (
                  <li key={index} className="py-3 flex justify-between items-center">
                    <p className="text-gray-700">{activity.activity}</p>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StudentProfileCard;
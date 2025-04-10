import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Toaster, toast } from 'react-hot-toast';
import { MdLockOutline, MdPersonOutline } from 'react-icons/md';
import NavBar from './NavBar';
import Footer from '@/Components/Footer';

export default function StudentLogin({ errors }) {
  const { data, setData, post, processing } = useForm({
    nic: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('student.login'), {
      onError: (errors) => {
        if (errors.nic) {
          toast.error(errors.nic);
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head title="Student Login" />
      <Toaster position="top-right" />
      
      {/* NavBar at the top */}
{/*       <NavBar /> */}
      
      {/* Login content centered in remaining space */}
      <div className="flex-grow bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Student Portal</h1>
              <p className="text-gray-600 mt-2">Sign in to access your academic profile</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nic" className="block text-sm font-medium text-gray-700 mb-1">
                  NIC/Registration Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdPersonOutline className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nic"
                    type="text"
                    value={data.nic}
                    onChange={e => setData('nic', e.target.value)}
                    className="pl-10 block w-full rounded-md border border-gray-300 py-3 px-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter your NIC or Registration Number"
                    required
                  />
                </div>
                {errors.nic && <p className="text-red-500 text-sm mt-1">{errors.nic}</p>}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdLockOutline className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={e => setData('password', e.target.value)}
                    className="pl-10 block w-full rounded-md border border-gray-300 py-3 px-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {processing ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>
            
            <div className="mt-8 text-center text-sm text-gray-600">
              <p>Need help? Contact your department administrator.</p>
              {/* Go to home page */}
              <p className="mt-2 text-indigo-600 hover:text-indigo-500 cursor-pointer" onClick={() => window.location.href = '/' }>
                Go to Home
              </p>
              
            </div>
          </div>
        </div>
      </div>
    
    </div>
  );
}
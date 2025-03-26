import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import axios from 'axios';
import Footer from '@/Components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import SeasonalSnowfall from '../componments/SeasonalSnowfall';
import { MdSearch, MdSchool, MdPersonSearch, MdArrowDropDown, MdRefresh } from 'react-icons/md';

export default function ViewResult() {
    const { data, setData, post, processing } = useForm({
        batch_code: 1,
        nic: null,
    });

    const [live, setLive] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchResult = async () => {
            const loadingToast = toast.loading('Loading available courses...');
            setIsLoading(true);
            
            try {
                const res = await axios.post(route('checkresult'));
                setLive(res.data.live_result);
                toast.success('Welcome', { id: loadingToast });
            } catch (err) {
                console.error(err);
                toast.error('Failed to load courses', { id: loadingToast });
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchResult();
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        
        if (!data.batch_code || data.batch_code === "" || !data.nic) {
            toast.error('Please fill all fields correctly');
            return;
        }
        
        router.post(route('DisplayResult'), data, {
            onStart: () => toast.loading('Searching for your results...'),
            onFinish: () => toast.dismiss(),
        });
    };

    return (
        <div className='min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50'>
            <SeasonalSnowfall />
            <NavBar />
            <Head title="View Result" />
            
            <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-xl">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 text-white">
                            <div className="flex items-center justify-center mb-3">
                                <MdSchool className="w-10 h-10 mr-3" />
                                <h2 className="text-2xl font-bold">BCI Result Search Portal</h2>
                            </div>
                            <p className="text-center text-blue-100">Find your examination results easily</p>
                        </div>
                        
                        <Toaster position="top-right" />
                        
                        <div className="p-8">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Your Course
                                    </label>
                                    <div className="relative">
                                        <select 
                                            id="batch" 
                                            onChange={(e) => { setData('batch_code', e.target.value) }} 
                                            className="block w-full pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg appearance-none bg-white shadow-sm"
                                            required
                                            disabled={isLoading}
                                        >
                                            {live ? (
                                                <>
                                                    <option value="">-- Select Course --</option>
                                                    {live.map((data, index) => (
                                                        <option key={index} value={data.batch_code}>
                                                            {data.batch_name}{index === 0 ? " (New)" : ""}
                                                        </option>
                                                    ))}
                                                </>
                                            ) : (
                                                <option value="">Loading courses...</option>
                                            )}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            {isLoading ? (
                                                <span className="animate-spin">
                                                    <MdRefresh className="h-5 w-5 text-indigo-500" />
                                                </span>
                                            ) : (
                                                <MdArrowDropDown className="h-6 w-6" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="nic" className="block text-sm font-medium text-gray-700 mb-1">
                                        Enter Your NIC Number
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MdPersonSearch className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input 
                                            type="text" 
                                            id="nic" 
                                            onChange={(e) => { setData('nic', e.target.value) }} 
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Enter your NIC number" 
                                            disabled={isLoading}
                                            required 
                                        />
                                    </div>
                                </div>
                                
                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={processing || isLoading}
                                        className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white transition-all duration-200 shadow-md hover:shadow-lg
                                          ${processing ? 'bg-gray-500' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Searching...
                                            </>
                                        ) : (
                                            <>
                                                <MdSearch className="mr-2 h-5 w-5" />
                                                Search Results
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                            
                            <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            Please ensure your NIC number is entered correctly to find your results.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 text-center text-xs text-gray-500">
                        <p>If you encounter any issues finding your results, please contact the administration office.</p>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
}
import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import Loading from '../componments/Loading';
import axios from 'axios';
import Footer from '@/Components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import Snowfall from 'react-snowfall'; 
import SeasonalSnowfall from '../componments/SeasonalSnowfall';

export default function ViewResult() {
    const { data, setData, post, processing } = useForm({
        batch_code: 1,
        nic: null,
    });

    const [Batch_ID, setBatch_ID] = useState(undefined);
    const [NIC_PO, setNIC_PO] = useState(undefined);
    const [live, setLive] = useState(undefined);
    const [LoadingLogo, setLoading] = useState(false);
    const [text, setText] = useState("wait...");

    useEffect(() => {
        const fetchResult = async () => {
            setLoading(true);
            setText('Loading...');

            await axios.post(route('checkresult')).then((res) => {
                setLive(res.data.live_result);
                setLoading(false);
                setText('wait...');
            }).catch((err) => setLoading(true));
        };
        fetchResult();
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        router.post(route('DisplayResult'), data, {
            onStart: () => setLoading(true),
            onSuccess: () => setLoading(false),
        });
    };

    return (
        <div className='bg-white min-h-screen flex flex-col'>
             <SeasonalSnowfall />
            <NavBar />
            <Head title="View Result" />
            <div className="flex-grow py-8 sm:py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 sm:p-8 m-2">
                        <Toaster />
                        <div className='bg-zinc-50 shadow-md rounded-lg p-6 sm:p-10 text-center'>
                            <h2 className='text-2xl sm:text-3xl font-bold mb-6'>SEARCH YOUR RESULT HERE</h2>
                            <form onSubmit={submit} className="max-w-lg mx-auto">
                                <div className="mb-6">
                                    <label htmlFor="course" className="block text-lg font-semibold text-gray-900 mb-2">
                                        Select Course
                                    </label>
                                    <select 
                                        id="batch" 
                                        onChange={(e) => { setData('batch_code', e.target.value) }} 
                                        className="lg:w-96 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500 "
                                        required
                                        style={{ appearance: 'none',width: '100%',padding: '0.5rem 1rem',fontSize: '1rem',borderRadius: '0.375rem',lineHeight: '1.5',borderWidth: '1px',borderColor: '#e2e8f0',backgroundColor: '#fff',color: '#2d3748',outline: '0',transition: 'box-shadow 0.15s ease',}}
                                    >
                                        {live ? (
                                            <>
                                                <option value="">Select Course</option>
                                                {live.map((data, index) => (
                                                    <option key={index} value={data.batch_code}>
                                                        {data.batch_name}{index === 0 ? " (New)" : ""}
                                                    </option>
                                                ))}
                                            </>
                                        ) : (
                                            <option value={data.batch_code}>Loading...</option>
                                        )}
                                    </select>
                                </div>
                                <div className=' scale-90 items-center '><Loading loading={LoadingLogo} text={text} /></div> 
                                <div className="mb-6">
                                    <label htmlFor="nic" className="block text-lg font-semibold text-gray-900 mb-2">
                                        Your NIC
                                    </label>
                                    <input 
                                        type="text" 
                                        id="nic" 
                                        onChange={(e) => { setData('nic', e.target.value) }} 
                                        className="lg:w-96 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="NIC" 
                                        required 
                                        style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: '0.375rem', lineHeight: '1.5', borderWidth: '1px', borderColor: '#e2e8f0', backgroundColor: '#fff', color: '#2d3748', outline: '0', transition: 'box-shadow 0.15s ease',}}
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg px-5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
                                >
                                    Search
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

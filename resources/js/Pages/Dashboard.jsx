import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import ResultStatus from './componments/ResultStatus';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Loading from './componments/Loading';
import toast, { Toaster } from 'react-hot-toast';
import { 
    MdPeople, 
    MdSchool, 
    MdWifiTethering, 
    MdWifiOff,
    MdDashboard
} from "react-icons/md";

export default function Dashboard(props) {
    const [shortlive, setShortlive] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        next_page_url: null,
        prev_page_url: null,
    });
    const [statistics, setStatistics] = useState({
        totalStudents: 0,
        liveCount: 0,
        offlineCount: 0,
        totalCourses: 0,
    });

    useEffect(() => {
        const load = () => toast("Welcome to BCI Result Management System", { 
            icon: '👋',
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });
        load();
        fetchPage(); // Fetch first page on load
        fetchStatistics(); // Fetch statistics
    }, []);

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('getStatistics'));
            setStatistics(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load statistics");
        } finally {
            setLoading(false);
        }
    };

    const fetchPage = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.post(route('shortlive'), { page });
            setShortlive(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                next_page_url: response.data.next_page_url,
                prev_page_url: response.data.prev_page_url,
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to load batch data");
        } finally {
            setLoading(false);
        }
    };

    const toogleButton = useCallback(async (e, status) => {
        const batchCode = e.target.value;
        // Optimistically update the batch status locally
        setShortlive(prev =>
            prev.map(item =>
                item.batch_code === batchCode ? { ...item, live: status } : item
            )
        );
        // Optionally update statistics locally
        setStatistics(prev => ({
            ...prev,
            liveCount: status ? prev.liveCount + 1 : prev.liveCount - 1,
            offlineCount: status ? prev.offlineCount - 1 : prev.offlineCount + 1,
        }));
        
        try {
            await axios.post(route('ShortCourseUpdateLive'), {
                batch: batchCode,
                livecode: status,
            });
            toast.success(`Status changed to ${status ? 'Online' : 'Offline'}`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
            // Revert the optimistic update if API call fails
            setShortlive(prev =>
                prev.map(item =>
                    item.batch_code === batchCode ? { ...item, live: !status } : item
                )
            );
            setStatistics(prev => ({
                ...prev,
                liveCount: status ? prev.liveCount - 1 : prev.liveCount + 1,
                offlineCount: status ? prev.offlineCount + 1 : prev.offlineCount - 1,
            }));
        }
    }, []);
    

    const deleteBatch = async (batchCode) => {
        setLoading(true);
        try {
            await axios.post(route('deleteBatch'), { batch: batchCode });
            toast.success("Batch deleted successfully");
            fetchPage(); // Refresh page data
            fetchStatistics(); // Refresh statistics
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete batch");
        } finally {
            setLoading(false);
        }
    };

    const searchResult = async (batch) => {
        router.get(route('viewAllBatchResult', { batch }), {
            onStart: () => setLoading(true),
            onSuccess: () => setLoading(false),
            onError: () => setLoading(false),
        });
    };

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Result Management Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />
            <Toaster position="top-right" />

            <div className="py-12">
                <div className=" mx-auto sm:px-6 lg:px-8"
                style={{ maxWidth: "1480px" }}
                >
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-lg shadow-lg overflow-hidden">
                            <div className="px-8 py-6">
                                <h2 className="text-2xl font-bold text-white flex items-center">
                                    <MdDashboard className="mr-2" /> Dashboard Overview
                                </h2>
                                <p className="mt-1 text-indigo-100">
                                    Manage and monitor your examination batch results
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Total Students Card */}
                            <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg overflow-hidden">
                                <div className="px-6 py-5 flex items-center">
                                    <div className="p-3 rounded-full bg-white/20 mr-4">
                                        <MdPeople className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-amber-100 text-sm uppercase font-semibold">Total Students</p>
                                        <p className="text-white text-2xl font-bold">{statistics.totalStudents}</p>
                                    </div>
                                </div>
                                <div className="bg-amber-700/30 px-6 py-2">
                                    <p className="text-amber-100 text-xs">Overall registered students</p>
                                </div>
                            </div>

                            {/* Total Courses Card */}
                            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg overflow-hidden">
                                <div className="px-6 py-5 flex items-center">
                                    <div className="p-3 rounded-full bg-white/20 mr-4">
                                        <MdSchool className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-emerald-100 text-sm uppercase font-semibold">Total Courses</p>
                                        <p className="text-white text-2xl font-bold">{statistics.totalCourses}</p>
                                    </div>
                                </div>
                                <div className="bg-emerald-700/30 px-6 py-2">
                                    <p className="text-emerald-100 text-xs">All available courses</p>
                                </div>
                            </div>

                            {/* Live Courses Card */}
                            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg overflow-hidden">
                                <div className="px-6 py-5 flex items-center">
                                    <div className="p-3 rounded-full bg-white/20 mr-4">
                                        <MdWifiTethering className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-blue-100 text-sm uppercase font-semibold">Live Courses</p>
                                        <p className="text-white text-2xl font-bold">{statistics.liveCount}</p>
                                    </div>
                                </div>
                                <div className="bg-blue-700/30 px-6 py-2">
                                    <p className="text-blue-100 text-xs">Currently online courses</p>
                                </div>
                            </div>

                            {/* Offline Courses Card */}
                            <div className="bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl shadow-lg overflow-hidden">
                                <div className="px-6 py-5 flex items-center">
                                    <div className="p-3 rounded-full bg-white/20 mr-4">
                                        <MdWifiOff className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-rose-100 text-sm uppercase font-semibold">Offline Courses</p>
                                        <p className="text-white text-2xl font-bold">{statistics.offlineCount}</p>
                                    </div>
                                </div>
                                <div className="bg-rose-700/30 px-6 py-2">
                                    <p className="text-rose-100 text-xs">Currently offline courses</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Batch Results Section */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                                    Examination Batch Management
                                </span>
                            </h3>
                            {loading && <Loading />}
                            <ResultStatus
                                searchResult={searchResult}
                                loading={loading}
                                toogleFunction={toogleButton}
                                deleteBatch={deleteBatch}
                                shortLive={shortlive}
                                fetchPage={fetchPage}
                                pagination={pagination}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
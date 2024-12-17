import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import ResultStatus from './componments/ResultStatus';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Loading from './componments/Loading';
import toast from 'react-hot-toast';

export default function Dashboard(props) {
    const [shortlive, setShortlive] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        next_page_url: null,
        prev_page_url: null,
    });
    const [statistics, setStatistics] = useState({
        liveCount: 0,
        offlineCount: 0,
        totalCourses: 0,
    });

    useEffect(() => {
        const load = () => toast("Welcome", { icon: '⌛' });
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
        } finally {
            setLoading(false);
        }
    };

    const toogleButton = useCallback(async (e, status) => {
        setLoading(true);
        try {
            await axios.post(route('ShortCourseUpdateLive'), { 'batch': e.target.value, 'livecode': status });
            fetchPage(); // Refresh page data
            fetchStatistics(); // Refresh statistics
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    });

    const deleteBatch = async (batchCode) => {
        setLoading(true);
        try {
            await axios.post(route('deleteBatch'), { batch: batchCode });
            fetchPage(); // Refresh page data
            fetchStatistics(); // Refresh statistics
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const searchResult = async (batch) => {
        router.post(route('viewAllBatchResult'), { batch }, {
            onStart: () => setLoading(true),
            onSuccess: () => setLoading(false),
            onError: () => setLoading(false),
        });
    };

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Result Management System</h2>}
        >
            <Head title="Dashboard" />

            <div className="">
                <div className="  ">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-4">
                        <div className="flex flex-col items-center mb-4">
                            <div className="text-gray-900 dark:text-gray-100">
                                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                                <div className="flex space-x-4">
                                    <div className="bg-green-500 text-white p-4 rounded-lg shadow-md flex flex-col items-center">
                                        <p className="text-xl font-bold">{statistics.totalCourses}</p>
                                        <p>Total Courses</p>
                                    </div>
                                    <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md flex flex-col items-center">
                                        <p className="text-xl font-bold">{statistics.liveCount}</p>
                                        <p>Live Courses</p>
                                    </div>
                                    <div className="bg-red-500 text-white p-4 rounded-lg shadow-md flex flex-col items-center">
                                        <p className="text-xl font-bold">{statistics.offlineCount}</p>
                                        <p>Offline Courses</p>
                                    </div>
                                </div>
                            </div>
                            {/* <Loading loading={loading} text="" /> */}
                        </div>

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
        </AuthenticatedLayout>
    );
}

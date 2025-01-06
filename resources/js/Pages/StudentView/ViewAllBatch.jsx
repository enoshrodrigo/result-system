import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function ViewAllBatch(props) {
    console.log(props.allBatch);

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Result Management System
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to BCI Result Management System</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {props.allBatch &&
                                props.allBatch.map((data, index) => (
                                    <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                                        <div className="p-6">
                                            <h5 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                                {data.first_name} - {data.NIC}
                                            </h5>
                                            <div className="space-y-2">
                                                {data.subjects &&
                                                    data.subjects.map((subData, subIndex) => (
                                                        <p key={subIndex} className="text-sm text-gray-700 dark:text-gray-400">
                                                            <span className="font-medium">{subData.subject_name}</span> ({subData.subject_code}) - 
                                                            <span className="text-green-500 font-bold"> {subData.grade}</span>
                                                        </p>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

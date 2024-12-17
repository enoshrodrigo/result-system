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
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-1">
                        <center>
                            {" "}
                            <div className="p-6 text-gray-900 dark:text-gray-100">
                                Welcome to BCI Result Management System
                            </div>{" "}
                        </center>
                        <div className="flex  flex-wrap gap-4">
                            {props.allBatch &&
                                props.allBatch.map((data, index) => (
                                    <div className="max-w-sm p-6 mb-4 pb-2 ">
                                        <div
                                            href="#"
                                            key={index}
                                            class="block  p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                                        >
                                            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                {data.first_name}-{data.NIC}
                                            </h5>
                                            {data.subjects &&
                                                data.subjects.map(
                                                    (subData, subIndex) => (
                                                        <p key={subIndex} class="font-normal text-gray-700 dark:text-gray-400">
                                                            {
                                                                subData.subject_name
                                                            }{" "}
                                                            - {subData.grade}
                                                        </p>
                                                    )
                                                )}
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

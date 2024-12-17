import React, { useState } from "react";
import Loading from "./Loading";

export default function ResultStatus(props) {
    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Calculate the total number of pages
    const totalPages = Math.ceil(props.shortLive?.length / itemsPerPage);
console.log(props.shortLive);
    // Get the items to display on the current page
    const currentItems = props.shortLive?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Function to go to the next page
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Function to go to the previous page
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="p-4">
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-gray-400 transition duration-150 ease-in-out"
                >
                    Previous
                </button>
                <span className="text-gray-800 font-semibold">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-gray-400 transition duration-150 ease-in-out"
                >
                    Next
                </button>
            </div>

            <div className="flex flex-wrap items-stretch justify-center gap-6">
                {currentItems ? (
                    currentItems.map((data, index) => (
                        <div
                            className="w-80 max-w-xs p-6 mb-4 bg-gradient-to-r from-blue-200 to-blue-400 border border-blue-300 rounded-lg shadow-lg flex flex-col justify-between"
                            key={index}
                        >
                            <div>
                                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-800">
                                    {data.batch_name}
                                    <br />
                                    <span className="text-sm text-gray-600">
                                        ({data.batch_code}) - {data.batch_year}
                                    </span>
                                </h5>
                            </div>

                            <div className="flex justify-center gap-4   mt-4">
                                <label
                                    className={`relative inline-flex items-center  ${
                                        props.loading
                                            ? "cursor-not-allowed"
                                            : "cursor-pointer"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        value={data.batch_code}
                                        disabled={props.loading}
                                        className="sr-only peer"
                                        checked={data.live}
                                        onChange={(e) =>
                                            props.toogleFunction(e, !data.live)
                                        }
                                    />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-800">
                                        {data.live ? "Online" : "Offline"}
                                    </span>
                                </label>
                                <button
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                "Are you sure you want to delete this?"
                                            )
                                        ) {
                                            props.deleteBatch(data.batch_code);
                                        }
                                    }}
                                    className="text-red-600 hover:text-red-800 transition duration-150 ease-in-out"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M10 11V17"
                                            stroke="#d75252"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M14 11V17"
                                            stroke="#d75252"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M4 7H20"
                                            stroke="#d75252"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M6 7H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z"
                                            stroke="#d75252"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
                                            stroke="#d75252"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                "This will redirect to a new route"
                                            )
                                        ) {
                                            props.searchResult(data.batch_code);
                                        }
                                    }}
                                    className="text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M12 4.5C7.58172 4.5 4 8.08172 4 12.5C4 16.9183 7.58172 20.5 12 20.5C16.4183 20.5 20 16.9183 20 12.5C20 8.08172 16.4183 4.5 12 4.5ZM12 18.5C9.23823 18.5 7 16.2618 7 13.5C7 10.7382 9.23823 8.5 12 8.5C14.7618 8.5 17 10.7382 17 13.5C17 16.2618 14.7618 18.5 12 18.5ZM12 6.5C8.68629 6.5 6 9.18629 6 12.5C6 15.8137 8.68629 18.5 12 18.5C15.3137 18.5 18 15.8137 18 12.5C18 9.18629 15.3137 6.5 12 6.5Z"
                                            fill="#3b82f6"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <Loading />
                )}
            </div>
        </div>
    );
}

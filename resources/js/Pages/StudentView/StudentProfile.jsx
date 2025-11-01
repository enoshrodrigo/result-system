import React, { useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    MdPerson,
    MdEmail,
    MdPhone,
    MdSchool,
    MdLocationOn,
    MdCalendarToday,
    MdAssignment,
    MdBarChart,
    MdVerified,
    MdEdit,
    MdHistory,
    MdOutlineInsertPhoto,
    MdViewList,
    MdPrint,
    MdFileDownload,
    MdLogout,
    MdInfoOutline,
    MdInsertDriveFile,
    MdBookmark,
    MdCheck,
    MdArrowUpward,
    MdLock,
    MdVisibility,
    MdVisibilityOff,
    MdExpandMore,
    MdExpandLess,
} from "react-icons/md";
import { toast, Toaster } from "react-hot-toast";
import { Dialog } from "@headlessui/react";
import * as XLSX from "xlsx";

export default function StudentProfile({
    student,
    results = [],
    batches = [],
    resultStats = {},
}) {
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(
        student.profile_image ||
            "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg"
    );
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [expandedBatch, setExpandedBatch] = useState(null);
    const [filteredResults, setFilteredResults] = useState([]);
    const [filterValue, setFilterValue] = useState("all");
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        password_confirmation: "",
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    // Update the getBatchGradeStats function to handle special grades
    const handlePasswordFormChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordUpdate = async () => {
        // Client-side validation
        if (passwordForm.new_password !== passwordForm.password_confirmation) {
            toast.error("Passwords do not match");
            return;
        }

        if (passwordForm.new_password.length < 6) {
            toast.error("Password should be at least 6 characters");
            return;
        }

        setUpdatingPassword(true);

        try {
            const response = await axios.post(
                route("student.update-password"),
                {
                    current_password: passwordForm.current_password,
                    password: passwordForm.new_password,
                    password_confirmation: passwordForm.password_confirmation,
                }
            );

            if (response.data.success) {
                toast.success("Password updated successfully");
                // Reset form
                setPasswordForm({
                    current_password: "",
                    new_password: "",
                    password_confirmation: "",
                });
            } else {
                toast.error(
                    response.data.message || "Failed to update password"
                );
            }
        } catch (error) {
            console.error("Password update error:", error);

            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                toast.error(error.response.data.message);
            } else if (error.response && error.response.status === 422) {
                // Validation errors
                const errors = error.response.data.errors || {};
                Object.values(errors)
                    .flat()
                    .forEach((err) => toast.error(err));
            } else {
                toast.error(
                    "Failed to update password. Please check current password and try again."
                );
            }
        } finally {
            setUpdatingPassword(false);
        }
    };
    const getBatchGradeStats = (batchId) => {
        // Filter results for this batch
        const batchResults = results.filter((result) =>
            batches.find(
                (b) =>
                    b.batch_id === batchId && b.batch_code === result.batch_code
            )
        );

        // Initialize grade counts with normalized keys
        const gradeCounts = {
            "A+": 0,
            A: 0,
            "A-": 0,
            "B+": 0,
            B: 0,
            "B-": 0,
            "C+": 0,
            C: 0,
            "C-": 0,
            "D+": 0,
            D: 0,
            "D-": 0,
            F: 0,
            Absent: 0,
            Other: 0,
        };

        // Count valid results
        let totalValidResults = 0;
        let passedCount = 0;
        let absentCount = 0;

        batchResults.forEach((result) => {
            // Skip results with null, empty, "-", or unknown grades
            if (
                !result.grade ||
                result.grade === "-" ||
                result.grade === "unknown"
            ) {
                return;
            }

            totalValidResults++;

            // Check for absent or special cases like A/B
            if (
                result.grade.toLowerCase() === "absent" ||
                result.grade.toLowerCase() === "ab" ||
                result.grade.toLowerCase() === "a/b"
            ) {
                gradeCounts["Absent"]++;
                absentCount++;
                return;
            }

            // Normalize the grade for consistent handling
            const normalizedGrade = result.grade
                .toUpperCase()
                .replace("_", "-");

            // Map the normalized grade to the standard form
            let gradeKey = normalizedGrade;
            if (Object.keys(gradeCounts).includes(normalizedGrade)) {
                gradeCounts[normalizedGrade]++;
            } else {
                // Count other non-standard grades as Other
                gradeCounts["Other"]++;
            }

            // Count passing grades - note C- is considered failing
            if (
                ["A+", "A", "A-", "B+", "B", "B-", "C+", "C"].includes(
                    normalizedGrade
                )
            ) {
                passedCount++;
            }
        });

        // Calculate pass rate (now including absent students as failed)
        const passRate =
            totalValidResults > 0
                ? Math.round((passedCount / totalValidResults) * 100)
                : 0;

        return {
            gradeCounts,
            totalValidResults,
            passedCount,
            absentCount,
            passRate,
        };
    };
    const [recentActivities, setRecentActivities] = useState([
        {
            type: "exam",
            title: "Exam Result Posted",
            date: "2025-03-25",
            time: "14:30",
            description:
                "Your results for Programming Fundamentals have been posted.",
        },
        {
            type: "login",
            title: "Account Login",
            date: "2025-03-24",
            time: "09:15",
            description: "Successful login to student portal from 192.168.1.1",
        },
        {
            type: "document",
            title: "Certificate Generated",
            date: "2025-03-20",
            time: "16:45",
            description:
                "Certificate for Web Development course is ready for download.",
        },
    ]);
    const [formData, setFormData] = useState({
        first_name: student.first_name || "",
        last_name: student.last_name || "",
        email: student.email || "",
        mobile_number: student.mobile_number || "",
        address: student.address || "",
    });
    const filterResultsByStatus = (status, batchId) => {
        const batchResults = results.filter((result) =>
            batches.find(
                (b) =>
                    b.batch_id === batchId && b.batch_code === result.batch_code
            )
        );

        if (status === "all") {
            setFilteredResults(batchResults);
        } else if (status === "passed") {
            setFilteredResults(
                batchResults.filter((result) => {
                    if (!result.grade) return false;
                    const normalizedGrade = result.grade
                        .toUpperCase()
                        .replace("_", "-");
                    return [
                        "A+",
                        "A",
                        "A-",
                        "B+",
                        "B",
                        "B-",
                        "C+",
                        "C",
                    ].includes(normalizedGrade);
                })
            );
        } else if (status === "failed") {
            setFilteredResults(
                batchResults.filter((result) => {
                    // Check if the grade exists and is not missing/unknown
                    if (
                        !result.grade ||
                        result.grade === "-" ||
                        result.grade === "unknown"
                    ) {
                        return false;
                    }

                    // Check if it's not an absent grade
                    const isAbsent =
                        result.grade.toLowerCase() === "absent" ||
                        result.grade.toLowerCase() === "ab" ||
                        result.grade.toLowerCase() === "a/b";

                    // Check if it's not a passing grade
                    const isPassing = [
                        "A+",
                        "A",
                        "A-",
                        "B+",
                        "B",
                        "B-",
                        "C+",
                        "C",
                    ].includes(result.grade);

                    // Return true only if it's not absent AND not passing
                    return !isAbsent && !isPassing;
                })
            );
        } else if (status === "absent") {
            setFilteredResults(
                batchResults.filter(
                    (result) =>
                        result.grade &&
                        (result.grade.toLowerCase() === "absent" ||
                            result.grade.toLowerCase() === "ab" ||
                            result.grade.toLowerCase() === "a/b")
                )
            );
        }
    };
    const downloadIndividualResult = (result) => {
        toast.success(`Downloading result for ${result.subject_name}...`);

        // Create an Excel workbook
        const wb = XLSX.utils.book_new();

        // Create data for the Excel sheet
        const data = [
            ["Student Information", ""],
            ["Name:", `${student.first_name} ${student.last_name}`],
            ["Student ID:", student.NIC_PO],
            ["", ""],
            ["Result Information", ""],
            ["Subject:", result.subject_name],
            ["Subject Code:", result.subject_code],
            ["Grade:", result.grade],
            [
                "Status:",
                result.grade.toLowerCase() === "absent" ||
                result.grade.toLowerCase() === "ab" ||
                result.grade.toLowerCase() === "a/b"
                    ? "Absent"
                    : (() => {
                          const normalizedGrade = result.grade
                              .toUpperCase()
                              .replace("_", "-");
                          return [
                              "A+",
                              "A",
                              "A-",
                              "B+",
                              "B",
                              "B-",
                              "C+",
                              "C",
                          ].includes(normalizedGrade)
                              ? "Passed"
                              : "Failed";
                      })(),
            ],
            ["Date:", new Date().toLocaleDateString()],
        ];

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Set column widths
        const wscols = [
            { wch: 20 }, // Column A width
            { wch: 30 }, // Column B width
        ];
        ws["!cols"] = wscols;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Result");

        // Generate Excel file and download
        XLSX.writeFile(wb, `${result.subject_code}_result.xlsx`);
    };
    const handleLogout = () => {
        axios
            .post(route("student.logout"))
            .then(() => {
                toast.success("Logging out...");
                setTimeout(() => {
                    window.location.href = route("student.login");
                }, 1000);
            })
            .catch((error) => {
                console.error("Logout error:", error);
                toast.error("Failed to logout");
            });
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadImage = async () => {
        if (!imageFile) return;

        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("profile_image", imageFile);

        try {
            const response = await axios.post(
                route("student.upload-image"),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content"),
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) /
                                    progressEvent.total
                            );
                            setUploadProgress(percentCompleted);
                        }
                    },
                }
            );

            if (response.data.success) {
                console.log("Image URL received:", response.data.image_url);
                setProfileImage(response.data.image_url);
                toast.success("Profile image updated successfully");
                setShowUploadModal(false);
                setImageFile(null);
                setImagePreview(null);
            } else {
                toast.error(response.data.message || "Failed to upload image");
            }
        } catch (error) {
            console.error("Upload error:", error);
            if (error.response) {
                toast.error(
                    `Upload failed: ${
                        error.response.data.message || "Server error"
                    }`
                );
            } else if (error.request) {
                toast.error("Upload failed: No response from server");
            } else {
                toast.error("Upload failed: Check console for details");
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.put(
                route("students.update", student.id),
                formData
            );

            if (response.data.success) {
                toast.success("Profile updated successfully");
                setEditMode(false);
            } else {
                toast.error(
                    response.data.message || "Failed to update profile"
                );
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update profile information");
        } finally {
            setLoading(false);
        }
    };

    const downloadResults = (batchId) => {
        toast.success("Generating Excel file...");

        // Filter results for the specific batch if provided
        const resultsToDownload = batchId
            ? results.filter((result) =>
                  batches.find(
                      (b) =>
                          b.batch_id === batchId &&
                          b.batch_code === result.batch_code
                  )
              )
            : results;

        if (resultsToDownload.length === 0) {
            toast.error("No results available to download");
            return;
        }

        // Create an Excel workbook
        const wb = XLSX.utils.book_new();

        // Create header row for the data
        const data = [["Subject", "Subject Code", "Grade", "Status", "Batch"]];

        // Add data rows
        resultsToDownload
            .filter(
                (result) =>
                    result.grade &&
                    result.grade !== "-" &&
                    result.grade !== "unknown"
            )
            .forEach((result) => {
                const batch = batches.find(
                    (b) => b.batch_code === result.batch_code
                );
                const status =
                    result.grade.toLowerCase() === "absent" ||
                    result.grade.toLowerCase() === "ab" ||
                    result.grade.toLowerCase() === "a/b"
                        ? "Absent"
                        : (() => {
                              const normalizedGrade = result.grade
                                  .toUpperCase()
                                  .replace("_", "-");
                              return [
                                  "A+",
                                  "A",
                                  "A-",
                                  "B+",
                                  "B",
                                  "B-",
                                  "C+",
                                  "C",
                              ].includes(normalizedGrade)
                                  ? "Passed"
                                  : "Failed";
                          })();

                data.push([
                    result.subject_name,
                    result.subject_code,
                    result.grade,
                    status,
                    batch ? batch.batch_name || batch.batch_code : "Unknown",
                ]);
            });

        // Create empty worksheet
        const ws = XLSX.utils.aoa_to_sheet([]);

        // Set column widths
        const wscols = [
            { wch: 30 }, // Subject
            { wch: 15 }, // Subject Code
            { wch: 10 }, // Grade
            { wch: 10 }, // Status
            { wch: 20 }, // Batch
        ];
        ws["!cols"] = wscols;

        // Add student info at the top of the sheet
        XLSX.utils.sheet_add_aoa(
            ws,
            [
                ["Student Results"],
                [
                    `Name: ${student.first_name} ${
                        student.last_name ? student.last_name : ""
                    }`,
                ],
                [`Student ID: ${student.NIC_PO}`],
                [`Generated on: ${new Date().toLocaleDateString()}`],
                [""], // Empty row for spacing
            ],
            { origin: "A1" }
        );

        // Add data table (only once)
        XLSX.utils.sheet_add_aoa(ws, data, { origin: "A6" });

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Results");

        // Generate Excel file and download
        const fileName = batchId
            ? `${student.first_name}_${
                  student.last_name ? student.last_name : ""
              }_batch_results.xlsx`
            : `${student.first_name}_${
                  student.last_name ? student.last_name : ""
              }_all_results.xlsx`;

        XLSX.writeFile(wb, fileName);
    };

    // Scroll to top functionality
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Prepare chart data
    const gradeDistribution = {
        labels: [
            "A+",
            "A",
            "A-",
            "B+",
            "B",
            "B-",
            "C+",
            "C",
            "C-",
            "D+",
            "D",
            "D-",
            "F",
        ],
        datasets: [
            {
                label: "Grade Distribution",
                data: [
                    resultStats.aPlusCount || 0,
                    resultStats.aCount || 0,
                    resultStats.aMinusCount || 0,
                    resultStats.bPlusCount || 0,
                    resultStats.bCount || 0,
                    resultStats.bMinusCount || 0,
                    resultStats.cPlusCount || 0,
                    resultStats.cCount || 0,
                    resultStats.cMinusCount || 0,
                    resultStats.dPlusCount || 0,
                    resultStats.dCount || 0,
                    resultStats.dMinusCount || 0,
                    resultStats.fCount || 0,
                ],
                backgroundColor: [
                    "rgba(16, 185, 129, 0.8)", // Green - A+
                    "rgba(20, 184, 166, 0.8)", // Teal - A
                    "rgba(56, 189, 248, 0.8)", // Light Blue - A-
                    "rgba(59, 130, 246, 0.8)", // Blue - B+
                    "rgba(99, 102, 241, 0.8)", // Indigo - B
                    "rgba(139, 92, 246, 0.8)", // Purple - B-
                    "rgba(168, 85, 247, 0.8)", // Violet - C+
                    "rgba(217, 70, 239, 0.8)", // Fuchsia - C
                    "rgba(236, 72, 153, 0.8)", // Pink - C-
                    "rgba(244, 114, 182, 0.8)", // Rose - D+
                    "rgba(251, 146, 60, 0.8)", // Orange - D
                    "rgba(249, 115, 22, 0.8)", // Amber - D-
                    "rgba(239, 68, 68, 0.8)", // Red - F
                ],
                borderWidth: 1,
            },
        ],
    };

    const progressData = {
        labels: batches.map((batch) => batch.batch_name || "Unknown Batch"),
        datasets: [
            {
                label: "Performance Score",
                data: batches.map((batch) => batch.performance_score || 0),
                backgroundColor: "rgba(59, 130, 246, 0.7)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Head
                title={`${student.first_name} ${
                    student.last_name || ""
                } - Profile`}
            />
            <Toaster position="top-right" />

            {/* Header */}
            <div className="bg-indigo-600 dark:bg-indigo-800 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <MdSchool className="text-white text-3xl mr-3" />
                            <h1 className="text-2xl font-bold text-white">
                                Student Portal
                            </h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-colors"
                        >
                            <MdLogout className="mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
                {/* Top Profile Section */}
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg overflow-hidden mb-6 transform transition-transform hover:scale-[1.01]">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start">
                            {/* Profile Photo */}
                            <div className="relative mb-6 md:mb-0 md:mr-8">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                    <img
                                        src={profileImage}
                                        alt={`${student.first_name}'s profile`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src =
                                                "https://via.placeholder.com/150?text=Student";
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                    title="Change profile picture"
                                >
                                    <MdOutlineInsertPhoto
                                        className="text-indigo-600"
                                        size={20}
                                    />
                                </button>
                            </div>

                            {/* Profile Info */}
                            <div className="text-center md:text-left text-white flex-grow">
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                    {student.first_name} {student.last_name}
                                </h1>
                                <p className="text-xl opacity-90 mb-4">
                                    Student ID: {student.NIC_PO}
                                </p>

                                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                                    {student.email && (
                                        <div className="flex items-center">
                                            <MdEmail
                                                className="mr-2"
                                                size={20}
                                            />
                                            <span>{student.email}</span>
                                        </div>
                                    )}

                                    {student.mobile_number && (
                                        <div className="flex items-center">
                                            <MdPhone
                                                className="mr-2"
                                                size={20}
                                            />
                                            <span>{student.mobile_number}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                                    {batches &&
                                        batches.length > 0 &&
                                        batches.map((batch, index) => (
                                            <span
                                                key={index}
                                                className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm"
                                            >
                                                {batch.batch_name ||
                                                    batch.batch_code}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`flex-1 py-4 px-6 font-medium focus:outline-none transition-all duration-200 ${
                            activeTab === "overview"
                                ? "text-indigo-600 border-b-2 border-indigo-600"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        }`}
                    >
                        <div className="flex items-center justify-center">
                            <MdPerson className="mr-2" size={20} />
                            <span>Overview</span>
                        </div>
                    </button>
                </div>

                {/* Content Sections */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 transition-all duration-300">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div
                            className={`space-y-6 ${
                                editMode ? "animate-fadeIn" : ""
                            }`}
                        >
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                                <MdInfoOutline className="mr-2 text-indigo-600" />
                                Personal Information
                            </h3>
                            {/* Password Update Section with Toggle */}
                            <div className="mt-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                        <MdLock className="mr-2 text-indigo-600" />
                                        Update Password
                                    </h4>
                                    <button
                                        onClick={() =>
                                            setShowPasswordSection(
                                                !showPasswordSection
                                            )
                                        }
                                        className="flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                    >
                                        {showPasswordSection ? (
                                            <>
                                                <span className="text-sm mr-1">
                                                    Hide
                                                </span>
                                                <MdExpandLess size={20} />
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-sm mr-1">
                                                    Show
                                                </span>
                                                <MdExpandMore size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>

                                {showPasswordSection && (
                                    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 transform transition-transform hover:scale-[1.01]">
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handlePasswordUpdate();
                                            }}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Current Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={
                                                                showCurrentPassword
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            name="current_password"
                                                            value={
                                                                passwordForm.current_password
                                                            }
                                                            onChange={
                                                                handlePasswordFormChange
                                                            }
                                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            placeholder="Enter your current password"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowCurrentPassword(
                                                                    !showCurrentPassword
                                                                )
                                                            }
                                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showCurrentPassword ? (
                                                                <MdVisibilityOff className="h-5 w-5" />
                                                            ) : (
                                                                <MdVisibility className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        New Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={
                                                                showNewPassword
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            name="new_password"
                                                            value={
                                                                passwordForm.new_password
                                                            }
                                                            onChange={
                                                                handlePasswordFormChange
                                                            }
                                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            placeholder="Enter new password"
                                                            required
                                                            minLength="6"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowNewPassword(
                                                                    !showNewPassword
                                                                )
                                                            }
                                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showNewPassword ? (
                                                                <MdVisibilityOff className="h-5 w-5" />
                                                            ) : (
                                                                <MdVisibility className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Password should be at
                                                        least 6 characters
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Confirm New Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={
                                                                showConfirmPassword
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            name="password_confirmation"
                                                            value={
                                                                passwordForm.password_confirmation
                                                            }
                                                            onChange={
                                                                handlePasswordFormChange
                                                            }
                                                            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                                passwordForm.new_password &&
                                                                passwordForm.password_confirmation &&
                                                                passwordForm.new_password !==
                                                                    passwordForm.password_confirmation
                                                                    ? "border-red-300"
                                                                    : "border-gray-300"
                                                            }`}
                                                            placeholder="Confirm new password"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowConfirmPassword(
                                                                    !showConfirmPassword
                                                                )
                                                            }
                                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showConfirmPassword ? (
                                                                <MdVisibilityOff className="h-5 w-5" />
                                                            ) : (
                                                                <MdVisibility className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    {passwordForm.new_password &&
                                                        passwordForm.password_confirmation &&
                                                        passwordForm.new_password !==
                                                            passwordForm.password_confirmation && (
                                                            <p className="mt-1 text-xs text-red-500">
                                                                Passwords do not
                                                                match
                                                            </p>
                                                        )}
                                                </div>

                                                <div className="md:col-span-2 flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            updatingPassword ||
                                                            !passwordForm.current_password ||
                                                            !passwordForm.new_password ||
                                                            !passwordForm.password_confirmation ||
                                                            passwordForm.new_password !==
                                                                passwordForm.password_confirmation
                                                        }
                                                        className={`px-6 py-3 rounded-md shadow text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                                            updatingPassword ||
                                                            !passwordForm.current_password ||
                                                            !passwordForm.new_password ||
                                                            !passwordForm.password_confirmation ||
                                                            passwordForm.new_password !==
                                                                passwordForm.password_confirmation
                                                                ? "bg-indigo-400 cursor-not-allowed focus:ring-indigo-400"
                                                                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                                                        }`}
                                                    >
                                                        {updatingPassword ? (
                                                            <div className="flex items-center">
                                                                <svg
                                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <circle
                                                                        className="opacity-25"
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="10"
                                                                        stroke="currentColor"
                                                                        strokeWidth="4"
                                                                    ></circle>
                                                                    <path
                                                                        className="opacity-75"
                                                                        fill="currentColor"
                                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                    ></path>
                                                                </svg>
                                                                Updating...
                                                            </div>
                                                        ) : (
                                                            "Update Password"
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                            {editMode ? (
                                /* Edit Form */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            name="mobile_number"
                                            value={formData.mobile_number}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Address
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        ></textarea>
                                    </div>

                                    {/* Password Section */}
                                    <div className="md:col-span-2 mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                                        <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                                            Password Management
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="Enter new password"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Confirm Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="password_confirmation"
                                                    value={
                                                        formData.password_confirmation
                                                    }
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="Confirm password"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 flex justify-end">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={loading}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            {loading
                                                ? "Saving..."
                                                : "Save Changes"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Display View */
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 transform transition-transform hover:scale-[1.02]">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                                                Contact Details
                                            </h4>

                                            <div className="space-y-4">
                                                <div className="flex items-start">
                                                    <MdPerson
                                                        className="text-indigo-600 dark:text-indigo-400 mr-3 mt-1"
                                                        size={20}
                                                    />
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Full Name
                                                        </p>
                                                        <p className="font-medium text-gray-800 dark:text-white">
                                                            {student.first_name}{" "}
                                                            {student.last_name}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start">
                                                    <MdEmail
                                                        className="text-indigo-600 dark:text-indigo-400 mr-3 mt-1"
                                                        size={20}
                                                    />
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Email Address
                                                        </p>
                                                        <p className="font-medium text-gray-800 dark:text-white">
                                                            {student.email ||
                                                                "Not provided"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start">
                                                    <MdPhone
                                                        className="text-indigo-600 dark:text-indigo-400 mr-3 mt-1"
                                                        size={20}
                                                    />
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Phone Number
                                                        </p>
                                                        <p className="font-medium text-gray-800 dark:text-white">
                                                            {student.mobile_number ||
                                                                "Not provided"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start">
                                                    <MdLocationOn
                                                        className="text-indigo-600 dark:text-indigo-400 mr-3 mt-1"
                                                        size={20}
                                                    />
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Address
                                                        </p>
                                                        <p className="font-medium text-gray-800 dark:text-white">
                                                            {student.address ||
                                                                "Not provided"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 transform transition-transform hover:scale-[1.02]">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                                                Academic Profile
                                            </h4>

                                            <div className="space-y-4">
                                                <div className="flex items-start">
                                                    <MdVerified
                                                        className="text-indigo-600 dark:text-indigo-400 mr-3 mt-1"
                                                        size={20}
                                                    />
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Student ID
                                                        </p>
                                                        <p className="font-medium text-gray-800 dark:text-white">
                                                            {student.NIC_PO}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start">
                                                    <MdSchool
                                                        className="text-indigo-600 dark:text-indigo-400 mr-3 mt-1"
                                                        size={20}
                                                    />
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Currently Availble
                                                            Results
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {batches &&
                                                            batches.length >
                                                                0 ? (
                                                                batches.map(
                                                                    (
                                                                        batch,
                                                                        index
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300"
                                                                        >
                                                                            {batch.batch_name ||
                                                                                batch.batch_code}
                                                                        </span>
                                                                    )
                                                                )
                                                            ) : (
                                                                <span className="text-gray-500 dark:text-gray-400">
                                                                    No active
                                                                    enrollments
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/*      <div className="flex items-start">
                                <MdBarChart className="text-indigo-600 dark:text-indigo-400 mr-3 mt-1" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Academic Status</p>
                                    <p className="font-medium text-gray-800 dark:text-white">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            resultStats && resultStats.passRate > 80 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                : resultStats && resultStats.passRate > 50
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                            {resultStats && resultStats.status ? resultStats.status : 'Active'}
                                        </span>
                                    </p>
                                </div>
                            </div> */}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Batch Results Section */}
                                    <div className="mt-8">
                                        <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                                            <MdAssignment className="mr-2 text-indigo-600" />
                                            Batch Results
                                        </h4>

                                        {batches && batches.length > 0 ? (
                                            <div className="space-y-4">
                                                {batches.map((batch, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600 overflow-hidden"
                                                    >
                                                        <div
                                                            onClick={() => {
                                                                if (
                                                                    expandedBatch ===
                                                                    batch.batch_id
                                                                ) {
                                                                    setExpandedBatch(
                                                                        null
                                                                    );
                                                                } else {
                                                                    setExpandedBatch(
                                                                        batch.batch_id
                                                                    );
                                                                    filterResultsByStatus(
                                                                        "all",
                                                                        batch.batch_id
                                                                    );
                                                                    setFilterValue(
                                                                        "all"
                                                                    );
                                                                }
                                                            }}
                                                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                                        >
                                                            <div className="flex items-center">
                                                                <div
                                                                    className="w-3 h-12 rounded-full mr-4"
                                                                    style={{
                                                                        backgroundColor:
                                                                            [
                                                                                "#3B82F6",
                                                                                "#10B981",
                                                                                "#8B5CF6",
                                                                                "#F59E0B",
                                                                            ][
                                                                                index %
                                                                                    4
                                                                            ],
                                                                    }}
                                                                ></div>
                                                                <div>
                                                                    <h5 className="text-lg font-medium text-gray-800 dark:text-white">
                                                                        {batch.batch_name ||
                                                                            "Unnamed Batch"}
                                                                    </h5>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {
                                                                            batch.batch_code
                                                                        }{" "}
                                                                        -{" "}
                                                                        {batch.department_name ||
                                                                            "Department"}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {
                                                                            batch.status
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center">
                                                               

                                                                <svg
                                                                    className={`h-5 w-5 text-gray-500 transition-transform ${
                                                                        expandedBatch ===
                                                                        batch.batch_id
                                                                            ? "transform rotate-180"
                                                                            : ""
                                                                    }`}
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        {expandedBatch ===
                                                            batch.batch_id && (
                                                            <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                                                                {/* Results Table */}
                                                                <div className="overflow-x-auto">
                                                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                                                            <tr>
                                                                                <th
                                                                                    scope="col"
                                                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                                                >
                                                                                    Subject
                                                                                </th>
                                                                                <th
                                                                                    scope="col"
                                                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                                                >
                                                                                    Grade
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-600">
                                                                            {filteredResults.length >
                                                                            0 ? (
                                                                                // Filter out null/empty/invalid grades
                                                                                filteredResults
                                                                                    .filter(
                                                                                        (
                                                                                            result
                                                                                        ) =>
                                                                                            result.grade &&
                                                                                            result.grade !==
                                                                                                "-" &&
                                                                                            result.grade !==
                                                                                                "unknown"
                                                                                    )
                                                                                    .map(
                                                                                        (
                                                                                            result,
                                                                                            resultIndex
                                                                                        ) => (
                                                                                            <tr
                                                                                                key={
                                                                                                    resultIndex
                                                                                                }
                                                                                                className={`${
                                                                                                    resultIndex %
                                                                                                        2 ===
                                                                                                    0
                                                                                                        ? "bg-white dark:bg-gray-700"
                                                                                                        : "bg-gray-50 dark:bg-gray-600"
                                                                                                } hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors`}
                                                                                            >
                                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                                        {
                                                                                                            result.subject_name
                                                                                                        }
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                                    <span
                                                                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${(() => {
                                                const normalizedGrade =
                                                    result.grade
                                                        .toUpperCase()
                                                        .replace("_", "-");
                                                return [
                                                    "A+",
                                                    "A",
                                                    "A-",
                                                    "B+",
                                                    "B",
                                                    "B-",
                                                    "C+",
                                                    "C",
                                                ].includes(normalizedGrade)
                                                    ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300"
                                                    : result.grade.toUpperCase() ===
                                                      "F"
                                                    ? "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300"
                                                    : "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300";
                                            })()}`}
                                                                                                    >
                                                                                                        {
                                                                                                            result.grade
                                                                                                        }
                                                                                                    </span>
                                                                                                </td>
                                                                                            </tr>
                                                                                        )
                                                                                    )
                                                                            ) : (
                                                                                <tr>
                                                                                    <td
                                                                                        colSpan="2"
                                                                                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                                                                                    >
                                                                                        No
                                                                                        results
                                                                                        available
                                                                                        for
                                                                                        this
                                                                                        filter
                                                                                    </td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}{" "}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6 text-center">
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    No batches enrolled
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Scroll to top button */}
            <button
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors z-50"
                aria-label="Scroll to top"
            >
                <MdArrowUpward size={24} />
            </button>

            {/* Upload Profile Image Modal */}
            {showUploadModal && (
                <Dialog
                    open={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    className="fixed inset-0 z-50 overflow-y-auto"
                >
                    <div className="flex items-center justify-center min-h-screen">
                        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

                        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <Dialog.Title className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                                Update Profile Picture
                            </Dialog.Title>

                            <div className="space-y-6">
                                {imagePreview ? (
                                    <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                                        <MdOutlineInsertPhoto
                                            className="mx-auto text-gray-400 dark:text-gray-500"
                                            size={48}
                                        />
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Select an image to upload
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Choose a profile picture
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
                                    />
                                </div>

                                {isUploading && (
                                    <div className="mt-4">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Uploading...
                                            </span>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {uploadProgress}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                            <div
                                                className="bg-indigo-600 h-2 rounded-full"
                                                style={{
                                                    width: `${uploadProgress}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowUploadModal(false)
                                        }
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleUploadImage}
                                        disabled={!imageFile || isUploading}
                                        className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none ${
                                            !imageFile || isUploading
                                                ? "bg-indigo-400 cursor-not-allowed"
                                                : "bg-indigo-600 hover:bg-indigo-700"
                                        }`}
                                    >
                                        {isUploading
                                            ? "Uploading..."
                                            : "Upload Image"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>
            )}
        </div>
    );
}

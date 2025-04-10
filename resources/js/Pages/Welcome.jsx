import { Link, Head } from '@inertiajs/react'; 
import SeasonalSnowfall from './componments/SeasonalSnowfall';
import { MdDashboard, MdAssignment, MdUpload, MdLanguage, MdArrowForward, MdLogin, MdAppRegistration } from 'react-icons/md';

export default function Welcome(props) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-sky-50">
            <Head title="Welcome" />
            <SeasonalSnowfall />
            
            {/* Header with the specified gradient */}
            <header className="shadow-md" style={{ background: 'linear-gradient(to right, rgb(63, 151, 177), rgb(66, 155, 214))' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between py-6">
                        <div className="flex items-center">
                            <img 
                                src="https://www.bci.lk/wp-content/uploads/2020/12/logo.svg" 
                                alt="BCI Logo" 
                                className="h-16 md:h-20 object-contain"
                            />
                        </div>
                        
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center my-4 md:my-0">
                            <span className="hidden sm:inline">BCI </span>
                            RESULT MANAGEMENT SYSTEM
                        </h1>
                        
                        <div className="mt-4 md:mt-0">
                            {props.auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center px-4 py-2 bg-white text-[rgb(63,151,177)] border border-transparent rounded-md font-semibold text-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(63,151,177)] transition-colors duration-200 shadow-sm"
                                >
                                    <MdDashboard className="mr-2" /> Dashboard
                                </Link>
                            ) : (
                                <div className="flex space-x-4">
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center px-4 py-2 bg-white text-[rgb(63,151,177)] border border-transparent rounded-md font-semibold text-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(63,151,177)] transition-colors duration-200 shadow-sm"
                                    >
                                        <MdLogin className="mr-2" /> Log in
                                    </Link>

                                  {/*   <Link
                                        href={route('register')}
                                        className="inline-flex items-center px-4 py-2 bg-[rgb(43,111,157)] text-white border border-transparent rounded-md font-semibold text-sm hover:bg-[rgb(33,101,147)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(43,111,157)] transition-colors duration-200 shadow-sm"
                                    >
                                        <MdAppRegistration className="mr-2" /> Register
                                    </Link> */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Decorative accent bar */}
                <div className="h-1 bg-gradient-to-r from-yellow-300 via-white to-yellow-300 opacity-40"></div>
            </header>

            <div className="flex-grow py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Welcome Title Section */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold text-[rgb(43,111,147)] mb-3">BCI Result Management System</h1>
                        <p className="text-[rgb(63,151,177)] text-lg max-w-2xl mx-auto">
                            Access and manage examination results easily through our secure platform
                        </p>
                    </div>

                    {/* Card Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {/* Dashboard Card */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-sky-100">
                            <div className="flex flex-col sm:flex-row">
                                <div className="sm:flex-shrink-0 p-6 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, rgb(63, 151, 177), rgb(43, 111, 157))' }}>
                                    <MdDashboard className="h-12 w-12 text-white" />
                                </div>
                                <div className="p-6 flex-grow">
                                    <h2 className="text-xl font-semibold text-[rgb(43,111,147)] mb-2">Student Portal</h2>
                                    <p className="text-gray-600 mb-4">Access the student portal to view your results </p>
                                    <Link
                                        href={route('student.profile')}
                                        className="inline-flex items-center text-[rgb(63,151,177)] font-medium hover:text-[rgb(43,111,157)]"
                                    >
                                        Go to Portal <MdArrowForward className="ml-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* View Result Card */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-sky-100">
                            <div className="flex flex-col sm:flex-row">
                                <div className="sm:flex-shrink-0 p-6 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, rgb(66, 155, 214), rgb(59, 130, 246))' }}>
                                    <MdAssignment className="h-12 w-12 text-white" />
                                </div>
                                <div className="p-6 flex-grow">
                                    <h2 className="text-xl font-semibold text-[rgb(43,111,147)] mb-2">View Results</h2>
                                    <p className="text-gray-600 mb-4">Check examination results by providing your credentials</p>
                                    <Link
                                        href={route('ViewResult')}
                                        className="inline-flex items-center text-[rgb(66,155,214)] font-medium hover:text-[rgb(59,130,246)]"
                                        target="_blank"
                                    >
                                        View Results <MdArrowForward className="ml-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Add Result Card */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-sky-100">
                            <div className="flex flex-col sm:flex-row">
                                <div className="sm:flex-shrink-0 p-6 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, rgb(14, 165, 142), rgb(5, 150, 105))' }}>
                                    <MdUpload className="h-12 w-12 text-white" />
                                </div>
                                <div className="p-6 flex-grow">
                                    <h2 className="text-xl font-semibold text-[rgb(43,111,147)] mb-2">Student LMS</h2>
                                    <p className="text-gray-600 mb-4">
                                        Access the Learning Management System (LMS) for course materials and updates 

                                    </p>
                                    <a
                                        href="https://lms.bci.lk"
                                        target="_blank"
                                        className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-700"
                                    >
                                       Student LMS<MdArrowForward className="ml-1" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Website Card */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-sky-100">
                            <div className="flex flex-col sm:flex-row">
                                <div className="sm:flex-shrink-0 p-6 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, rgb(124, 58, 237), rgb(109, 40, 217))' }}>
                                    <MdLanguage className="h-12 w-12 text-white" />
                                </div>
                                <div className="p-6 flex-grow">
                                    <h2 className="text-xl font-semibold text-[rgb(43,111,147)] mb-2">BCI Website</h2>
                                    <p className="text-gray-600 mb-4">Visit the official website of Benedict XVI Catholic Institute Negombo</p>
                                    <a
                                        href="https://www.bci.lk" 
                                        target="_blank"
                                        className="inline-flex items-center text-violet-600 font-medium hover:text-violet-700"
                                    >
                                        Visit Website <MdArrowForward className="ml-1" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Additional Info Section */}
                    <div className="rounded-xl p-8 border border-sky-200" style={{ background: 'linear-gradient(to right, rgba(63, 151, 177, 0.1), rgba(66, 155, 214, 0.1))' }}>
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-2xl font-bold text-[rgb(43,111,147)] mb-4">About BCI Result Management System</h2>
                            <p className="text-gray-700 mb-6">
                                This system provides a secure and efficient way to manage and distribute examination results 
                                for students and staff at Benedict XVI Catholic Institute.
                            </p>
                            {!props.auth.user && (
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center px-5 py-3 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(63,151,177)] transition-all duration-200 shadow-md"
                                    style={{ background: 'linear-gradient(to right, rgb(63, 151, 177), rgb(66, 155, 214))' }}
                                >
                                    Get Started <MdArrowForward className="ml-2" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-8 text-white" style={{ background: 'linear-gradient(to right, rgb(43, 111, 147), rgb(63, 151, 177))' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center">
                            <img 
                                src="https://www.bci.lk/wp-content/uploads/2020/12/logo.svg" 
                                alt="BCI Logo" 
                                className="h-10 mr-4" 
                            />
                            <span className="text-white text-sm">
                                Result Management System
                            </span>
                        </div>
                        
                        <div className="mt-4 md:mt-0 text-white text-sm">
                            Benedict XVI Catholic Institute © {new Date().getFullYear()}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
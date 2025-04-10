import { useEffect, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiLockClosed, HiShieldCheck, HiUserGroup } from 'react-icons/hi';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'manager',
    });

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [formStep, setFormStep] = useState(1);
    
    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const handleOnChange = (event) => {
        setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
    };

    const nextStep = (e) => {
        e.preventDefault();
        setFormStep(2);
    };

    const prevStep = (e) => {
        e.preventDefault();
        setFormStep(1);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Create Your Account</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Join our platform to manage results effectively</p>
            </div>

            <div className="relative mb-8">
                <div className="flex items-center justify-between">
                    <div className={`flex-1 ${formStep === 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600'}`}>
                        <div className="flex items-center justify-center flex-col">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                                formStep === 1 
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                            }`}>
                                <HiUser className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium">Account Details</span>
                        </div>
                    </div>
                    
                    <div className="w-1/4 h-1 bg-gray-200 dark:bg-gray-700"></div>
                    
                    <div className={`flex-1 ${formStep === 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600'}`}>
                        <div className="flex items-center justify-center flex-col">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                                formStep === 2 
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                            }`}>
                                <HiLockClosed className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium">Security</span>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                {formStep === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-6"
                    >
                        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Personal Information</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <InputLabel htmlFor="name" value="Full Name" />
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiUser className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="pl-10 block w-full"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={handleOnChange}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email Address" />
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="pl-10 block w-full"
                                        autoComplete="username"
                                        onChange={handleOnChange}
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="role" value="Account Type" />
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiUserGroup className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        id="role"
                                        name="role"
                                        value={data.role}
                                        className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 shadow-sm"
                                        onChange={handleOnChange}
                                        required
                                    >
                                        <option value="manager">Manager</option>
                                        <option value="manager,admin">Administrator</option>
                                    </select>
                                </div>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Select your account privileges level</p>
                                <InputError message={errors.role} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={nextStep}
                                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md shadow-md transition-all duration-200 flex items-center justify-center"
                                type="button"
                            >
                                <span>Continue</span>
                                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                )}

                {formStep === 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-6"
                    >
                        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Security Information</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <InputLabel htmlFor="password" value="Password" />
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiLockClosed className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="password"
                                        type={passwordVisible ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        className="pl-10 pr-10 block w-full"
                                        autoComplete="new-password"
                                        onChange={handleOnChange}
                                        placeholder="Create a strong password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {passwordVisible ? (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Minimum 8 characters with letters and numbers</p>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiShieldCheck className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="password_confirmation"
                                        type={confirmPasswordVisible ? "text" : "password"}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="pl-10 pr-10 block w-full"
                                        autoComplete="new-password"
                                        onChange={handleOnChange}
                                        placeholder="Confirm your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleConfirmPasswordVisibility}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {confirmPasswordVisible ? (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <button
                                onClick={prevStep}
                                className="py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors duration-200 flex items-center justify-center"
                                type="button"
                            >
                                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>Back</span>
                            </button>
                            
                            <button
                                type="submit"
                                disabled={processing}
                                className={`py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md shadow-md transition-all duration-200 flex items-center justify-center ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <span>Complete Registration</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </form>

            <div className="text-center mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link
                        href={route('login')}
                        className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
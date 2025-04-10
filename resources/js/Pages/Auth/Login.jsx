import { useEffect, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [passwordVisible, setPasswordVisible] = useState(false);

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const handleOnChange = (event) => {
        setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Welcome Back</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to access your account</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {status && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex">
                            <svg className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-green-800 dark:text-green-200">{status}</span>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={submit}>
                            <div className="space-y-6">
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
                                            isFocused={true}
                                            onChange={handleOnChange}
                                            placeholder="your.email@example.com"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <InputLabel htmlFor="password" value="Password" />
                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>
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
                                            autoComplete="current-password"
                                            onChange={handleOnChange}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {passwordVisible ? (
                                                <HiEyeOff className="h-5 w-5" />
                                            ) : (
                                                <HiEye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center cursor-pointer">
                                        <Checkbox 
                                            name="remember" 
                                            checked={data.remember} 
                                            onChange={handleOnChange}
                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md shadow-md transition-all duration-200 flex items-center justify-center ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign in"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>

            <div className="text-center mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account yet?{' '}
                    <Link
                        href={route('register')}
                        className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
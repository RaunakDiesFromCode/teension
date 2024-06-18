'use client'
import { useState, ChangeEvent } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

const SignUp = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [createUserWithEmailAndPassword, user, loading, signUpError] = useCreateUserWithEmailAndPassword(auth);

    const handleSignUp = async () => {
        setError(''); // Clear previous error
        try {
            const res = await createUserWithEmailAndPassword(email, password);
            if (res?.user) {
                console.log({ res });
                sessionStorage.setItem('user', 'true');
                setEmail('');
                setPassword('');
            } else {
                setError('Sign-up failed. Please try again.');
            }
        } catch (e: any) {
            if (e.code === 'auth/email-already-in-use') {
                setError('Email already in use. Please sign in instead.');
            } else {
                setError(e.message || 'An unexpected error occurred. Please try again.');
            }
            console.error(e);
        }
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) setError(''); // Clear error when user starts typing
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error) setError(''); // Clear error when user starts typing
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-black">
            <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
                <h1 className="text-white text-2xl mb-5">Sign Up</h1>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
                />
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500 pr-10"
                    />
                    <button
                        onClick={toggleShowPassword}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                {error && (
                    <p className="text-red-500 mb-4">
                        {error} {error.includes('sign in') && <Link href="/sign-in" className='text-white/50 underline'>Sign In</Link>}
                    </p>
                )}
                <button
                    onClick={handleSignUp}
                    className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
                    disabled={loading}
                >
                    Sign Up
                </button>
                <Link href="/sign-in" className='text-white/50 flex justify-center pt-2 text-sm'>Take me to sign-in Page</Link>
            </div>
        </div>
    );
};

export default SignUp;

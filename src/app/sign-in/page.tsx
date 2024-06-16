// app/sign-in/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/"); // Redirect to home page after successful sign-in
        } catch (error: any) {
            setError(error.message);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 text-black">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Sign In</h2>
                <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300 text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password:</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"} // Toggle input type based on showPassword state
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300 text-black"
                            />
                            <button
                                type="button"
                                onClick={toggleShowPassword}
                                className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 focus:outline-none"
                            >
                                {showPassword ? (
                                    <FaRegEye />
                                ) : (
                                    <FaRegEyeSlash />
                                )}
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600">Invalid email or password. Please try again.</p>}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignIn;

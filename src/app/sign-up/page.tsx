// app/sign-up/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuth } from "../utils/authUtils";

const SignUp = () => {
    const { user, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.push("/"); // Redirect to home page after successful sign-up
        } catch (error: any) {
            setError(error.message);
        }
    };

    if (loading) return <p>Loading...</p>; 

    if (user) {
        router.push("/"); // Redirect to home page if already signed in
        return null;
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 text-black">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Sign Up</h2>
                <form onSubmit={handleSignUp} className="space-y-4">
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
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300 text-black"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
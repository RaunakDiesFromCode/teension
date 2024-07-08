"use client";
import { useState, ChangeEvent } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

const SignIn = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [signInWithEmailAndPassword, user, loading, signInError] =
    useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSignIn = async () => {
    setError(""); // Clear previous error
    try {
      const res = await signInWithEmailAndPassword(email, password);
      if (res?.user) {
        console.log({ res });
        sessionStorage.setItem("user", "true");
        setEmail("");
        setPassword("");
        router.push("/");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred. Please try again.");
      console.error(e);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-full flex items-center justify-center dark:bg-gray-900 bg-gray-200 z-50 transition-colors duration-100">
      <div className="dark:bg-gray-800 bg-gray-100 p-10 rounded-lg shadow-xl w-96">
        <h1 className="dark:text-white text-black text-2xl mb-5">Sign In</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
          className="w-full p-3 mb-4 dark:bg-gray-700 bg-gray-50 rounded outline-none dark:text-white text-black placeholder-gray-500 transition-colors duration-100"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            className="w-full p-3 mb-4 dark:bg-gray-700 bg-gray-50 rounded outline-none dark:text-white text-black placeholder-gray-500 pr-10 transition-colors duration-100"
          />
          <button
            onClick={toggleShowPassword}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={handleSignIn}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500 "
          disabled={loading}
        >
          Sign In
        </button>
        <Link
          href="/sign-up"
          className="dark:text-white/50 text-black/50 flex justify-center pt-2 text-sm transition-colors duration-100"
        >
          Take me to sign-up Page
        </Link>
      </div>
    </div>
  );
};

export default SignIn;

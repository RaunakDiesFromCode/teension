"use client";
import { useState, ChangeEvent } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db, storage } from "@/app/firebase/config";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { doc, setDoc, serverTimestamp } from "@firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import {useRouter} from "next/navigation";

const SignUp = () => {
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [createUserWithEmailAndPassword, user, loading, signUpError] =
    useCreateUserWithEmailAndPassword(auth);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(
    null
  );

  const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePictureFile(file);
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhotoFile(file);
        setCoverPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignUp = async () => {
    setError(""); // Clear previous error
    try {
      const res = await createUserWithEmailAndPassword(email, password);
      if (res?.user) {
        console.log({ res });
        sessionStorage.setItem("user", "true");

        const storage = getStorage();
        let profilePictureURL = "";
        let coverPhotoURL = "";

        // Upload profile picture if present
        if (profilePictureFile) {
          const profileStorageRef = ref(
            storage,
            `images/${profilePictureFile.name}`
          );
          await uploadBytes(profileStorageRef, profilePictureFile);
          profilePictureURL = await getDownloadURL(profileStorageRef);
        }

        // Upload cover photo if present
        if (coverPhotoFile) {
          const coverStorageRef = ref(storage, `images/${coverPhotoFile.name}`);
          await uploadBytes(coverStorageRef, coverPhotoFile);
          coverPhotoURL = await getDownloadURL(coverStorageRef);
        }

        // Add user information to Firestore, including cover photo URL if available
        await setDoc(doc(db, "users", email), {
          email,
          name,
          profilePicture: profilePictureURL,
          coverPhoto: coverPhotoURL, // Include cover photo URL
          description,
          createdAt: serverTimestamp(), // Add createdAt timestamp
          stars: 1, // Add stars field
          tribe: "rookie", // Add tribe field
          fire: false, // Add fire field
          OP: false, // Add OP field
        });

        // Reset form fields
        setEmail("");
        setPassword("");
        setName("");
        setProfilePictureFile(null);
        setProfilePicturePreview(null);
        setCoverPhotoFile(null); // Reset cover photo file
        setCoverPhotoPreview(null); // Reset cover photo preview
        setDescription("");

        const router = useRouter();
        router.push("/");
      } else {
        setError("Sign-up failed. Please try again.");
      }
    } catch (e: any) {
      if (e.code === "auth/email-already-in-use") {
        setError("Email already in use. Please sign in instead.");
      } else {
        setError(
          e.message || "An unexpected error occurred. Please try again."
        );
      }
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

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h1 className="text-white text-2xl mb-5">Sign Up - Step 1</h1>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <button
              onClick={() => setStep(2)}
              className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
            >
              Next
            </button>
          </div>
        );
      case 2:
        return (
          <div>
            <h1 className="text-white text-2xl mb-5">Sign Up - Step 2</h1>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
              id="profilePictureInput"
            />
            <label htmlFor="profilePictureInput" className="cursor-pointer">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl">+</span>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-400">
                Choose Profile Picture
              </div>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverPhotoChange}
              className="hidden"
              id="coverPhotoInput"
            />
            <label htmlFor="coverPhotoInput" className="cursor-pointer">
              <div className="w-full bg-gray-700 rounded flex items-center justify-center overflow-hidden h-32 mb-4">
                {coverPhotoPreview ? (
                  <img
                    src={coverPhotoPreview}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl">Add Cover Photo</span>
                )}
              </div>
            </label>
            <button
              onClick={() => setStep(3)}
              className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
            >
              Next
            </button>
          </div>
        );
      case 3:
        return (
          <div>
            <h1 className="text-white text-2xl mb-5">Sign Up - Step 3</h1>
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            />
            <button
              onClick={handleSignUp}
              className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
              disabled={loading}
            >
              Sign Up
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <div className="bg-gray-900 p-8 rounded shadow-lg w-96">
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {renderStepContent()}
        <Link
          href="/sign-in"
          className="text-white/50 flex justify-center pt-2 text-sm"
        >
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
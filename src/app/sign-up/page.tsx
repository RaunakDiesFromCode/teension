"use client";
import { useState, ChangeEvent } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/config";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  serverTimestamp,
  doc,
} from "@firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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

  const checkNameExists = async (name: string) => {
    const q = query(collection(db, "users"), where("name", "==", name));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSignUp = async () => {
    setError(""); // Clear previous error
    try {
      const nameExists = await checkNameExists(name);
      if (nameExists) {
        setError("Name already taken. Please choose a different name.");
        return;
      }

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
          coverPhoto: coverPhotoURL,
          description,
          createdAt: serverTimestamp(),
          stars: 1,
          tribe: "rookie",
          fire: false,
          OP: false,
        });

        // Reset form fields
        setEmail("");
        setPassword("");
        setName("");
        setProfilePictureFile(null);
        setProfilePicturePreview(null);
        setCoverPhotoFile(null);
        setCoverPhotoPreview(null);
        setDescription("");

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
          <div className="dark:bg-gray-800 bg-gray-300 p-5 rounded-md shadow-md">
            <h1 className="dark:text-white text-black text-2xl mb-5">
              Sign Up - Step 1
            </h1>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              className="w-full p-3 mb-4 dark:bg-gray-700 bg-gray-50 rounded outline-none dark:text-white text-black placeholder-gray-500 transition-colors duration-100"
            />
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 mb-4 dark:bg-gray-700 bg-gray-50 rounded outline-none dark:text-white text-black placeholder-gray-500 transition-colors duration-100"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-3 mb-4 dark:bg-gray-700 bg-gray-50 rounded outline-none dark:text-white text-black placeholder-gray-500 transition-colors duration-100"
              />
              <button
                onClick={toggleShowPassword}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className=" flex gap-3 flex-row-reverse">
              <button
                onClick={() => {
                  setStep(2);
                  setError("");
                }}
                className="w-[50%] p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="dark:bg-gray-800 bg-gray-300 p-5 rounded-md shadow-md w-[28rem] ">
            <h1 className="dark:text-white text-black text-2xl mb-5 transition-colors duration-100">
              Sign Up - Step 2
            </h1>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden "
              id="profilePictureInput"
            />
            <label
              htmlFor="profilePictureInput"
              className="cursor-pointer w-full "
            >
              <div className="w-20 h-20 dark:bg-gray-700 bg-gray-50 rounded-full flex items-center justify-center overflow-hidden transition-colors duration-100">
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="dark:text-white/50 text-black/50 text-2xl transition-colors duration-100">
                    +
                  </span>
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
              className="hidden "
              id="coverPhotoInput"
            />
            <label htmlFor="coverPhotoInput" className="cursor-pointer">
              <div className="w-full dark:bg-gray-700 bg-gray-50 rounded flex items-center justify-center overflow-hidden h-32 mb-4 transition-colors duration-100">
                {coverPhotoPreview ? (
                  <img
                    src={coverPhotoPreview}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="dark:text-white/50 text-black/50 text-2xl transition-colors duration-100">
                    +
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-400">
                Choose Cover Photo
              </div>
            </label>
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 mb-4 dark:bg-gray-700 bg-gray-50 rounded outline-none dark:text-white text-black placeholder-gray-500 transition-colors duration-100"
            />
            {error && (
              <p className="text-red-500 mb-4 transition-colors duration-100">
                {error}
              </p>
            )}
            <div className=" flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
              >
                Back
              </button>{" "}
              <button
                onClick={handleSignUp}
                className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500 transition-colors duration-100"
              >
                Sign Up
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      {renderStepContent()}
      <div className="mt-4 text-center">
        <Link href="/signin" className="text-indigo-600 hover:underline">
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );
};

export default SignUp;

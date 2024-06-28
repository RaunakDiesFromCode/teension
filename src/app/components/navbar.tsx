"use client";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaSearch } from "react-icons/fa";
import Logo from "./UI/logo";
import { RiNotification3Line } from "react-icons/ri";
import { MdFace } from "react-icons/md";
import { GoGear } from "react-icons/go";
import Link from "next/link";
import PostForm from "./postform";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "@firebase/firestore";
import { auth, db } from "../firebase/config";
import DropdownMenu from "./UI/DropdownMenu";

export default function Navbar() {
  const [showPostForm, setShowPostForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profilePic, setProfilePic] = useState("");

  const handlePostAdded = () => {
    setShowPostForm(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setProfilePic(userDoc.data().profilePicture);
        }
      } else {
        setProfilePic("");
      }
    });

    return () => unsubscribe();
  }, []);

  const email = user?.email || ""; // Get the email of the logged-in user

  return (
    <>
      <nav className="flex justify-between bg-gray-900 py-2 mt-3 px-9">
        <div>
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="rounded-xl bg-black pl-10 p-2 w-[50rem] border border-white/50 "
            />
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 px-1">
              <FaSearch />
            </span>
          </div>
        </div>
        <ul className="flex gap-5 items-center justify-center">
          <li>
            <Link href="/">
              <button
                onClick={() => setShowPostForm(true)}
                className="flex gap-2 bg-gray-700 px-4 py-2 rounded-xl hover:bg-gray-600 transition ease-in duration-100"
              >
                <FaPencilAlt size={23} />
                Post
              </button>
            </Link>
          </li>
          <li>
            <Link href="/about">
              <RiNotification3Line size={25} />
            </Link>
          </li>
          <li>
            <Link href={`/profile/${email}`}>
              {user ? (
                <img className="text-white"
                  src={profilePic}
                  alt="Profile"
                  style={{ width: 25, height: 25, borderRadius: "50%" }}
                />
              ) : (
                <span>
                  To sign in, click <Link href="/sign-in">here</Link>
                </span>
              )}
            </Link>
          </li>
          <li>
            <DropdownMenu /> {/* Use the DropdownMenu component */}
          </li>
        </ul>
      </nav>
      {showPostForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="p-4 rounded">
            <PostForm onPostAdded={handlePostAdded} />
          </div>
        </div>
      )}
    </>
  );
}

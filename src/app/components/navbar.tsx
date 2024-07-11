"use client";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaSearch } from "react-icons/fa";
import Logo from "./UI/logo";
import { RiNotification3Line } from "react-icons/ri";
import { MdFace } from "react-icons/md";
import { GoGear } from "react-icons/go";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "@firebase/firestore";
import { auth, db } from "../firebase/config";
import Image from "next/image";
import DropdownMenu from "./UI/DropdownMenu";
import NotificationDropdownMenu from "./UI/NotificationDropdownMenu";
import ThemeSwitch from "./themeSwitch";
import PostForm from "./postform";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [showPostForm, setShowPostForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profilePic, setProfilePic] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search/${searchQuery.trim()}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePostAdded = () => {
    setShowPostForm(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.email || "");
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
      <nav className="flex justify-between dark:bg-gray-900 bg-gray-200 py-2 mt-3 px-9 dark:text-white text-black transition-colors duration-100">
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
              className="rounded-xl dark:bg-black bg-white pl-10 p-2 w-[50rem] border dark:border-white/50 border-black/50 transition duration-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 px-1 cursor-pointer"
              onClick={handleSearch}
            >
              <FaSearch />
            </button>
          </div>
        </div>

        <ul className="flex gap-5 items-center justify-center">
          <li>
            <Link href="/">
              <button
                onClick={() => setShowPostForm(true)}
                className="flex gap-2 dark:bg-gray-700 bg-gray-300 px-4 py-2 rounded-xl dark:hover:bg-gray-600 hover:bg-gray-400 transition-colors duration-100"
              >
                <FaPencilAlt size={23} />
                Post
              </button>
            </Link>
          </li>

          <li>
            <NotificationDropdownMenu />
          </li>

          <li>
            <Link href={`/profile/${email}`} className="">
              {user ? (
                <Image
                  className="text-white dark:bg-white/50 bg-black/50 transition-colors duration-100"
                  src={profilePic}
                  alt="Profile"
                  style={{ width: 25, height: 25, borderRadius: "50%" }}
                  height={25}
                  width={25}
                />
              ) : (
                <span>
                  <Link href="/sign-in">Sign-in</Link>
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
        <div className="fixed inset-0 flex items-center justify-center z-50 dark:bg-black/50 bg-white/50 transition-colors duration-100">
          <div className="p-4 rounded">
            <PostForm onPostAdded={handlePostAdded} />
          </div>
        </div>
      )}
    </>
  );
}

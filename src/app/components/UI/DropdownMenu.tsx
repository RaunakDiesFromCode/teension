"use client";
import { auth } from "@/app/firebase/config";
import { signOut } from "firebase/auth";
import router from "next/router";
import React, { useState } from "react";
import { GoGear } from "react-icons/go";
import ThemeSwitch from "../themeSwitch";

const DropdownMenu = () => {
  // Step 1: Add state for toggle
  const [isVisible, setIsVisible] = useState(false);

  // Step 3: Toggle function
  const toggleDropdown = () => setIsVisible(!isVisible);

  const handleSignOut = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    router.push("/sign-in");
  };

  return (
    <div className="flex justify-end ">
      {/* Step 2: Create Settings Button */}
      <button onClick={toggleDropdown} className="">
        <GoGear size={25} />
      </button>

      {/* Step 4: Conditional Rendering */}
      {isVisible && (
        <div className="dropdown-content dark:bg-gray-700 bg-gray-50 rounded shadow-md mt-9 w-fit absolute">
          <button className="block px-4 py-2 text-sm dark:text-white text-black dark:hover:bg-gray-600 hover:bg-gray-200 w-full transition-colors duration-100">
            Button 1
          </button>
          <button className="block px-4 py-2 text-sm dark:text-white text-black dark:hover:bg-gray-600 hover:bg-gray-200 w-full transition-colors duration-100">
            Button 2
          </button>
          <button className="px-4 py-2 text-sm dark:text-white text-black dark:hover:bg-gray-600 hover:bg-gray-200 w-full flex justify-center">
            <ThemeSwitch />
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-fit"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
          {/* Add more buttons as needed */}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;

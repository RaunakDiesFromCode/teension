import React, { useState } from "react";
import { FaPencilAlt, FaSearch } from "react-icons/fa";
import Logo from "./UI/logo";
import { RiNotification3Line } from "react-icons/ri";
import { MdFace } from "react-icons/md";
import { GoGear } from "react-icons/go";
import Link from "next/link";
import PostForm from "./postform";

export default function Navbar() {

  const [showPostForm, setShowPostForm] = useState(false);

  return (
    <>
      <nav className="flex justify-between bg-gray-900 py-2 mt-3 px-9">
        <ul className="flex gap-7 items-center">
          <li>
            <Link href="/">
              <Logo />
            </Link>
          </li>
          <li>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="rounded-xl bg-black pl-10 p-2 w-96 border border-white/50 "
              />
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 px-1">
                <FaSearch />
              </span>
            </div>
          </li>
        </ul>
        <ul className="flex gap-5 items-center">
          <li>
            <Link href="/">
              <button onClick={() => setShowPostForm(true)} className="flex gap-2 bg-gray-700 px-4 py-2 rounded-xl hover:bg-gray-600 transition ease-in duration-100">
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
            <Link href="/about">
              <MdFace size={25} />
            </Link>
          </li>
          <li>
            <Link href="/about">
              <GoGear size={25} />
            </Link>
          </li>
        </ul>
      </nav>
      {showPostForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-black p-4 rounded">
            <PostForm />
            <button
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-fit"
              onClick={() => setShowPostForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

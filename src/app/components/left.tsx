import Link from "next/link";
import React from "react";
import { FaDumbbell, FaHatCowboySide, FaUserFriends } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import { MdOutlinePets } from "react-icons/md";
import { PiSmileyMeltingBold } from "react-icons/pi";

const Left = () => {

  return (
    <>
      <div className="flex justify-between bg-gray-200 dark:bg-gray-900 py-2 m-3 px-4 w-[50rem] flex-col rounded-xl overflow-scroll transition-colors duration-100">
        <ul className="pt-2 text-xl dark:text-white/80 text-black/80 transition-colors duration-100">
          <li className="py-1 transition-all duration-100 dark:hover:bg-slate-700 hover:bg-slate-50 rounded-md dark:hover:text-white hover:text-black ">
            <Link
              href={"/"}
              className=" flex flex-row items-center gap-2 px-2 text-[17px]"
            >
              <IoHome color="tomato" size={"25px"} />
              Home
            </Link>
          </li>
          <li className="py-1 transition-all duration-100 dark:hover:bg-slate-700 hover:bg-slate-50 rounded-md dark:hover:text-white hover:text-black">
            <Link
              href={"/friends"}
              className=" flex flex-row items-center gap-2 px-2 text-[17px]"
            >
              <FaUserFriends color="orange" size={"25px"} />
              Friends
            </Link>
          </li>
          <li className="py-1 transition-all duration-100 dark:hover:bg-slate-700 hover:bg-slate-50 rounded-md dark:hover:text-white hover:text-black">
            <Link
              href={"/challenges"}
              className=" flex flex-row items-center gap-2 px-2 text-[17px]"
            >
              <FaDumbbell color="dodgerblue" size={"25px"} />
              Challenges
            </Link>
          </li>
          <li className="py-1 transition-all duration-100 dark:hover:bg-slate-700 hover:bg-slate-50 rounded-md dark:hover:text-white hover:text-black">
            <Link
              href={"/tribe"}
              className=" flex flex-row items-center gap-2 px-2 text-[17px]"
            >
              <FaHatCowboySide color="mediumseagreen" size={"25px"} />
              Tribe
            </Link>
          </li>
          <li className="py-1 transition-all duration-100 dark:hover:bg-slate-700 hover:bg-slate-50 rounded-md dark:hover:text-white hover:text-black">
            <Link
              href={"/pets"}
              className=" flex flex-row items-center gap-2 px-2 text-[17px]"
            >
              <MdOutlinePets color="violet" size={"25px"} />
              Pets
            </Link>
          </li>
        </ul>

        <hr className="h-px my-3 dark:bg-gray-600 bg-gray-50 border-0 transition-colors duration-100" />

        <h2 className="px-2 mb-1 font-bold py-1 text-black dark:text-white transition-colors duration-100">
          Recents
        </h2>
        <ul className="text-xl dark:text-white/80 text-black/80 transition-colors duration-100">
          {Array.from({ length: 20 }, (_, index) => (
            <li
              key={index}
              className="py-1 transition-all duration-100 dark:hover:bg-slate-700 hover:bg-slate-50 rounded-md dark:hover:text-white hover:text-black"
            >
              <Link
                href={"/"}
                className=" flex flex-row items-center gap-2 px-2 text-[17px]"
              >
                Item {index + 1}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Left;

import Link from "next/link";
import React from "react";
import { FaDumbbell, FaHatCowboySide, FaUserFriends } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import { MdOutlinePets } from "react-icons/md";
import { PiSmileyMeltingBold } from "react-icons/pi";

const Left = () => {

  return (
    <>
      <div className="flex justify-between bg-gray-900 py-2 m-3 px-4 w-[50rem] flex-col rounded-xl overflow-scroll">
        <ul className="pt-2 text-xl text-white/80">
          <li className="py-1 transition-all duration-100 hover:bg-slate-700 rounded-md hover:text-white">
            <Link
              href={"/"}
              className=" flex flex-row items-center gap-2 px-2 text-[17px]"
            >
              <IoHome color="tomato" size={"25px"} />
              Home
            </Link>
          </li>
          <li className="py-1 transition-all duration-100 hover:bg-slate-700 rounded-md hover:text-white">
            <Link
              href={"/"}
              className=" flex flex-row items-center gap-2 px-2 text-[17px]"
            >
              <FaUserFriends color="yellow" size={"25px"} />
              Friends
            </Link>
          </li>
          <li className="py-1 transition-all duration-100 hover:bg-slate-700 rounded-md hover:text-white">
            <Link
              href={"/"}
              className=" flex flex-row items-center gap-2 px-2 text-[17px]"
            >
              <FaDumbbell color="cyan" size={"25px"} />
              Challenges
            </Link>
          </li>
          <li className="py-1 transition-all duration-100 hover:bg-slate-700 rounded-md hover:text-white">
            <Link
              href={"/"}
              className=" flex flex-row items-center gap-2 px-2 text-[17px]"
            >
              <FaHatCowboySide color="greenyellow" size={"25px"} />
              Tribe
            </Link>
          </li>
          <li className="py-1 transition-all duration-100 hover:bg-slate-700 rounded-md hover:text-white">
            <Link
              href={"/"}
              className=" flex flex-row items-center gap-2 px-2 text-[17px]"
            >
              <PiSmileyMeltingBold color="lightsalmon" size={"25px"} />
              Vibe Zone
            </Link>
          </li>
          <li className="py-1 transition-all duration-100 hover:bg-slate-700 rounded-md hover:text-white">
            <Link
              href={"/"}
              className=" flex flex-row items-center gap-2 px-2 text-[17px]"
            >
              <MdOutlinePets color="violet" size={"25px"} />
              Pets
            </Link>
          </li>
        </ul>

        <hr className="h-px my-3 bg-gray-600 border-0" />

        <h2 className="px-2 mb-1 font-bold py-1">Recents</h2>
        <ul className="text-xl text-white/80">
          {Array.from({ length: 20 }, (_, index) => (
            <li
              key={index}
              className="py-1 transition-all duration-100 hover:bg-slate-700 rounded-md hover:text-white"
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

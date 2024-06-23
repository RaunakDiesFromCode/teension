import Link from "next/link";
import React from "react";

// h-[17.6rem]
// w-[25rem]

const Right = () => {
  return (
    <>
      <div className="flex bg-gray-900 py-2 my-3 mr-3 px-4 w-screen  flex-col rounded-xl overflow-scroll">
        <h1 className="px-2 mb-1 font-bold py-1 text-2xl">Chats</h1>
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
                Chat {index + 1}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Right;

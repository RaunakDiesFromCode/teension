import React from "react";
import { FaFire } from "react-icons/fa";
import { TbCrown } from "react-icons/tb";

type Props = {
  username: string;
  tribe: string;
  OP: boolean;
  fire: boolean;
};

const Username: React.FC<Props> = ({ username, tribe, OP, fire }) => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center h-full dark:text-white text-black transition-colors duration-100">
        <div className="font-bold text-4xl flex justify-center items-center gap-0">
          {username}
          {OP ? (
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 m-2 rounded-full p-0.5 z-50 shadow-2xl">
              {" "}
              <TbCrown color="orange" size={25} className=" rotate-45" />
            </div>
          ) : null}
          {!OP && fire ? (
            <div className="flex items-center justify-center bg-gradient-to-r from-sky-500 to-blue-600 m-2 rounded-full p-0.5 z-50 shadow-2xl">
              <FaFire color="orange" size={25} />
            </div>
          ) : null}
        </div>
        <div className="tribe-text text-[9rem] font-PlayfairDisplay italic dark:text-white/30 text-black/30 -mt-40">
          {tribe.toLowerCase()}
        </div>
      </div>
    </div>
  );
};

export default Username;

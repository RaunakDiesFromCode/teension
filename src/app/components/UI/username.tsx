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
        <div className="font-bold text-4xl flex justify-center items-center gap-1">
          {username}
          {OP ? <TbCrown color="orange" size={25} /> : null}
          {!OP && fire ? (
            <div className="flex items-center justify-center">
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

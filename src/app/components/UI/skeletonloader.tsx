import React from "react";

const SkeletonLoader: React.FC = () => {
  const placeholderPosts = Array.from({ length: 5 });

  return (
    <ul className="text-xl text-white/80">
      {placeholderPosts.map((_, index) => (
        <li
          key={index}
          className="py-1 transition-all duration-100 bg-gray-800 my-3 hover:bg-slate-800 rounded-md flex flex-col animate-pulse"
        >
          <div className="flex flex-col flex-grow">
            <div className="flex flex-col gap-2 px-3 py-1 text-[17px]">
              <div className="h-8 bg-gray-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-700 rounded w-5/6 my-2"></div>
              <div className="relative bg-gray-700 rounded-md h-[300px] mb-2"></div>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="flex flex-row items-center m-2 gap-2 bg-slate-700 rounded-full p-3 w-fit">
              <div className="h-6 w-6 bg-gray-700 rounded-full"></div>
              <div className="h-6 w-6 bg-gray-700 rounded-full"></div>
              <div className="h-6 w-6 bg-gray-700 rounded-full"></div>
            </div>
            <div className="m-2 bg-slate-700 rounded-full p-3 w-fit">
              <div className="h-6 w-6 bg-gray-700 rounded-full"></div>
            </div>
            <div className="m-2 bg-slate-700 rounded-full p-3 w-fit">
              <div className="h-6 w-6 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SkeletonLoader;

import React from "react";

const SkeletonLoader: React.FC = () => {
  const placeholderPosts = Array.from({ length: 5 });

  return (
    <ul className="text-xl text-black/80 dark:text-white/80 w-[353%] transition-colors duration-100">
      {placeholderPosts.map((_, index) => (
        <li
          key={index}
          className="py-1 transition-all duration-100 dark:bg-gray-800 bg-gray-300 my-3 dark:hover:bg-slate-800 hover:bg-slate-100 rounded-md flex flex-col animate-pulse "
        >
          <div className="flex flex-col flex-grow">
            <div className="flex flex-col gap-2 px-3 py-1 text-[17px]">
              <div className="h-4 dark:bg-gray-700 bg-gray-400 rounded w-1/6"></div>
              <div className="h-8 dark:bg-gray-700 bg-gray-400 rounded w-3/4"></div>
              <div className="h-6 dark:bg-gray-700 bg-gray-400 rounded w-5/6 my-2"></div>
              <div className="relative dark:bg-gray-700 bg-gray-400 rounded-md h-[300px] mb-2"></div>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="flex flex-row items-center m-2 gap-2 dark:bg-slate-700 bg-slate-200 rounded-full p-3 w-fit">
              <div className="h-6 w-9 dark:bg-gray-700 bg-gray-400 rounded-full"></div>
            </div>
            <div className="m-2 dark:bg-slate-700 bg-slate-200 rounded-full p-3 w-fit">
              <div className="h-6 w-9 dark:bg-gray-700 bg-gray-400 rounded-full"></div>
            </div>
            <div className="m-2 dark:bg-slate-700 bg-slate-200 rounded-full p-3 w-fit">
              <div className="h-6 w-6 dark:bg-gray-700 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SkeletonLoader;

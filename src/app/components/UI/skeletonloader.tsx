import React from "react";

const SkeletonLoader: React.FC = () => {
  const placeholderPosts = Array.from({ length: 5 });

  return (
    <ul className="text-xl text-black/80 dark:text-white/80 w-full transition-colors duration-100">
      {placeholderPosts.map((_, index) => (
        <li
          key={index}
          className="py-4 transition-all duration-100 dark:bg-gray-800 bg-gray-300 my-3 rounded-md flex flex-col animate-pulse"
        >
          <div className="flex flex-col gap-2 px-4 py-2 text-[17px]">
            <div className="h-4 dark:bg-gray-700 bg-gray-400 rounded w-1/4 mb-2"></div>
            <div className="flex items-center justify-between">
              <div className="h-4 dark:bg-gray-700 bg-gray-400 rounded w-1/3"></div>
              <div className="h-4 dark:bg-gray-700 bg-gray-400 rounded w-1/6"></div>
            </div>
            <div className="h-6 dark:bg-gray-700 bg-gray-400 rounded w-2/3 my-2"></div>
            <div className="h-48 dark:bg-gray-700 bg-gray-400 rounded-md mb-2"></div>
          </div>
          <div className="flex gap-2 px-4 py-2">
            <div className="flex items-center gap-2 dark:bg-slate-700 bg-slate-200 rounded-full p-2">
              <div className="h-6 w-6  dark:bg-slate-700 bg-slate-200  rounded-full"></div>
              <div className="h-6 w-8  dark:bg-slate-700 bg-slate-200  rounded-full"></div>
            </div>
            <div className="flex items-center gap-2 dark:bg-slate-700 bg-slate-200 rounded-full p-2">
              <div className="h-6 w-6  dark:bg-slate-700 bg-slate-200  rounded-full"></div>
              <div className="h-6 w-8  dark:bg-slate-700 bg-slate-200  rounded-full"></div>
            </div>
            <div className="flex items-center gap-2 dark:bg-slate-700 bg-slate-200 rounded-full p-2">
              <div className="h-6 w-6  dark:bg-slate-700 bg-slate-200  rounded-full"></div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SkeletonLoader;

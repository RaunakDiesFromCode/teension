import Link from "next/link";
import React from "react";

const Notfound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen text-white">
      <section className=" rounded-xl p-5">
        <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
          <div className="mx-auto max-w-screen-sm text-center">
            <h1 className="mb-4 tracking-tight font-extrabold flex text-9xl text-center items-center w-full justify-center">
              <div className="">4</div>
              <div className="italic font-PlayfairDisplay flex items-center underline">0</div>
              <div className="">4</div>
            </h1>
            <p className="mb-4 text-3xl tracking-tight font-bold md:text-4xl">
              {"Something's missing."}
            </p>
            <p className="mb-4 text-lg font-light text-gray-300">
              {
                "Sorry, we can't find that page. You'll find lots to explore on the home page."
              }
            </p>
            <Link
              href="/"
              className="inline-flex bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Notfound;

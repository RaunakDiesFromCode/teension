// src/app/components/page.tsx
"use client"
import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";

const Page = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold mb-4">You've found an Easter egg!</h1>
      <p className="text-xl mb-4">As a reward, enjoy this confetti!</p>
      {showConfetti && <Confetti />}
      <div className="mt-8 text-center">
        <p className="text-lg">
          This page is usually hidden, but you found it! 🎉
        </p>
      </div>
      <p className=" text-white/50 italic">{"(Please dont tell this to anyone)"}</p>
    </div>
  );
};

export default Page;

"use client";

import { FiSun, FiMoon } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string | undefined>(
    resolvedTheme
  );

  useEffect(() => {
    setMounted(true);
    setCurrentTheme(resolvedTheme);
  }, [resolvedTheme]);

  const toggleTheme = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setTheme(currentTheme === "dark" ? "light" : "dark");
      setIsAnimating(false);
      setCurrentTheme(currentTheme === "dark" ? "light" : "dark");
    }, 500); // Duration of the animation
  };

  if (!mounted)
    return (
      <Image
        src="data:image/svg+xml;base64,PHN2ZyBzdHJva2U9IiNGRkZGRkYiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMCIgdmlld0JveD0iMCAwIDI0IDI0IiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdD0iMjAiIGhlaWdodD0iMjAiIHg9IjIiIHk9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMiIgcng9IjIiPjwvcmVjdD48L3N2Zz4K"
        width={36}
        height={36}
        sizes="36x36"
        alt="Loading Light/Dark Toggle"
        priority={false}
        title="Loading Light/Dark Toggle"
      />
    );

  return (
    <div
      className="relative flex items-center justify-center w-9 h-9 transition-transform transform cursor-pointer hover:scale-110"
      onClick={toggleTheme}
    >
      <FiSun
        size={25}
        className={`absolute transition-all duration-500 ${
          isAnimating && currentTheme === "dark" ? "animate-fade-in-rotate" : ""
        } ${
          !isAnimating && currentTheme === "light" ? "opacity-1" : "opacity-0"
        }`}
      />
      <FiMoon
        size={25}
        className={`absolute transition-all duration-500 ${
          isAnimating && currentTheme === "light"
            ? "animate-fade-in-rotate"
            : ""
        } ${
          !isAnimating && currentTheme === "dark" ? "opacity-1" : "opacity-0"
        }`}
      />
    </div>
  );
}

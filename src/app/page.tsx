"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useEffect } from "react";
import Navbar from "@/app/components/navbar";
import Left from "@/app/components/left";
import Right from "@/app/components/right";
import Center from "@/app/components/center";

export default function Home() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const userSession = localStorage.getItem("user");

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  if (!user && !userSession) {
    router.push("/sign-in");
  }

  const handleSignOut = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    router.push("/sign-in");
  };

  return (
    <div className="flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <div className="mt-[4.5rem] flex h-[90vh]">
        <Left />
        <Center />
        <Right />
      </div>
      <button
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-fit"
        onClick={handleSignOut}
      >
        Sign Out
      </button>
    </div>
  );
}

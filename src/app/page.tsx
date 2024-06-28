"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useEffect } from "react";

import Center from "./components/center";

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [loading, user, router]);


  if (loading) {
    return <div>Loading...</div>; // or any loading indicator you prefer
  }

  return (
    <div className="flex flex-col">
      <div className="flex h-[90vh]">
        {/* <Left /> */}
        <Center />
        {/* <Right /> */}
      </div>
    </div>
  );
}

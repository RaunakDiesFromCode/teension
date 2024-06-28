import React from "react";
import { db } from "@/app/firebase/config";
import { collection, getDocs } from "@firebase/firestore";
import { GetStaticPaths, GetStaticProps } from "next";
import ProfilePage from "./ProfilePage";

export default function Page({ params }: { params: any }) {
  return <ProfilePage email={decodeURIComponent(params.email)} />;
}

// Generate static paths
export async function generateStaticParams() {
  const usersCollection = collection(db, "users");
  const userDocs = await getDocs(usersCollection);
  const paths = userDocs.docs.map((doc) => {
    const data = doc.data();
    return {
      params: { email: encodeURIComponent(data.email) },
    };
  });

  return paths;
}


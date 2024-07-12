import React from "react";
import { db } from "@/app/firebase/config";
import { collection, query, where, getDocs } from "@firebase/firestore";
import ProfilePage from "./ProfilePage";

export default async function Page({ params }: { params: { username: string } }) {
  const username= decodeURIComponent(params.username);
  console.log("Username:", username); // Debugging line

  const usersCollection = collection(db, "users");

  if (!username) {
    throw new Error("Username is undefined or null.");
  }

  const q = query(usersCollection, where("name", "==", username));
  const querySnapshot = await getDocs(q);

  let email = "";
  querySnapshot.forEach((doc) => {
    email = doc.data().email;
  });
  return <ProfilePage email={email} />;
}

"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import { doc, getDoc } from "@firebase/firestore";
import Image from "next/image";

interface Profile {
  name: string;
  email: string;
  description: string;
  profilePicture: string;
  coverPhoto: string;
}

export default function ProfilePage({ email }: { email: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (email) {
          const profileDoc = doc(db, "users", email);
          const docSnap = await getDoc(profileDoc);
          if (docSnap.exists()) {
            const profileData = docSnap.data() as Profile; // Cast to Profile instead of Post
            setProfile(profileData); // Set the profile state
          } else {
            setError("Profile not found");
          }
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        setError("Error fetching document");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [email]);

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        Error: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      {profile && (
        <>
          <div>
            <div className="flex items-center">
              <img src={profile.coverPhoto} alt="" className="rounded-xl" />
            </div>
            <div className="w-full flex items-center justify-around">
              <img
                src={profile.profilePicture}
                alt=""
                className="rounded-full -translate-y-[50%] border-gray-900 border-8"
              />
            </div>
          </div>
          <div>{profile.email}</div>
          <div>{profile.name}</div>
          <div>{profile.description}</div>
          {/* Render other data as needed */}
        </>
      )}
    </>
  );
}

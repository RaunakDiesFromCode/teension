"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import { doc, getDoc } from "@firebase/firestore";
import Image from "next/image";
import { GetStaticPaths, GetStaticProps } from "next";

interface Profile {
  name: string;
  email: string;
  description: string;
  profilePicture: string;
  coverPhoto: string;
}

export default function Page({ params }: { params: any }) {
  const email = decodeURIComponent(params.email);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (email) {
          const postDoc = doc(db, "users", email);
          const docSnap = await getDoc(postDoc);
          if (docSnap.exists()) {
            const postData = docSnap.data() as Profile; // Cast to Profile instead of Post
            setProfile(postData); // Set the profile state
          } else {
            setError("Post not found");
          }
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        setError("Error fetching document");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
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
      {profile && ( // Ensure profile is not null before accessing its properties
        <>
          <div>
            <div className="flex items-center">
              <img src={profile.coverPhoto} alt="" className="rounded-xl" />
            </div>
            <div className=" w-full flex items-center justify-around">
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

export const getStaticPaths: GetStaticPaths = async () => {
  // Ideally, fetch a list of emails or paths you want to pre-render
  // For demonstration, using an empty array
  const paths: never[] = [];

  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const email = decodeURIComponent(params?.email as string);
    const postDoc = doc(db, "users", email);
    const docSnap = await getDoc(postDoc);

    if (docSnap.exists()) {
      const profile = docSnap.data() as Profile;
      return { props: { profile, error: null } };
    } else {
      return { props: { profile: null, error: "Profile not found" } };
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    return { props: { profile: null, error: "Error fetching document" } };
  }
};
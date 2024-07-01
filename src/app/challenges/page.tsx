"use client";
import React, { useEffect, useState } from "react";
import useAuth from "../firebase/useAuth";
import { arrayUnion, doc, getDoc, updateDoc } from "@firebase/firestore";
import { db } from "../firebase/config";
import Username from "../components/UI/username";
import { FaRegStar, FaStar } from "react-icons/fa";
import { CiLocationArrow1 } from "react-icons/ci";
import { checkId } from "./challenges";

interface Challenge {
  id: string; // Unique identifier for the challenge
  name: string; // Name of the challenge
  completedAt: { seconds: number; nanoseconds: number }; // Timestamp when the challenge was completed
  // Add more properties as needed
}

interface Profile {
  name: string;
  email: string;
  description: string;
  profilePicture: string;
  coverPhoto: string;
  createdAt: { seconds: number; nanoseconds: number };
  tribe: string;
  stars: number;
  fire: boolean;
  OP: boolean;
  completedChallenges: Challenge[];
}

const Challenges = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, loading: authLoading } = useAuth();
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);

  const topics = [
    {
      id: 1,
      name: "First Post",
      description: "Make your first post on the app",
      stars: 1,
      difficulty: "Easy",
    },
    {
      id: 2,
      name: "Profile Update",
      description:
        "Complete your profile by adding a profile picture and description",
      stars: 1,
      difficulty: "Easy",
    },
    {
      id: 3,
      name: "Follow a Friend",
      description: "Follow your first friend on the app",
      stars: 1,
      difficulty: "Easy",
    },
    {
      id: 4,
      name: "Like a Post",
      description: "Like 5 posts from other users",
      stars: 1,
      difficulty: "Medium",
    },
    {
      id: 5,
      name: "Daily Active",
      description: "Log in and interact with the app for 7 consecutive days",
      stars: 2,
      difficulty: "Medium",
    },
    {
      id: 6,
      name: "Commenter",
      description: "Leave 10 comments on different posts",
      stars: 2,
      difficulty: "Medium",
    },
    {
      id: 7,
      name: "Engage with Content",
      description: "Share 3 different posts on your timeline",
      stars: 2,
      difficulty: "Hard",
    },
    {
      id: 8,
      name: "Content Creator",
      description: "Create 3 unique posts in a week",
      stars: 3,
      difficulty: "Hard",
    },
    {
      id: 9,
      name: "Group Member",
      description:
        "Join 3 different groups and participate in their discussions",
      stars: 2,
      difficulty: "Hard",
    },
    {
      id: 10,
      name: "Influencer",
      description: "Gain 50 followers",
      stars: 3,
      difficulty: "Very Hard",
    },
    {
      id: 11,
      name: "Top Contributor",
      description: "Receive 20 likes on a single post",
      stars: 3,
      difficulty: "Very Hard",
    },
    {
      id: 12,
      name: "Social Butterfly",
      description: "Interact with 30 different users",
      stars: 3,
      difficulty: "Very Hard",
    },
    {
      id: 13,
      name: "Event Organizer",
      description:
        "Create and manage a successful event with at least 10 attendees",
      stars: 4,
      difficulty: "Expert",
    },
    {
      id: 14,
      name: "Content Marathon",
      description: "Post every day for a month",
      stars: 4,
      difficulty: "Expert",
    },
    {
      id: 15,
      name: "Community Leader",
      description: "Create a group and have at least 50 active members",
      stars: 5,
      difficulty: "Expert",
    },
    {
      id: 16,
      name: "Viral Post",
      description: "Have a post that gets 100 likes",
      stars: 5,
      difficulty: "Expert",
    },
    {
      id: 17,
      name: "Influence Spreader",
      description: "Be tagged in 20 different posts by other users",
      stars: 5,
      difficulty: "Expert",
    },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return;

      if (!currentUser || !currentUser.email) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const email = currentUser.email;

      try {
        const profileDoc = doc(db, "users", email);
        const docSnap = await getDoc(profileDoc);

        if (docSnap.exists()) {
          const profileData = docSnap.data() as Profile;
          setProfile(profileData);
        } else {
          setError("Profile not found");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        setError("Error fetching document");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, authLoading]);

  const handleCompleteChallenge = async (topicId: number) => {
    if (!profile || !profile.email) return;

    const isChallengeCompleted = await checkId(topicId, profile.email);
    if (isChallengeCompleted) {
      console.log(`Challenge ${topicId} completed!`);
      profile.stars += topics.find((topic) => topic.id === topicId)?.stars || 0;

      // Assuming you have a Firestore instance initialized as `db`
      // and your profiles are stored in a collection named "profiles"
      const profileRef = doc(db, "users", profile.email); // Reference to the user's profile document, assuming email is the document ID

      // Update the profile document with the new challenge data
      await updateDoc(profileRef, {
        completedChallenges: arrayUnion(topicId), // Add the completed challenge ID to the array
        stars: profile.stars, // Update the stars count
      });

      setCompletedChallenges((prev) => [...prev, topicId]);

      console.log(
        `Profile updated with challenge ${topicId} and new stars count.`
      );
    } else {
      console.log(`Challenge ${topicId} not yet completed.`);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="flex items-center flex-col w-full h-full gap-20 mt-9 pt-9">
        <div className="">
          {profile ? (
            <div className="flex flex-col items-center">
              <Username
                username={profile.name}
                tribe={profile.tribe}
                OP={profile.OP}
                fire={profile.fire}
              />
              <div className="flex flex-row justify-between items-center gap-1">
                <div className="flex items-center">
                  <FaStar color="gold" size={20} />
                </div>
                <div className="flex items-center">{profile.stars}</div>
              </div>
            </div>
          ) : (
            <div>Profile not found</div>
          )}
        </div>
        <p className="-mt-14 text-white/50 italic">
          Complete challenges to earn stars
        </p>
        <div className="grid grid-cols-3 w-full gap-3 -mt-14">
          {topics.map((topic, index) => (
            <div key={topic.id} className="bg-slate-700 px-3 py-2 h-60 rounded">
              <div className="flex font-bold text-2xl items-center gap-1">
                {topic.name}
                {index === topics.length - 1 && <CiLocationArrow1 />}
              </div>
              <div className="py-3">{topic.description}</div>
              <div className="flex gap-2 py-3 items-center">
                <div className="">{topic.difficulty}</div>
                {topic.stars !== 0 && "・"}
                <div className=" flex items-center gap-1">
                  {topic.stars !== 0 && topic.stars}
                  {topic.stars !== 0 && <FaStar color="gold" />}
                </div>
              </div>
              {completedChallenges.includes(topic.id) ? (
                <button
                  className="mt-4 bg-gray-500 text-white py-1 px-3 rounded"
                  disabled
                >
                  Completed
                </button>
              ) : (
                <button
                  onClick={() => handleCompleteChallenge(topic.id)}
                  className="mt-4 bg-blue-500 text-white py-1 px-3 rounded"
                >
                  Complete Challenge
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Challenges;

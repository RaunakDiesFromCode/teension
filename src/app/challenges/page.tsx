"use client";
import React, { useEffect, useState } from "react";
import useAuth from "../firebase/useAuth";
import { arrayUnion, doc, getDoc, updateDoc } from "@firebase/firestore";
import { db } from "../firebase/config";
import Username from "../components/UI/username";
import { FaArrowRight, FaRegStar, FaStar } from "react-icons/fa";
import { CiLocationArrow1 } from "react-icons/ci";
import { checkId } from "../components/utility/challenges";
import { MdDoneOutline } from "react-icons/md";
import Spinner from "../components/UI/spinner";

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
  completedChallenges: number[]; // Changed to number[]
}

const Challenges = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
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
      description: "Complete your profile",
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
      name: "Like those Posts",
      description: "Like 5 posts from other users",
      stars: 2,
      difficulty: "Medium",
    },
    {
      id: 5,
      name: "Daily Active",
      description: "Interact with the app for 7 consecutive days",
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
      name: "Tribal",
      description: "Join a tribe",
      stars: 3,
      difficulty: "Hard",
    },
    {
      id: 10,
      name: "Influencer",
      description: "Gain 50 followers",
      stars: 5,
      difficulty: "Very Hard",
    },
    {
      id: 11,
      name: "Top Contributor",
      description: "Receive 20 likes on a single post",
      stars: 5,
      difficulty: "Very Hard",
    },
    {
      id: 12,
      name: "Social Butterfly",
      description: "Interact with 30 different posts",
      stars: 5,
      difficulty: "Very Hard",
    },
    {
      id: 13,
      name: "Century",
      description: "Get 100 likes on your post",
      stars: 7,
      difficulty: "Expert",
    },
    {
      id: 14,
      name: "Content Marathon",
      description: "Post every day for a month",
      stars: 7,
      difficulty: "Expert",
    },
    {
      id: 15,
      name: "Sweet Pet",
      description: "Get yourself a pet",
      stars: 7,
      difficulty: "Expert",
    },
    {
      id: 16,
      name: "Viral Post",
      description: "Have a post that gets 1000 likes",
      stars: 7,
      difficulty: "Expert",
    },
    {
      id: 17,
      name: "The Chief",
      description: "Be the leader of your tribe",
      stars: 15,
      difficulty: "Impossible",
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
          setCompletedChallenges(profileData.completedChallenges || []);
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

    const isChallengeCompleted = await checkId(topicId, profile.name);
    if (isChallengeCompleted) {
      console.log(`Challenge ${topicId} completed!`);
      profile.stars += topics.find((topic) => topic.id === topicId)?.stars || 0;

      const profileRef = doc(db, "users", profile.email);

      await updateDoc(profileRef, {
        completedChallenges: arrayUnion(topicId),
        stars: profile.stars,
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
      <div className="h-full w-full flex items-center justify-center dark:text-white text-black">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex items-center flex-col w-full h-full gap-20 mt-9 pt-9 dark:text-white text-black transition-colors duration-100">
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
      <p className="-mt-14 dark:text-white/50 text-black/50 italic transition-colors duration-100">
        Complete challenges to earn stars
      </p>
      <div className="grid grid-cols-2 w-full gap-3 -mt-14">
        {topics.map((topic, index) => (
          <div
            key={topic.id}
            className="relative dark:bg-gray-800 bg-gray-100 px-3 py-3 h-60 rounded dark:hover:bg-slate-800 hover:bg-slate-100 transition-all duration-100 justify-between flex flex-col dark:text-white/75 text-black/75 dark:hover:text-white hover:text-black transition-colors duration-100"
          >
            <div>
              <div className="flex font-bold text-2xl items-center gap-1">
                {topic.name}
              </div>
              <div className="py-3">{topic.description}</div>
              <div className="flex gap-2 py-3 items-center">
                <div className="">{topic.difficulty}</div>
                {"・"}
                <div className="flex items-center gap-1">
                  {topic.stars}
                  {<FaStar color="gold" />}
                </div>
              </div>
            </div>

            <div>
              {/* // Adjusted button rendering logic with loading state */}
              {isLoading ? (
                <button
                  className="mt-4 bg-gray-400 text-white py-1 px-3 rounded-lg flex items-center gap-1 transition-colors duration-100"
                  disabled
                >
                  <Spinner />
                  {/* You can replace this with a spinner or any loading indicator */}
                </button>
              ) : completedChallenges.includes(topic.id) ? (
                <button
                  className="mt-4 bg-gray-500 text-white py-1 px-3 rounded-lg flex items-center gap-1 transition-colors duration-100"
                  disabled
                >
                  Completed Challenge
                  <MdDoneOutline />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsLoading(true); // Set loading to true when button is clicked
                    handleCompleteChallenge(topic.id).finally(() =>
                      setIsLoading(false)
                    ); // Reset loading state after completion
                  }}
                  className="mt-4 bg-blue-400 hover:bg-blue-500 transition duration-100 text-white py-1 px-3 rounded-lg flex items-center gap-1"
                >
                  Complete Challenge
                  <FaArrowRight />
                </button>
              )}
            </div>

            <div className="text-[10rem] font-PlayfairDisplay italic text-white/10 -mt-60 ml-52">
              {topic.id}
            </div>
          </div>
        ))}
        <div className="relative dark:bg-gray-800 bg-gray-100 px-3 py-3 h-60 rounded dark:hover:bg-slate-800 hover:bg-slate-100 transition-all duration-100 justify-between flex flex-col dark:text-white/75 text-black/75 dark:hover:text-white hover:text-black">
          <div className="h-full flex items-center flex-col justify-center">
            <div className="flex font-bold text-2xl items-center gap-1 ">
              {"More Comming Soon"}
              <CiLocationArrow1 />
            </div>
            <div className="">{"Stay tuned for more challenges!"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;

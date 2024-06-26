"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from "@firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import {
  FaFire,
  FaStar,
  FaHeart,
  FaRegHeart,
  FaRegShareSquare,
  FaRegStar,
} from "react-icons/fa";
import { TbCrown } from "react-icons/tb";
import useAuth from "@/app/firebase/useAuth";
import SkeletonLoader from "@/app/components/UI/skeletonloader";
import Link from "next/link";
import Image from "next/image";
import { BiComment } from "react-icons/bi";
import ShareScreen from "@/app/components/UI/sharescreen";
import Username from "@/app/components/UI/username";

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
}

interface Post {
  id: string;
  genre: string;
  image: string;
  username: string;
  text: string;
  votes: number;
  description: string;
  createdAt: { seconds: number; nanoseconds: number };
}

export default function ProfilePage({ email }: { email: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const { currentUser, loading: authLoading } = useAuth();
  const [commentCounts, setCommentCounts] = useState<{
    [postId: string]: number;
  }>({});
  const [userLikes, setUserLikes] = useState<{ [postId: string]: boolean }>({});
  const [showShareScreen, setShowShareScreen] = useState(false);
  const [postIdForShare, setPostIdForShare] = useState<string | null>(null); // State to track postId for sharing

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        if (email) {
          // Fetch profile data
          const profileDoc = doc(db, "users", email);
          const docSnap = await getDoc(profileDoc);
          if (docSnap.exists()) {
            const profileData = docSnap.data() as Profile;
            setProfile(profileData);

            // Fetch post IDs from user's sub-collection
            const userPostsCollection = collection(db, "users", email, "posts");
            const userPostsSnapshot = await getDocs(userPostsCollection);
            const postIds = userPostsSnapshot.docs.map((doc) => doc.id);

            // Fetch posts data from 'posts' collection
            const postsData: Post[] = [];
            const userLikesData: { [postId: string]: boolean } = {};

            const promises = postIds.map(async (postId) => {
              const postDoc = doc(db, "posts", postId);
              const postSnap = await getDoc(postDoc);
              if (postSnap.exists()) {
                const postData = {
                  id: postSnap.id,
                  ...postSnap.data(),
                } as Post;
                postsData.push(postData);

                if (currentUser) {
                  const likesQuery = query(
                    collection(db, "posts", postData.id, "likes"),
                    where("email", "==", currentUser.email)
                  );

                  const likesSnapshot = await getDocs(likesQuery);
                  userLikesData[postData.id] = !likesSnapshot.empty;
                }

                return onSnapshot(
                  collection(db, "posts", postData.id, "comments"),
                  (commentsSnapshot) => {
                    setCommentCounts((prevCounts) => ({
                      ...prevCounts,
                      [postData.id]: commentsSnapshot.size,
                    }));
                  }
                );
              }
            });

            Promise.all(promises).then(() => {
              setUserLikes(userLikesData);
              setPosts(postsData);
              setLoading(false);
            });
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

    fetchProfileAndPosts();
  }, [email, currentUser]);

  useEffect(() => {
    console.log("Posts data:", posts);
  }, [posts]);

  const toggleShareScreen = async (postId: string) => {
    const shareref = doc(db, "users", email);
    const sharesnapshot = await getDoc(shareref);
    if (sharesnapshot.exists()) {
      const userData = sharesnapshot.data();
      const currentShareCount = userData.shareCount ?? 0;
      const updatedShareCount = currentShareCount + 1;

      // Update the user's document with the new comment count
      await updateDoc(shareref, { shareCount: updatedShareCount });
    } else {
      console.log("Error fetching document");
    }
    setShowShareScreen(true);
    setPostIdForShare(postId);
  };

  const handleLike = async (postId: string) => {
    if (!currentUser || !currentUser.email) {
      alert("You need to be logged in to like posts");
      return;
    }

    const postIndex = posts.findIndex((post) => post.id === postId);
    if (postIndex === -1) return;

    let newVoteCount = posts[postIndex].votes;

    if (userLikes[postId]) {
      newVoteCount -= 1;
      await deleteDoc(doc(db, "posts", postId, "likes", currentUser.email));

      const likeref = doc(db, "users", currentUser.email);
      const likesnapshot = await getDoc(likeref);
      if (likesnapshot.exists()) {
        const userData = likesnapshot.data();
        const currentLikes = userData.likes ?? 0; // Initialize to 0 if undefined
        const updatedLikes = currentLikes - 1;
        await updateDoc(likeref, { likes: updatedLikes });
      } else {
        console.log("Error fetching document");
      }
    } else {
      newVoteCount += 1;
      await setDoc(doc(db, "posts", postId, "likes", currentUser.email), {
        email: currentUser.email,
      });

      const likeref = doc(db, "users", currentUser.email);
      const likesnapshot = await getDoc(likeref);
      if (likesnapshot.exists()) {
        const userData = likesnapshot.data();
        const currentLikes = userData.likes ?? 0; // Initialize to 0 if undefined
        const updatedLikes = currentLikes + 1;
        await updateDoc(likeref, { likes: updatedLikes });
      } else {
        console.log("Error fetching document");
      }
    }

    await updateDoc(doc(db, "posts", postId), { votes: newVoteCount });

    setUserLikes((prevState) => ({
      ...prevState,
      [postId]: !userLikes[postId],
    }));

    setPosts((prevPosts) => {
      const newPosts = [...prevPosts];
      newPosts[postIndex].votes = newVoteCount;
      return newPosts;
    });
  };

  const formatTimestamp = (timestamp: {
    seconds: number;
    nanoseconds: number;
  }) => {
    const date = new Date(timestamp.seconds * 1000);
    let distance = formatDistanceToNow(date, { addSuffix: false });

    // Convert "1 day" to "a day"
    distance = distance.replace(/^1 day$/, "a day");

    return distance;
  };

  return (
    <>
      {profile && (
        <>
          <div>
            <div className="flex items-center">
              <Image
                src={profile.coverPhoto}
                alt=""
                className="w-full h-64 object-cover rounded-xl"
                width={100}
                height={50}
              />
            </div>
            <div className="w-full flex items-center justify-around">
              <Image
                src={profile.profilePicture}
                alt=""
                className="rounded-full -translate-y-[50%] border-gray-900 border-8"
                width={230}
                height={230}
              />
            </div>
          </div>

          <div className="-mt-[9%]">
            <Username
              username={profile.name}
              tribe={profile.tribe}
              OP={profile.OP}
              fire={profile.fire}
            />

            <div className="flex flex-row justify-between bg-gray-800 rounded-md p-2 ">
              <div className="">
                {"Member since "}
                {formatTimestamp(profile.createdAt)}
              </div>
              <div className="flex flex-row justify-between items-center gap-1">
                <div className="flex items-center">
                  <FaStar color="gold" size={20} />
                </div>
                <div className="flex items-center">{profile.stars}</div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-md p-2 my-4">
              <div className="text-white/80 text-sm">{profile.email}</div>
              <hr className="h-px my-1 bg-gray-200 border-0 dark:bg-gray-700" />
              <div>{profile.description}</div>
            </div>
            <div className=" rounded-md  my-4">
              <h1 className="font-bold text-2xl mb-1">Posts</h1>
              {posts.map((post) => (
                <>
                  <div
                    key={post.id}
                    className="bg-gray-800 rounded-lg py-2 mb-4"
                  >
                    <div className="flex flex-row items-center -mb-2 gap-2 px-3 py-1 text-[17px] text-white/75">
                      <span className="text-md">
                        <Link href={"/"} className="hover:text-blue-400">
                          {post.genre}
                        </Link>
                      </span>
                      {"・"}
                      <span className="text-xs text-opacity-50 italic">
                        {formatTimestamp(post.createdAt)} ago
                      </span>
                    </div>
                    <Link href={`/post/${post.id}`} passHref>
                      <div className="flex flex-col gap-2 px-3 py-1 text-[17px] cursor-pointer">
                        <span className="text-2xl font-bold">{post.text}</span>
                        <span className="text-md my-1">{post.description}</span>
                        {post.image && (
                          <div className="relative">
                            <Image
                              layout="responsive"
                              width={500}
                              height={300}
                              src={post.image}
                              alt={post.text}
                              className="w-full rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-row">
                      <div className="flex flex-row items-center m-2 gap-2 rounded-full p-3 bg-slate-700">
                        <button onClick={() => handleLike(post.id)}>
                          {userLikes[post.id] ? (
                            <FaHeart
                              className="text-white"
                              color="orangered"
                              size={20}
                            />
                          ) : (
                            <FaRegHeart className="text-gray-300" size={20} />
                          )}
                        </button>
                        <span className="text-sm">{post.votes}</span>
                      </div>
                      <Link href={`/post/${post.id}`} passHref>
                        <div className="m-2 bg-slate-700 rounded-full p-3 flex items-center gap-1 cursor-pointer">
                          <BiComment size={20} />
                          <span className="text-sm">
                            {commentCounts[post.id] || 0}
                          </span>
                        </div>
                      </Link>
                      <div
                        className="m-2 bg-slate-700 rounded-full p-3 flex items-center gap-1 cursor-pointer"
                        onClick={() => toggleShareScreen(post.id)}
                      >
                        <FaRegShareSquare size={20} />
                      </div>
                    </div>
                  </div>
                </>
              ))}
            </div>
          </div>
        </>
      )}
      {showShareScreen && postIdForShare && (
        <ShareScreen
          onClose={() => setShowShareScreen(false)}
          Strlink={`localhost:3000/post/${postIdForShare}`}
        >
          {/* Pass any props or children needed by ShareScreen */}
        </ShareScreen>
      )}
    </>
  );
}

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
import { formatDistanceToNow, set } from "date-fns";
import { FaStar, FaHeart, FaRegHeart, FaRegShareSquare } from "react-icons/fa";
import useAuth from "@/app/firebase/useAuth";
import Link from "next/link";
import Image from "next/image";
import { BiComment } from "react-icons/bi";
import ShareScreen from "@/app/components/UI/sharescreen";
import Username from "@/app/components/UI/username";
import { fetchUserName } from "@/app/components/utility/fetchUserName";
import { createNotification } from "@/app/components/utility/createNotification";
import { commentCount } from "@/app/components/utility/commentCount";
import { shortenNumber } from "@/app/components/utility/shortenNumber";
import { MdOutlinePersonAdd, MdOutlinePersonAddDisabled } from "react-icons/md";
import Spinner from "@/app/components/UI/spinner";

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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        if (email) {
          // Fetch profile data
          setNotFound(false);
          const profileDoc = doc(db, "users", email);
          const docSnap = await getDoc(profileDoc);
          if (docSnap.exists()) {
            const profileData = docSnap.data() as Profile;
            setProfile(profileData);

            // Fetch post IDs from user's sub-collection
            const userPostsCollection = collection(db, "users", email, "posts");
            const userPostsSnapshot = await getDocs(userPostsCollection);
            const postIds = userPostsSnapshot.docs.map((doc) => doc.id);
            const commentCountsData: { [postId: string]: number } = {};

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

                const totalComments = await commentCount(postData.id);
                commentCountsData[postData.id] = totalComments;
                setCommentCounts(commentCountsData);
              }
            });

            Promise.all(promises).then(() => {
              setUserLikes(userLikesData);
              setPosts(postsData);
              setLoading(false);
            });
          } else {
            setNotFound(true);
            setError("Profile not found");
          }
        } else {
          setNotFound(true);
          setError("Profile not found");
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
      const post = posts[postIndex]; // Access the post object
      // const userName = await fetchUserName(post.username); // Fetch username dynamically
      const likersName = await fetchUserName(currentUser.email); // Await the result
      const notificationMessage = `${likersName ?? "Someone"} liked your post`;

      await createNotification(
        "like",
        notificationMessage, // Title of the notification
        postId,
        Date.now(), // Current time in milliseconds
        post.username // Dynamic username from post data
      );
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

  const followUser = async () => {
    if (!currentUser || !currentUser.email) {
      alert("You need to be logged in to follow users");
      return;
    }

    if (!isFollowing) {
      const followersName = await fetchUserName(currentUser.email);
      const userFollowersRef = doc(
        db,
        "users",
        email,
        "followers",
        currentUser.email
      );
      const userFollowingRef = doc(
        db,
        "users",
        currentUser.email,
        "followings",
        email
      );
      await setDoc(userFollowersRef, { email });
      await setDoc(userFollowingRef, { email });
      createNotification(
        "follow",
        `${followersName} followed you`,
        currentUser.email,
        Date.now(),
        email
      );
    } else {
      const userFollowersRef = doc(
        db,
        "users",
        email,
        "followers",
        currentUser.email
      );
      const userFollowingRef = doc(
        db,
        "users",
        currentUser.email,
        "followings",
        email
      );
      await deleteDoc(userFollowersRef);
      await deleteDoc(userFollowingRef);
    }

    setIsFollowing((prev) => !prev);
  };

  useEffect(() => {
    const followersCollection = collection(db, "users", email, "followers");
    const followersUnsubscribe = onSnapshot(followersCollection, (snapshot) => {
      setFollowerCount(snapshot.size);
    });
    const followingsCollection = collection(db, "users", email, "followings");
    const followingUnsubscribe = onSnapshot(
      followingsCollection,
      (snapshot) => {
        setFollowingCount(snapshot.size);
      }
    );

    return () => {
      followersUnsubscribe();
      followingUnsubscribe();
    };
  }, [email]);

  useEffect(() => {
    const checkIfFollowing = async () => {
      if (currentUser && currentUser.email) {
        const followingDoc = doc(
          db,
          "users",
          currentUser.email,
          "followers",
          email
        );
        const followingSnapshot = await getDoc(followingDoc);
        setIsFollowing(followingSnapshot.exists());
      }
    };

    checkIfFollowing();
  }, [currentUser, email]);

  const isUser = currentUser?.email === email;

  return (
    <div className=" dark:text-white text-black transition-colors duration-100">
      {profile ? (
        <>
          <div className="">
            <div className="flex items-center">
              <Image
                src={profile.coverPhoto}
                alt=""
                className="w-full h-64 object-cover rounded-xl"
                width={100}
                height={50}
              />
            </div>
            <div className="flex items-center justify-around w-full mb-4">
              <Image
                src={profile.profilePicture}
                alt=""
                className="rounded-full -translate-y-[50%] dark:border-gray-900 border-gray-200 border-8 transition-colors duration-100 h-52 w-52 object-cover"
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

            <div className="dark:bg-gray-800 bg-gray-100 rounded-md p-2 my-4 transition-colors duration-100">
              <div className="flex flex-row justify-between ">
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

              <hr className="h-px my-1 bg-gray-300 border-0 dark:bg-gray-700" />

              <div className="flex flex-row justify-between items-center w-full">
                <div className="w-96">{profile.description}</div>

                <div className="flex items-center pl-4">
                  <div className="dark:bg-slate-800 bg-gray-100 flex gap-1 items-center dark:text-white/75 text-black/75 ">
                    <div className="flex flex-col">
                      <div>{shortenNumber(followerCount)} followers</div>
                      <div>{shortenNumber(followingCount)} following</div>
                    </div>
                    {!isUser && (
                      <button
                        className="dark:bg-gray-900 bg-gray-50 dark:hover:bg-slate-700 hover:bg-gray-200 hover:font-semibold rounded-md transition-all duration-100 p-2 dark:shadow-gray-400/20"
                        onClick={followUser}
                      >
                        {isFollowing ? (
                          <MdOutlinePersonAddDisabled size={35} />
                        ) : (
                          <MdOutlinePersonAdd size={35} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className=" rounded-md  my-4">
              <h1 className="font-bold text-2xl mb-1 dark:text-white/85 text-black/85">
                Posts
              </h1>
              {posts.map((post) => (
                <>
                  <div
                    key={post.id}
                    className="dark:bg-gray-800 bg-gray-100 dark:hover:bg-slate-800 hover:bg-slate-100 dark:hover:text-white hover:text-black transition-all duration-100 rounded-lg py-2 mb-4"
                  >
                    <div className="flex flex-row items-center -mb-2 gap-2 px-3 py-1 text-[17px] dark:text-white/75 text-black/75 transition-colors duration-100">
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
                      <div className="flex flex-row items-center m-2 gap-2 rounded-full p-3 dark:bg-slate-700 bg-gray-300 transition-colors duration-100">
                        <button onClick={() => handleLike(post.id)}>
                          {userLikes[post.id] ? (
                            <FaHeart
                              className="dark:text-white text-black"
                              color="orangered"
                              size={20}
                            />
                          ) : (
                            <FaRegHeart
                              className="dark:text-gray-300 text-gray-900"
                              size={20}
                            />
                          )}
                        </button>
                        <span className="text-sm">{post.votes}</span>
                      </div>
                      <Link href={`/post/${post.id}`} passHref>
                        <div className="m-2  rounded-full p-3 flex items-center gap-1 cursor-pointer dark:bg-slate-700 bg-gray-300 transition-colors duration-100">
                          <BiComment size={20} />
                          <span className="text-sm">
                            {commentCounts[post.id] || 0}
                          </span>
                        </div>
                      </Link>
                      <div
                        className="m-2  rounded-full p-3 flex items-center gap-1 cursor-pointer dark:bg-slate-700 bg-gray-300 transition-colors duration-100"
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
      ) : (
        <div className="h-full w-full flex text-center items-center justify-center mt-[25%]">
          {notFound ? `Profile not found` : <Spinner />}
        </div>
      )}
      {showShareScreen && postIdForShare && (
        <ShareScreen
          onClose={() => setShowShareScreen(false)}
          Strlink={`localhost:3000/post/${postIdForShare}`}
        >
          {/* Pass any props or children needed by ShareScreen */}
        </ShareScreen>
      )}
    </div>
  );
}

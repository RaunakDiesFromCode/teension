// src/app/friends/page.tsx 

"use client"
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { BiComment } from "react-icons/bi";
import { FaHeart, FaRegHeart, FaRegShareSquare } from "react-icons/fa";
import useAuth from "@/app/firebase/useAuth";
import { formatDistanceToNow } from "date-fns";
import { commentCount } from "../components/utility/commentCount";
import { fetchUserName } from "../components/utility/fetchUserName";
import { createNotification } from "../components/utility/createNotification";
import SkeletonLoader from "../components/UI/skeletonloader";
import ShareScreen from "../components/UI/sharescreen";

interface Post {
  genre: string;
  id: string;
  image: string;
  username: string;
  displayName?: string;
  text: string;
  votes: number;
  description: string;
  createdAt: { seconds: number; nanoseconds: number };
  userEmail: string;
}

const Friends: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>(
    {}
  );
  const { currentUser, loading: authLoading } = useAuth();
  const [userLikes, setUserLikes] = useState<{ [postId: string]: boolean }>({});
  const [commentCounts, setCommentCounts] = useState<{
    [postId: string]: number;
  }>({});
  const [showShareScreen, setShowShareScreen] = useState(false);
  const [postIdForShare, setPostIdForShare] = useState<string | null>(null);

  const fetchCommentCounts = useCallback(async (posts: Post[]) => {
    const commentCountsData: { [postId: string]: number } = {};
    const promises = posts.map(async (post) => {
      const totalComments = await commentCount(post.id);
      commentCountsData[post.id] = totalComments;
    });

    await Promise.all(promises);
    setCommentCounts(commentCountsData);
  }, []);

  const fetchFollowedUsersPosts = useCallback(async () => {
    if (!currentUser || !currentUser.email) return;

    const followingsQuery = collection(
      db,
      "users",
      currentUser.email,
      "followings"
    );
    const followingsSnapshot = await getDocs(followingsQuery);

    if (followingsSnapshot.empty) {
      setLoading(false);
      return;
    }

    const followedEmails = followingsSnapshot.docs.map((doc) => doc.id);
    console.log(followedEmails);
    const postsQuery = query(
      collection(db, "posts"),
      where("username", "in", followedEmails)
    );

    onSnapshot(postsQuery, async (snapshot) => {
      const postsData: Post[] = [];
      const userLikesData: { [postId: string]: boolean } = {};

      const promises = snapshot.docs.map(async (doc) => {
        const postData = { id: doc.id, ...doc.data() } as Post;
        postData.displayName =
          (await fetchUserName(postData.username)) || postData.username;
        postsData.push(postData);

        if (currentUser) {
          const likesQuery = query(
            collection(db, "posts", postData.id, "likes"),
            where("email", "==", currentUser.email)
          );

          const likesSnapshot = await getDocs(likesQuery);
          userLikesData[postData.id] = !likesSnapshot.empty;
        }
      });

      Promise.all(promises).then(() => {
        setUserLikes(userLikesData);
        setPosts(postsData);
        setLoading(false);
        fetchCommentCounts(postsData);
      });
    });
  }, [currentUser, fetchCommentCounts]);

  useEffect(() => {
    fetchFollowedUsersPosts();
  }, [fetchFollowedUsersPosts]);

  const handleImageLoaded = (postId: string) => {
    setImageLoaded((prevState) => ({ ...prevState, [postId]: true }));
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
        const currentLikes = userData.likes ?? 0;
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
        const currentLikes = userData.likes ?? 0;
        const updatedLikes = currentLikes + 1;
        await updateDoc(likeref, { likes: updatedLikes });
      } else {
        console.log("Error fetching document");
      }

      const post = posts[postIndex];
      const likersName = await fetchUserName(currentUser.email);
      const notificationMessage = `${likersName ?? "Someone"} liked your post`;

      await createNotification(
        "like",
        notificationMessage,
        postId,
        Date.now(),
        post.username
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

  const toggleShareScreen = async (postId: string) => {
    if (currentUser && currentUser.email) {
      const shareref = doc(db, "users", currentUser.email);
      const sharesnapshot = await getDoc(shareref);
      if (sharesnapshot.exists()) {
        const userData = sharesnapshot.data();
        const currentShareCount = userData.shareCount ?? 0;
        const updatedShareCount = currentShareCount + 1;

        await updateDoc(shareref, { shareCount: updatedShareCount });
      }
    } else {
      console.log("Error fetching document");
    }
    setShowShareScreen(true);
    setPostIdForShare(postId);
  };

  const formatTimestamp = (timestamp: {
    seconds: number;
    nanoseconds: number;
  }) => {
    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (loading || authLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div>
      <ul className="text-xl dark:text-white/80 text-black/80 transition-colors duration-200">
        {posts.map((post) => (
          <li
            key={post.id}
            className="py-1 dark:bg-gray-800 bg-gray-100 my-3 dark:hover:bg-slate-800 hover:bg-slate-100 rounded-md dark:hover:text-white hover:text-black flex flex-col transition-colors duration-100"
          >
            <div className="flex flex-row items-center -mb-2 gap-2 px-3 py-1 text-[17px] dark:text-white/75 text-black/75 transition-colors duration-200 justify-between">
              <span className="text-md">
                <Link
                  href={`/profile/${post.username}`}
                  className="hover:text-blue-400"
                >
                  {post.displayName || post.username}
                </Link>
              </span>
              <div className="flex items-center">
                <span className="text-sm">
                  <Link href={"/"} className="hover:text-blue-400">
                    {post.genre}
                  </Link>
                </span>
                {"・"}
                <span className="text-sm text-opacity-50 italic">
                  {formatTimestamp(post.createdAt)}
                </span>
              </div>
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
                      onLoad={() => handleImageLoaded(post.id)}
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
                    />
                  ) : (
                    <FaRegHeart className="dark:text-gray-300 text-gray-900" />
                  )}
                </button>
                <span className="text-sm">{post.votes}</span>
              </div>
              <Link href={`/post/${post.id}`} passHref>
                <div className="m-2 dark:bg-slate-700 bg-gray-300 rounded-full p-3 flex items-center gap-1 cursor-pointer transition-colors duration-100">
                  <BiComment />
                  <span className="text-sm">{commentCounts[post.id] || 0}</span>
                </div>
              </Link>
              <div
                className="m-2 dark:bg-slate-700 bg-gray-300 rounded-full p-3 flex items-center gap-1 cursor-pointer transition-colors duration-100"
                onClick={() => toggleShareScreen(post.id)}
              >
                <FaRegShareSquare />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {showShareScreen && postIdForShare && (
        <ShareScreen
          onClose={() => setShowShareScreen(false)}
          Strlink={`localhost:3000/post/${postIdForShare}`}
        />
      )}
    </div>
  );
};

export default Friends;

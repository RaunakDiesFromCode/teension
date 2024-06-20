import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { BiComment, BiDownvote, BiUpvote } from "react-icons/bi";
import { FaRegShareFromSquare } from "react-icons/fa6";
import useAuth from "@/app/firebase/useAuth";
import firebase from "firebase/compat/app";
import SkeletonLoader from "./UI/skeletonloader";

interface Post {
  id: string;
  image: string;
  text: string;
  votes: number;
  description: string;
}

const Center: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>(
    {}
  );
  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const handleImageLoaded = (postId: string) => {
    setImageLoaded((prevState) => ({
      ...prevState,
      [postId]: true,
    }));
  };

  const handleVote = async (postId: string, change: number) => {
    if (!currentUser || !currentUser.email) {
      alert("You need to be logged in to vote");
      return;
    }

    const postIndex = posts.findIndex((post) => post.id === postId);
    if (postIndex === -1) return;

    const postRef = doc(db, "posts", postId);
    const upvoteRef = doc(collection(postRef, "upvotes"), currentUser.email);
    const downvoteRef = doc(
      collection(postRef, "downvotes"),
      currentUser.email
    );

    const upvoteDoc = await getDoc(upvoteRef);
    const downvoteDoc = await getDoc(downvoteRef);

    let newVoteCount = posts[postIndex].votes;

    if (change === 1) {
      if (upvoteDoc.exists()) {
        // User already upvoted, do nothing
        return;
      } else if (downvoteDoc.exists()) {
        // User had downvoted, remove downvote and add upvote
        await deleteDoc(downvoteRef);
        newVoteCount += 2;
      } else {
        // User had no previous vote, add upvote
        newVoteCount += 1;
      }
      await setDoc(upvoteRef, { email: currentUser.email });
    } else if (change === -1) {
      if (downvoteDoc.exists()) {
        // User already downvoted, do nothing
        return;
      } else if (upvoteDoc.exists()) {
        // User had upvoted, remove upvote and add downvote
        await deleteDoc(upvoteRef);
        newVoteCount -= 2;
      } else {
        // User had no previous vote, add downvote
        newVoteCount -= 1;
      }
      await setDoc(downvoteRef, { email: currentUser.email });
    }

    // Update vote count
    await updateDoc(postRef, {
      votes: newVoteCount,
    });

    // Update local state with new vote count
    const newPosts = [...posts];
    newPosts[postIndex].votes = newVoteCount;
    setPosts(newPosts);

    // Set imageLoaded to true to show the image (if applicable)
    setImageLoaded((prevState) => ({
      ...prevState,
      [postId]: true,
    }));
  };

  return (
    <div className="flex bg-gray-900 py-2 my-3 mr-3 px-4 w-[200rem] flex-col rounded-xl overflow-scroll">
      {loading ? (
        <SkeletonLoader />
      ) : (
        <ul className="text-xl text-white/80">
          {posts.map((post, index) => (
            <li
              key={post.id}
              className="py-1 transition-all duration-100 bg-gray-800 my-3 hover:bg-slate-800 rounded-md hover:text-white flex flex-col"
            >
              <div className="flex flex-col flex-grow">
                <Link
                  href={"/"}
                  className="flex flex-col gap-2 px-3 py-1 text-[17px]"
                >
                  <span className="text-2xl font-bold">{post.text}</span>
                  <span className="text-md my-2">{post.description}</span>
                  {post.image && post.image.trim() !== "" && (
                    <div className="relative">
                      {imageLoaded[post.id] ? null : (
                        <div className="bg-gray-700 rounded-md h-[300px] mb-2"></div>
                      )}
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
                </Link>
              </div>
              <div className="flex flex-row">
                <div className="flex flex-row items-center m-2 gap-2 bg-slate-700 rounded-full p-3 w-fit">
                  <button onClick={() => handleVote(post.id, 1)}>
                    <BiUpvote />
                  </button>
                  <span className="text-sm">{post.votes}</span>
                  <button onClick={() => handleVote(post.id, -1)}>
                    <BiDownvote />
                  </button>
                </div>
                <div className="m-2 bg-slate-700 rounded-full p-3 w-fit">
                  <BiComment />
                </div>
                <div className="m-2 bg-slate-700 rounded-full p-3 w-fit">
                  <FaRegShareFromSquare />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Center;

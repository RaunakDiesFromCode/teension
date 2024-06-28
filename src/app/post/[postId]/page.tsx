"use client";
// src/app/post/[postId]/page.tsx
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  setDoc,
  deleteDoc,
  increment,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { formatDistanceToNow } from "date-fns";
import firebase from "firebase/compat/app";
import Link from "next/link";
import { FaHeart, FaRegHeart, FaRegShareSquare } from "react-icons/fa";
import useAuth from "@/app/firebase/useAuth";
import { fetchUserName } from "@/app/components/utility/fetchUserName";
import { IoChevronBack } from "react-icons/io5";
import ShareScreen from "@/app/components/UI/sharescreen";

interface Post {
  likes: number;
  text: string;
  image?: string;
  votes: number;
  username: string;
  genre: string;
  createdAt: firebase.firestore.Timestamp;
}

interface Comment {
  id: string;
  email: string;
  text: string;
  time: string;
  likes: number;
  likedBy: string[];
  username?: string;
}

export default function PostDetailPage({ params }: { params: any }) {
  const postId = params.postId;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [voteCount, setVoteCount] = useState<number>(0);
  const { currentUser, loading: authLoading } = useAuth();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [postLiked, setPostLiked] = useState<boolean>(false);
  const [showShareScreen, setShowShareScreen] = useState(false);
  const [postIdForShare, setPostIdForShare] = useState<string | null>(null); // State to track postId for sharing

  useEffect(() => {
    if (!authLoading) {
      setUserEmail(currentUser?.email ?? null);
    }
  }, [currentUser, authLoading]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (postId) {
          const postDoc = doc(db, "posts", postId);
          const docSnap = await getDoc(postDoc);
          if (docSnap.exists()) {
            const postData = docSnap.data() as Post;
            const username = await fetchUserName(postData.username);
            setPost({ ...postData, username: username || postData.username });
            setVoteCount(postData.votes);
            if (userEmail) {
              // Check if the user has liked the post
              const userLikeRef = doc(db, "posts", postId, "likes", userEmail);
              const userLikeDoc = await getDoc(userLikeRef);
              setPostLiked(userLikeDoc.exists());
            }
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
  }, [postId, userEmail]);

  useEffect(() => {
    if (postId) {
      const commentsCollection = collection(db, `posts/${postId}/comments`);
      const unsubscribeComments = onSnapshot(
        commentsCollection,
        async (snapshot) => {
          const commentsList = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const commentData = doc.data();
              const username = await fetchUserName(commentData.email);
              return {
                id: doc.id,
                ...commentData,
                time: commentData.time,
                username: username || commentData.email,
              };
            })
          );
          commentsList.sort(
            (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
          );
          setComments(commentsList as Comment[]);
        }
      );

      const postDoc = doc(db, "posts", postId);
      const unsubscribeVotes = onSnapshot(postDoc, (doc) => {
        const data = doc.data();
        if (data && typeof data.votes === "number") {
          setVoteCount(data.votes);
        }
      });

      return () => {
        unsubscribeComments();
        unsubscribeVotes();
      };
    }
  }, [postId]);

  const handleCommentSubmit = async () => {
    if (comment.trim() === "" || !userEmail) return;

    const timeOfPosting = new Date().toISOString();
    const newComment = {
      email: userEmail,
      text: comment,
      time: timeOfPosting,
      likes: 0,
      likedBy: [],
    };

    try {
      await addDoc(collection(db, `posts/${postId}/comments`), newComment);
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!userEmail) return;

    const commentRef = doc(db, `posts/${postId}/comments`, commentId);
    const likedBy = comments.find((c) => c.id === commentId)?.likedBy || [];

    try {
      await updateDoc(commentRef, {
        likedBy: isLiked ? arrayRemove(userEmail) : arrayUnion(userEmail),
        likes: isLiked ? likedBy.length - 1 : likedBy.length + 1,
      });
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const toggleShareScreen = (postId: string) => {
    setShowShareScreen(true);
    setPostIdForShare(postId);
  };

  const handlePostLike = async () => {
    if (!userEmail || !post) return;

    // Toggle postLiked state and update voteCount accordingly
    const newVoteCount = postLiked ? voteCount - 1 : voteCount + 1;
    setVoteCount(newVoteCount);
    setPostLiked(!postLiked);

    const postRef = doc(db, "posts", postId);
    const userLikeRef = doc(db, "posts", postId, "likes", userEmail);

    try {
      // Update Firestore
      if (postLiked) {
        await deleteDoc(userLikeRef);
        await updateDoc(postRef, { votes: increment(-1) });
      } else {
        await setDoc(userLikeRef, { email: userEmail });
        await updateDoc(postRef, { votes: increment(1) });
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        Error: {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center h-screen">
        No post found for ID: {postId}
      </div>
    );
  }

  const formatTimestamp = (timestamp: {
    seconds: number;
    nanoseconds: number;
  }) => {
    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-1.5 text-white">
      <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <Link
          href="/"
          passHref
          className="mb-4 text-blue-500 flex flex-row items-center"
        >
          <IoChevronBack size={20} />
          Back to All Posts
        </Link>
        <div className="flex flex-row items-center -mb-2 gap-2 py-1 text-[17px]">
          <span className="text-md text-opacity-80">
            <Link href={"/"} className="hover:text-blue-400">
              {post.genre}
            </Link>
          </span>
          ・
          <span className="text-xs text-opacity-50 italic">
            {formatTimestamp(post.createdAt)}
          </span>
        </div>
        <p className="mb-2 -mt-2 text-xs text-white/75">
          {"Posted by "}
          <Link href={"/"} className="hover:text-blue-400 ">
            {post.username}
          </Link>
        </p>
        <h1 className="text-3xl font-bold mb-4">{post.text}</h1>
        {post.image && (
          <img
            src={post.image}
            alt={post.text}
            className="mb-4 w-full h-auto rounded-lg"
          />
        )}
        <div className="flex items-center space-x-4 mb-4 ">
          <div className="rounded-full p-3 bg-slate-700 flex flex-row gap-2 items-center">
            <button onClick={handlePostLike}>
              {postLiked ? (
                <FaHeart size={24} color="orangered" />
              ) : (
                <FaRegHeart size={24} />
              )}
            </button>
            <span>{voteCount}</span>
          </div>
          <div
            className="m-2 bg-slate-700 rounded-full p-3 flex items-center gap-1 cursor-pointer"
            onClick={() => toggleShareScreen(postId)}
          >
            <FaRegShareSquare size={24} />
          </div>
        </div>
        <div className="mb-6">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment"
            className="w-full p-2 mb-2 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent text-white"
          />
          <button
            onClick={handleCommentSubmit}
            className="w-full bg-blue-500 p-2 rounded-lg"
          >
            Post
          </button>
        </div>
        <div>
          {comments.map((c) => (
            <div key={c.id} className="m-1 my-4 rounded-lg">
              <p className="">
                <strong>{c.username}</strong>{" "}
                <em className="text-xs text-white/75">
                  {formatDistanceToNow(new Date(c.time), { addSuffix: true })}
                </em>
              </p>
              <p>{c.text}</p>
              <button
                onClick={() =>
                  handleLikeComment(
                    c.id,
                    c.likedBy.includes(userEmail as string)
                  )
                }
                className="flex items-center mt-1"
              >
                {Array.isArray(c.likedBy) &&
                c.likedBy.includes(userEmail as string) ? (
                  <FaHeart size={16} color="orangered" />
                ) : (
                  <FaRegHeart size={16} />
                )}
                <span className="ml-2">{c.likes}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
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
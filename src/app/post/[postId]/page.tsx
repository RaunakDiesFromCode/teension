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

interface Post {
  likes: number;
  text: string;
  image?: string;
  votes: number;
  username: string;
  createdAt: firebase.firestore.Timestamp;
}

interface Comment {
  id: string;
  email: string;
  text: string;
  time: string;
  likes: number;
  likedBy: string[];
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
            setPost(postData);
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
      const unsubscribeComments = onSnapshot(commentsCollection, (snapshot) => {
        const commentsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          time: doc.data().time,
        }));
        commentsList.sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );
        setComments(commentsList as Comment[]);
      });

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">{post.text}</h1>
        <p className="mb-2">
          Posted by {post.username}{" "}
          {formatDistanceToNow(post.createdAt.toDate())} ago
        </p>
        {post.image && (
          <img
            src={post.image}
            alt={post.text}
            className="mb-4 w-full h-auto rounded-lg"
          />
        )}
        <div className="flex items-center space-x-4 mb-4">
          <button onClick={handlePostLike}>
            {postLiked ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
          </button>
          <span>{voteCount}</span>
          <button>
            <FaRegShareSquare size={24} />
          </button>
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
            <div key={c.id} className="bg-gray-700 p-4 mb-2 rounded-lg">
              <p>
                <strong>{c.email}</strong>{" "}
                <em>
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
                className="flex items-center mt-2"
              >
                {Array.isArray(c.likedBy) &&
                c.likedBy.includes(userEmail as string) ? (
                  <FaHeart size={16} />
                ) : (
                  <FaRegHeart size={16} />
                )}
                <span className="ml-2">{c.likes}</span>
              </button>
            </div>
          ))}
        </div>
        <Link href="/" passHref className="mt-4 inline-block text-blue-500">
          Back to All Posts
        </Link>
      </div>
    </div>
  );
}

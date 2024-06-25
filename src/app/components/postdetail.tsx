import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaHeart, FaRegHeart, FaRegShareSquare } from "react-icons/fa";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { db } from "@/app/firebase/config";
import { Post } from "./types";
import ShareScreen from "./UI/sharescreen";
import Link from "next/link";

interface PostDetailProps {
  post: Post;
  onClose: () => void;
  userVote: number;
  handleVote: (postId: string, change: number) => void;
  userEmail?: string | null; // Define userEmail as an optional prop
}

const PostDetail: React.FC<PostDetailProps> = ({
  post,
  onClose,
  userVote,
  handleVote,
  userEmail,
}) => {
  const [comment, setComment] = useState<string>("");
  const [comments, setComments] = useState<
    Array<{
      id: string;
      email: string;
      text: string;
      time: string;
      likes: number;
      likedBy: string[];
    }>
  >([]);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [voteCount, setVoteCount] = useState<number>(post.votes);

  useEffect(() => {
    const commentsCollection = collection(db, `posts/${post.id}/comments`);
    const unsubscribeComments = onSnapshot(commentsCollection, (snapshot) => {
      const commentsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().time, // Add the 'time' property
      }));
      commentsList.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      setComments(
        commentsList as Array<{
          id: string;
          email: string;
          text: string;
          time: string;
          likes: number;
          likedBy: string[];
        }>
      );
    });

    // Set up real-time listener for vote count
    const postDoc = doc(db, "posts", post.id);
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
  }, [post.id]);

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
      await addDoc(collection(db, `posts/${post.id}/comments`), newComment);
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!userEmail) return;

    const commentRef = doc(db, `posts/${post.id}/comments`, commentId);
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

  const [showShareScreen, setShowShareScreen] = useState(false); // State to manage ShareScreen visibility

  const toggleShareScreen = () => {
    setShowShareScreen((prev) => !prev);
  };

  const formatTimestamp = (timestamp: {
    seconds: number;
    nanoseconds: number;
  }) => {
    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-90 flex justify-center"
      onClick={onClose}
    >
      <div
        className="p-6 rounded-lg m-4 flex flex-col gap-3 w-full max-w-3xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="fixed top-4 right-4" onClick={onClose}>
          <IoClose size={40} />
        </button>
        <div className="flex flex-col">
          <div className="flex flex-row items-center -mb-2 gap-2 py-1 text-[17px]">
            <span className="text-lg  text-opacity-50">
              <Link href={"/"} className=" hover:text-blue-400">
                {post.genre}
              </Link>
            </span>
            ・
            <span className="text-xs text-opacity-50 italic">
              {formatTimestamp(post.createdAt)}
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-2">{post.text}</h2>
          <p className="text-lg mb-4 -mt-2">{post.description}</p>
          {post.image && (
            <div className="relative mb-4 flex items-center justify-center">
              {imageLoading && (
                <div className="w-[500%] h-96 bg-gray-300 animate-pulse rounded-lg mx-14"></div>
              )}
              <img
                src={post.image}
                alt={post.text}
                className={`rounded-lg w-[90%] object-cover transition-opacity duration-500 ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setImageLoading(false)}
              />
            </div>
          )}
          <div className="flex items-center space-x-4 mb-4">
            <button onClick={() => handleVote(post.id, userVote === 1 ? 0 : 1)}>
              {userVote === 1 ? (
                <FaHeart size={20} color="orangered" />
              ) : (
                <FaRegHeart size={20} />
              )}
            </button>
            <span className="text-lg">{voteCount}</span>
            <button onClick={toggleShareScreen}>
              <FaRegShareSquare size={20} />
            </button>
            {showShareScreen && (
              <ShareScreen
                onClose={toggleShareScreen}
                Strlink={`localhost:3000/post/${post.id}`}
              >
                {/* Pass any props or children needed by ShareScreen */}
              </ShareScreen>
            )}
          </div>
        </div>
        <div className="my-4">
          <div className="flex flex-row items-center gap-2 mb-4">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment"
              className="w-full px-2 h-10 bg-transparent border-b-2 border- border-gray-300 focus:outline-none focus:border-blue-500 text-white"
            />
            <button
              onClick={handleCommentSubmit}
              className="p-2 bg-blue-500 text-white rounded"
            >
              Post
            </button>
          </div>
          <div className="bg-slate-800 p-2 rounded-lg text-white">
            {comments.map((c, index) => (
              <div key={index} className="px-2 py-2 rounded shadow mb-2">
                <p>
                  <strong className="text-sm">{c.email}</strong>{" "}
                  <em className="text-xs">
                    {"・" +
                      formatDistanceToNow(new Date(c.time), {
                        addSuffix: true,
                      })}
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
                  className="flex flex-row items-center gap-1 text-sm justify-center"
                >
                  {c.likedBy.includes(userEmail as string) ? (
                    <FaHeart color="orangered" />
                  ) : (
                    <FaRegHeart />
                  )}{" "}
                  {c.likes}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

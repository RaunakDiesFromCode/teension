import React, { useState, useEffect } from "react";
import {
  BiUpvote,
  BiSolidUpvote,
  BiDownvote,
  BiSolidDownvote,
} from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { FaRegShareSquare } from "react-icons/fa";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Post } from "./types";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase/config";
import { formatDistanceToNow } from "date-fns";

interface PostDetailProps {
  post: Post;
  onClose: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onClose }) => {
  const [voted, setVoted] = useState<number>(0); // 0: not voted, 1: upvoted, -1: downvoted
  const [comment, setComment] = useState<string>("");
  const [comments, setComments] = useState<
    Array<{ email: string; text: string; time: string }>
  >([]);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const fetchComments = async () => {
      const commentsCollection = collection(db, `posts/${post.id}/comments`);
      const commentsSnapshot = await getDocs(commentsCollection);
      const commentsList = commentsSnapshot.docs.map((doc) => doc.data());
      commentsList.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      setComments(
        commentsList as Array<{ email: string; text: string; time: string }>
      );
    };

    fetchComments();
  }, [post.id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email || "");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleVote = (change: number) => {
    if (voted === 1 && change === 1) {
      post.votes -= 1;
      setVoted(0);
    } else if (voted === -1 && change === -1) {
      post.votes += 1;
      setVoted(0);
    } else if (voted === -1 && change === 1) {
      post.votes += 2;
      setVoted(1);
    } else if (voted === 1 && change === -1) {
      post.votes -= 2;
      setVoted(-1);
    } else if (voted === 0 && change === 1) {
      post.votes += 1;
      setVoted(1);
    } else if (voted === 0 && change === -1) {
      post.votes -= 1;
      setVoted(-1);
    }
  };

  const handleCommentSubmit = async () => {
    if (comment.trim() === "" || userEmail === "") return;

    const timeOfPosting = new Date().toISOString();

    const newComment = {
      email: userEmail,
      text: comment,
      time: timeOfPosting,
    };

    try {
      await addDoc(collection(db, `posts/${post.id}/comments`), newComment);
      setComments([newComment, ...comments]);
      setComment("");
    } catch (e) {
      console.error("Error adding comment: ", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-90 flex justify-center">
      <div className="p-6 rounded-lg relative m-4 flex gap-4">
        <button className="absolute top-4 right-4" onClick={onClose}>
          <IoClose size={40} />
        </button>
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold">{post.text}</h2>
          <p className="text-lg my-2 mb-4">{post.description}</p>
          <div className="flex justify-center items-center">
            {post.image && (
              <div className="relative mb-4 h-60">
                <img
                  src={post.image}
                  alt={post.text}
                  className="rounded-lg w-full"
                />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <button onClick={() => handleVote(1)}>
              {voted === 1 ? <BiSolidUpvote /> : <BiUpvote />}
            </button>
            <span className="text-lg">{post.votes}</span>
            <button onClick={() => handleVote(-1)}>
              {voted === -1 ? <BiSolidDownvote /> : <BiDownvote />}
            </button>
            {/* Share Section */}
            <button>
              <FaRegShareSquare />
            </button>
          </div>
        </div>
        {/* Comments Section */}
        <div className="my-4 flex gap-1 flex-col">
          <div className="mt-4 flex flex-row items-center gap-1">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment"
              className="w-full px-1 rounded text-black overflow-scroll"
            />
            <button
              onClick={handleCommentSubmit}
              className="p-2 bg-blue-500 text-white rounded"
            >
              Post
            </button>
          </div>
          <div className="bg-slate-800 p-2 rounded-lg text-black overflow-scroll w-96">
            {comments.map((c, index) => (
              <div key={index} className="px-2 rounded shadow text-white py-2">
                <p>
                  <strong className="text-sm">{c.email}</strong>{""}
                  <em className="text-xs mb-1">
                    {"・"+formatDistanceToNow(new Date(c.time), { addSuffix: true })}
                  </em>
                </p>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

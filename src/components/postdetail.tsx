import React, { useState } from "react";
import { BiUpvote, BiSolidUpvote, BiDownvote, BiSolidDownvote } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { FaRegShareSquare } from "react-icons/fa";
import { Post } from "./types";

interface PostDetailProps {
  post: Post;
  onClose: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onClose }) => {
  const [voted, setVoted] = useState<number>(0); // 0: not voted, 1: upvoted, -1: downvoted

  const handleVote = (change: number) => {
    // If already upvoted and trying to upvote again, remove upvote
    if (voted === 1 && change === 1) {
      post.votes -= 1;
      setVoted(0);
    }
    // If already downvoted and trying to downvote again, remove downvote
    else if (voted === -1 && change === -1) {
      post.votes += 1;
      setVoted(0);
    }
    // If switching from downvote to upvote
    else if (voted === -1 && change === 1) {
      post.votes += 2;
      setVoted(1);
    }
    // If switching from upvote to downvote
    else if (voted === 1 && change === -1) {
      post.votes -= 2;
      setVoted(-1);
    }
    // If not voted yet and upvoting
    else if (voted === 0 && change === 1) {
      post.votes += 1;
      setVoted(1);
    }
    // If not voted yet and downvoting
    else if (voted === 0 && change === -1) {
      post.votes -= 1;
      setVoted(-1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-90 flex justify-center items-center">
      <div className="p-6 rounded-lg max-w-xl w-full bg-slate-700">
        <h2 className="text-3xl font-bold">{post.text}</h2>
        <p className="text-lg my-2 mb-4">{post.description}</p>
        {post.image && (
          <div className="relative mb-4">
            <img src={post.image} alt={post.text} className="rounded-lg w-full" />
          </div>
        )}
        <div className="flex items-center space-x-4 mb-4">
          <button onClick={() => handleVote(1)}>
            {voted === 1 ? <BiSolidUpvote /> : <BiUpvote />}
          </button>
          <span className="text-lg">{post.votes}</span>
          <button onClick={() => handleVote(-1)}>
            {voted === -1 ? <BiSolidDownvote /> : <BiDownvote />}
          </button>
        </div>
        {/* Comments Section */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">Comments</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            {/* Placeholder for comments */}
          </div>
        </div>
        {/* Share Section */}
        <div className="flex items-center space-x-4">
          <div className="bg-slate-700 rounded-full p-3">
            <FaRegShareSquare />
          </div>
        </div>
        <button
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <IoClose size={40} />
        </button>
      </div>
    </div>
  );
};

export default PostDetail;

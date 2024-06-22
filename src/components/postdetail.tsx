import React, { useState, useEffect } from "react";
import {
  BiUpvote,
  BiSolidUpvote,
  BiDownvote,
  BiSolidDownvote,
} from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { FaRegShareSquare } from "react-icons/fa";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  deleteDoc, // Add deleteDoc import for Firebase
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { auth, db } from "@/app/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { Post } from "./types";

interface PostDetailProps {
  post: Post;
  onClose: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onClose }) => {
  const [upvoted, setUpvoted] = useState<boolean>(false);
  const [downvoted, setDownvoted] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [comments, setComments] = useState<
    Array<{
      email: string;
      text: string;
      time: string;
    }>
  >([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [voteCount, setVoteCount] = useState<number>(post.votes);

  useEffect(() => {
    const fetchUserVotes = async () => {
      if (!userEmail) return;

      const upvoteRef = doc(db, `posts/${post.id}/upvotes/${userEmail}`);
      const downvoteRef = doc(db, `posts/${post.id}/downvotes/${userEmail}`);

      const upvoteSnap = await getDoc(upvoteRef);
      const downvoteSnap = await getDoc(downvoteRef);

      setUpvoted(upvoteSnap.exists());
      setDownvoted(downvoteSnap.exists());
    };

    fetchUserVotes();
  }, [post.id, userEmail]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email || "");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const commentsCollection = collection(db, `posts/${post.id}/comments`);
    const unsubscribe = onSnapshot(commentsCollection, (snapshot) => {
      const commentsList = snapshot.docs.map((doc) => doc.data());
      commentsList.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      setComments(
        commentsList as Array<{ email: string; text: string; time: string }>
      );
    });

    return () => unsubscribe();
  }, [post.id]);

  useEffect(() => {
    const postRef = doc(db, "posts", post.id);
    const unsubscribe = onSnapshot(postRef, (doc) => {
      if (doc.exists()) {
        const { votes } = doc.data() as { votes: number };
        setVoteCount(votes);
      }
    });

    return () => unsubscribe();
  }, [post.id]);

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!userEmail) {
      alert("You need to be logged in to vote");
      return;
    }

    let newVoteCount = voteCount;

    if (voteType === "upvote") {
      if (upvoted) {
        // Unvoting
        newVoteCount -= 1;
        setUpvoted(false);
        await deleteDoc(doc(db, `posts/${post.id}/upvotes/${userEmail}`));
      } else {
        // Upvoting
        newVoteCount += downvoted ? 2 : 1; // +2 if switching from downvote
        setUpvoted(true);
        setDownvoted(false);
        await setDoc(doc(db, `posts/${post.id}/upvotes/${userEmail}`), {
          timestamp: new Date(),
        });
        if (downvoted) {
          await deleteDoc(doc(db, `posts/${post.id}/downvotes/${userEmail}`));
        }
      }
    } else if (voteType === "downvote") {
      if (downvoted) {
        // Unvoting
        newVoteCount += 1;
        setDownvoted(false);
        await deleteDoc(doc(db, `posts/${post.id}/downvotes/${userEmail}`));
      } else {
        // Downvoting
        newVoteCount -= upvoted ? 2 : 1; // -2 if switching from upvote
        setDownvoted(true);
        setUpvoted(false);
        await setDoc(doc(db, `posts/${post.id}/downvotes/${userEmail}`), {
          timestamp: new Date(),
        });
        if (upvoted) {
          await deleteDoc(doc(db, `posts/${post.id}/upvotes/${userEmail}`));
        }
      }
    }

    try {
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, { votes: newVoteCount });
      setVoteCount(newVoteCount);
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (comment.trim() === "" || !userEmail) return;

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
    } catch (error) {
      console.error("Error adding comment:", error);
    }
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
        <button className="absolute top-4 right-4" onClick={onClose}>
          <IoClose size={40} />
        </button>
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold mb-2">{post.text}</h2>
          <p className="text-lg mb-4">{post.description}</p>
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
            <button onClick={() => handleVote("upvote")}>
              {upvoted ? <BiSolidUpvote /> : <BiUpvote />}
            </button>
            <span className="text-lg">{voteCount}</span>
            <button onClick={() => handleVote("downvote")}>
              {downvoted ? <BiSolidDownvote /> : <BiDownvote />}
            </button>
            <button>
              <FaRegShareSquare />
            </button>
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

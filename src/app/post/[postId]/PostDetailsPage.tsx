// src/components/PostDetailPage.tsx
"use client";
import { use, useEffect, useState } from "react";
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
  getDocs,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { formatDistanceToNow, set } from "date-fns";
import firebase from "firebase/compat/app";
import Link from "next/link";
import { FaHeart, FaRegHeart, FaRegShareSquare } from "react-icons/fa";
import useAuth from "@/app/firebase/useAuth";
import { fetchUserName } from "@/app/components/utility/fetchUserName";
import { IoChevronBack } from "react-icons/io5";
import { IoIosMore } from "react-icons/io";
import ShareScreen from "@/app/components/UI/sharescreen";
import { createNotification } from "@/app/components/utility/createNotification";
import { FiSend } from "react-icons/fi";
import { MdDeleteOutline, MdOutlineReport } from "react-icons/md";
import Spinner from "@/app/components/UI/spinner";
import addPoints from "@/app/components/utility/addPoints";
import addKeywordPoints from "@/app/components/utility/keywordPoints";

interface Post {
  likes: number;
  text: string;
  image?: string;
  votes: number;
  username: string;
  email: string;
  genre: string;
  description: string;
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
  replies?: Comment[];
}

export default function PostDetailPage({ postId }: { postId: string }) {
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
  const [email, setEmail] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState<{ [key: string]: string }>({});
  const [isPoster, setIsPoster] = useState<boolean>(false);
  const [isPosting, setIsPosting] = useState(false);
  const [moreOption, setMoreOption] = useState(false);

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
            console.log(postData.username);
            setEmail(postData.username); // Update the state instead of a let variable
            postData.email = postData.username; // Update the email property
            userEmail === postData.email
              ? setIsPoster(true)
              : setIsPoster(false);
            const username = await fetchUserName(postData.username);
            setPost({ ...postData, username: username || postData.username });
            setVoteCount(postData.votes);
            if (userEmail) {
              const userLikeRef = doc(db, "posts", postId, "likes", userEmail);
              const userLikeDoc = await getDoc(userLikeRef);
              setPostLiked(userLikeDoc.exists());
            }
            if (userEmail) {
              addPoints(userEmail, postData.genre, 1);
              addKeywordPoints(userEmail, postData.text, 1);
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
    // Other code remains the same
  }, [postId, db, userEmail]); // Make sure to include all dependencies

  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        try {
          const postDoc = doc(db, "posts", postId);
          const docSnap = await getDoc(postDoc);

          if (docSnap.exists()) {
            const postData = docSnap.data() as Post;
            const username = await fetchUserName(postData.email);
            setPost({ ...postData, username: username || postData.username });
            setVoteCount(postData.votes);

            // Fetch comments with their replies
            const commentsCollection = collection(
              db,
              `posts/${postId}/comments`
            );
            const unsubscribeComments = onSnapshot(
              commentsCollection,
              async (snapshot) => {
                const commentsList = await Promise.all(
                  snapshot.docs.map(async (doc) => {
                    const commentData = doc.data();
                    const username = await fetchUserName(commentData.email);
                    const repliesCollection = collection(
                      db,
                      `posts/${postId}/comments/${doc.id}/replies`
                    );
                    const repliesSnapshot = await getDocs(repliesCollection);
                    const repliesList = repliesSnapshot.docs.map(
                      (replyDoc) => ({
                        id: replyDoc.id,
                        ...replyDoc.data(),
                      })
                    );

                    return {
                      id: doc.id,
                      ...commentData,
                      time: commentData.time,
                      username: username || commentData.email,
                      replies: repliesList,
                    };
                  })
                );

                commentsList.sort(
                  (a, b) =>
                    new Date(b.time).getTime() - new Date(a.time).getTime()
                );
                setComments(commentsList as Comment[]);
              }
            );

            return () => {
              unsubscribeComments();
            };
          } else {
            setError("Post not found");
          }
        } catch (error) {
          console.error("Error fetching document:", error);
          setError("Error fetching document");
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [postId, db]);

  const handleCommentSubmit = async () => {
    setIsPosting(true);
    if (comment.trim() === "" || !userEmail) return;

    const timeOfPosting = new Date().toISOString();
    const newComment = {
      email: userEmail,
      text: comment,
      time: timeOfPosting,
      likes: 0,
      likedBy: [],
      username: await fetchUserName(userEmail),
    };

    try {
      // Add the new comment to the 'comments' sub-collection of the post
      await addDoc(collection(db, `posts/${postId}/comments`), newComment);

      // Reference to the user's document in the 'users' collection
      const userRef = doc(db, "users", userEmail);

      // Fetch the current user's document
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();

        // Initialize commentCount to 0 if undefined, then increment by 1
        const currentCommentCount = userData.commentCount ?? 0;
        const updatedCommentCount = currentCommentCount + 1;

        // Update the user's document with the new comment count
        await updateDoc(userRef, { commentCount: updatedCommentCount });

        const comentorsName = await userData.name; // Await the result
        const notificationMessage = `${
          comentorsName ?? "Someone"
        } commented on your your post`;

        if (post) {
          await createNotification(
            "commentedOnPost",
            notificationMessage,
            postId,
            Date.now(),
            post.email
          );
          if (userEmail) {
            addPoints(userEmail, post.genre, 1);
            addKeywordPoints(userEmail, post.text, 1);
          }
        } else {
          console.log("Post is null");
        }
        setIsPosting(false);
      } else {
        console.log("Error fetching user document");
      }

      // Clear the comment input field
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

      const comment = comments.find((c) => c.id === commentId);
      let commentersEmail = comment?.email || "";

      if (!isLiked) {
        const commentLikersName = await fetchUserName(userEmail); // Await the result
        const notificationMessage = `${
          commentLikersName ?? "Someone"
        } liked your comment`;
        await createNotification(
          "like",
          notificationMessage, // Title of the notification
          postId,
          Date.now(), // Current time in milliseconds
          commentersEmail // Dynamic username from post data
        );
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const toggleShareScreen = async (postId: string) => {
    if (!(currentUser === null || currentUser.email === null)) {
      const shareref = doc(db, "users", currentUser.email);
      const sharesnapshot = await getDoc(shareref);
      if (sharesnapshot.exists()) {
        const userData = sharesnapshot.data();
        const currentShareCount = userData.shareCount ?? 0;
        const updatedShareCount = currentShareCount + 1;

        // Update the user's document with the new comment count
        await updateDoc(shareref, { shareCount: updatedShareCount });
      }
    } else {
      console.log("Error fetching document");
    }
    setShowShareScreen(true);
    setPostIdForShare(postId);
  };

  const handleReplySubmit = async (parentCommentId: string) => {
    setIsPosting(true);
    const replyText = replyInput[parentCommentId]?.trim();
    if (!replyText || !userEmail) return;

    const timeOfPosting = new Date().toISOString();
    const newReply = {
      email: userEmail,
      text: replyText,
      time: timeOfPosting,
      likes: 0,
      likedBy: [],
      username: await fetchUserName(userEmail),
    };

    try {
      // Add the new reply to the 'replies' subcollection of the comment
      await addDoc(
        collection(db, `posts/${postId}/comments/${parentCommentId}/replies`),
        newReply
      );

      if (userEmail && post) {
        addPoints(userEmail, post.genre, 1);
        addKeywordPoints(userEmail, post.text, 1);
      }

      // Fetch comments with updated replies
      const commentsCollection = collection(db, `posts/${postId}/comments`);
      const snapshot = await getDocs(commentsCollection);
      const updatedComments = snapshot.docs.map(async (doc) => {
        const commentData = doc.data();
        const username = await fetchUserName(commentData.email);
        const repliesCollection = collection(
          db,
          `posts/${postId}/comments/${doc.id}/replies`
        );
        const repliesSnapshot = await getDocs(repliesCollection);
        const repliesList = repliesSnapshot.docs.map((replyDoc) => ({
          id: replyDoc.id,
          ...replyDoc.data(),
        }));

        return {
          id: doc.id,
          ...commentData,
          time: commentData.time,
          username: username || commentData.email,
          replies: repliesList,
        };
      });

      const commentsWithReplies = await Promise.all(updatedComments);
      commentsWithReplies.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      setComments(commentsWithReplies as Comment[]);

      // Clear the reply input field after successfully adding reply
      setReplyInput((prev) => ({ ...prev, [parentCommentId]: "" }));

      // Create a notification for the parent comment owner
      const notificationMessage = `${newReply.username} replied to your comment`;
      const parentComment = comments.find((c) => c.id === parentCommentId);
      const parentCommentEmail = parentComment?.email;
      await createNotification(
        "reply",
        notificationMessage,
        postId,
        Date.now(),
        parentCommentEmail || ""
      );
      setIsPosting(false);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    commentId: string
  ) => {
    setReplyInput((prev) => ({ ...prev, [commentId]: event.target.value }));
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

        const likeref = doc(db, "users", userEmail);
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
        await setDoc(userLikeRef, { email: userEmail });
        await updateDoc(postRef, { votes: increment(1) });

        const likeref = doc(db, "users", userEmail);
        const likesnapshot = await getDoc(likeref);
        if (likesnapshot.exists()) {
          const userData = likesnapshot.data();
          const currentLikes = userData.likes ?? 0; // Initialize to 0 if undefined
          const updatedLikes = currentLikes + 1;
          await updateDoc(likeref, { likes: updatedLikes });
        } else {
          console.log("Error fetching document");
        }

        const likersName = await fetchUserName(currentUser?.email ?? "");
        const notificationMessage = `${
          likersName ?? "Someone"
        } liked your post`;

        await createNotification(
          "like",
          notificationMessage,
          postId,
          Date.now(),
          post.email // Pass the username instead of the email
        );
        if (userEmail) {
          addPoints(userEmail, post.genre, 1);
        }
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

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
        {/* No post found for ID: {postId} */}
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

  const handleLikeReply = async (
    commentId: string,
    replyId: string,
    isLiked: boolean
  ) => {
    if (!userEmail) return;

    const replyRef = doc(
      db,
      `posts/${postId}/comments/${commentId}/replies`,
      replyId
    );

    try {
      await updateDoc(replyRef, {
        likedBy: isLiked ? arrayRemove(userEmail) : arrayUnion(userEmail),
        likes: increment(isLiked ? -1 : 1),
      });

      // Real-time update for likes
      onSnapshot(replyRef, (doc) => {
        const replyData = doc.data();
        const updatedComments = comments.map((comment) => {
          if (comment.id === commentId) {
            const updatedReplies = comment.replies?.map((reply) => {
              if (reply.id === replyId) {
                return {
                  ...reply,
                  likedBy: replyData?.likedBy || [],
                  likes: replyData?.likes || 0,
                };
              }
              return reply;
            });
            return {
              ...comment,
              replies: updatedReplies,
            };
          }
          return comment;
        });

        setComments(updatedComments as Comment[]);
      });

      // Optional: Add notification logic or any other actions here
      if (!isLiked) {
        const reply = comments
          .find((c) => c.id === commentId)
          ?.replies?.find((r) => r.id === replyId);
        const replyersEmail = reply?.email || "";
        const replyLikersName = (await fetchUserName(userEmail)) || "Someone";
        const notificationMessage = `${replyLikersName} liked your reply`;

        await createNotification(
          "like",
          notificationMessage,
          postId,
          Date.now(),
          replyersEmail
        );
      }
    } catch (error) {
      console.error("Error liking reply:", error);
    }
  };

  const delPost = async () => {
    try {
      await deleteDoc(doc(db, "posts", postId));
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const reportPost = async () => {
    try {
      const postRef = doc(db, "posts", postId);

      if (postRef) {
        const postSnapshot = await getDoc(postRef);
        if (postSnapshot.exists()) {
          const reportCounter = postSnapshot.data()?.reportCounter || 0;
          await updateDoc(postRef, { reportCounter: reportCounter + 1 });
        } else {
          console.error("Post does not exist");
        }
      }
    } catch (error) {
      console.error("Error reporting post:", error);
    }
  };

  const moreOptionToggle = () => {
    setMoreOption(!moreOption);
  };

  return (
    <div className="min-h-screen py-1.5 dark:text-white text-black transition-colors duration-100">
      <div className="max-w-3xl mx-auto dark:bg-gray-800 bg-gray-100 p-6 rounded-lg shadow-lg transition-colors duration-100">
        <div className=" flex items-center justify-between">
          <Link
            href="/"
            passHref
            className="mb-4 text-blue-500 flex flex-row items-center"
          >
            <IoChevronBack size={20} />
            Back to All Posts
          </Link>
          <div>
            <button className=" rounded-full p-1" onClick={moreOptionToggle}>
              <IoIosMore
                size={25}
                className=" opacity-70 hover:opacity-100 transition duration-100"
              />
            </button>
            {moreOption && (
              <div className="absolute -translate-x-[6rem] bg-white dark:bg-gray-700 rounded-lg shadow-lg p-2">
                {isPoster && (
                  <button
                    className=" rounded-full p-1 flex items-center gap-1 opacity-70 hover:opacity-100 transition duration-100"
                    onClick={delPost}
                  >
                    <MdDeleteOutline size={25} color="orangered" />
                    Delete Post
                  </button>
                )}
                <button
                  className=" rounded-full p-1 flex items-center gap-1 opacity-70 hover:opacity-100 transition duration-100"
                  onClick={reportPost}
                >
                  <MdOutlineReport size={25} color="orangered" />
                  Report Post
                </button>
              </div>
            )}
          </div>
        </div>
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
        <p className="mb-2 -mt-2 text-xs dark:text-white/75 text-black/75 transition-colors duration-100">
          {"Posted by "}
          <Link
            href={`/profile/${post.username}`}
            className="hover:text-blue-400 "
          >
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
        <div className="mb-5">{post.description}</div>
        <div className="flex items-center space-x-4 mb-4 ">
          <div className="rounded-full p-3 dark:bg-slate-700 bg-gray-300 flex flex-row gap-2 items-center transition-colors duration-100">
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
            className="m-2 dark:bg-slate-700 bg-gray-300 rounded-full p-3 flex items-center gap-1 cursor-pointer transition-colors duration-100"
            onClick={() => toggleShareScreen(postId)}
          >
            <FaRegShareSquare size={24} />
          </div>
        </div>
        <div className="mb-6 flex bg-gray-200 dark:bg-gray-700 rounded-full pl-5 pr-1 py-1 transition-colors duration-100">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment"
            className="w-full p-2 mb-2 border-b-2 dark:border-gray-300 border-gray-400 focus:border-blue-500 focus:outline-none bg-transparent"
          />
          <button
            onClick={handleCommentSubmit}
            className="dark:hover:bg-white/20 w-14 hover:bg-black/10 p-2 rounded-full flex items-center justify-center"
            disabled={isPosting} // Disable button while posting
          >
            {isPosting ? (
              <Spinner /> // Render spinner when posting
            ) : (
              <FiSend size={25} /> // Otherwise, render send icon
            )}
          </button>
        </div>
        <div className="mt-4">
          <div>
            {comments.map((c) => (
              <div key={c.id} className="m-1 my-4 rounded-lg">
                <p className="">
                  <strong>
                    <Link
                      href={`/profile/${c.username}`}
                      className="hover:text-blue-400 "
                    >
                      {c.username}
                    </Link>
                  </strong>{" "}
                  <em className="text-xs dark:text-white/75 text-black/75 transition-colors duration-100">
                    {formatDistanceToNow(new Date(c.time), {
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
                {/* Reply Section */}
                <div className="ml-6">
                  {c.replies?.map((r) => (
                    <div key={r.id} className="m-1 my-2 rounded-lg">
                      <p className="">
                        <strong>
                          <Link
                            href={`/profile/${r.username}`}
                            className="hover:text-blue-400 "
                          >
                            {r.username}
                          </Link>
                        </strong>{" "}
                        <em className="text-xs dark:text-white/75 text-black/75 transition-colors duration-100">
                          {formatDistanceToNow(new Date(r.time), {
                            addSuffix: true,
                          })}
                        </em>
                      </p>
                      <p>{r.text}</p>
                      <button
                        onClick={() =>
                          handleLikeReply(
                            c.id,
                            r.id,
                            r.likedBy.includes(userEmail as string)
                          )
                        }
                        className="flex items-center mt-1"
                      >
                        {Array.isArray(r.likedBy) &&
                        r.likedBy.includes(userEmail as string) ? (
                          <FaHeart size={16} color="orangered" />
                        ) : (
                          <FaRegHeart size={16} />
                        )}
                        <span className="ml-2">{r.likes}</span>
                      </button>
                    </div>
                  ))}
                  <div className="flex">
                    <input
                      type="text"
                      value={replyInput[c.id] || ""}
                      onChange={(e) => handleInputChange(e, c.id)}
                      placeholder="Reply to this comment"
                      className="w-full p-2 mb-2 border-b-2 dark:border-gray-300 border-gray-400 focus:border-blue-500 focus:outline-none bg-transparent transition-colors duration-100"
                    />
                    <button
                      onClick={() => handleReplySubmit(c.id)}
                      className="dark:hover:bg-white/20 w-14 hover:bg-black/10 p-2 rounded-full flex items-center justify-center transition-colors duration-100"
                      disabled={isPosting} // Disable button while posting
                    >
                      {isPosting ? (
                        <Spinner /> // Render spinner when posting
                      ) : (
                        <FiSend size={25} /> // Otherwise, render send icon
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

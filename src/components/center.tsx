import React, { useEffect, useState } from "react";
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
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import {
  BiComment,
  BiDownvote,
  BiSolidDownvote,
  BiSolidUpvote,
  BiUpvote,
} from "react-icons/bi";
import { FaRegShareSquare } from "react-icons/fa";
import useAuth from "@/app/firebase/useAuth";
import SkeletonLoader from "./UI/skeletonloader";
import PostDetail from "./postdetail";

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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>(
    {}
  );
  const { currentUser, loading: authLoading } = useAuth();

  // State to track user's vote status for each post
  const [userVotes, setUserVotes] = useState<{ [postId: string]: number }>({});
  const [commentCounts, setCommentCounts] = useState<{
    [postId: string]: number;
  }>({});

  useEffect(() => {
    const unsubscribePosts = onSnapshot(collection(db, "posts"), (snapshot) => {
      const postsData: Post[] = [];
      const userVotesData: { [postId: string]: number } = {};

      const promises = snapshot.docs.map(async (doc) => {
        const postData = { id: doc.id, ...doc.data() } as Post;
        postsData.push(postData);

        // Fetch user's votes for each post
        if (currentUser) {
          // Check if current user has upvoted or downvoted this post
          const upvotesQuery = query(
            collection(db, "posts", postData.id, "upvotes"),
            where("email", "==", currentUser.email)
          );
          const downvotesQuery = query(
            collection(db, "posts", postData.id, "downvotes"),
            where("email", "==", currentUser.email)
          );

          const [upvotesSnapshot, downvotesSnapshot] = await Promise.all([
            getDocs(upvotesQuery),
            getDocs(downvotesQuery),
          ]);

          if (!upvotesSnapshot.empty) {
            userVotesData[postData.id] = 1; // 1 means upvoted
          } else if (!downvotesSnapshot.empty) {
            userVotesData[postData.id] = -1; // -1 means downvoted
          } else {
            userVotesData[postData.id] = 0; // 0 means no vote
          }
        }

        // Set up real-time listener for comments
        const unsubscribeComments = onSnapshot(
          collection(db, "posts", postData.id, "comments"),
          (commentsSnapshot) => {
            setCommentCounts((prevState) => ({
              ...prevState,
              [postData.id]: commentsSnapshot.size,
            }));
          }
        );

        return unsubscribeComments;
      });

      Promise.all(promises).then(() => {
        setUserVotes(userVotesData);
        setPosts(postsData);
        setLoading(false);
      });
    });

    return () => unsubscribePosts();
  }, [currentUser]);

  const handleImageLoaded = (postId: string) => {
    setImageLoaded((prevState) => ({ ...prevState, [postId]: true }));
  };

  const handleVote = async (postId: string, change: number) => {
    if (!currentUser || !currentUser.email) {
      alert("You need to be logged in to vote");
      return;
    }

    const postIndex = posts.findIndex((post) => post.id === postId);
    if (postIndex === -1) return;

    let newVoteCount = posts[postIndex].votes;

    if (change === 1 && userVotes[postId] !== 1) {
      // Upvote
      newVoteCount += userVotes[postId] === -1 ? 2 : 1; // +2 if switching from downvote
      await setDoc(doc(db, "posts", postId, "upvotes", currentUser.email), {
        email: currentUser.email,
      });

      // Remove from downvotes if previously downvoted
      if (userVotes[postId] === -1) {
        await deleteDoc(
          doc(db, "posts", postId, "downvotes", currentUser.email)
        );
      }

      setUserVotes((prevState) => ({ ...prevState, [postId]: 1 }));
    } else if (change === -1 && userVotes[postId] !== -1) {
      // Downvote
      newVoteCount -= userVotes[postId] === 1 ? 2 : 1; // -2 if switching from upvote
      await setDoc(doc(db, "posts", postId, "downvotes", currentUser.email), {
        email: currentUser.email,
      });

      // Remove from upvotes if previously upvoted
      if (userVotes[postId] === 1) {
        await deleteDoc(doc(db, "posts", postId, "upvotes", currentUser.email));
      }

      setUserVotes((prevState) => ({ ...prevState, [postId]: -1 }));
    } else if (
      change === 0 &&
      (userVotes[postId] === 1 || userVotes[postId] === -1)
    ) {
      // Unvote
      if (userVotes[postId] === 1) {
        await deleteDoc(doc(db, "posts", postId, "upvotes", currentUser.email));
        newVoteCount -= 1;
      } else {
        await deleteDoc(
          doc(db, "posts", postId, "downvotes", currentUser.email)
        );
        newVoteCount += 1;
      }

      setUserVotes((prevState) => ({ ...prevState, [postId]: 0 }));
    } else {
      // User is trying to upvote/downvote again after already upvoting/downvoting
      return;
    }

    await updateDoc(doc(db, "posts", postId), { votes: newVoteCount });

    // Update posts state with new vote count
    setPosts((prevPosts) => {
      const newPosts = [...prevPosts];
      newPosts[postIndex].votes = newVoteCount;
      return newPosts;
    });
  };

  const handleCommentClick = (postId: string) => {
    const selectedPost = posts.find((post) => post.id === postId);
    if (selectedPost) {
      setSelectedPost(selectedPost);
    }
  };

  return (
    <div className="flex bg-gray-900 py-2 my-3 mr-3 px-4 w-[200rem] flex-col rounded-xl overflow-scroll">
      {loading ? (
        <SkeletonLoader />
      ) : (
        <ul className="text-xl text-white/80">
          {posts.map((post) => (
            <li
              key={post.id}
              className="py-1 transition-all duration-100 bg-gray-800 my-3 hover:bg-slate-800 rounded-md hover:text-white flex flex-col"
            >
              <Link href="/" passHref>
                <div
                  className="flex flex-col gap-2 px-3 py-1 text-[17px] cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <span className="text-2xl font-bold">{post.text}</span>
                  <span className="text-md my-2">{post.description}</span>
                  {post.image && (
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
                </div>
              </Link>
              <div className="flex flex-row">
                <div className="flex flex-row items-center m-2 gap-2 rounded-full p-3 bg-slate-700">
                  <button
                    onClick={() =>
                      handleVote(post.id, userVotes[post.id] === 1 ? 0 : 1)
                    }
                  >
                    {userVotes[post.id] === 1 ? (
                      <BiSolidUpvote className="text-white" />
                    ) : (
                      <BiUpvote className="text-gray-300" />
                    )}
                  </button>
                  <span className="text-sm">{post.votes}</span>
                  <button
                    onClick={() =>
                      handleVote(post.id, userVotes[post.id] === -1 ? 0 : -1)
                    }
                  >
                    {userVotes[post.id] === -1 ? (
                      <BiSolidDownvote className="text-white" />
                    ) : (
                      <BiDownvote className="text-gray-300" />
                    )}
                  </button>
                </div>
                <div
                  className="m-2 bg-slate-700 rounded-full p-3 flex items-center gap-1 cursor-pointer"
                  onClick={() => handleCommentClick(post.id)}
                >
                  <BiComment />
                  <span className="text-sm">{commentCounts[post.id] || 0}</span>
                </div>
                <div className="m-2 bg-slate-700 rounded-full p-3">
                  <FaRegShareSquare />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          userVote={userVotes[selectedPost.id]}
          handleVote={handleVote}
        />
      )}
    </div>
  );
};

export default Center;

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
import { BiComment } from "react-icons/bi";
import { FaHeart, FaRegHeart, FaRegShareSquare } from "react-icons/fa";
import useAuth from "@/app/firebase/useAuth";
import SkeletonLoader from "./UI/skeletonloader";
import PostDetail from "./postdetail";
import ShareScreen from "./UI/sharescreen";
import { formatDistanceToNow } from "date-fns";

interface Post {
  genre: string;
  id: string;
  image: string;
  username: string;
  text: string;
  votes: number;
  description: string;
  createdAt: { seconds: number; nanoseconds: number };
}

const Center: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>(
    {}
  );
  const { currentUser, loading: authLoading } = useAuth();

  const [userLikes, setUserLikes] = useState<{ [postId: string]: boolean }>({});
  const [commentCounts, setCommentCounts] = useState<{
    [postId: string]: number;
  }>({});
  const [showShareScreen, setShowShareScreen] = useState(false);
  const [postIdForShare, setPostIdForShare] = useState<string | null>(null); // State to track postId for sharing

  useEffect(() => {
    const unsubscribePosts = onSnapshot(collection(db, "posts"), (snapshot) => {
      const postsData: Post[] = [];
      const userLikesData: { [postId: string]: boolean } = {};

      const promises = snapshot.docs.map(async (doc) => {
        const postData = { id: doc.id, ...doc.data() } as Post;
        postsData.push(postData);

        if (currentUser) {
          const likesQuery = query(
            collection(db, "posts", postData.id, "likes"),
            where("email", "==", currentUser.email)
          );

          const likesSnapshot = await getDocs(likesQuery);
          userLikesData[postData.id] = !likesSnapshot.empty;
        }

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
        setUserLikes(userLikesData);
        setPosts(postsData);
        setLoading(false);
      });
    });

    return () => unsubscribePosts();
  }, [currentUser]);

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
    } else {
      newVoteCount += 1;
      await setDoc(doc(db, "posts", postId, "likes", currentUser.email), {
        email: currentUser.email,
      });
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

  const handleCommentClick = (postId: string) => {
    const selectedPost = posts.find((post) => post.id === postId);
    if (selectedPost) {
      setSelectedPost(selectedPost);
    }
  };

  const toggleShareScreen = (postId: string) => {
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
              <div className="flex flex-row items-center -mb-2 gap-2 px-3 py-1 text-[17px]">
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
              <div
                className="flex flex-col gap-2 px-3 py-1 text-[17px] cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <span className="text-2xl font-bold">{post.text}</span>
                <span className="text-md my-1">{post.description}</span>
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
              <div className="flex flex-row">
                <div className="flex flex-row items-center m-2 gap-2 rounded-full p-3 bg-slate-700">
                  <button onClick={() => handleLike(post.id)}>
                    {userLikes[post.id] ? (
                      <FaHeart className="text-white" color="orangered" />
                    ) : (
                      <FaRegHeart className="text-gray-300" />
                    )}
                  </button>
                  <span className="text-sm">{post.votes}</span>
                </div>
                <div
                  className="m-2 bg-slate-700 rounded-full p-3 flex items-center gap-1 cursor-pointer"
                  onClick={() => handleCommentClick(post.id)}
                >
                  <BiComment />
                  <span className="text-sm">{commentCounts[post.id] || 0}</span>
                </div>
                <div
                  className="m-2 bg-slate-700 rounded-full p-3 flex items-center gap-1 cursor-pointer"
                  onClick={() => toggleShareScreen(post.id)}
                >
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
          userVote={userLikes[selectedPost.id] ? 1 : 0}
          handleVote={handleLike}
          userEmail={currentUser?.email}
        />
      )}

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
};

export default Center;
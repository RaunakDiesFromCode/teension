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
  getDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { BiComment } from "react-icons/bi";
import { FaHeart, FaRegHeart, FaRegShareSquare } from "react-icons/fa";
import useAuth from "@/app/firebase/useAuth";
import SkeletonLoader from "./UI/skeletonloader";
import { formatDistanceToNow } from "date-fns";
import ShareScreen from "./UI/sharescreen";

interface Post {
  genre: string;
  id: string;
  image: string;
  username: string;
  text: string;
  votes: number;
  description: string;
  createdAt: { seconds: number; nanoseconds: number };
  userEmail: string; // Add userEmail property
}

const Center: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
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

      const likeref = doc(db, "users", currentUser.email);
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
      newVoteCount += 1;
      await setDoc(doc(db, "posts", postId, "likes", currentUser.email), {
        email: currentUser.email,
      });

      const likeref = doc(db, "users", currentUser.email);
      const likesnapshot = await getDoc(likeref);
      if (likesnapshot.exists()) {
        const userData = likesnapshot.data();
        const currentLikes = userData.likes ?? 0; // Initialize to 0 if undefined
        const updatedLikes = currentLikes + 1;
        await updateDoc(likeref, { likes: updatedLikes });
      } else {
        console.log("Error fetching document");
      }
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
    // No need to set selectedPost anymore
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

  const formatTimestamp = (timestamp: {
    seconds: number;
    nanoseconds: number;
  }) => {
    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div>
      {loading ? (
        <SkeletonLoader />
      ) : (
        <ul className="text-xl text-white/80">
          {posts.map((post) => (
            <li
              key={post.id}
              className="py-1 transition-all duration-100 bg-gray-800 my-3 hover:bg-slate-800 rounded-md hover:text-white flex flex-col"
            >
              <div className="flex flex-row items-center -mb-2 gap-2 px-3 py-1 text-[17px] text-white/75">
                <span className="text-md">
                  <Link href={"/"} className="hover:text-blue-400">
                    {post.genre}
                  </Link>
                </span>
                {"・"}
                <span className="text-xs text-opacity-50 italic">
                  {formatTimestamp(post.createdAt)}
                </span>
              </div>
              <Link href={`/post/${post.id}`} passHref>
                <div className="flex flex-col gap-2 px-3 py-1 text-[17px] cursor-pointer">
                  <span className="text-2xl font-bold">{post.text}</span>
                  <span className="text-md my-1">{post.description}</span>
                  {post.image && (
                    <div className="relative">
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
                  <button onClick={() => handleLike(post.id)}>
                    {userLikes[post.id] ? (
                      <FaHeart className="text-white" color="orangered" />
                    ) : (
                      <FaRegHeart className="text-gray-300" />
                    )}
                  </button>
                  <span className="text-sm">{post.votes}</span>
                </div>
                <Link href={`/post/${post.id}`} passHref>
                  <div className="m-2 bg-slate-700 rounded-full p-3 flex items-center gap-1 cursor-pointer">
                    <BiComment />
                    <span className="text-sm">
                      {commentCounts[post.id] || 0}
                    </span>
                  </div>
                </Link>
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

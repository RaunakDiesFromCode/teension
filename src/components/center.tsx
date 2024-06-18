import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { BiComment, BiDownvote, BiUpvote } from "react-icons/bi";
import { FaRegShareFromSquare } from "react-icons/fa6";

interface Post {
  id: string;
  image: string;
  text: string;
  votes: number;
}

const Center = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const handleImageLoaded = (postId: string) => {
    setImageLoaded((prevState) => ({
      ...prevState,
      [postId]: true,
    }));
  };

  return (
    <div className="flex bg-gray-900 py-2 my-3 mr-3 px-4 w-[200rem] flex-col rounded-xl overflow-scroll">
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <span className="text-gray-200">Loading posts...</span>
        </div>
      ) : (
        <ul className="text-xl text-white/80">
          {posts.map((post, index) => (
            <li
              key={post.id}
              className="py-1 transition-all duration-100 bg-gray-800 my-3 hover:bg-slate-800 rounded-md hover:text-white flex flex-col"
            >
              <div className="flex flex-col flex-grow">
                <Link
                  href={"/"}
                  className="flex flex-col gap-2 px-3 py-1 text-[17px]"
                >
                  <span className="text-2xl font-bold">{post.text}</span>
                  {post.image && post.image.trim() !== "" && (
                    <div className="relative">
                      {imageLoaded[post.id] ? null : (
                        <div className="bg-gray-700 rounded-md h-[300px] mb-2"></div>
                      )}
                      <Image
                        src={post.image}
                        alt={post.text}
                        className="w-full rounded-md"
                        onLoad={() => handleImageLoaded(post.id)}
                      />
                    </div>
                  )}
                </Link>
              </div>
              <div className="flex flex-row">
                <div className="flex flex-row items-center m-2 gap-2 bg-slate-700 rounded-full p-3 w-fit">
                  <h1>
                    <BiUpvote />
                  </h1>
                  <span className="text-sm">{post.votes}</span>
                  <h1>
                    <BiDownvote />
                  </h1>
                </div>
                <div className="m-2 bg-slate-700 rounded-full p-3 w-fit">
                  <BiComment />
                </div>
                <div className="m-2 bg-slate-700 rounded-full p-3 w-fit">
                  <FaRegShareFromSquare />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Center;

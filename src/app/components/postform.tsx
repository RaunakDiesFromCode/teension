import React, { useState, useEffect } from "react";
import useAuth from "@/app/firebase/useAuth"; // Replace with your actual Firebase Auth hook
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import addPost from "./utility/addPost";
import { IoClose } from "react-icons/io5";
import Spinner from "./UI/spinner";
import { FiSend } from "react-icons/fi";

interface PostFormProps {
  onPostAdded: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ onPostAdded }) => {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.email || ""); // Set the username to the user's email
      setLoading(false);
    }
  }, [currentUser]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();

    let downloadURL = "";
    if (image) {
      try {
        const storage = getStorage();
        const storageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(storageRef, image);
        downloadURL = await getDownloadURL(storageRef);
      } catch (error) {
        console.error(error);
      }
    }

    try {
      await addPost(text, downloadURL, 0, username, description, genre);
      onPostAdded();
      setText("");
      setDescription("");
      setImage(null);
      setGenre("");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // if (loading) {
  //   return <p className="text-white">Loading...</p>;
  // }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 dark:bg-gray-800 bg-gray-200 rounded-lg mx-10 shadow-xl dark:text-white text-black h-auto w-[90vw] transition-colors duration-100"
    >
      <div className="flex flex-col">
        <label className="mb-2 text-xl text-black/70 dark:text-white/70 flex items-center justify-between transition-colors duration-100">
          Create a post
          <button
            type="button"
            className=" dark:text-white text-black font-bold py-2 px-4 rounded transition-colors duration-100"
            onClick={() => {
              onPostAdded();
            }}
          >
            <IoClose size={25} />
          </button>
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          className="p-2 dark:bg-gray-800 bg-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl text-xl transition-colors duration-100"
          placeholder="Enter title"
        />
      </div>
      <div className="flex flex-col">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="p-2 dark:bg-gray-800 bg-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl transition-colors duration-100"
          placeholder="Enter description"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1">Image (optional)</label>
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setImage(e.target.files[0]);
            }
          }}
          className="p-2 dark:bg-gray-800 bg-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl transition-colors duration-100"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1">Genre</label>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          required
          className="p-2 dark:bg-gray-800 bg-gray-100 border border-gray-600 focus:outline-none h-10 focus:ring-2 focus:ring-blue-500 rounded transition-colors duration-100"
        >
          <option value="">Select a genre</option>
          <option value="help">Help</option>
          <option value="games">Games</option>
          <option value="love">Love</option>
          <option value="life">Life</option>
          <option value="life">Sports</option>
          <option value="others">Others</option>
        </select>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex gap-1 items-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner />
            </>
          ) : (
            <>
              Post
              <FiSend size={25} />
            </>
          )}
        </button>
        <button
          type="button"
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            setText("");
            setDescription("");
            setImage(null);
            setGenre("");
          }}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default PostForm;

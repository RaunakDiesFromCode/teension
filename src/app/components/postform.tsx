import React, { useState, useEffect } from "react";
import useAuth from "@/app/firebase/useAuth"; // Replace with your actual Firebase Auth hook
import addPost from "@/app/firebase/addPost";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface PostFormProps {
  onPostAdded: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ onPostAdded }) => {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      // setUsername(currentUser.displayName || "");
      setLoading(false);
    }
  }, [currentUser]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      await addPost(text, downloadURL, 0, username, description);
      onPostAdded();
      setText("");
      setDescription("");
      setImage(null);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <p className="text-white">Loading...</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-gray-800 rounded-lg mx-10 shadow-lg text-white h-auto w-[90vw] "
    >
      <div className="flex flex-col">
        <label className="mb-2 text-xl">Create a post</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          className="p-2 bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl text-xl"
          placeholder="Enter title"
        />
      </div>
      <div className="flex flex-col">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="p-2 bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl"
          placeholder="Enter description"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1">{"Image (optional)"}</label>
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setImage(e.target.files[0]);
            }
          }}
          className="p-2 bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl"
        />
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Add Post
        </button>
        <button
          type="button"
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            setText("");
            setDescription("");
            setImage(null);
          }}
        >
          Clear
        </button>
        <button
          type="button"
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            onPostAdded();
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PostForm;

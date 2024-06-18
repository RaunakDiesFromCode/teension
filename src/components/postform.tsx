import React, { useState, useEffect } from "react";
import useAuth from "@/app/firebase/useAuth"; // Replace with your actual Firebase Auth hook
import addPost from "@/app/firebase/addPost";

const PostForm = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true); // State to manage loading state while fetching username
  const { currentUser } = useAuth(); // Custom hook to get current user from Firebase Auth

  useEffect(() => {
    if (currentUser) {
      // setUsername(currentUser.displayName || ""); // Use display name if available
      setLoading(false);
    }
  }, [currentUser]);

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    try {
      await addPost(text, image, 1, username); // Pass username to addPost function
      setText("");
      setImage("");
    } catch (error) {
      console.error("Error adding post: ", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>; // Render loading state while fetching username
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Text:
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          className="text-black"
        />
      </label>
      <label>
        Image URL:
        <input
          type="file"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="text-black"
        />
      </label>
      <button type="submit" className=" bg-blue-400 rounded-xl p-3">
        Add Post
      </button>
      <button
        type="button"
        className="bg-red-400 rounded-xl p-3"
        onClick={() => {
          setText("");
          setImage("");
        }}
      >
        Clear
      </button>
    </form>
  );
};

export default PostForm;

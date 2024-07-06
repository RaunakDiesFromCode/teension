import { db } from "@/app/firebase/config";
import {
  addDoc,
  collection,
  doc,
  setDoc,
  Timestamp,
} from "@firebase/firestore";

const addPost = async (
  text: string,
  image: string,
  votes: number,
  username: string,
  description: string,
  genre: string
) => {
  try {
    // Add the post to the "posts" collection
    const postRef = await addDoc(collection(db, "posts"), {
      text,
      image: image || "",
      votes,
      username,
      description,
      genre,
      createdAt: Timestamp.now(), // Use Firestore Timestamp
    });

    // Add a reference to the post in the user's "posts" subcollection
    await setDoc(doc(db, "users", username, "posts", postRef.id), {
      postId: postRef.id,
    });

    console.log("Post added with ID: ", postRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export default addPost;

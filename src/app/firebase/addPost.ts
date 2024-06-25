import { addDoc, collection } from "@firebase/firestore";
import { db } from "./config";

const addPost = async (text: String, image: String, votes: Number, username: String, description: String, genre: string) => {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      text,
      image: image || "",
      votes,
      username,
      description,
      genre,
      createdAt: new Date() // Optionally include a timestamp
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export default addPost;

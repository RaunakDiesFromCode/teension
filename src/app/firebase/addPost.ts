import { addDoc, collection } from "@firebase/firestore";
import { db } from "./config";

const addPost = async (text: string, image: string, votes: Number, username: string, description: string, genre: string) => {
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
    const userRef = await addDoc(collection(db, "users", username, "posts" ), {
      text,
      image: image || "",
      votes,
      username,
      description,
      genre,
      createdAt: new Date() // Optionally include a timestamp
    });
  
    console.log("Document written with ID: ", docRef.id);
    console.log("Document written with ID: ", userRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export default addPost;

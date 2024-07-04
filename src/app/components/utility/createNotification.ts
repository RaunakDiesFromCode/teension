import { db } from "@/app/firebase/config";
import { addDoc, collection, Timestamp } from "@firebase/firestore";

export async function createNotification(
  field: string, // Assuming this is a theme in the document
  name: string, // Assuming this is the title of the document
  postId: string, // Assuming this is the ID of the document
  time: number, // Assuming this is in milliseconds
  email: string //whome to send notification
) {
  console.log("Creating notification for", email);
  console.log("Field:", field);
  console.log("Name:", name);
  console.log("Post ID:", postId);
  console.log("Time:", time);
  const timestamp = Timestamp.fromMillis(time);
  const postsRef = collection(db, "users", email, "notification");
  await addDoc(postsRef, {
    field: field,
    name: name,
    postId: postId,
    time: timestamp, // Now storing as a Timestamp
    read: false,
  });
}

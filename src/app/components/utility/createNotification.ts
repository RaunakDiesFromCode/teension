import { db } from "@/app/firebase/config";
import { addDoc, collection, Timestamp } from "@firebase/firestore";

export async function createNotification(
  field: string,
  name: string,
  postId: string,
  time: number, // Assuming this is in milliseconds
  email: string
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

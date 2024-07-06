import { db } from "@/app/firebase/config";
import { doc, updateDoc } from "@firebase/firestore";
import { createNotification } from "./createNotification";
import { getAuth } from "firebase/auth";

export async function createTribe(
email: string | "", tribe: string, // Assuming this is a tribe of the user
) {

  const currentUser = getAuth().currentUser;
  // const email = currentUser ? currentUser.email || "" : "";

  console.log("Creating notification for", email);
  console.log("Tribe:", tribe);

  try {
    // Get the reference to the user's document
    const userDocRef = doc(db, "users", email);

    // Update the tribe field in the user's document
    await updateDoc(userDocRef, {
      tribe: tribe,
    });

    // Create the notification
    createNotification(
      "tribe",
      "You are now in tribe " + tribe,
      "",
      Date.now(),
      email
    );

    console.log("Tribe added to document successfully");
  } catch (error) {
    console.error("Error updating tribe: ", error);
  }
}

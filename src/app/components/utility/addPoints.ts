import { db } from "@/app/firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "@firebase/firestore";

export default async function addPoints(
  email: string,
  genre: string,
  points: number
) {
  const pointsRef = doc(db, "users", email, "points", "genre");

  const pointsDoc = await getDoc(pointsRef);

  if (pointsDoc.exists()) {
    // Check if the genre exists and update the points
    const existingPoints = pointsDoc.data()[genre] || 0;
    await updateDoc(pointsRef, {
      [genre]: existingPoints + points,
    });
  } else {
    // Create a new document and set the genre points
    await setDoc(pointsRef, {
      [genre]: points,
    });
  }
}

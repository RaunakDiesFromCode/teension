import { db } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export const fetchUserName = async (email: string): Promise<string | null> => {
  try {
    if (email) {
      console.log("Fetching user data for:", email);
      const userDocRef = doc(db, "users", email);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData?.name || null;
      } else {
        console.error("User data not found for:", email);
        return null;
      }
    } else {
      console.error("Invalid email:", email);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

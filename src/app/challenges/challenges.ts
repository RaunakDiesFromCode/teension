import { collection, getDocs } from "@firebase/firestore";
import { db } from "../firebase/config";

export async function checkId(id: number, email: string): Promise<boolean> {
  console.log("checkId", id, email);
  switch (id) {
    case 1:
      const postsRef = collection(db, "users", email, "posts");
      const snapshot = await getDocs(postsRef);
      return !snapshot.empty;

    default:
      return false;
  }
}

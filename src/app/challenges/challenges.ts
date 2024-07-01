import { collection, doc, getDoc, getDocs } from "@firebase/firestore";
import { db } from "../firebase/config";
import { ca } from "date-fns/locale";

export async function checkId(id: number, email: string): Promise<boolean> {
  console.log("checkId", id, email);
  switch (id) {
    case 1:
      const postsRef = collection(db, "users", email, "posts");
      const snapshot = await getDocs(postsRef);
      return !snapshot.empty;

    case 2:
      const userDocRef = doc(db, "users", email);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        const pfpExists = userData.profilePicture != null;
        const cvrExists = userData.coverPhoto != null;
        return pfpExists && cvrExists;
      } else {
        return false;
      }

    case 3:
      const fllwrsRef = collection(db, "users", email, "followers");
      const fllwrssnapshot = await getDocs(fllwrsRef);
      return !fllwrssnapshot.empty;

    case 4:
      const likeref = doc(db, "users", email);
      const likesnapshot = await getDoc(likeref);
      if (likesnapshot.exists()) {
        const userData = likesnapshot.data();
        const likesexists = userData.likes >= 5;
        return likesexists;
      } else {
        return false;
      }

    case 5:
      const dateref = doc(db, "users", email);
      const datesnapshot = await getDoc(dateref);
      if (datesnapshot.exists()) {
        const userData = datesnapshot.data();
        const dateexists = userData.consecutiveLogin >= 7;
        return dateexists;
      } else {
        return false;
      }

    case 6:
      const commentsref = doc(db, "users", email);
      const commentssnapshot = await getDoc(commentsref);
      if (commentssnapshot.exists()) {
        const userData = commentssnapshot.data();
        const commentsexists = userData.commentCount >= 10;
        return commentsexists;
      } else {
        return false;
      }

    case 7:
      const shareref = doc(db, "users", email);
      const sharesnapshot = await getDoc(shareref);
      if (sharesnapshot.exists()) {
        const userData = sharesnapshot.data();
        const currentShareCount = userData.shareCount >= 3;
        return currentShareCount;
      } else {
        return false;
      }

    case 8:

    case 9:

    case 10:

    case 11:

    case 12:

    case 13:

    case 14:

    case 15:

    case 16:

    case 17:

    default:
      return false;
  }
}

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
} from "@firebase/firestore";
import { where } from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  differenceInDays,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { createNotification } from "./createNotification";

const topics = [
  {
    id: 1,
    name: "First Post",
  },
  {
    id: 2,
    name: "Profile Update",
  },
  {
    id: 3,
    name: "Follow a Friend",
  },
  {
    id: 4,
    name: "Like those Posts",
  },
  {
    id: 5,
    name: "Daily Active",
  },
  {
    id: 6,
    name: "Commenter",
  },
  {
    id: 7,
    name: "Engage with Content",
  },
  {
    id: 8,
    name: "Content Creator",
  },
  {
    id: 9,
    name: "Tribal",
  },
  {
    id: 10,
    name: "Influencer",
  },
  {
    id: 11,
    name: "Top Contributor",
  },
  {
    id: 12,
    name: "Social Butterfly",
  },
  {
    id: 13,
    name: "Century",
  },
  {
    id: 14,
    name: "Content Marathon",
  },
  {
    id: 15,
    name: "Sweet Pet",
  },
  {
    id: 16,
    name: "Viral Post",
  },
  {
    id: 17,
    name: "The Chief",
  },
];

function getChallengeName(id: number) {
  return topics.find((topic) => topic.id === id)?.name;
}

export async function checkId(id: number, email: string): Promise<boolean> {
  console.log("checkId", id, email);
  switch (id) {

    case 1:
      const postsRef = collection(db, "users", email, "posts");
      const snapshot = await getDocs(postsRef);
      if (!snapshot.empty) {
        createNotification(
          "challenge",
          "Finished challenge: " + getChallengeName(id),
          "",
          Date.now(),
          email,
        );
        return !snapshot.empty;
      }

    case 2:
      const userDocRef = doc(db, "users", email);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        const pfpExists = userData.profilePicture != null;
        const cvrExists = userData.coverPhoto != null;
        if (pfpExists && cvrExists) {
          createNotification(
            "challenge",
            "Finished challenge: " + getChallengeName(id),
            "",
            Date.now(),
            email,
          );
          return pfpExists && cvrExists;
        } else {
          return false;
        }
      }

    case 3:
      const fllwingRef = collection(db, "users", email, "following");
      const fllwingsnapshot = await getDocs(fllwingRef);
      if (fllwingsnapshot.size >= 1) {
        createNotification(
          "challenge",
          "Finished challenge: " + getChallengeName(id),
          "",
          Date.now(),
          email,
        );
      }
      return !fllwingsnapshot.empty;

    case 4:
      const likeref = doc(db, "users", email);
      const likesnapshot = await getDoc(likeref);
      if (likesnapshot.exists()) {
        const userData = likesnapshot.data();
        const likesexists = userData.likes >= 5;
        if (likesexists) {
          createNotification(
            "challenge",
            "Finished challenge: " + getChallengeName(id),
            "",
            Date.now(),
            email,
          );
          return likesexists;
        } else {
          return false;
        }
      }

    case 5:
      const dateref = doc(db, "users", email);
      const datesnapshot = await getDoc(dateref);
      if (datesnapshot.exists()) {
        const userData = datesnapshot.data();
        const dateexists = userData.consecutiveLogin >= 7;
        if (dateexists) {
          createNotification(
            "challenge",
            "Finished challenge: " + getChallengeName(id),
            "",
            Date.now(),
            email,
          );
          return dateexists;
        } else {
          return false;
        }
      }

    case 6:
      const commentsref = doc(db, "users", email);
      const commentssnapshot = await getDoc(commentsref);
      if (commentssnapshot.exists()) {
        const userData = commentssnapshot.data();
        const commentsexists = userData.commentCount >= 10;
        if (commentsexists) {
          createNotification(
            "challenge",
            "Finished challenge: " + getChallengeName(id),
            "",
            Date.now(),
            email,
          );
          return commentsexists;
        } else {
          return false;
        }
      }

    case 7:
      const shareref = doc(db, "users", email);
      const sharesnapshot = await getDoc(shareref);
      if (sharesnapshot.exists()) {
        const userData = sharesnapshot.data();
        const currentShareCount = userData.shareCount >= 3;
        if (currentShareCount) {
          createNotification(
            "challenge",
            "Finished challenge: " + getChallengeName(id),
            "",
            Date.now(),
            email,
          );
          return currentShareCount;
        } else {
          return false;
        }
      }

    case 8:
      // Check if user has created 3 unique posts in the last week
      const postsCollectionRef = collection(db, "posts");
      const sevenDaysAgo = subDays(new Date(), 7);
      const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

      const postsQuery = query(
        postsCollectionRef,
        where("username", "==", email),
        where("createdAt", ">=", sevenDaysAgoTimestamp)
      );

      const postsQuerySnapshot = await getDocs(postsQuery);

      // Check if there are at least 3 unique posts
      const uniquePostsCount = postsQuerySnapshot.size;
      if (uniquePostsCount >= 3) {
        createNotification(
          "challenge",
          "Finished challenge: " + getChallengeName(id),
          "",
          Date.now(),
          email,
        );
      }
      return uniquePostsCount >= 3;

    case 9:
      const tribeRef = doc(db, "users", email);
      const tribeSnapshot = await getDoc(tribeRef);
      if (tribeSnapshot.exists()) {
        const userData = tribeSnapshot.data();
        const tribeExists = userData.tribe != "rookie";
        if (tribeExists) {
          createNotification(
            "challenge",
            "Finished challenge: " + getChallengeName(id),
            "",
            Date.now(),
            email,
          );
        }
        return tribeExists;
      } else {
        return false;
      }

    case 10:
      const fllwrsRef = collection(db, "users", email, "followers");
      const fllwrssnapshot = await getDocs(fllwrsRef);
      if (fllwrssnapshot.size >= 50) {
        createNotification(
          "challenge",
          "Finished challenge: " + getChallengeName(id),
          "",
          Date.now(),
          email,
        );
      }
      return !(fllwrssnapshot.size < 50);

    case 11:
      const postsLikeQuery = query(
        collection(db, "posts"),
        where("username", "==", email)
      );

      const postsLikeQuerySnapshot = await getDocs(postsLikeQuery);
      for (const docSnapshot of postsLikeQuerySnapshot.docs) {
        const postData = docSnapshot.data();
        if (postData.votes >= 20) {
          createNotification(
            "challenge",
            "Finished challenge: " + getChallengeName(id),
            "",
            Date.now(),
            email,
          );
          return true;
        }
      }
      return false;

    case 12:
      const likesRef = doc(db, "users", email);
      const likesSnapshot = await getDoc(likesRef);

      if (likesSnapshot.exists()) {
        const userData = likesSnapshot.data();
        const likesGiven = userData.likes >= 30 || userData.commentCount >= 30;
        if (likesGiven) {
          createNotification(
            "challenge",
            "Finished challenge: " + getChallengeName(id),
            "",
            Date.now(),
            email,
          );
        }
        return likesGiven;
      } else {
        return false;
      }

    case 13:
      const likes100Ref = doc(db, "users", email);
      const likes100Snapshot = await getDoc(likes100Ref);

      if (likes100Snapshot.exists()) {
        const userData = likes100Snapshot.data();
        const likesGiven = userData.likes >= 100;
        if (likesGiven) {
          createNotification(
            "challenge",
            "Finished challenge: " + getChallengeName(id),
            "",
            Date.now(),
            email,
          );
        }
        return likesGiven;
      } else {
        return false;
      }

    case 14:
      const oneMonthPostsCollectionRef = collection(db, "posts");
      const MonthAgo = subDays(new Date(), 30); // Adjusted to 30 days for a month
      const MonthAgoTimestamp = Timestamp.fromDate(MonthAgo);

      const monthPostsQuery = query(
        oneMonthPostsCollectionRef,
        where("username", "==", email),
        where("createdAt", ">=", MonthAgoTimestamp)
      );

      const monthPostsQuerySnapshot = await getDocs(monthPostsQuery);

      // Count the number of unique days on which the user posted
      let uniquePostDays = new Set();
      monthPostsQuerySnapshot.forEach((doc) => {
        const createdAt = doc.data().createdAt.toDate();
        const postDay = format(createdAt, "yyyy-MM-dd"); // Format date to compare by day
        uniquePostDays.add(postDay);
      });

      // Check if there are posts on at least 30 unique days
      const daysWithPostsCount = uniquePostDays.size;
      if (daysWithPostsCount >= 30) {
        createNotification(
          "challenge",
          "Finished challenge: " + getChallengeName(id),
          "",
          Date.now(),
          email,
        );
      }
      return daysWithPostsCount >= 30;

    case 15:
      const PetRef = doc(db, "users", email);
      const PetSnapshot = await getDoc(PetRef);

      if (PetSnapshot.exists()) {
        const userData = PetSnapshot.data();
        const likesGiven = userData.pet != null && userData.pet != "";
        if (likesGiven) {
          createNotification(
            "challenge",
            "Finished challenge: " + getChallengeName(id),
            "",
            Date.now(),
            email,
          );
        }
        return likesGiven;
      } else {
        return false;
      }

    case 16:
      const likes1000Ref = doc(db, "users", email);
      const likes1000Snapshot = await getDoc(likes1000Ref);

      if (likes1000Snapshot.exists()) {
        const userData = likes1000Snapshot.data();
        const likesGiven = userData.likes >= 1000;
        if (likesGiven) {
          createNotification(
            "challenge",
            "Finished challenge: " + getChallengeName(id),
            "",
            Date.now(),
            email
          );
        }
        return likesGiven;
      } else {
        return false;
      }

    case 17:
      const tribeLeaderRef = doc(db, "users", email);
      const tribeLeaderSnapshot = await getDoc(tribeLeaderRef);
      if (tribeLeaderSnapshot.exists()) {
        const userData = tribeLeaderSnapshot.data();
        const tribeExists = userData.tribePos === "leader";
        if (tribeExists) {
          createNotification(
            "challenge",
            "Finished challenge: " + getChallengeName(id),
            "",
            Date.now(),
            email
          );
        }
        return tribeExists;
      } else {
        return false;
      }

    default:
      return false;
  }
}

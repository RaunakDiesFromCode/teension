import { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { app, db } from "./config"; // Adjust this according to your Firebase initialization
import { doc, getDoc, setDoc, updateDoc } from "@firebase/firestore";
import { differenceInDays, parseISO } from "date-fns";

interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null); // Use Firebase User type here
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user); // Set Firebase User directly
        if (user.email !== null) {
        setLoginDate(user.email);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    const setLoginDate = async (email: string) => {
      const userRef = doc(db, "users", email);
      const currentLogin = new Date();

      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const lastLogin = userData.lastLogin
          ? parseISO(userData.lastLogin)
          : null;
        const consecutiveLogin = userData.consecutiveLogin || 0;

        let newConsecutiveLogin = consecutiveLogin;

        if (lastLogin) {
          const daysDifference = differenceInDays(currentLogin, lastLogin);

          if (daysDifference === 1) {
            newConsecutiveLogin += 1;
          } else if (daysDifference >= 2) {
            newConsecutiveLogin = 0;
          }
        }

        await updateDoc(userRef, {
          lastLogin: currentLogin.toISOString(),
          currentLogin: currentLogin.toISOString(),
          consecutiveLogin: newConsecutiveLogin,
        });
      } else {
        await setDoc(userRef, {
          lastLogin: currentLogin.toISOString(),
          currentLogin: currentLogin.toISOString(),
          consecutiveLogin: 0,
        });
      }
    };

    return () => unsubscribe();
  }, []);

  return { currentUser, loading };
};

export default useAuth;

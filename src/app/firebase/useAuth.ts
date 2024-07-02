import { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { app, db } from "./config"; // Adjust this according to your Firebase initialization
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "@firebase/firestore";
import { differenceInDays } from "date-fns";

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
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
      const currentLogin = Timestamp.now();

      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const lastLogin = userData.lastLogin
          ? userData.lastLogin.toDate()
          : null;
        const consecutiveLogin = userData.consecutiveLogin || 0;

        let newConsecutiveLogin = consecutiveLogin;
        let daysDifference = 0;

        if (lastLogin) {
          daysDifference = differenceInDays(currentLogin.toDate(), lastLogin);

          if (daysDifference === 1) {
            // Increment streak if login is consecutive
            newConsecutiveLogin += 1;
          } else if (daysDifference > 1) {
            // Reset streak if login is not consecutive
            newConsecutiveLogin = 1;
          }

          // If the difference is less than 1 day, do not update lastLogin
        } else {
          // First login or user data didn't have lastLogin
          newConsecutiveLogin = 1;
        }

        // Update currentLogin and consecutiveLogin
        await updateDoc(userRef, {
          currentLogin,
          consecutiveLogin: newConsecutiveLogin,
          ...(daysDifference !== 0 && { lastLogin: currentLogin }), // Update lastLogin only if daysDifference is not 0
        });
      } else {
        // Create new user document if it doesn't exist
        await setDoc(userRef, {
          lastLogin: currentLogin,
          currentLogin,
          consecutiveLogin: 1,
        });
      }
    };

    return () => unsubscribe();
  }, []);

  return { currentUser, loading };
};

export default useAuth;

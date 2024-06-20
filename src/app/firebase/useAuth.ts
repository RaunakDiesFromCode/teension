import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {app} from "./config"; // Ensure this is your initialized Firebase app

interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email || "", // Ensure email is always available
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { currentUser, loading };
};

export default useAuth;

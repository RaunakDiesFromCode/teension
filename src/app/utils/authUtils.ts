// app/utils/authUtils.ts
import { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/router";

interface AuthState {
    user: User | null;
    loading: boolean;
}

export const useAuth = (): AuthState => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                setLoading(false);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    return { user, loading };
};

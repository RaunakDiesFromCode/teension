// src/app/tribe/page.tsx

"use client";
import React, { useState, useEffect } from "react";
import Selector from "./selector";
import { doc, getDoc } from "@firebase/firestore";
import { db } from "../firebase/config";
import { getAuth } from "firebase/auth";
import Selected from "./selected";

const Page = () => {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [tribe, setTribe] = useState<string | null>(null);
  const currentUser = getAuth().currentUser;
  const email = currentUser ? currentUser.email || "" : "";
  const [refreshKey, setRefreshKey] = useState(0);
  // const email = currentUser ? currentUser.email || "" : "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tribeRef = doc(db, "users", email);
        const tribeSnapshot = await getDoc(tribeRef);

        if (tribeSnapshot.exists()) {
          const userData = tribeSnapshot.data();
          setTribe(userData.tribe);
          const tribeExists = userData.tribe !== "rookie";
          setSelected(tribeExists);
        } else {
          setSelected(false);
        }
      } catch (error) {
        console.error("Error fetching tribe data: ", error);
        setSelected(false);
      }
    };

    fetchData();
  }, [email, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1); // Update the key to force re-render
  };

  if (selected === null) {
    return <div>Loading...</div>; // Show loading state while data is being fetched
  }

  return (
    <div>
      {selected ? (
        <div>
          <Selected tribe={tribe ?? ""}/>
        </div>
      ) : (
        <div>
          <Selector onRefresh={handleRefresh} />
        </div>
      )}
    </div>
  );
};

export default Page;

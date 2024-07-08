"use client";
import { useState, useEffect } from "react";
import { RiNotification3Line } from "react-icons/ri";
import {
  collection,
  doc,
  updateDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { formatDistanceToNow } from "date-fns";
import useAuth from "@/app/firebase/useAuth";
import Link from "next/link";
// @ts-igmore
import { useSound } from "use-sound";
import { toast } from "react-toastify";
import { shortenNumber } from "../utility/shortenNumber";

const NotificationDropdownMenu = () => {
  const { currentUser } = useAuth(); // Custom hook to get current user info
  const [isVisible, setIsVisible] = useState(false);
  const [notifications, setNotifications] = useState<
    {
      postId: string; // Ensure this matches your Firestore field name
      field: string;
      time: { seconds: number };
      post: string;
      id: string;
      name: string;
      read: boolean;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [newNotificationCount, setNewNotificationCount] = useState(0);
  const [play] = useSound("/sounds/notification.wav", { volume: 0.25 });

  const toggleDropdown = () => {
    setIsVisible(!isVisible);
    if (isVisible) {
      setNewNotificationCount(0); // Reset new notification count when dropdown is opened
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.email) {
      const notificationsCollection = collection(
        db,
        `/users/${currentUser.email}/notification`
      );

      let notificationTxt = "";

      const notificationsQuery = query(notificationsCollection);
      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const notificationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          time: doc.data().time,
          post: doc.data().post,
          name: doc.data().name,
          field: doc.data().field,
          postId: doc.data().postId,
          read: doc.data().read,
        }));

        // Sort notifications by timestamp (most recent first)
        notificationsData.sort((a, b) => b.time.seconds - a.time.seconds);

        // Filter out read notifications
        const unreadNotifications = notificationsData.filter(
          (notification) => !notification.read
        );

        setNotifications(unreadNotifications);
        setLoading(false);
        setNewNotificationCount(unreadNotifications.length);
        if (unreadNotifications.length > 0) {
          notificationTxt = notificationsData[0].name;
          console.log("New notification(s) arrived");
          console.log("Playing notification sound");
          play();
          toast.info(notificationTxt);
        }
      });

      return () => unsubscribe(); // Cleanup the listener on component unmount
    }
  }, [currentUser]);


  const formatTimestamp = (timestamp: { seconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const markAsRead = async (notificationId: string) => {
    if (currentUser && currentUser.email) {
      const notificationRef = doc(
        db,
        `/users/${currentUser.email}/notification`,
        notificationId
      );
      await updateDoc(notificationRef, { read: true });
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification.id !== notificationId
        )
      );
    }
  };

  function linkMaker(notificationField: string, postId: string) {
    console.log(
      "making link for Notification field:",
      notificationField,
      " with Post ID:",
      postId
    );
    if (
      notificationField === "post" ||
      notificationField === "likedPost" ||
      notificationField === "commentedOnPost" ||
      notificationField === "likedComment" ||
      notificationField === "like"
    ) {
      return `/post/${postId}`;
    } else if (notificationField === "challenge") {
      return `/challenges`;
    } else if (notificationField === "tribe") {
      return `/tribe`;
    } else {
      return "";
    }
  }

  return (
    <div className="flex justify-end">
      <button onClick={toggleDropdown} className="relative">
        <RiNotification3Line size={25} />
        {newNotificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 w-5 text-white rounded-full  text-center text-xs p-0.5">
            <div>{shortenNumber(newNotificationCount)}</div>
          </span>
        )}
      </button>

      {isVisible && (
        <div className="dropdown-content dark:bg-gray-700 bg-gray-50 rounded-2xl shadow-xl mt-9 w-96 -mr-28 absolute h-[40rem] overflow-scroll z-50 transition-colors duration-100">
          {loading ? (
            <p className="dark:text-white text-black text-center py-4 transition-colors duration-100">
              Loading...
            </p>
          ) : notifications.length === 0 ? (
            <p className="dark:text-white text-black text-center py-4 transition-colors duration-100">
              No notifications
            </p>
          ) : (
            notifications.map((notification) => (
              <Link
                href={linkMaker(notification.field, notification.postId) || ""}
                key={notification.id}
                onClick={async () => {
                  await markAsRead(notification.id);
                }}
              >
                <div
                  className={`px-4 py-2 text-sm dark:text-white text-black dark:hover:bg-gray-600 hover:bg-gray-100 w-full transition-colors duration-100 ${
                    notification.read ? "bg-gray-800 text-white/60" : ""
                  }`}
                >
                  <p className="font-bold text-lg">{notification.name}</p>
                  <p className="text-white/75">{notification.post}</p>
                  <p>{formatTimestamp(notification.time)}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdownMenu;

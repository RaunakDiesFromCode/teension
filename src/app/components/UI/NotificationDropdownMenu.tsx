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

      const notificationsQuery = query(notificationsCollection);
      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const notificationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          time: doc.data().time,
          post: doc.data().post,
          name: doc.data().name,
          field: doc.data().field,
          postId: doc.data().postId, // Ensure this matches your Firestore field name
          read: doc.data().read,
        }));

        console.log("Retrieved notifications:", notificationsData);

        // Filter out read notifications
        const unreadNotifications = notificationsData.filter(
          (notification) => !notification.read
        );

        setNotifications(unreadNotifications);
        setLoading(false);
        setNewNotificationCount(unreadNotifications.length);
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
    } else {
      return "";
    }
  }

  return (
    <div className="flex justify-end">
      <button onClick={toggleDropdown} className="relative">
        <RiNotification3Line size={25} />
        {newNotificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 w-4 text-center text-xs">
            {newNotificationCount}
          </span>
        )}
      </button>

      {isVisible && (
        <div className="dropdown-content bg-gray-700 rounded shadow-md mt-9 w-96 -mr-28 absolute h-[40rem] overflow-scroll">
          {loading ? (
            <p className="text-white text-center py-4">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="text-white text-center py-4">No notifications</p>
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
                  className={`px-4 py-2 text-sm text-white hover:bg-gray-600 w-full ${
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

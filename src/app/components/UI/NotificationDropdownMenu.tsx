"use client";
import { useState, useEffect } from "react";
import { RiNotification3Line } from "react-icons/ri";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { formatDistanceToNow } from "date-fns";
import useAuth from "@/app/firebase/useAuth";
import Link from "next/link";

const NotificationDropdownMenu = () => {
  const { currentUser } = useAuth(); // Custom hook to get current user info
  const [isVisible, setIsVisible] = useState(false);
  const [notifications, setNotifications] = useState<
    {
      postid: string;
      field: string;
      time: { seconds: number };
      post: string;
      id: string;
      name: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const toggleDropdown = () => setIsVisible(!isVisible);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (currentUser && currentUser.email) {
        const notificationsCollection = collection(
          db,
          `/users/${currentUser.email}/notification`
        );
        const snapshot = await getDocs(notificationsCollection);
        const notificationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          time: doc.data().time,
          post: doc.data().post,
          name: doc.data().name,
          field: doc.data().field,
          postid: doc.data().postid,
        }));
        setNotifications(notificationsData);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]); // Trigger fetch on currentUser change

  const formatTimestamp = (timestamp: { seconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="flex justify-end">
      <button onClick={toggleDropdown} className="">
        <RiNotification3Line size={25} />
      </button>

      {isVisible && (
        <div className="dropdown-content bg-gray-700 rounded shadow-md mt-9 w-96 -mr-28 absolute">
          {loading ? (
            <p className="text-white text-center py-4">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="text-white text-center py-4">No notifications</p>
          ) : (
            notifications.map((notification) => (
              <Link href={`/post/${notification.postid}`}>
                <div
                  key={notification.id}
                  className="px-4 py-2 text-sm text-white hover:bg-gray-600 w-full"
                >
                  {notification.field === "post" ? (
                    <p>{notification.name} posted:</p>
                  ) : (
                    <p>{notification.name}</p>
                  )}
                  {notification.postid}
                  <p>{notification.post}</p>
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

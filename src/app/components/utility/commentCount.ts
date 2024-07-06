// src/app/components/utility/commentCount.ts
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/config";

export async function commentCount(postId: string): Promise<number> {
  try {
    // Fetch comments for the post
    const commentsSnapshot = await getDocs(
      collection(db, "posts", postId, "comments")
    );

    let totalComments = commentsSnapshot.size;

    // Fetch replies for each comment
    const replyPromises = commentsSnapshot.docs.map(async (commentDoc) => {
      const repliesSnapshot = await getDocs(
        collection(db, "posts", postId, "comments", commentDoc.id, "replies")
      );
      totalComments += repliesSnapshot.size;
    });

    // Wait for all reply fetch promises to complete
    await Promise.all(replyPromises);

    return totalComments;
  } catch (error) {
    console.error("Error counting comments and replies: ", error);
    return 0;
  }
}

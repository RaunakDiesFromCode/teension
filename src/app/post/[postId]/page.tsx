// src/pages/post/[postId]/page.tsx
import { db } from "@/app/firebase/config";
import { collection, getDocs } from "@firebase/firestore";
import { GetStaticPaths, GetStaticProps } from "next";
import PostDetailPage from "./PostDetailsPage";

export default function Page({ params }: { params: any }) {
  return <PostDetailPage postId={params.postId} />;
}

// Generate static paths
export async function generateStaticParams() {
  const postsCollection = collection(db, "posts");
  const postDocs = await getDocs(postsCollection);
  const paths = postDocs.docs.map((doc) => {
    const data = doc.data();
    return {
      params: { postId: doc.id },
    };
  });

  return paths;
}


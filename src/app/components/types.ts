import { ReactNode } from "react";

export interface Post {
  genre: string;
  id: string;
  image: string;
  username: string;
  text: string;
  votes: number;
  description: string;
  createdAt: { seconds: number; nanoseconds: number };
  userEmail: string;  // Add userEmail property
}

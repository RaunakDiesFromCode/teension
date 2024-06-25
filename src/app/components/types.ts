export interface Post {
  createdAt: { seconds: number; nanoseconds: number };
  genre: string;
  id: string;
  image: string;
  text: string;
  votes: number;
  description: string;
  // Add any other properties your post object may have
}

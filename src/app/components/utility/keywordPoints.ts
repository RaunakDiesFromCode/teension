import { db } from "@/app/firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "@firebase/firestore";
import keyword_extractor from "keyword-extractor";

interface PointsData {
  [key: string]: number;
}

export default async function addKeywordPoints(
  email: string,
  sentence: string,
  points: number
) {
  // Extract keywords from the sentence
  sentence = sentence.toLowerCase();
  const extraction_result = keyword_extractor.extract(sentence, {
    language: "english",
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: false,
  });

  const pointsRef = doc(db, "users", email, "points", "keywords");

  // Get the current points document
  const pointsDoc = await getDoc(pointsRef);
  const pointsData = pointsDoc.exists() ? (pointsDoc.data() as PointsData) : {};

  // Prepare updates for each keyword
  const updates: PointsData = {};

  for (const word of extraction_result) {
    const existingPoints = pointsData[word] || 0;
    updates[word] = existingPoints + points;
  }

  // If the document exists, update it; otherwise, set it with initial points
  if (pointsDoc.exists()) {
    await updateDoc(pointsRef, updates);
  } else {
    await setDoc(pointsRef, updates);
  }
}

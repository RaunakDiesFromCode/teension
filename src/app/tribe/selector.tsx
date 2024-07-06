// src/app/tribe/selector.tsx

"use client";
// src/app/tribe/selector.tsx

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Username from "../components/UI/username";
import { FaWpexplorer } from "react-icons/fa";
import { createTribe } from "../components/utility/createTribe";
import { getAuth } from "firebase/auth";
import Link from "next/link";

type Tribe =
  | "Ateredes"
  | "Covenant"
  | "Thunderbolt"
  | "Gryffindor"
  | "Fraternity"
  | "Hunted"
  | "Highness"
  | "Jedi";

type Question = {
  question: string;
  options: { label: string; value: string }[];
  mapping: { [key: string]: Tribe };
};

const questions: Question[] = [
  {
    question: "How do you handle defeat?",
    options: [
      {
        label: "I feel determined to fight back and win next time.",
        value: "A",
      },
      { label: "I listen to my leader's advice and move on.", value: "B" },
      { label: "I get frustrated and might break things.", value: "C" },
      {
        label:
          "I analyze what went wrong and make a plan to succeed next time.",
        value: "D",
      },
      {
        label: "I gather my friends and support each other, win or lose.",
        value: "E",
      },
      {
        label: "I don't care about the rules; I just follow my own vision.",
        value: "F",
      },
      {
        label: "I continue to lead confidently, regardless of the outcome.",
        value: "G",
      },
      {
        label:
          "I reflect, learn from the experience, and prepare for future challenges.",
        value: "H",
      },
    ],
    mapping: {
      A: "Ateredes",
      B: "Covenant",
      C: "Thunderbolt",
      D: "Gryffindor",
      E: "Fraternity",
      F: "Hunted",
      G: "Highness",
      H: "Jedi",
    },
  },
  {
    question: "How important is teamwork to you?",
    options: [
      { label: "I prefer to lead, but I’m open to teamwork.", value: "A" },
      { label: "I trust my superiors and work well in a team.", value: "B" },
      { label: "Teamwork is secondary; I rely on my strength.", value: "C" },
      {
        label: "Teamwork is crucial; it ensures success in the long run.",
        value: "D",
      },
      { label: "Teamwork is everything to me.", value: "E" },
      {
        label: "I prefer working alone or with a small, loyal group.",
        value: "F",
      },
      {
        label:
          "Teamwork is important, but I’m comfortable making solo decisions.",
        value: "G",
      },
      { label: "I value teaching and working alongside others.", value: "H" },
    ],
    mapping: {
      A: "Ateredes",
      B: "Covenant",
      C: "Thunderbolt",
      D: "Gryffindor",
      E: "Fraternity",
      F: "Hunted",
      G: "Highness",
      H: "Jedi",
    },
  },
  {
    question: "How do you handle power?",
    options: [
      {
        label: "I have power but sometimes struggle to use it effectively.",
        value: "A",
      },
      { label: "I follow the guidance of those in power.", value: "B" },
      {
        label: "I have power but lack the finesse to use it constructively.",
        value: "C",
      },
      { label: "I use power wisely and strategically.", value: "D" },
      { label: "I believe in the collective power of a group.", value: "E" },
      {
        label: "I use my power to challenge and change the system.",
        value: "F",
      },
      { label: "I wield power confidently and assertively.", value: "G" },
      {
        label: "I use power responsibly and with respect for tradition.",
        value: "H",
      },
    ],
    mapping: {
      A: "Ateredes",
      B: "Covenant",
      C: "Thunderbolt",
      D: "Gryffindor",
      E: "Fraternity",
      F: "Hunted",
      G: "Highness",
      H: "Jedi",
    },
  },
  {
    question: "What motivates you the most?",
    options: [
      { label: "The desire to prove myself after a loss.", value: "A" },
      { label: "The approval and direction of my superiors.", value: "B" },
      { label: "The need to express my strength and capability.", value: "C" },
      { label: "The pursuit of knowledge and eventual success.", value: "D" },
      { label: "The bonds of friendship and unity.", value: "E" },
      {
        label: "The pursuit of justice and rebellion against oppression.",
        value: "F",
      },
      {
        label: "The responsibility of leadership and being seen as a hero.",
        value: "G",
      },
      {
        label: "The legacy and teachings of those who came before me.",
        value: "H",
      },
    ],
    mapping: {
      A: "Ateredes",
      B: "Covenant",
      C: "Thunderbolt",
      D: "Gryffindor",
      E: "Fraternity",
      F: "Hunted",
      G: "Highness",
      H: "Jedi",
    },
  },
  {
    question: "How do you view rules and authority?",
    options: [
      {
        label: "I respect authority but struggle with rules sometimes.",
        value: "A",
      },
      {
        label: "I follow rules and respect authority without question.",
        value: "B",
      },
      {
        label: "Rules are often a hindrance; I rely on my strength.",
        value: "C",
      },
      { label: "I follow rules but think critically about them.", value: "D" },
      {
        label: "Rules are less important than our collective unity.",
        value: "E",
      },
      { label: "I challenge and break rules if they are unjust.", value: "F" },
      { label: "I create and enforce rules as a leader.", value: "G" },
      {
        label: "I respect rules but adapt them to fit my teachings.",
        value: "H",
      },
    ],
    mapping: {
      A: "Ateredes",
      B: "Covenant",
      C: "Thunderbolt",
      D: "Gryffindor",
      E: "Fraternity",
      F: "Hunted",
      G: "Highness",
      H: "Jedi",
    },
  },
];

const tribesInfo: { [key in Tribe]: string } & { [key: string]: string } = {
  Ateredes:
    "With power in their hands, they rise anew, In the face of defeat, their courage grew.",
  Covenant:
    "Faithful hearts, in unity they stand, Yet some seek freedom, a rebel's hand.",
  Thunderbolt:
    "Strength to shatter, yet gentle hearts, They break to rebuild, a fresh start.",
  Gryffindor:
    "With wisdom and strength, they pave their way, Steadily climbing, to victory's day.",
  Fraternity:
    "Together they thrive, through thick and thin, In unity, their battles they win.",
  Hunted:
    "Outlaws with visions, bold and free, Like Robin Hood, in dreams they see.",
  Highness:
    "They rule with might, in glory’s radiant light, Heroes to some, a noble sight.",
  Jedi: "Rarest of all, with a legacy grand, They fight, they teach, with wisdom's hand.",
};

const currentUser = getAuth().currentUser;
const email = currentUser ? currentUser.email : "";
console.log(email);

const shuffleArray = (array: any[]) => {
  return array.sort(() => Math.random() - 0.5);
};

type SelectorProps = {
  onRefresh: () => void; // Add this prop to handle refresh
};

const Selector: React.FC<SelectorProps> = ({ onRefresh }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showIntroduction, setShowIntroduction] = useState(true);
  const [finalTribe, setFinalTribe] = useState<Tribe | null>(null);
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

   useEffect(() => {
     if (finalTribe && user) {
       createTribe(user.email || "", finalTribe)
         .then(() => {
           console.log("Tribe created successfully:", finalTribe);
         })
         .catch((error) => {
           console.error("Error creating tribe:", error);
         });
     }
   }, [finalTribe, user]);

  const handleAnswerClick = (optionValue: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestionIndex]: optionValue,
    }));
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handleExploreTribe = () => {
    onRefresh(); // Call the onRefresh prop when the link is clicked
    router.push("/tribe");
  };

  const startQuestionnaire = () => {
    setShowIntroduction(false);
  };

  if (showIntroduction) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="p-8 rounded-lg text-center">
          <h1 className="text-4xl font-bold mb-4">The Tribe Selector...</h1>
          <p className="my-6">
            Discover which tribe you belong to based on your personality and
            preferences. Each tribe has unique characteristics and values. Se
            which tribe suits you best!
          </p>
          <ul className=" flex flex-col">
            {Object.entries(tribesInfo).map(([tribe, description]) => (
              <li
                key={tribe}
                className="mb-2 bg-slate-800 p-3 rounded flex items-center flex-col"
              >
                <div className="flex flex-col items-center justify-center h-full mt-10 text-white/80 hover:text-white transition duration-150">
                  <div className="font-bold text-xl flex justify-center items-center gap-1 mt-6 ">
                    {description}
                  </div>
                  <div className="tribe-text text-[7rem] font-PlayfairDisplay italic text-white/30 -mt-[9rem]">
                    {tribe}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="mb-4">
            Answer the following questions to determine your tribe:
          </p>
          <button
            className="bg-blue-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            onClick={startQuestionnaire}
          >
            Start the Questionnaire
          </button>
        </div>
      </div>
    );
  }

  if (currentQuestionIndex >= questions.length) {
    // Calculate the final tribe based on answers
    if (!finalTribe) {
      setFinalTribe(calculateFinalTribe(answers));
    }

    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className=" p-8 rounded-lg text-center mt-[30%]">
          <Username
            username={`Your Tribe: ${finalTribe}`}
            tribe={finalTribe || ""}
            OP={false}
            fire={false}
          />
          <p className=" mb-4">
            {finalTribe ? tribesInfo[finalTribe as Tribe] : ""}
          </p>
          <Link href="/tribe" onClick={handleExploreTribe}>
            <div className="text-blue-500 hover:underline">
              Explore your tribe <FaWpexplorer className="inline-block ml-1" />
            </div>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="h-full w-full flex flex-col justify-center">
      <div className=" p-8 rounded-lg">
        <h2 className="text-xl font-semibold text-center text-white/70">
          Question {currentQuestionIndex + 1}
        </h2>
        <p className="mb-4 text-4xl font-bold text-center">{currentQuestion.question}</p>
        <ul className="">
          {currentQuestion.options.map((option) => (
            <li>
              <button
                key={option.value}
                className="bg-slate-800 hover:bg-slate-700 transition duration-100 text-white px-4 py-2 rounded-lg mb-2 w-full"
                onClick={() => handleAnswerClick(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const calculateFinalTribe = (answers: { [key: number]: string }): Tribe => {
  const tribeScores: { [key in Tribe]?: number } = {};
  questions.forEach((question, index) => {
    const answer = answers[index];
    const tribe = question.mapping[answer];
    tribeScores[tribe] = (tribeScores[tribe] || 0) + 1;
  });

  let finalTribe: Tribe = "Ateredes";
  let maxScore = 0;

  for (const [tribe, score] of Object.entries(tribeScores)) {
    if (score! > maxScore) {
      finalTribe = tribe as Tribe;
      maxScore = score!;
    }
  }

  return finalTribe;
};


export default Selector;

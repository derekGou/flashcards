"use client";

require('dotenv').config();
import { useState, useEffect } from 'react';
import './globals.css';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Home() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState({ front: '', back: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [flipIndex, setFlipIndex] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState("");

  useEffect(() => {
    const fetchFlashcards = async () => {
      const querySnapshot = await getDocs(collection(db, "flashcards"));
      const loadedCards = querySnapshot.docs.map(doc => doc.data());
      setFlashcards(loadedCards);
    };
    fetchFlashcards();
  }, []);

  const handleAddFlashcard = async () => {
    setIsEditing(true);
  };

  const handleConfirmFlashcard = async () => {
    const q = query(collection(db, "flashcards"), where("front", "==", currentCard.front), where("back", "==", currentCard.back));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No duplicate found, adding flashcard");
      setFlashcards([...flashcards, currentCard]);
      await addDoc(collection(db, "flashcards"), currentCard);
    } else {
      alert("Duplicate flashcard!");
    }

    setCurrentCard({ front: '', back: '' });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCard((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuiz = () => {
    if (flashcards.length === 0) return;
    setShowQuiz(true);
    setQuizIndex(0);
    setCorrectAnswers([]);
    setWrongAnswers([]);
    setShowScore(false);
    setScore(0);
    setIsAnswered(false);
    setAnswerFeedback("");
  };

  const handleNextQuiz = () => {
    if (!isAnswered) {
      const correctAnswer = flashcards[quizIndex].back.trim().toLowerCase().replace(/\s+/g, '');
      const userAnswer = quizAnswer.trim().toLowerCase().replace(/\s+/g, '');

      if (userAnswer === correctAnswer) {
        setCorrectAnswers([...correctAnswers, quizIndex]);
        setScore(score + 1);
        setAnswerFeedback("Correct! 😊");
      } else {
        setWrongAnswers([...wrongAnswers, quizIndex]);
        setAnswerFeedback(`Wrong! 😢 Correct Answer: ${flashcards[quizIndex].back}`);
      }

      setIsAnswered(true);
    } else {
      const nextIndex = quizIndex + 1 < flashcards.length ? quizIndex + 1 : 0;
      setQuizIndex(nextIndex);
      setQuizAnswer("");
      setIsAnswered(false);
      setAnswerFeedback("");

      if (quizIndex + 1 === flashcards.length) {
        setShowScore(true);
        setShowQuiz(false);
      }
    }
  };

  const handleCardFlip = (index) => {
    setFlipIndex(flipIndex === index ? null : index);
  };

  const handleImportNotes = async (e) => {
    try {
      console.log("Importing notes");
      const file = e.target.files[0];
      const text = await file.text();
      
      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: text,
      });      

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const generatedFlashcards = await response.json();

      generatedFlashcards.forEach(async (card) => {
        const q = query(collection(db, "flashcards"), where("front", "==", card.front), where("back", "==", card.back));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          await addDoc(collection(db, "flashcards"), card);
        }
      });

      setFlashcards((prev) => [...prev, ...generatedFlashcards]);

    } catch (error) {
      console.error("Error importing notes:", error);
    }
  };  

  const handleCloseQuiz = () => {
    setShowScore(false);
    setShowQuiz(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-blue-700 p-4 text-center text-white text-xl">
        AI Flashcards
      </header>

      <div className="container mx-auto p-4">
        <div className="flex justify-center mb-4 space-x-4">
          <button
            className="bg-blue-500 text-white text-xl py-2 px-4 rounded shadow hover:bg-blue-600"
            onClick={handleAddFlashcard}
            disabled={isEditing}
          >
            Add Card
          </button>
          <button
            className="bg-blue-500 text-white text-xl py-2 px-4 rounded shadow hover:bg-blue-600"
            onClick={handleQuiz}
          >
            Quiz
          </button>
          <input
            type="file"
            className="hidden"
            id="import-notes"
            accept=".txt"
            onChange={handleImportNotes}
          />
          <label
            htmlFor="import-notes"
            className="bg-blue-500 text-white text-xl py-2 px-4 rounded shadow hover:bg-blue-600 cursor-pointer"
          >
            Import Notes
          </label>
        </div>

        {isEditing && (
          <div className="p-4 bg-blue-500 mb-4 rounded shadow">
            <div>
              <label>Front:</label>
              <input
                type="text"
                name="front"
                value={currentCard.front}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-800 text-white rounded mt-1"
              />
            </div>
            <div>
              <label>Back:</label>
              <input
                type="text"
                name="back"
                value={currentCard.back}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-800 text-white rounded mt-1"
              />
            </div>
            <button
              className="bg-blue-600 text-white text-xl py-2 px-4 rounded shadow hover:bg-blue-700 mt-2"
              onClick={handleConfirmFlashcard}
            >
              Confirm
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {flashcards.map((card, index) => (
            <div
              key={index}
              className={`p-4 rounded shadow cursor-pointer relative ${
                flipIndex === index ? 'bg-blue-400 text-black' : 'bg-blue-500 text-white'
              }`}
              onClick={() => handleCardFlip(index)}
            >
              <span className="absolute top-2 right-2 text-xl text-red-600">
                {flipIndex === index ? 'A' : 'Q'}
              </span>
              {flipIndex === index ? card.back : card.front}
            </div>
          ))}
        </div>

        {showQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="bg-blue-500 p-8 rounded text-white w-96">
              <p className="text-2xl mb-4">Quiz Time!</p>
              <p className="text-xl mb-4">{flashcards[quizIndex].front}</p>
              {!isAnswered && (
                <>
                  <input
                    type="text"
                    value={quizAnswer}
                    onChange={(e) => setQuizAnswer(e.target.value)}
                    className="w-full p-2 bg-gray-800 text-white rounded mt-4"
                  />
                  <button
                    className="bg-blue-600 text-white text-xl py-2 px-4 rounded shadow mt-4"
                    onClick={handleNextQuiz}
                  >
                    Submit
                  </button>
                </>
              )}
              {isAnswered && (
                <>
                  <p className={`text-xl mt-4 ${answerFeedback.startsWith("Correct") ? "text-green-500" : "text-red-500"}`}>
                    {answerFeedback}
                  </p>
                  <button
                    className="bg-green-600 text-white text-xl py-2 px-4 rounded shadow mt-4"
                    onClick={handleNextQuiz}
                  >
                    Next
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {showScore && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="bg-blue-500 p-8 rounded text-white w-96 text-center">
              <p className="text-2xl mb-4">Quiz Finished!</p>
              <p className="text-xl mb-4">Your Score: {score}/{flashcards.length}</p>
              <button
                className="bg-white text-black text-xl py-2 px-4 rounded shadow hover:bg-gray-200 mt-4"
                onClick={handleCloseQuiz}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
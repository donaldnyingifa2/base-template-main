import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const textToType = "The quick brown fox jumps over the lazy dog..."; // Full text truncated for brevity here

function Timer({ timeLeft }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / 60) * circumference;

  return (
    <div className="flex justify-center mb-4">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="gray"
          fill="transparent"
          strokeWidth="5"
          r={radius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="blue"
          fill="transparent"
          strokeWidth="5"
          strokeDasharray={`${progress} ${circumference}`}
          strokeDashoffset="0"
          r={radius}
          cx={radius}
          cy={radius}
        />
      </svg>
    </div>
  );
}

function TypingTest() {
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTypingMessage, setStartTypingMessage] = useState('Start typing to begin practice!');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isTimerRunning, timeLeft]);

  useEffect(() => {
    if (userInput.length > 0 && !isTimerRunning) {
      setIsTimerRunning(true);
      setStartTypingMessage('');
    }
  }, [userInput, isTimerRunning]);

  const wpm = (userInput.length / 5) / ((60 - timeLeft) / 60); // Assuming average word length is 5
  const accuracy = (userInput.split('').filter((char, i) => char === textToType[i]).length / userInput.length) * 100 || 0;

  const handleChange = (e) => {
    if (!isTimerRunning) setIsTimerRunning(true);
    setUserInput(e.target.value);
  };

  const restartTest = () => {
    setUserInput('');
    setTimeLeft(60);
    setIsTimerRunning(false);
    setStartTypingMessage('Start typing to begin practice!');
  };

  return (
    <Card className="max-w-3xl mx-auto my-10">
      <CardContent>
        <Timer timeLeft={timeLeft} />
        <p>{startTypingMessage}</p>
        <div className="relative">
          <textarea
            value={userInput}
            onChange={handleChange}
            className="w-full h-40 p-2 border rounded bg-transparent relative z-10"
            disabled={timeLeft === 0}
          />
          <div className="absolute top-0 left-0 w-full h-40 p-2 text-gray-400 pointer-events-none">
            {textToType.split('').map((char, index) => (
              <span key={index} style={{ color: userInput[index] === char ? 'blue' : userInput[index] && userInput[index] !== char ? 'red' : 'inherit' }}>
                {char}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <p>WPM: {wpm.toFixed(2)}</p>
          <p>Accuracy: {accuracy.toFixed(2)}%</p>
        </div>
        {timeLeft === 0 && (
          <div>
            <p>You type with the speed of {wpm.toFixed(0)} WPM. Your accuracy was {accuracy.toFixed(2)}%. It could be better!</p>
            <Button onClick={restartTest}>Restart</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function App() {
  return (
    <div className="container mx-auto px-4">
      <TypingTest />
    </div>
  );
}
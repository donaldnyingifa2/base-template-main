import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui/card";

const text = `The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! Bright vixens jump; dozy fowl quack. Sphinx of black quartz, judge my vow. Two driven jocks help fax my big quiz. The five boxing wizards jump quickly. Jackdaws love my big sphinx of quartz. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex! Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! "Now fax quiz Jack!" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump. The quick onyx goblin jumps over the lazy dwarf. Jackdaws love my big sphinx of quartz. My girl wove six dozen plaid jackets before she quit. Six big devils from Japan quickly forgot how to waltz.`;

function Timer({ seconds, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const intervalRef = useRef();

  useEffect(() => {
    if (timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else {
      clearInterval(intervalRef.current);
      onTimeUp();
    }

    return () => clearInterval(intervalRef.current);
  }, [timeLeft, onTimeUp]);

  const percentage = (timeLeft / seconds) * 100;

  return (
    <div className="w-24 h-24 relative">
      <svg className="transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="5" />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="5"
          strokeDasharray="283"
          strokeDashoffset={`${283 * (1 - percentage / 100)}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span>{timeLeft}</span>
      </div>
    </div>
  );
}

function TypingTest() {
  const [userInput, setUserInput] = useState('');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [stats, setStats] = useState({ wpm: 0, cpm: 0, accuracy: 100 });
  const [testCompleted, setTestCompleted] = useState(false);

  useEffect(() => {
    if (userInput.length === 1 && !isTestRunning) {
      setIsTestRunning(true);
    }
    if (isTestRunning) {
      const correctChars = userInput.split('').filter((char, i) => char === text[i]).length;
      const words = userInput.split(' ').length - 1;
      const minutes = (60 - (document.querySelector('.Timer')?.textContent || 0)) / 60;
      setStats({
        wpm: Math.round(words / minutes) || 0,
        cpm: Math.round(userInput.length / minutes) || 0,
        accuracy: Math.round((correctChars / userInput.length) * 100) || 100
      });
    }
  }, [userInput, isTestRunning]);

  const handleRestart = () => {
    setUserInput('');
    setIsTestRunning(false);
    setTestCompleted(false);
  };

  const handleTimeUp = () => {
    setTestCompleted(true);
  };

  return (
    <Card className="w-full max-w-lg mx-auto mt-10 p-4">
      <CardHeader>
        <CardTitle>Typing Speed Test</CardTitle>
      </CardHeader>
      <CardContent>
        {!isTestRunning && <p>Start typing to begin practice!</p>}
        <div className="relative">
          <textarea
            value={text}
            readOnly
            className="text-sm w-full h-40 p-2 bg-gray-100 rounded text-gray-400 pointer-events-none"
          />
          <textarea
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            className="absolute top-0 left-0 w-full h-40 p-2 text-lg bg-transparent border-none focus:outline-none resize-none"
            style={{ color: 'transparent', caretColor: 'black' }}
          />
        </div>
        <Timer seconds={60} onTimeUp={handleTimeUp} className="Timer" />
        {testCompleted ? (
          <div>
            <p>You type with the speed of {stats.wpm} WPM. Your accuracy was {stats.accuracy}%. It could be better!</p>
            <Button onClick={handleRestart}>Restart</Button>
          </div>
        ) : (
          <div className="mt-4">
            <p>WPM: {stats.wpm}</p>
            <p>CPM: {stats.cpm}</p>
            <p>Accuracy: {stats.accuracy}%</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function App() {
  return <TypingTest />;
}
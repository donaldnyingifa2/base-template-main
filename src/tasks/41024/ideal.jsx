import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";

const sampleText = `The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! Bright vixens jump; dozy fowl quack. Sphinx of black quartz, judge my vow. Two driven jocks help fax my big quiz. The five boxing wizards jump quickly. Jackdaws love my big sphinx of quartz. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex! Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! "Now fax quiz Jack!" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump. The quick onyx goblin jumps over the lazy dwarf. Jackdaws love my big sphinx of quartz. My girl wove six dozen plaid jackets before she quit. Six big devils from Japan quickly forgot how to waltz.`;

const TypingSpeedTest = () => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [typedText, setTypedText] = useState('');
  const [wordsPerMinute, setWordsPerMinute] = useState(0);
  const [charsPerMinute, setCharsPerMinute] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const inputRef = useRef(null);
  const textDisplayRef = useRef(null);
  const lastVisibleCharRef = useRef(null);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      setShowSummary(true);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    // Ensure focus on mount and after any re-renders
    inputRef.current?.focus();
  });

  useEffect(() => {
    if (isRunning) {
      const words = typedText.trim().split(/\s+/).length;
      const chars = typedText.length;
      const timeSpent = 60 - timeLeft;

      setWordsPerMinute(Math.round((words / timeSpent) * 60) || 0);
      setCharsPerMinute(Math.round((chars / timeSpent) * 60) || 0);

      const correctChars = typedText.split('').filter((char, index) => char === sampleText[index]).length;
      setAccuracy(Math.round((correctChars / chars) * 100) || 100);
    }
  }, [typedText, timeLeft, isRunning]);

  useEffect(() => {
    if (lastVisibleCharRef.current) {
      const rect = lastVisibleCharRef.current.getBoundingClientRect();
      const containerRect = textDisplayRef.current.getBoundingClientRect();

      if (rect.bottom > containerRect.bottom) {
        textDisplayRef.current.scrollTop += rect.bottom - containerRect.bottom;
      }
    }
  }, [typedText]);

  const handleInputChange = (e) => {
    const newText = e.target.value;
    setTypedText(newText);
    if (!isRunning && newText.length === 1) {
      setIsRunning(true);
      setTimeLeft(60);
      setShowPrompt(false);
    }
  };

  const restartTest = () => {
    setTypedText('');
    setTimeLeft(60);
    setIsRunning(false);
    setWordsPerMinute(0);
    setCharsPerMinute(0);
    setAccuracy(100);
    setShowPrompt(true);
    setShowSummary(false);
    inputRef.current?.focus();
    if (textDisplayRef.current) {
      textDisplayRef.current.scrollTop = 0;
    }
  };

  const renderText = () => {
    return sampleText.split('').map((char, index) => {
      let className = 'text-gray-400'; // Default color
      if (index < typedText.length) {
        className = typedText[index] === char ? 'text-blue-500' : 'text-red-500';
      }
      return (
        <span
          key={index}
          className={className}
          ref={index === typedText.length - 1 ? lastVisibleCharRef : null}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-6 space-y-6 bg-white shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-600">Typing Speed Test</h1>
        <div className="flex justify-between items-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold">{timeLeft}</span>
            </div>
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#FFC107"
                strokeWidth="2"
                strokeDasharray={`${((60 - timeLeft) / 60) * 100}, 100`}
              />
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-semibold">{wordsPerMinute < Infinity ? wordsPerMinute : 0}</div>
              <div className="text-sm text-gray-500">words/min</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold">{charsPerMinute < Infinity ? charsPerMinute : 0}</div>
              <div className="text-sm text-gray-500">chars/min</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold">{accuracy}</div>
              <div className="text-sm text-gray-500">% accuracy</div>
            </div>
          </div>
        </div>

        <div className="relative border rounded-md p-4 bg-gray-50 overflow-hidden h-64">
          {showPrompt && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xl">
              <span className='bg-blue-100 rounded-md p-4 z-50 bg-opacity-70'>Start typing to begin</span>
            </div>
          )}
          {showSummary && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-100 bg-opacity-90">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Test Complete!</h2>
                <p className="text-xl">Your typing speed: <span className="font-bold">{wordsPerMinute} WPM</span></p>
                <p className="text-xl">Accuracy: <span className="font-bold">{accuracy}%</span></p>
              </div>
            </div>
          )}
          <div ref={textDisplayRef} className="whitespace-pre-wrap font-mono text-lg leading-relaxed h-full overflow-auto">
            {renderText()}
          </div>
          <textarea
            ref={inputRef}
            value={typedText}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full p-4 bg-transparent resize-none focus:outline-none font-mono opacity-0 caret-black caret-[0.75em]"
            disabled={timeLeft === 0 || showSummary}
            autoFocus
          />
        </div>

        {(timeLeft === 0 || showSummary) && (
          <button
            onClick={restartTest}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Restart
          </button>
        )}
      </Card>
    </div>
  );
};

export default TypingSpeedTest;
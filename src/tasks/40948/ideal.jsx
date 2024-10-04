import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Moon, Sun } from 'lucide-react';

const useTimer = () => {
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer(Date.now() - startTime);
      }, 1000);
    } else if (!isActive && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const start = () => {
    setIsActive(true);
    setStartTime(Date.now());
    setTimer(0);
  };

  const stop = () => {
    setIsActive(false);
  };

  const reset = () => {
    setIsActive(false);
    setTimer(0);
  };

  return { timer, isActive, start, stop, reset };
};

const formatTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

function BabyInfoForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center text-gray-800 dark:text-white">Welcome to BabyFeed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Baby's Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <Input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <Button
            onClick={() => onSubmit({ name, dob })}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Start Tracking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FeedingTracker({ baby, onNewSession }) {
  const [activeSide, setActiveSide] = useState(null);
  const [lastUsed, setLastUsed] = useState(null);
  const [notification, setNotification] = useState('');
  const leftTimer = useTimer();
  const rightTimer = useTimer();
  const [lastFeedingTime, setLastFeedingTime] = useState(null);
  const [, setFeedingIntervals] = useState([]);
  const [averageInterval, setAverageInterval] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [totalLeftTime, setTotalLeftTime] = useState(0);
  const [totalRightTime, setTotalRightTime] = useState(0);

  const checkAndSetNotification = useCallback(() => {
    if (lastFeedingTime && averageInterval) {
      const timeSinceLastFeeding = Date.now() - lastFeedingTime; // in milliseconds
      const minutes = Math.floor(timeSinceLastFeeding / 60000);
      const seconds = Math.floor((timeSinceLastFeeding % 60000) / 1000);

      let timeString;
      if (minutes < 1) {
        timeString = `${seconds} second${seconds !== 1 ? 's' : ''}`;
      } else {
        timeString = `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`;
      }

      if (timeSinceLastFeeding / 60000 > averageInterval) {
        setNotification(`It's been ${timeString} since the last feeding. Consider checking if ${baby.name} is hungry.`);

        // Clear the notification after 10 seconds
        setTimeout(() => {
          setNotification('');
        }, 10000);
      }
    }
  }, [lastFeedingTime, averageInterval]);

  useEffect(() => {
    let notificationInterval;
    let checkInterval;

    if (lastFeedingTime && !activeSide) {
      // Set up the 40-second interval for checking and setting notifications
      notificationInterval = setInterval(() => {
        checkAndSetNotification();
      }, 40000);

      // Set up a more frequent check to clear the notification if a new feeding starts
      checkInterval = setInterval(() => {
        if (activeSide) {
          clearInterval(notificationInterval);
          clearInterval(checkInterval);
          setNotification('');
        }
      }, 1000);
    }

    return () => {
      clearInterval(notificationInterval);
      clearInterval(checkInterval);
    };
  }, [lastFeedingTime, activeSide, checkAndSetNotification]);

  const updateFeedingIntervals = (newFeedingTime) => {
    if (lastFeedingTime) {
      const newInterval = (newFeedingTime - lastFeedingTime) / 60000; // in minutes
      setFeedingIntervals(prev => {
        const updatedIntervals = [...prev, newInterval].slice(-10); // Keep last 10 intervals
        if (updatedIntervals.length >= 2) {
          const newAverage = updatedIntervals.reduce((a, b) => a + b, 0) / updatedIntervals.length;
          setAverageInterval(newAverage);
        } else {
          setAverageInterval(null);
        }
        return updatedIntervals;
      });
    }
    setLastFeedingTime(newFeedingTime);
  };

  const handleFeedingAction = (side) => {
    const currentTime = Date.now();

    if (activeSide === side) {
      // Stop feeding
      const duration = Math.floor((side === 'left' ? leftTimer.timer : rightTimer.timer) / 1000);
      const newSession = { side, duration, date: new Date(currentTime) };
      onNewSession(newSession);
      setSessions([newSession, ...sessions]);

      // Update total feeding time for the side
      if (side === 'left') {
        setTotalLeftTime(prev => prev + duration);
      } else {
        setTotalRightTime(prev => prev + duration);
      }

      side === 'left' ? leftTimer.reset() : rightTimer.reset();
      setActiveSide(null);
      updateFeedingIntervals(currentTime);
    } else {
      // Start feeding
      setNotification(''); // Clear any existing notifications when feeding starts

      // Check for feeding balance before starting new session
      if (totalLeftTime * 2 < totalRightTime && side === 'right') {
        setNotification(`Consider feeding ${baby.name} from the left breast to balance feeding times.`);
      } else if (totalRightTime * 2 < totalLeftTime && side === 'left') {
        setNotification(`Consider feeding ${baby.name} from the right breast to balance feeding times.`);
      }

      if (activeSide) {
        // If there's an active session on the other side, stop it first
        const otherSide = activeSide === 'left' ? 'right' : 'left';
        const otherTimer = activeSide === 'left' ? rightTimer : leftTimer;
        const duration = Math.floor(otherTimer.timer / 1000);
        const newSession = { side: activeSide, duration, date: new Date(currentTime) };
        onNewSession(newSession);
        setSessions([newSession, ...sessions]);

        // Update total feeding time for the other side
        if (activeSide === 'left') {
          setTotalLeftTime(prev => prev + duration);
        } else {
          setTotalRightTime(prev => prev + duration);
        }

        otherTimer.reset();
      }
      side === 'left' ? leftTimer.start() : rightTimer.start();
      setActiveSide(side);
    }
    setLastUsed(side);
  };

  const formatTimeMin = (timeInMinutes) => {
    const minutes = Math.floor(timeInMinutes);
    const seconds = Math.round((timeInMinutes - minutes) * 60);

    if (minutes === 0) {
      return `${seconds} sec${seconds !== 1 ? 's' : ''}`;
    } else if (seconds === 0) {
      return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    } else {
      return `${minutes} min${minutes !== 1 ? 's' : ''} ${seconds} sec${seconds !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">{baby.name}'s Feeding Tracker</h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-2">Age: {calculateAge(baby.dob)}</p>
      {averageInterval && (
        <p className="text-center text-gray-600 dark:text-gray-300 mb-4">Avg. interval: ~{formatTimeMin(averageInterval)}</p>
      )}
      {notification && (

        <div className="bg-yellow-100 dark:bg-yellow-800 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 mb-4 rounded">
          <p className='mb-4'>
            Total feeding times - Left: {formatTime(totalLeftTime * 1000)}, Right: {formatTime(totalRightTime * 1000)}
          </p>
          <p>{notification}</p>
        </div>
      )}
      <div className="flex justify-between mb-8">
        <FeedingButton
          side="Left"
          isActive={activeSide === 'left'}
          timer={leftTimer}
          onClick={() => handleFeedingAction('left')}
          disabled={activeSide === 'right'}
          isLastUsed={lastUsed === 'left'}
        />
        <FeedingButton
          side="Right"
          isActive={activeSide === 'right'}
          timer={rightTimer}
          onClick={() => handleFeedingAction('right')}
          disabled={activeSide === 'left'}
          isLastUsed={lastUsed === 'right'}
        />
      </div>
      <Button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 mb-4"
      >
        {showHistory ? 'Hide' : ''} Feeding History
      </Button>
      {showHistory && <FeedingHistory sessions={sessions} />}
    </div>
  );
}

function FeedingButton({ side, isActive, timer, onClick, disabled, isLastUsed }) {
  return (
    <div className="flex flex-col items-center">
      <span className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">{side}</span>
      <Button
        onClick={onClick}
        disabled={disabled}
        className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-lg font-semibold transition-all duration-300 ${isActive
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="text-2xl mb-2">{formatTime(timer.timer)}</span>
        <span>{isActive ? 'Stop' : 'Start'}</span>
      </Button>
      {isLastUsed && (
        <span className="mt-1 text-xs text-blue-500 dark:text-blue-400">Last used</span>
      )}
    </div>
  );
}

function FeedingHistory({ sessions }) {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const totalPages = Math.ceil(sessions.length / recordsPerPage);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sessions.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">Feeding History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Date</TableHead>
                <TableHead className="text-left">Breast</TableHead>
                <TableHead className="text-left">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRecords.map((session, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{formatDateTime(session.date)}</TableCell>
                  <TableCell>{session.side}</TableCell>
                  <TableCell>{formatTime(session.duration * 1000)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-400 text-gray-700 dark:text-gray-900"
            >
              prev
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-400 text-gray-800 dark:text-gray-1000"
            >
              next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatDateTime(date) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function calculateAge(dob) {
  const today = new Date();
  const birthDate = new Date(dob);
  const ageInDays = Math.floor((today - birthDate) / (24 * 60 * 60 * 1000));

  if (ageInDays < 7) {
    return `${ageInDays} day${ageInDays !== 1 ? 's' : ''}`;
  } else if (ageInDays < 30) {
    const weeks = Math.floor(ageInDays / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  } else {
    const months = Math.floor(ageInDays / 30.44);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
}

export default function App() {
  const [baby, setBaby] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!baby) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <BabyInfoForm onSubmit={setBaby} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-md mx-auto p-4">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <FeedingTracker baby={baby} onNewSession={(session) => console.log('New session:', session)} />
      </div>
    </div>
  );
}
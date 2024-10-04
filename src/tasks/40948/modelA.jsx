import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const useTimer = (initialState = 0) => {
  const [timer, setTimer] = useState(initialState);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer(prevTime => prevTime + 1);
      }, 1000);
    } else if (!isActive && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  return {
    timer,
    start: () => setIsActive(true),
    stop: () => setIsActive(false),
    reset: () => {
      setTimer(0);
      setIsActive(false);
    }
  };
};

function BabyInfoForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Baby's Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Input type="text" placeholder="Baby's Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-2" />
        <Button onClick={() => onSubmit({ name, dob })} className="mt-4">Start Tracking</Button>
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

  useEffect(() => {
    if (leftTimer.timer > rightTimer.timer * 2 || rightTimer.timer > leftTimer.timer * 2) {
      setNotification(`Consider feeding from the ${leftTimer.timer < rightTimer.timer ? 'left' : 'right'} side more.`);
    } else {
      setNotification('');
    }
  }, [leftTimer.timer, rightTimer.timer]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!activeSide && (leftTimer.timer > 0 || rightTimer.timer > 0)) {
        setNotification('Time for the next feeding session!');
      }
    }, 40000);
    return () => clearInterval(interval);
  }, [activeSide, leftTimer.timer, rightTimer.timer]);

  const startFeeding = (side) => {
    setActiveSide(side);
    side === 'left' ? leftTimer.start() : rightTimer.start();
    setLastUsed(side);
    onNewSession(side, side === 'left' ? leftTimer.timer : rightTimer.timer);
  };

  const stopFeeding = () => {
    activeSide === 'left' ? leftTimer.stop() : rightTimer.stop();
    setActiveSide(null);
  };

  return (
    <div className="text-center">
      <h2 className="text-lg font-bold">{baby.name}'s Feeding Tracker</h2>
      <p>Age: {calculateAge(baby.dob)}</p>
      {notification && <p className="bg-yellow-100 text-yellow-600 p-2 my-2 rounded">{notification}</p>}
      <div className="flex justify-center space-x-4 mt-4">
        <div>
          <p className="mb-2">Left</p>
          <Button onClick={() => activeSide === 'left' ? stopFeeding() : startFeeding('left')} className="rounded-full w-20 h-20">
            {activeSide === 'left' ? 'Stop' : 'Start'}
            <br />{formatTime(leftTimer.timer)}
          </Button>
        </div>
        <div>
          <p className="mb-2">Right</p>
          <Button onClick={() => activeSide === 'right' ? stopFeeding() : startFeeding('right')} className="rounded-full w-20 h-20">
            {activeSide === 'right' ? 'Stop' : 'Start'}
            <br />{formatTime(rightTimer.timer)}
          </Button>
        </div>
      </div>
      {lastUsed && <p className="mt-2 text-sm">Last used: {lastUsed}</p>}
    </div>
  );
}

function FeedingHistory({ sessions, toggleHistory }) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const indexOfLastSession = currentPage * rowsPerPage;
  const indexOfFirstSession = indexOfLastSession - rowsPerPage;
  const currentSessions = sessions.slice(indexOfFirstSession, indexOfLastSession);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feeding History</CardTitle>
        <Button onClick={toggleHistory}>Hide Feeding History</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Breast</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSessions.map((session, idx) => (
              <TableRow key={idx}>
                <TableCell>{new Date(session.date).toLocaleDateString()}</TableCell>
                <TableCell>{session.side}</TableCell>
                <TableCell>{formatTime(session.duration)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-between">
          {Array.from({ length: Math.ceil(sessions.length / rowsPerPage) }, (_, i) => (
            <Button key={i} onClick={() => paginate(i + 1)}>{i + 1}</Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function calculateAge(dob) {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age < 1 ? `${12 - birthDate.getMonth() + today.getMonth()} months` : `${age} years`;
}

export default function App() {
  const [baby, setBaby] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([]);

  if (!baby) {
    return <BabyInfoForm onSubmit={setBaby} />;
  }

  return (
    <div className="p-4 sm:p-8">
      {showHistory ? (
        <FeedingHistory sessions={sessions} toggleHistory={() => setShowHistory(!showHistory)} />
      ) : (
        <>
          <FeedingTracker baby={baby} onNewSession={(side, duration) =>
            setSessions([...sessions, { side, duration, date: Date.now() }])} />
          <Button onClick={() => setShowHistory(!showHistory)} className="mt-4">
            {showHistory ? 'Hide' : 'Show'} Feeding History
          </Button>
        </>
      )}
    </div>
  );
}
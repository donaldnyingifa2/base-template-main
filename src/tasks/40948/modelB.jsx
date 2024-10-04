// App.jsx
import React, { useState } from 'react';
import BabyInfoForm from './BabyInfoForm';
import FeedingTracker from './FeedingTracker';
import { Card } from "@/components/ui/card";

function App() {
  const [babyInfo, setBabyInfo] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-2xl mx-auto">
        <Card.Header>
          {babyInfo ? (
            <FeedingTracker babyInfo={babyInfo} />
          ) : (
            <BabyInfoForm setBabyInfo={setBabyInfo} />
          )}
        </Card.Header>
      </Card>
    </div>
  );
}

export default App;

// BabyInfoForm.jsx
import React from 'react';
import { Button, Input } from "@/components/ui";

const BabyInfoForm = ({ setBabyInfo }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setBabyInfo({
      name: formData.get('name'),
      dob: formData.get('dob')
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input type="text" name="name" placeholder="Baby's Name" />
      <Input type="date" name="dob" />
      <Button type="submit">Submit</Button>
    </form>
  );
};

// FeedingTracker.jsx
import React, { useState, useEffect } from 'react';
import Timer from './Timer';
import Notification from './Notification';
import FeedingHistory from './FeedingHistory';

const FeedingTracker = ({ babyInfo }) => {
  const [side, setSide] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Timer logic, notification logic, and history management would go here

  return (
    <div>
      {!showHistory ? (
        <>
          <h1>{babyInfo.name}'s Feeding Tracker</h1>
          {/* Implement side circles, timer, and notification here */}
          <Button onClick={() => setShowHistory(true)}>Show Feeding History</Button>
        </>
      ) : (
        <FeedingHistory history={history} close={() => setShowHistory(false)} />
      )}
    </div>
  );
};

// Timer.jsx, Notification.jsx, FeedingHistory.jsx would follow with similar structure
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RoomEntry from '../components/RoomEntry.jsx';
import CallRoom from '../components/CallRoom.jsx';

function App() {
  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white">
      <Routes>
        <Route path="/" element={<RoomEntry />} />
        <Route path="/room/:roomId" element={<CallRoom />} />
      </Routes>
    </div>
  );
}

export default App;

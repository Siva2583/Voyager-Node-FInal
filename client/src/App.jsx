import React from 'react';
import TripForm from './components/TripForm';
import TripResult from './components/TripResult';
import Loading from './components/Loading';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TripForm />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/result" element={<TripResult />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

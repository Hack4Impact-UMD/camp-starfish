"use client";

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingPage from './LoadingPage';

export default function Home() {
  return <>
    <Router>
      <Routes>
        <Route path="/" element={<LoadingPage />} />
      </Routes>
    </Router>
  </>
}

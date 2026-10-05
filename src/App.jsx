import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './Components/Navbar';
import Hero from './Components/Hero';
import Functionalities from './Components/Functionalities';
import Industries from './Components/Industries';
import Footer from './Components/Footer';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import MyFiles from './Components/MyFiles';
import HomePage from './Components/HomePage';
import Auth from './Components/Auth';
import AuthCallback from './Components/AuthCallback';
import { ThemeProvider } from './contexts/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <div className="bg-white">
                <Navbar />
                <Hero />
                <Functionalities />
                <Industries />
                <Footer />
              </div>
            }
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/my-files" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

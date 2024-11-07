import React from 'react';
import './App.css';
import './css/dashboard.css';
import './css/loginpage.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLoginButton from './componets/GoogleLoginButton';
import Dashboard from './componets/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<GoogleLoginButton />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;

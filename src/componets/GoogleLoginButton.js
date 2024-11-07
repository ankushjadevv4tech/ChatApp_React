import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const handleLogin = useGoogleLogin({
    onSuccess: async (coderResponse) => {
      if (coderResponse.access_token) {
        fetch("http://localhost:3000/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ token: coderResponse.access_token })
        })
          .then(response => response.json())
          .then(data => {
            console.log("User logged in:", data);
            localStorage.setItem("authToken", data.token);
            navigate("/dashboard");
          });
      }
    }
  });
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Welcome to Chat App</h2>
        <p className="subtitle">Sign in to continue</p>
        <button onClick={handleLogin} className="googleButton">
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google icon"
            className="googleIcon"
          />
          Login with Google
        </button>
      </div>
    </div>
  );
};



export default GoogleLoginButton;

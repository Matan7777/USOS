import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './signUp.css';  // Ensure this CSS is imported

function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  //הרשמה של משתמש
  const signUpUser = async () => {
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      //בקשת POST לצורך הרשמה
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json(); //מחכה לתשובת השרת

      if (response.ok) {
        setMessage("User registered successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Error: Failed to connect to server");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1>Sign Up</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button onClick={signUpUser}>Sign Up</button>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default SignUp;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './login.css';

const baseUrl = "http://localhost:5000";  // כתובת השרת

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const loginUser = async () => {
    try {
      const response = await axios.post(`${baseUrl}/login`, {
        username,
        password
      });

      if (response.data.message === "Login successful!") {
        localStorage.setItem('user_id', response.data.user_id);
        onLogin(username);
        setMessage("Login successful! You are now logged in.");
        navigate("/products");  // ניתוב לעמוד המוצרים לאחר התחברות מוצלחת
      } else {
        setMessage(response.data.message);  // אם ההתחברות נכשלה, הצגת ההודעה המתאימה
      }
    } catch (error) {
      setMessage("Error: Failed to connect to server");  // הודעת שגיאה במקרה של כשל חיבור לשרת
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}  // עדכון שם המשתמש
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}  // עדכון הסיסמה
        />
        <button onClick={loginUser}>Login</button> 
        <p>{message}</p>

        {/* כפתור להרשמה אם אין למשתמש חשבון */}
        <div className="signup-link">
          <p>Don't have an account?</p>
          <Link to="/signup">
            <button>Sign Up</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import ProductPage from './ProductPage';
import Login from './login';
import ShoppingCart from './shoppingCart';
import Navbar from './Navbar'; 
import SignUp from './signUp';
import ProtectedRoute from './protectedRoute'; 

function App() {
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Guest');  // אחסון שם המשתמש

  // פונקציה להתעדכנות שם המשתמש
  const handleLogin = (username) => {
    setUsername(username);  // עדכון שם המשתמש ב-state
    localStorage.setItem('username', username);  // שמירת שם המשתמש ב-localStorage
  };

  const handleLogout = () => {
    setUsername('Guest');  // עדכון שם המשתמש ל'Guest' בעת התנתקות
    localStorage.removeItem('username');  // הסרת שם המשתמש מה-localStorage
  };

  // מניעת חזרה אחורה בדפדפן
  useEffect(() => {
    const preventBackNavigation = (event) => {
      window.history.pushState(null, null, window.location.href);
    };

    // מניעת מעבר עם כפתורי אחורה וקדימה בדפדפן
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', preventBackNavigation);

    return () => {
      window.removeEventListener('popstate', preventBackNavigation);
    };
  }, []);

  return (
    <Router>
      <div>
        <Navbar username={username} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* מניעת גישה לדף login אם המשתמש כבר מחובר */}
          <Route
            path="/login"
            element={username !== 'Guest' ? <Navigate to="/products" /> : <Login onLogin={handleLogin} />}
          />

          {/* מניעת גישה לדף signup אם המשתמש כבר מחובר */}
          <Route
            path="/signup"
            element={username !== 'Guest' ? <Navigate to="/products" /> : <SignUp />}
          />

          {/* מסלולים מוגנים */}
          <Route 
            path="/products" 
            element={
              <ProtectedRoute username={username}>
                <ProductPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute username={username}>
                <ShoppingCart />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

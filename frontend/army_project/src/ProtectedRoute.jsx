import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('username'); // בדיקה אם המשתמש מחובר

  return isAuthenticated ? children : <Navigate to="/login" />; // ניתוב לדף התחברות אם המשתמש לא מחובר
}

export default ProtectedRoute;

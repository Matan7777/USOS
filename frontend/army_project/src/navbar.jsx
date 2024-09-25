import { Link, useNavigate } from 'react-router-dom';
import './navbar.css'; 

function Navbar({ username, onLogout }) { 
  const navigate = useNavigate();

  // פונקציה להתנתקות משתמש
  const handleLogout = () => {
    onLogout();  // מעדכן את שם המשתמש ל- Guest
    navigate('/');  // 
  };

  return (
    <nav className="navbar">
      <ul className="nav-list">
        {/*רק אם המשתמש מחובר*/}
        {username !== 'Guest' && (
          <li className="cart">
            <Link to="/cart" className="nav-link">
              <img src="public/icon_cart.png" alt="Shopping Cart" style={{ width: '24px', height: '24px' }} />
            </Link>
          </li>
        )}
        <li className='name'>USOS</li>
        <div className='myfixed'>
          <li className="user-info">
            <span className="username">Hello, {username}</span>
            {username !== 'Guest' && (
              <button className="logout-button" onClick={handleLogout}>Log out</button>
            )}
          </li>
        </div>
      </ul>
    </nav>
  );
}

export default Navbar;

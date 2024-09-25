import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; 

function HomePage() {
  return (
    <div className="homepage">
      <div className="homepage-content">
        <h1>Welcome to USOS!</h1>
        <p>Discover the latest trends in clothing, footwear and accessories!</p>
        <div className="homepage-buttons">
          <Link to="/login">
            <button className="styled-button">Login</button>
          </Link>
          <Link to="/signup">
            <button className="styled-button">Sign Up</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

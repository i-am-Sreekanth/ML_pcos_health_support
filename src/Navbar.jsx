import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="Navbar-container">
      <div className="Navbar-content">
        {/* Logo Section */}
        <div 
          className="Brand-logo cursor-pointer" 
          onClick={() => navigate('/')}
        >
          FEMHEALTH
        </div>

        {/* Navigation Links */}
        <nav className="Nav-links">
          <div className="nav-item" onClick={() => navigate('/')}>HOME</div>
          <div className="nav-item" onClick={() => navigate('/about')}>ABOUT</div>
          <div className="nav-item" onClick={() => navigate('/predict')}>PREDICT (FORM)</div>
          <div className="nav-item" onClick={() => navigate('/predict-image')}>PREDICT (IMAGE)</div>
          <div className="nav-item" onClick={() => navigate('/articles')}>ARTICLES</div>
        </nav>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .Navbar-container {
          width: 100%;
          background-color: #ffffff;
          box-shadow: 0 2px 15px rgba(58, 91, 191, 0.08);
          position: sticky;
          top: 0;
          z-index: 1000;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .Navbar-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 25px;
        }

        .Brand-logo {
          font-weight: 800;
          font-size: 22px;
          letter-spacing: -0.5px;
          color: #3a5bbf;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .Brand-logo:hover {
          transform: scale(1.02);
        }

        .Nav-links {
          display: flex;
          gap: 32px; /* Fixed spacing */
          align-items: center;
        }

        .nav-item {
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.5px;
          color: #64748b; /* Subtle grey for inactive */
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          padding: 5px 0;
        }

        .nav-item:hover {
          color: #3a5bbf; /* Your specific blue */
        }

        /* Underline effect on hover */
        .nav-item::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: #3a5bbf;
          transition: width 0.3s ease;
        }

        .nav-item:hover::after {
          width: 100%;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .Nav-links {
            gap: 15px;
          }
          .nav-item {
            font-size: 11px;
          }
        }
      `}</style>
    </header>
  );
}

export default Navbar;
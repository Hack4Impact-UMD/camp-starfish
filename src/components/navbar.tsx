import React from 'react';
import Link from 'next/link'; // Use Next.js Link instead of react-router-dom
import darkBgLogo from '../assets/logos/darkBgLogo.png';
import profile from '../assets/logos/Profile.png';
import './navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="container">
      {/* Logo on the left */}
      <div className="left-section">
        <Link href="/">
          <img className="logo" src={darkBgLogo.src} alt="Camp Starfish Logo" />
        </Link>
      </div>

      {/* Centered Text Container */}
      <div className="text-container">
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index}>Example Item</span>
        ))}
      </div>

      {/* Profile Picture on the right */}
      <div>
        <Link href="/profile">
        <img className="profile" src={profile.src} alt="Profile" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

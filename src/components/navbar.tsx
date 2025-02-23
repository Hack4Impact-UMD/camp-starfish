import React from 'react';
import Link from 'next/link'; // Use Next.js Link instead of react-router-dom
// Import images from the assets folder located in the parent directory
import darkBgLogo from '../assets/logos/darkBgLogo.png';
import profile from '../assets/logos/Profile.png';

const Navbar: React.FC = () => {
  // Container style based on Figma requirements (using absolute positioning with fixed width)
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '112px',
    position: 'absolute',
    backgroundColor: '#002D45',
    padding: '13px 128px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  // Left section holds the logo and text container.
  const leftSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
  };

  // The text container is given a left margin to push it away from the logo.
  // The gap between each text item is set to 30px.
  const textContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '30px', // spacing between each "Example Item"
    marginLeft: '40px', // extra space between the logo and text container
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: '24px',
    fontFamily: 'var(--font-lato), sans-serif',
  };

  const logoStyle: React.CSSProperties = {
    width: '100.94px',
    height: '72px',
    cursor: 'pointer',
  };

  const profileStyle: React.CSSProperties = {
    width: '72px',
    height: '72px',
  };

  return (
    <nav style={containerStyle}>
      <div style={leftSectionStyle}>
        {/* Clicking the logo redirects to the home page */}
        <Link href="/">
          <img src={darkBgLogo.src} alt="Camp Starfish Logo" style={logoStyle} />
        </Link>
        <div style={textContainerStyle}>
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index}>Example Item</span>
          ))}
        </div>
      </div>
      <div>
        <img src={profile.src} alt="Profile" style={profileStyle} />
      </div>
    </nav>
  );
};

export default Navbar;

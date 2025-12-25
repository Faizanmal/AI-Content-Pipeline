import React from 'react';
import Link from 'next/link';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="logo">
          <span className="logo-icon">📝</span>
          <span className="logo-text"> Blog</span>
        </Link>
        <nav className="nav">
          <Link href="/" className="nav-link">Articles</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

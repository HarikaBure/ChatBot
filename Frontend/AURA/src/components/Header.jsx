import React, { useEffect, useState } from 'react';
import { Bot } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const [visible, setVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  let lastScrollY = window.scrollY;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username'); // Retrieve username from local storage
    if (token) {
      setIsLoggedIn(true);
      setUsername(storedUsername || ''); // Set username from local storage
    }
  }, []);

  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      // Scrolling down
      setVisible(false);
    } else {
      // Scrolling up
      setVisible(true);
    }
    lastScrollY = window.scrollY;
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token
    localStorage.removeItem('username'); // Clear the username
    setIsLoggedIn(false); // Update the login state
    setUsername(''); // Clear the username
    navigate('/'); // Redirect to login page
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 backdrop-blur-lg shadow-sm border-b border-white/20 transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'} bg-blue`}>
      <nav className="flex items-center justify-between px-6 py-4 text-white">
        {/* Left - Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-teal-400 p-2 rounded-full">
            <Bot className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-wider">AURA</span>
        </Link>

        <div className="hidden md:flex gap-6 text-lg font-medium">
        <a href="#main" className="hover:text-teal-400 transition">About</a>
         <a href="#features " className="hover:text-teal-400 transition">Features</a>
         <a href="# " className="hover:text-teal-400 transition">Contact</a>
         <a href="#" className="hover:text-teal-400 transition">Demo</a>

        </div>
        {/* Right - Buttons */}
        <div className="flex items-center gap-4 text-md">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2">
                <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                  {username.charAt(0).toUpperCase()} {/* Display first letter of username */}
                </div>
                <span className="text-lg font-semibold">{username}</span> {/* Enhanced font size */}
              </div>
              <button onClick={handleLogout} className="hover:text-teal-400 transition cursor-pointer ">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-teal-400 transition">Sign In</Link>
              <Link
                to="/register"
                className="bg-teal-500 text-white px-4 py-1 rounded-full hover:bg-teal-600 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;

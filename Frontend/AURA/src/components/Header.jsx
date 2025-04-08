import React from 'react';
import { Bot } from "lucide-react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-lg shadow-md border-b border-white/20">
      <nav className="flex items-center justify-between px-6 py-4 text-white">
        {/* Left - Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-teal-400 p-2 rounded-full">
            <Bot className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-bold">AURA</span>
        </Link>

        {/* Center - Links */}
        <div className="hidden md:flex gap-6 text-md">
          <a href="#features" className="hover:text-teal-400 transition">Features</a>
          <a href="#testimonials" className="hover:text-teal-400 transition">Testimonials</a>
          <a href="#get-started" className="hover:text-teal-400 transition">Get Started</a>
        </div>

        {/* Right - Buttons */}
        <div className="flex items-center gap-4 text-md">
          <Link to="/login" className="hover:text-teal-400 transition">Sign In</Link>
          <Link
            to="/register"
            className="bg-teal-500 text-white px-4 py-1 rounded-full hover:bg-teal-600 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;

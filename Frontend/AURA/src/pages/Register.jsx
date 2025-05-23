import React, { useState } from "react";
import { FaLock, FaUser, FaEnvelope } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify'; // Import toast
import Footer from "../components/Footer";
import Header from "../components/Header";

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      toast.success("Registration successful!");
      navigate('/login');
    } else {
      toast.error(data.message); // Display error message from the server
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0f1b2d] to-[#0e2e38] text-white flex items-center justify-center px-4">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Form Card */}
          <div className="bg-white/5 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-1">Create Your Account</h2>
            <p className="text-sm text-gray-300 mb-6">
              Fill in the details to get started
            </p>
            <form onSubmit={handleRegister}>
              <div className="mb-4 relative">
                <FaUser className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/20 rounded-md placeholder-white/50"
                />
              </div>
              <div className="mb-4 relative">
                <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white/60" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/20 rounded-md placeholder-white/50"
                />
              </div>
              <div className="mb-6 relative">
                <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white/60" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/20 rounded-md placeholder-white/50"
                />
              </div>
              <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 py-2 rounded-md font-medium flex items-center justify-center gap-2">
                Register
              </button>
            </form>
            <p className="text-sm text-gray-400 mt-4 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-teal-400 hover:underline underline-offset-2">
                Sign In
              </Link>
            </p>
          </div>

          {/* Side Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Join the AURA Community
            </h1>
            <p className="text-gray-300 mb-4">
              Discover the power of AI-powered movie recommendations based on your emotional state.
            </p>
            <ul className="space-y-2">
              <li>✅ <strong>Advanced AI:</strong> Understands your emotions from conversation</li>
              <li>🎯 <strong>Tailored Recommendations:</strong> Find the perfect film for your mood</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;

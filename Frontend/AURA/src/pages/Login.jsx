import React, { useState } from "react";
import { FaLock, FaSignInAlt, FaEnvelope } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import Footer from "../components/Footer";
import Header from "../components/Header";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user);
      toast.success("Login successful!");
      navigate('/chat');
    } else {
      toast.error(data.message);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0f1b2d] to-[#0e2e38] text-white flex items-center justify-center px-4">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Form Card */}
          <div className="bg-white/5 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-1">Welcome to AURA</h2>
            <p className="text-sm text-gray-300 mb-6">
              Enter your details to continue your journey
            </p>
            <form onSubmit={handleLogin}>
              <div className="mb-4 relative">
                <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white/60" />
                <input
                  type="email"
                  placeholder="email"
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
                <FaSignInAlt /> Sign In
              </button>
            </form>
            <p className="text-sm text-gray-400 mt-4 text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-teal-400 hover:underline underline-offset-2">
                Register
              </Link>
            </p>
          </div>

          {/* Side Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Experience emotional intelligence with AURA
            </h1>
            <p className="text-gray-300 mb-4">
              Join thousands of users who have discovered the power of AI-powered
              movie recommendations based on their emotional state.
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

export default Login;

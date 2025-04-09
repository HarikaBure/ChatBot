import React from "react";
import {useState} from 'react'
import axios from 'axios'
import { useNavigate } from "react-router-dom";

import { FaUser, FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
const Register = () => {
  const navigate = useNavigate(); 
  const [user,setUser]=useState({
    username:"",
    email:"",
    password:""

  })
  const handleChange=(e)=>{
    setUser({...user,[e.target.name]:e.target.value})

  }

  const handleSubmit=(e)=>{
    e.preventDefault();
    axios.post('http://localhost:5000/register',user)
    .then((res)=>{
      console.log(res.data);
      if(res)
      {console.log("Full response:", res);
        console.log("res.data:", res.data);
        alert("user registered success");
        navigate('/chat');
      }

    })
    .catch((err)=>{
      console.log(err);
    })

  }
  return (
    <>
    <Header/>
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0f1b2d] to-[#0e2e38] text-white flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Form Card */}
        <div className="bg-white/5 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-1">Create Your AURA Account</h2>
          <p className="text-sm text-gray-300 mb-6">
            Register to start your journey
          </p>
          <form onSubmit={handleSubmit}>
  <div className="mb-4 relative">
    <FaUser className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white/60" />
    <input
      type="text"
      name="username"
      placeholder="Username"
      className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/20 rounded-md"
      value={user.username}
      onChange={handleChange}
    />
  </div>

  <div className="mb-4 relative">
    <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white/60" />
    <input
      type="email"
      name="email"
      placeholder="Email"
      className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/20 rounded-md placeholder-white/50"
      value={user.email}
      onChange={handleChange}
    />
  </div>

  <div className="mb-6 relative">
    <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white/60" />
    <input
      type="password"
      name="password"
      placeholder="Password"
      className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/20 rounded-md placeholder-white/50"
      value={user.password}
      onChange={handleChange}
    />
  </div>

  <button
    type="submit"
    className="w-full bg-teal-500 hover:bg-teal-600 py-2 rounded-md font-medium flex items-center justify-center gap-2"
  >
    <FaUserPlus /> Register
  </button>
</form>

          <p className="text-sm text-gray-400 mt-4 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-teal-400 hover:underline underline-offset-2"
            >
              Login
            </Link>
          </p>
        </div>

        {/* Side Content */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Discover AURA's Emotional AI
          </h1>
          <p className="text-gray-300 mb-4">
            Let our smart system suggest movies based on how you feel.
          </p>
          <ul className="space-y-2">
            <li>🤖 <strong>Emotion Analysis:</strong> AI that understands your vibe</li>
            <li>📽️ <strong>Smart Movie Picks:</strong> Match your mood with the perfect film</li>
          </ul>
        </div>
      </div>
    </div>

 <Footer/>
    </>
  );
};

export default Register;

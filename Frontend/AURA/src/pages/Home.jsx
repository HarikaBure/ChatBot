import React, { useState } from 'react';
import Header from '../components/Header';
import { Bot, UserCircle2 } from 'lucide-react';
import FeaturesSection from '../components/Features';
import Footer from '../components/Footer';
import Main from '../components/Main';
function Home() {
  
  return (

    <>
    <div
      className="min-h-screen flex flex-col items-center justify-start p-4 relative bg-gradient-to-br from-[#041d1f] via-[#045c59] to-[#0a8476]"
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a111d] to-[#0b2831] z-0"
      
      
      
      
      />

      {/* Header - Full Width */}
      <div className="w-full z-10 ">
        <Header />
      </div>

      {/* Main Content */}
     <Main/>
    <FeaturesSection/>
 
    
    
    </div>
   
    <Footer/>
    </>
  );
}

export default Home;

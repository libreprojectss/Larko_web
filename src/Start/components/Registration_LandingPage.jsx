import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Registration_LandingPage() {
  
  return (
    <div className="h-screen w-screen">
      <nav className="flex justify-around items-center w-screen py-6">
        <div className="flex justify-between cursor-pointer">
          <img src="/vite.svg" alt="Not available" />
          <span className="font-bold text-4xl ml-4">Larko</span>
        </div>
        <div>
          Have an account?  <Link to="/login" className='text-[#4100FA] hover:underline'>  Sign in </Link>
        </div>
      </nav>
      <main className="flex flex-col items-center justify-around h-[70vh] pt-10">
        
      </main>
    </div>
  )
}
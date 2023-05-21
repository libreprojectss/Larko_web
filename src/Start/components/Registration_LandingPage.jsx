import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Registration_LandingPage() {

  return (
    <div className="h-screen w-screen">
      <nav className="flex justify-between items-center w-screen py-6 px-24">
        <div className="flex justify-between cursor-pointer">
          <img src="/vite.svg" alt="Not available" />
          <span className="font-bold text-4xl ml-4">Larko</span>
        </div>
        <div>
          Have an account?  <Link to="/login" className='text-[#4100FA] hover:underline'>  Sign in </Link>
        </div>
      </nav>
      <main className="flex justify-around pt-10 h-[85vh]">
        <div className="h-full w-1/3 flex flex-col justify-evenly">
          <p className="text-4xl font-bold">Welcome to Larko</p>
          <p className="text-2xl font-semibold">CONNECTING PEOPLE TO SERVICES</p>
          <p className="text-xl font-medium">
            We help our clients create truly excellent customer and employee experiences
            <p>
              as well as smoother, more efficient operations -  every day and all around the world.
            </p>
          </p>
          <div className="text-xl font-medium">
            <p className="font-bold text-2xl pb-2">Features:</p>
            <ul className="list-disc ml-10">
              <li>let customers join from anywhere</li>
              <li>Customize Services and Resources</li>
              <li>Data Analytics and Report Genarations</li>
              <li>Realtime</li>
              <li>Queue Automation</li>
            </ul>
          </div>
          <div className="text-xl font-medium">
            <p className="mb-4">
              Why to wait? Just plung into our product and feel the differences.
            </p>
            <p>
              <Link to='/signup' className='bg-[#4100FA] text-white font-bold rounded-xl p-2 hover:bg-blue-700'>Let's Go</Link>
            </p>
          </div>
        </div>
        <div className="h-full w-[40%] bg-slate-100 rounded-xl shadow-md">

        </div>

      </main>
    </div>
  )
}
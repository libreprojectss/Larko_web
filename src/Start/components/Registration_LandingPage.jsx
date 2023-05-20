import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Registration_LandingPage() {
  const category = [
    { title: 'Setup a waitlist', desc: 'let my clients wait from anywhere.', image:'a.png'},
    { title: 'Schedule appointments', desc: 'let my clients schedule in advance.',image:'a.png' },
    { title: 'Both', desc: 'let my clients do both.',image:'a.png' },
  ]
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
      <hr className="w-full"/>
      <main className="flex flex-col items-center justify-around h-[70vh] pt-10">
        <p className="font-extrabold text-5xl">How would you like to use Larko?</p>
        <p className="text-2xl">No credit card required.</p>
        <p className="h-[2vh]"></p>
        <div className="grid grid-cols-3 gap-8">
          {
            category.map((item, index) => {
              return (
                <div key={index} className='p-5 rounded-xl h-[45vh] w-[18vw] flex flex-col justify-between drop-shadow-xl bg-[#fffffff4] hover:scale-110  hover:bg-amber-400 duration-100 transition-all hover:border-none bg'>
                  <div className="h-1/3 flex flex-col justify-between">
                    <p className="text-2xl font-extrabold">{item.title}</p>
                    <p className="text-xl">{item.desc}</p>
                  </div>
                  <div>
                    <img src="a.svg" alt="" className="h-[5vh] rounded-full drop-shadow-md bg-slate-200 p-2"/>
                  </div>
                </div>
              )
            })
          }
        </div>
      </main>
    </div>
  )
}
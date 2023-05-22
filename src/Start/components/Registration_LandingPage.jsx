import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SiBandrautomation, BiCustomize } from 'react-icons/all'
import { HiOutlineUserGroup } from 'react-icons/hi'
export default function Registration_LandingPage() {

  return (
    <>
      <div className="">
        <nav className="flex justify-between items-center w-screen py-6 px-24">
          <div className="flex justify-between cursor-pointer">
            <img src="/vite.svg" alt="Not available" />
            <span className="font-bold text-4xl ml-4">Larko</span>
          </div>
          <div>
            Have an account?  <Link to="/login" className='text-[#4100FA] hover:underline'>  Sign in </Link>
          </div>
        </nav>
        <main className="flex flex-col pt-10 h-full w-[80vw] mx-auto">
          <div className="flex flex-col justify-center">
            <div className="flex justify-center flex-col text-center space-y-4">
              <p className="text-6xl font-bold">Welcome to <space className='text-blue-700 font-bold'> Larko</space></p>
              <p className="text-2xl font-semibold"><span className="text-blue-600">CONNECTING</span> PEOPLE TO SERVICES</p>
              <p className="text-xl font-medium">
                We help our clients create truly excellent customer and employee experiences
                <p>
                  as well as smoother, more efficient operations -  every day and all around the world.
                </p>
              </p>

            </div>
            <div className="h-[60vh] w-[60vw]  mx-auto bg-slate-100 rounded-xl shadow-md my-8">
              video
            </div>
          </div>
          <div className="flex justify-center font-bold text-2xl  my-8">
            <h1 className="text-gray-800">Our Features</h1>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className='flex flex-col space-y-1 justify-center items-center bg-slate-100  rounded-xl shadow-lg mt-7 p-8 h-[40vh] hover:bg-blue-500  cursor-pointer  text-gray-500 hover:text-white'>
              
              <HiOutlineUserGroup
                size='80'
                className="hover:text-white"
              />
              <h1 className="text-center font-bold text-2xl ">Join Queue From anywhere</h1>
            </div>

            <div className='flex flex-col space-y-1 justify-center items-center bg-slate-100  rounded-xl shadow-lg mt-7 p-8 h-[40vh] hover:bg-blue-500 cursor-pointer text-gray-500 hover:text-white'>
              <BiCustomize
                size='80'
                className="hover:text-white"
              />
              <h1 className="text-center font-bold text-2xl ">Customize Services and Resources</h1>
            </div>
     
            <div className='flex flex-col justify-center items-center bg-slate-100  rounded-xl shadow-lg mt-7 p-8 h-[40vh] hover:bg-blue-500  cursor-pointer text-gray-500 hover:text-white'>
              <SiBandrautomation
                size='80'
                className="hover:text-white"
              />
              <h1 className="text-center font-bold text-2xl ">Queue Automation and Real Time Queue</h1>
            </div>
          </div>

          <div className="text-xl font-medium mt-12 flex justify-center items-center space-x-3 mb-8">
            <p className="p-4">
              Why to wait? Just plung into our product and feel the differences.
            </p>
            <p className="p-4">
              <Link to='/signup' className='bg-blue-600 text-white font-bold rounded-xl p-2 hover:bg-blue-700'>Let's Go</Link>
            </p>
          </div>
        </main>
      </div>
      <footer className="text-center">
        <p className="font-medium">Powered by Larko</p>
      </footer>
    </>
  )
}
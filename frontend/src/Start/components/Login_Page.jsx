import React from "react";
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { StoreToken } from "../../context/Localstorage";

export default function Login_Page() {
  const navigate = useNavigate();
  const [errors, seterrors] = useState({});
  
  const handle_submit = (event) => {
    event.preventDefault();
    const formdata = new FormData(event.target)
    axios.post('http://localhost:8000/api/user/login/', formdata)
      .then((resp) => {
        if (resp.data.errors) {
          seterrors(resp.data.errors)
        }
        else {
          console.log(resp);
          StoreToken(resp.data.token);
          window.location.reload(true);
        }
      })
      .catch((err) => {
        console.log(err.response.data.errors);
        seterrors(err.response.data.errors)
      }
      )

  }
  return (
    <div className="w-screen h-screen">
      <nav className="flex justify-around items-center w-screen py-6">
        <div className="flex justify-between cursor-pointer" onClick={()=>{navigate('/')}}>
          <img src="/vite.svg" alt="Not available" />
          <span className="font-bold text-4xl ml-4" >Larko</span>
        </div>
        <div>
          New around here? <Link to='/signup' className="hover:underline hover:underline-offset-2 text-[#4100FA]">Sign up</Link>
        </div>
      </nav>
      <main className="w-[28%] mx-auto flex flex-col items-center">
        <p className="font-extrabold text-4xl mb-10 mt-4">Log in to your account</p>
        <form className="flex flex-col justify-around w-9/12" onSubmit={handle_submit}>
          <label htmlFor="email" className="font-bold mt-3">Email</label>
          <input type="email" name="email" id="email" placeholder="Email" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />
          <div className="text-red-600 text-sm" >{errors ? errors.email ? errors.email : '' : ''}</div>
          <div className="flex justify-between mt-3">
            <label htmlFor="password" className="font-bold ">Password</label>
            <a href="#" className="text-[#4100FA] hover:underline hover:underline-offset-2">Forgot your password?</a>
          </div>
          <input type="password" name="password" id="password" placeholder="Password" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />
          <div className="text-red-600 text-sm">{errors ? errors.password ? errors.password : '' : ''}</div>
          <button type="submit" className="py-3 bg-[#4100FA] rounded-xl text-white font-bold  mt-5">Log in</button>
        </form>
      </main>
    </div>
  )
}

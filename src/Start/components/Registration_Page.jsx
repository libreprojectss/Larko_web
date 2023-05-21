import React, { useContext } from 'react'
import { useState } from "react";
import axios from 'axios';
import { Link, useNavigate, } from "react-router-dom";
import { StoreToken } from '../../context/Localstorage';
import { GetTkn, StoreTkn } from '../../context/Localstg';

export default function Registration_Page() {
  const navigate = useNavigate()
  const [errors, seterrors] = useState({});

  const handle_submit = (event) => {
    event.preventDefault();
    const formdata = new FormData(event.target)

    axios.post('http://localhost:8000/api/user/signup/', formdata)
      .then((resp) => {
        if (resp.data.errors) {
          console.log(resp.response)
          seterrors(resp.data.errors)
        }
        else {
          console.log(resp);
          StoreToken(resp.data.token);
          StoreTkn();
          navigate('/lastform')
        }
      })
      .catch((err) => {
        console.log(err.response.data.errors);
        seterrors(err.response.data.errors)
      }
      )
  }
  return (
    <div className='flex w-screen h-screen'>
      <div className='h-screen w-[72%] shadow-2xl'>
        <nav className="py-6 ml-[5vw]">
          <div className="cursor-pointer flex" onClick={() => { navigate('/') }}>
            <img src="/vite.svg" alt="Not available" />
            <span className="font-bold text-4xl ml-4">Larko</span>
          </div>
        </nav>
        <div className='ml-[5vw] h-[40vh] flex flex-col justify-around mt-[15vh]'>
          <div className='font-extrabold text-6xl'>
            <p>
              Just a few
            </p>
            <p >
              more steps!
            </p>
          </div>
          <div className='text-semibold text-slate-800 text-2xl'>
            <p>
              Create a way for clients to schedule
            </p>
            <p>
              appointments or join your online waitlist.
            </p>
          </div>
          <div className='text-semibold text-slate-800 text-2xl'>
            <p>

            </p>
          </div>
        </div>
      </div>
      <div className='h-screen flex flex-col justify-around items-center w-[28%] mt-8'>
        <div>
          Already have an account?<Link to="/login" className='text-[#4100FA] hover:underline'>  Sign in </Link>
        </div>
        <div className='w-full flex justify-center items-center'>
          <form className="flex flex-col justify-around w-9/12" onSubmit={handle_submit}>
            <label htmlFor="first_name" className="font-bold  mt-10">First name</label>
            <input type="text" name="first_name" id="first_name" placeholder="First name" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />
            <div className="text-red-600 text-sm">{errors ? errors.first_name ? errors.first_name : '' : ''}</div>
            <label htmlFor="last_name" className="font-bold  mt-3">Last name</label>
            <input type="text" name="last_name" id="last_name" placeholder="Last name" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />
            <div className="text-red-600 text-sm">{errors ? errors.last_name ? errors.last_name : '' : ''}</div>
            <label htmlFor="email" className="font-bold  mt-3">Work email</label>
            <input type="email" name="email" id="email" placeholder="Email" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />
            <div className="text-red-600 text-sm">{errors ? errors.email ? errors.email : '' : ''}</div>
            <div className="flex justify-between mt-3">
              <label htmlFor="password" className="font-bold">Password</label>
            </div>
            <input type="password" name="password" id="password" placeholder="Password" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />
            <div className="text-red-600 text-sm">{errors ? errors.password ? errors.password : '' : ''}</div>
            <div className="flex justify-between mt-3">
              <label htmlFor="password" className="font-bold">Confirm password</label>
            </div>
            <input type="password" name="password_confirm" id="password_confirm" placeholder="Confirm password" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />
            <div className="text-red-600 text-sm">{errors ? errors.password_confirm
              ? errors.password_confirm : '' : ''}
              {errors ? errors.non_field_errors ? errors.non_field_errors : "" : ""}
            </div>
            <button type="submit" className="py-3 bg-[#4100FA] rounded-xl text-white font-bold mt-5">Create account</button>
          </form>
        </div>
        <div className='h-[15vh]'>

        </div>
      </div>
    </div>
  )
}


import React, { useState } from 'react'
import Side from '../components/Side'
import Nav from '../components/Nav'
import SettingSidebar from '../../components/SettingSidebar'
import Resizer from "react-image-file-resizer";
import { AiOutlineCamera } from 'react-icons/ai';
import axios from 'axios';
import { GetToken } from '../../context/Localstorage';

function Component() {
  const [image, setImage] = useState(null);

  const handleChange = (event) => {
    const file = event.target.files[0];
    Resizer.imageFileResizer(
      file,
      500, // max width
      100, // max height
      "JPEG", // format
      100, // quality
      0, // rotation
      (uri) => {
        setImage(uri); // set the resized image uri to state
      },
      "base64" // output type
    );
  };

  const [errors, seterrors] = useState({});
  const { access } = GetToken();
  const [success, setsuccess] = useState('')

  const handle_submit = (event) => {
    event.preventDefault();
    const formdata = new FormData(event.target)

    axios.post('http://localhost:8000/api/customer/services/', formdata, {
      "headers": {
        "Content-Type": "multipart/form-data",
        "authorization": `Bearer ${access}`
      }
    })
      .then((resp) => {
        if (resp.data.errors) {
          console.log(resp.response)
          seterrors(resp.data.errors)
        }
        else {
          console.log(resp);
          seterrors({})
          setsuccess("Service Added Successfully")
          event.target.reset()
          setImage('')
        }
      })
      .catch((err) => {
        console.log(err.response.data.errors);
        seterrors(err.response.data.errors)
      }
      )
  }
  function display() {
    return success
  }


  return (
    <div className='my-20  w-[70vw] absolute right-0 ml-6'>
      <div className="px-4 py-2.5 bg-white mx-3 ">
        <div>
          <h1 className="text-3xl font-bold text-gray-700 text-center my-4 py-2">Services</h1>
          <p className='text-center text-green-500'>
            {success ? success : ''}
          </p>

          <div className='flex justify-center items-center w-[50vw] ml-[8.5vw]'>
            <form className="flex flex-col justify-around w-[78%]" onSubmit={handle_submit}>
              <div className='w-full flex justify-between'>
                <div className='flex flex-col w-[70%]'>
                  <label htmlFor="service_name" className="font-bold mt-3 ">Service Name *</label>
                  <input type="text" name="service_name" id="service_name" placeholder="Service Name" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />
                  <div className="text-red-600 text-sm">{errors ? errors.service_name ? errors.service_name : '' : ''}</div>
                  <label htmlFor="category_name" className="font-bold mt-3">Category *</label>
                  <input type="text" name="category_name" id="category_name" placeholder="Category" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />
                  <div className="text-red-600 text-sm">{errors ? errors.category_name ? errors.category_name : '' : ''}</div>
                </div>
                <div>
                  {
                    !image ?
                      <div className='h-[75%]'>
                        <p className='mt-3 font-bold text-center'>
                          Click to Upload Image
                        </p>
                        <div className='h-full border-2 border-dashed border-slate-300 rounded-xl mt-2'>
                          <label htmlFor="image" className='h-full flex justify-center items-center hover:cursor-pointer'>
                            {/* <p className='font-bold'>Click Here</p> */}
                            <AiOutlineCamera size="6em" />
                          </label>
                          <input type="file" accept="image/*" name="image" id="image" onChange={handleChange} hidden />
                        </div>
                      </div>
                      :
                      <div className='h-[75%]'>
                        <p className='mt-3 font-bold text-center'>
                          Click to Change Image
                        </p>
                        <div className='h-full border-2 border-dashed border-slate-300 rounded-xl mt-2'>
                          <label htmlFor="image" className='text-center h-full flex justify-center items-center hover:cursor-pointer p-5'>
                            <img src={image} className='rounded-xl' />
                          </label>
                          <input type="file" accept="image/*" name="image" id="image" onChange={handleChange} hidden />
                        </div>
                      </div>
                  }
                </div>
              </div>
              {/* {file && <img src={file} alt="Preview" />} */}
              <label htmlFor="description" className="font-bold mt-3">Description *</label>
              <input type="text" name="description" id="description" placeholder="Description" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />
              <div className="text-red-600 text-sm">{errors ? errors.description ? errors.description : '' : ''}</div>
              <div className='flex w-full justify-between mt-3'>
                <div className='flex flex-col w-[45%]'>
                  <label htmlFor="duration" className="font-bold ">Duration (In Minutes)</label>
                  <input type="text" name="duration" id="duration" placeholder="Duration" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />
                  <div className="text-red-600 text-sm">{errors ? errors.duration ? errors.duration : '' : ''}</div>
                </div>
                <div className='flex flex-col w-[45%]'>
                  <label htmlFor="price" className="font-bold ">Price (In NRP)</label>
                  <input type="price" name="price" id="price" placeholder="Price" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />
                  <div className="text-red-600 text-sm">{errors ? errors.price ? errors.price : '' : ''}</div>
                </div>
              </div>
              <label htmlFor="buffer_time" className="font-bold mt-3">Buffer Time (In Minutes)</label>
              <input type="text" name="buffer_time" id="buffer_time" placeholder="Buffer Time" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />
              <div className="text-red-600 text-sm">{errors ? errors.buffer_time ? errors.buffer_time : '' : ''}</div>
              <button type="submit" className="py-3 bg-[#4100FA] rounded-xl text-white font-bold  mt-5">Add</button>
            </form>
          </div>

        </div>
      </div>

    </div>
  )
}

function Servicessetting() {
  return (
    <div className='flex'>
      <div className='w-1/8 h-[100vh] fixed z-20'>
        <Side />
      </div>

      <section className='w-full flex flex-col '>
        <div className='w-full fixed top-0 left-50 right-0 z-10'>
          <Nav />
        </div>
        <div className="flex">
          <div className="fixed top-0 left-40 right-0 max-w-[180px] h-full">
            <SettingSidebar />
          </div>
          <Component />
        </div>
      </section>

    </div>
  )
}

export default Servicessetting;
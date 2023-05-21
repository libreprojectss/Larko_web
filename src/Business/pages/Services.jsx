import React, { useState } from 'react'
import Nav from '../components/Nav'
import Side from '../components/Side'
import { useEffect } from 'react'
import axios from 'axios'
import { GetToken } from '../../context/Localstorage'
import Resizer from "react-image-file-resizer";
import { AiOutlineCamera } from 'react-icons/ai';
import { AiFillBell, BsFillCheckCircleFill, BsThreeDots, BiMoveVertical, AiFillDelete, BsFillPersonFill, CiTimer } from 'react-icons/all'
import { useNavigate } from 'react-router-dom'
import { DeleteToken } from '../../context/Localstorage'
import jwt_decode from "jwt-decode";

function Services() {
    const [toggle, setToggle] = useState(false);
    const { access, refresh } = GetToken()
    const [data, setdata] = useState([]);
    const [errors, seterrors] = useState({});
    const [editon, setediton] = useState(false)
    const [delton, setdelton] = useState(false)
    const [id, setid] = useState(0);
    const [image, setImage] = useState(null);
    const [change, setchange] = useState(false);
    const [fetch, setfetch] = useState({});
    const navigate = useNavigate()

    console.log('Services')

    function validity() {
        axios.post('http://localhost:8000/api/user/token/verify/', { token: access })
            .then((resp) => {
                if (resp) {
                    if (Object.keys(resp.data).length === 0) {
                        console.log('Verification Successful')
                    }
                    else {
                        console.log('Verification Failed')
                    }
                }
            })
            .catch((err) => {
                console.log(err.response.data.detail);
                console.log(err.response.data.code);
                console.log("Bye")
                DeleteToken();
                navigate('/login')
            }
            )
    }

    function refresh_token() {
        axios.post('http://localhost:8000/api/user/token/update/', { refresh: refresh })
            .then((resp) => {
                console.log(resp.data.access)
                localStorage.setItem('access_token', resp.data.access)
            })
            .catch((err) => {
                console.log(err);
            }
            )

    }

    function refresh_regular() {
        let decoded = jwt_decode(access);
        let currenttime = ~~(new Date().getTime() / 1000)
        console.log(currenttime)
        if (currenttime + 300 > decoded.exp) {
            console.log('hello')
            validity()
            refresh_token()
        }
    }

    // setInterval(() => {
    //     refresh_regular()
    // }, 5000);

    useEffect(() => {
        axios.get('http://localhost:8000/api/customer/services/', {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((resp) => {

                console.log(resp.data)

                setdata(resp.data)
            }
            )
            .catch((err) => {
                console.log(err)
            }
            )
    }, [change])

    function editwow(e) {
        setid(e.target.parentNode.id)
        // console.log(e.target.parentNode.children[0].innerText,e.target.parentNode.children[1].innerText)
        fetch.buffer_time = e.target.parentNode.children[0].innerText
        fetch.category_name = e.target.parentNode.children[1].innerText
        fetch.description = e.target.parentNode.children[2].innerText
        fetch.duration = e.target.parentNode.children[3].innerText
        setImage(e.target.parentNode.children[4].src)
        fetch.price = e.target.parentNode.children[5].innerText
        fetch.service_name = e.target.parentNode.children[6].innerText
        // console.log(id);
        setediton(true)
        setdelton(false)
        // console.log(editon);
    }
    function delwow(e) {
        setid(e.target.parentNode.id)
        // console.log(id)
        setdelton(true)
        setediton(false)
        // console.log(delton);
    }

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
    function handlesubmit(e) {
        e.preventDefault();
        validity()
        const formdata = new FormData(e.target);
        // for (const key of formdata.keys()) {
        //     console.log(key);
        // }
        console.log('hello')
        // console.log(formdata.getAll('services'));
        axios.put(`http://localhost:8000/api/customer/services/${id}/`, formdata, {
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
                    e.target.reset()
                    setImage('')
                    setediton(false)
                    setchange(!change)
                }
            })
            .catch((err) => {
                console.log(err.response.data.errors);
                seterrors(err.response.data.errors)
            }
            )
    }

    function handsdown(e) {
        e.preventDefault();
        validity()
        // for (const key of formdata.keys()) {
        //     console.log(key);
        // }
        console.log('hello')
        // console.log(formdata.getAll('services'));
        axios.delete(`http://localhost:8000/api/customer/services/${id}/`, {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((resp) => {
                console.log(resp.data)
                setdelton(false)
                setchange(!change)
            }
            )
            .catch((err) => {
                console.log(err)
            }
            )

    }

    const handle_change = (e) => {
        const newdata = { ...fetch };
        newdata[e.target.id] = e.target.value;
        setfetch(newdata);
    }



    return (
        <div className='h-full w-full'>
            <div className='flex relative'>
                <div className='w-1/8 h-[100vh] fixed z-10'>
                    <Side />
                </div>
                <section className='w-full flex flex-col '>
                    <div className='w-full fixed top-0 left-50 right-0'>
                        <Nav />
                    </div>
                    <div className='mt-20 flex w-full justify-center'>
                        <div className="px-6 py-2.5 text-gray-500 font-medium text-xs leading-tight uppercase rounded-md  mx-2 flex  justify-center items-center space-x-1">
                        </div>

                    </div>
                    <div className='h-full flex flex-col justify-start '>


                        <div className='mt-4 h-[90vh] ml-[20vw] mr-[5vw]'>
                            <div className="grid lg:grid-cols-3 gap-4 mx-auto">
                                {
                                    data.map((value, index) => {
                                        return (
                                            <div key={index} className='flex justify-between items-center border bg-slate-100 shadow-md rounded-xl h-[25vh] pl-4'>
                                                <img src={'http://127.0.0.1:8000' + value.image} alt="No Image" className='h-24 w-24 rounded-full' />
                                                <div className='mx-2 flex flex-col '>
                                                    <div className='flex justify-start items-center space-x-2'>
                                                        <div className='bg-black w-3 h-3 rounded-full'></div>
                                                        <h1 className='font-semibold text-lg text-gray-700'>{value.service_name}</h1>
                                                    </div>
                                                    <div className='flex flex-col'>

                                                        <p className='font-semibold text-lg text-gray-700'>{value.category_name}</p>
                                                        <div className=''>{value.description}</div>
                                                        <div className='flex  space-x-2 text-gray-500'>
                                                            <p>{value.serving} Serving</p>
                                                            <p>{value.waiting} Waiting</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='flex flex-col justify-between h-full relative' id={value.id}>
                                                    <div className='hidden'>{value.buffer_time}</div>
                                                    <div className='hidden'>{value.category_name}</div>
                                                    <div className='hidden'>{value.description}</div>
                                                    <div className='hidden'>{value.duration}</div>
                                                    <img src={'http://127.0.0.1:8000' + value.image} alt="No Image" className='hidden' />
                                                    <div className='hidden'>{value.price}</div>
                                                    <div className='hidden'>{value.service_name}</div>
                                                    <button className='px-2 py-2 rounded-bl-xl rounded-tr-xl bg-blue-500 text-white' onClick={editwow}>Edit</button>
                                                    <button className='px-2 py-2 rounded-tl-xl rounded-br-xl bg-red-500 text-white mt-2' onClick={delwow}>Delete</button>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                <div className='w-[80vw] flex items-center pl-[15vw]'>
                                    {
                                        editon ?
                                            <form className='w-[78%]' onSubmit={handlesubmit}>
                                                {
                                                    data.map((value, index) => {
                                                        if (value.id == id) {

                                                            return (
                                                                <div key={index} className='flex flex-col justify-around w-full'>
                                                                    <div className='w-full flex justify-between'>
                                                                        <div className='flex flex-col w-[70%]'>
                                                                            <label htmlFor="service_name" className="font-bold mt-3 ">Service Name *</label>
                                                                            <input type="text" name="service_name" id="service_name" placeholder="Service Name" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" value={fetch.service_name} onChange={handle_change} />
                                                                            <div className="text-red-600 text-sm">{errors ? errors.service_name ? errors.service_name : '' : ''}</div>
                                                                            <label htmlFor="category_name" className="font-bold mt-3">Category *</label>
                                                                            <input type="text" name="category_name" id="category_name" placeholder="Category" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" value={fetch.category_name} onChange={handle_change} />
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
                                                                                                <img src={image} className='rounded-xl object-cover' height={110} width={150} alt='Image Not Uploaded Yet' />
                                                                                            </label>
                                                                                            <input type="file" accept="image/*" name="image" id="image" onChange={handleChange} hidden />
                                                                                        </div>
                                                                                    </div>
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    {/* {file && <img src={file} alt="Preview" />} */}
                                                                    <label htmlFor="description" className="font-bold mt-3 ">Description *</label>
                                                                    <input type="text" name="description" id="description" placeholder="Description" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" value={fetch.description} onChange={handle_change} />
                                                                    <div className="text-red-600 text-sm">{errors ? errors.description ? errors.description : '' : ''}</div>
                                                                    <div className='flex w-full justify-between mt-3'>
                                                                        <div className='flex flex-col w-[45%]'>
                                                                            <label htmlFor="duration" className="font-bold ">Duration (In Minutes)</label>
                                                                            <input type="text" name="duration" id="duration" placeholder="Duration" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" value={fetch.duration} onChange={handle_change} />
                                                                            <div className="text-red-600 text-sm">{errors ? errors.duration ? errors.duration : '' : ''}</div>
                                                                        </div>
                                                                        <div className='flex flex-col w-[45%]'>
                                                                            <label htmlFor="price" className="font-bold ">Price (In NRP)</label>
                                                                            <input type="price" name="price" id="price" placeholder="Price" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" value={fetch.price} onChange={handle_change} />
                                                                            <div className="text-red-600 text-sm">{errors ? errors.price ? errors.price : '' : ''}</div>
                                                                        </div>
                                                                    </div>
                                                                    <label htmlFor="buffer_time" className="font-bold mt-3">Buffer Time (In Minutes)</label>
                                                                    <input type="text" name="buffer_time" id="buffer_time" placeholder="Buffer Time" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" value={fetch.buffer_time} onChange={handle_change} />
                                                                    <div className="text-red-600 text-sm">{errors ? errors.buffer_time ? errors.buffer_time : '' : ''}</div>

                                                                    <button type="submit" className='py-3 bg-[#4100FA] rounded-3xl text-white font-bold  mt-5 w-full'>Confirm</button>
                                                                </div>

                                                            )
                                                        }
                                                    })
                                                }
                                            </form>
                                            :
                                            <div>

                                            </div>

                                    }
                                    {
                                        delton ?
                                            <form className='w-[80%]' onSubmit={handsdown}>
                                                <p className='text-center font-bold text-red-500'>Are you Sure to Delete?</p>
                                                <input type="text" name="id" id="id" value={id} className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2 w-full" />
                                                <button type="submit" className="py-3 bg-[#4100FA] rounded-3xl text-white font-bold  mt-5 w-full">Confirm</button>
                                            </form>
                                            :
                                            <div>

                                            </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                </section>

            </div>
        </div>
    )
}

export default Services;
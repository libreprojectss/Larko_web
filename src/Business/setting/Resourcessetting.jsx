import React, { useState } from 'react'
import Side from '../components/Side'
import Nav from '../components/Nav'
import SettingSidebar from '../../components/SettingSidebar'
import { GetToken } from '../../context/Localstorage'
import { useEffect } from 'react'
import Resizer from "react-image-file-resizer";
import { AiOutlineCamera } from 'react-icons/ai';
import axios from 'axios'

function Component() {
    const { access } = GetToken();
    const [data, setdata] = useState([]);
    const [adata, setadata] = useState([]);
    const [add, setadd] = useState(true);


    useEffect(() => {
        axios.get('http://localhost:8000/api/customer/services/', {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((resp) => {
                // console.log(resp.data)
                setdata(resp.data)
            }
            )
            .catch((err) => {
                console.log(err)
            }
            )
    }, [])

    useEffect(() => {
        axios.get('http://localhost:8000/api/customer/resources/', {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((resp) => {
                // console.log(resp.data)
                setadata(resp.data)

            }
            )
            .catch((err) => {
                console.log(err)
            }
            )
    }, [])

    function handlesubmit(e) {
        e.preventDefault();
        const formdata = new FormData(e.target);
        // for (const key of formdata.keys()) {
        //     console.log(key);
        // }
        console.log(access)
        console.log(formdata.getAll('services'));
        axios.post('http://localhost:8000/api/customer/resources/', formdata, {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((resp) => {
                console.log(resp.data)
            }
            )
            .catch((err) => {
                console.log(err)
            }
            )
        e.target.reset();
        setImage('');
    }
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

    function addition() {
        setadd(true)
        console.log('in addition')
    }

    return (
        <div className='my-20  w-[70vw] absolute right-0 ml-6'>
            <div className="px-4 py-2.5 bg-whitemx-2 ">
                <div>
                    <div className=" my-4 py-2 px-[11%] flex ml-[21vw]">
                        <p className='text-3xl font-bold text-gray-700 text-center'>Resources</p>
                    </div>

                    {
                        add &&
                        <div className='flex justify-center items-center w-[50vw] ml-[8vw] mt-4'>

                            <form onSubmit={handlesubmit} className="flex flex-col justify-around w-[78%]">
                                <div className='w-full flex justify-between'>
                                    <div className='flex flex-col w-[70%]'>
                                        <label htmlFor="name" className="font-bold mt-3 ">Name *</label>
                                        <input type="text" name="name" id="name" placeholder="Name" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />

                                        <label htmlFor="description" className="font-bold mt-3">Description *</label>
                                        <input type="text" name="description" id="description" placeholder="Description" className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />

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
                                <div className=''>
                                    <p className='font-bold mt-3'>Services</p>
                                    <div className='pt-5 pl-5'>
                                        {
                                            data.map((value, index) => {
                                                return (
                                                    <p key={index}>
                                                        <input type="checkbox" id={value.service_name} name='services' defaultChecked={false} value={value
                                                            .id} className='scale-[150%]' />
                                                        <label htmlFor={value
                                                            .service_name} className='pl-3 font-bold'>{value.service_name}</label><br></br>
                                                    </p>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                                <button type="submit" className="py-3 bg-[#4100FA] rounded-xl text-white font-bold  mt-5">Add</button>
                            </form>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

function Resourcessetting() {
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

export default Resourcessetting
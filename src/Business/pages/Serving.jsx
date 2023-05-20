import React, { useState } from 'react'
import Nav from '../components/Nav'
import Side from '../components/Side'
import { AiFillBell, BsFillCheckCircleFill, BsThreeDots, BiMoveVertical, AiFillDelete, BsFillPersonFill, CiTimer } from 'react-icons/all'
import { useEffect } from 'react'
import { GetToken } from '../../context/Localstorage'
import axios from 'axios'
import jwt_decode from "jwt-decode";

function Serving() {
    const [toggle, setToggle] = useState(false);
    const [data, setdata] = useState([]);
    const { access, refresh } = GetToken();
    const [change, setchange] = useState(false);

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
        axios.get('http://localhost:8000/api/customer/serving/', {
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

    const served = (id) => {
        validity()
        axios.post(`http://localhost:8000/api/customer/served/${id}/`, 1, {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((resp) => {
                console.log(resp.data)
                setchange(!change)
            }
            )
            .catch((err) => {
                console.log(err)
            }
            )
    }
    return (
        <div className='flex'>
            <div className='w-1/8 h-[100vh] fixed z-10'>
                <Side />
            </div>
            <section className='w-full flex flex-col ' onClick={() => {
                toggle && setToggle(false);
            }}>
                <div className='w-full fixed top-0 left-50 right-0'>
                    <Nav />
                </div>
                <div className='mt-20 flex w-full justify-center ml-[5vw]'>
                    <div className="px-2 py-3 w-[7%] text-teal-500 font-medium text-xs leading-tight rounded-xl  shadow-md bg-slate-100 mx-2 flex justify-around items-center space-x-1"> <BsFillPersonFill size='20' /><p className=''>1 </p></div>
                </div>
                <div className='h-full mt-4 flex flex-col justify-start '>

                    <div className=' overflow-y-auto h-[90vh] ml-[20vw] mr-[5vw]'>
                        <table className="w-full ">
                            <thead className="text-sm text-gray-500 font-thin  bg-white ">
                                <tr className='bg-slate-100'>
                                    <th scope="col" className="pl-4 py-4 text-left w-[6%]">
                                        SN
                                    </th>
                                    <th scope="col" className="text-left w-[20%]">
                                        Name
                                    </th>
                                    <th scope="col" className="text-left w-[19%]">
                                        Counter
                                    </th>
                                    <th scope="col" className="text-left w-[20%]">
                                        Service
                                    </th>
                                    <th scope="col" className="text-left w-[20%]">
                                        Served
                                    </th>
                                    <th scope="col" className="text-left w-[20%]">
                                        Action
                                    </th>

                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data.map((value, index) => {
                                        return (
                                            <tr className=" odd:bg-white even:bg-slate-100 text-xs " >
                                                <td className="tracking-tight pl-4 py-4 font-semibold text-gray-900">
                                                    {value.rank}
                                                </td>
                                                <td className="tracking-tight font-semibold text-gray-900">
                                                    {`${value.first_name + " " + value.last_name}`}
                                                </td>

                                                <td className="tracking-tight font-semibold text-gray-900">
                                                    Counter 45
                                                </td>
                                                <td className="font-semibold text-gray-900">
                                                    Presentation
                                                </td>
                                                <td className=" font-semibold text-gray-900 ">
                                                    5 min
                                                </td>
                                                <td className="py-4 font-semibold text-gray-900 ">

                                                    <BsFillCheckCircleFill size='20' color='green' style={{ marginRight: '12px', cursor: 'pointer' }} onClick={() => { served(value.id) }} />
                                                    <div className='relative'>

                                                        {
                                                            toggle && <div className='bg-white w-32 h-auto  absolute top-8 left-0 border shadow-sm rounded-lg'>
                                                                <div className='flex flex-col px-1 py-2 m-4 bg-transparent'>
                                                                    <div className='flex justify-start items-start'>
                                                                        <BiMoveVertical size='20' color='black' style={{ background: 'transparent' }} />
                                                                        <p className='text-md font-semibold ml-2'>Move</p>
                                                                    </div>
                                                                    <div className='flex  justify-start mt-2'>
                                                                        <AiFillDelete size='20' color='red' />
                                                                        <p className='text-md font-semibold ml-2'>Remove</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

        </div>
    )
}

export default Serving;
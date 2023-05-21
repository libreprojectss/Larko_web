import Nav from '../components/Nav'
import Side from '../components/Side'
import { AiFillBell, BsFillCheckCircleFill, BsThreeDots, AiOutlineEdit, AiFillDelete, BsFillPersonFill, CiTimer, BsFillPlusCircleFill } from 'react-icons/all'
import { Dialog, Transition } from '@headlessui/react'
import { toast } from 'react-toastify'
import Notifier from '../../components/Notifier'
import { Fragment, useState, useEffect, useRef } from 'react'
import axios from 'axios';
import { redirect, useNavigate } from 'react-router-dom'
import { GetToken } from '../../context/Localstorage'
import { fetchEventSource } from "@microsoft/fetch-event-source";
import jwt_decode from "jwt-decode";
import { SlArrowRightCircle } from "react-icons/sl";
import { FaRegDotCircle } from "react-icons/fa";

const { access, refresh } = GetToken();
const access_token = access;

function Waitlist() {
    const [toggle, setToggle] = useState(false);
    const [openForm, setForm] = useState(false);
    const [waitList, setWaitlist] = useState([]);
    const [per, setper] = useState(false)
    const [change, setchange] = useState(false)

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




    function toggleController() {
        setForm((pre) => !pre);
    }

    useEffect(() => {
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
    }, [])


    useEffect(() => {
        const socket = new WebSocket(`ws://127.0.0.1:8000/ws/waitlist/?access_token=${access}`); // Replace with your server URL

        // WebSocket event listeners
        socket.onopen = () => {
            console.log('WebSocket connection established');
        };

        socket.onmessage = (event) => {
            console.log('Received message:', event.data);
            setWaitlist(JSON.parse(event.data))
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        // Clean up WebSocket connection on component unmount
        return () => {
            socket.close();
        }
    }, [change])


    const complete = (id) => {
        validity()
        console.log(id)
        console.log(access_token)
        axios.post(`http://127.0.0.1:8000/api/customer/serving/${id}/`, 1, {
            "headers": {
                "authorization": `Bearer ${access_token}`
            }
        })
            .then((resp) => {
                console.log(resp)
                setper(!per)
                setchange(!change)
            }
            )
            .catch((err) => {
                console.log(err)
            }
            )
    }
    const notify = (id) => {
        validity()
        console.log(id)
        console.log(access_token)
        axios.get(`http://127.0.0.1:8000/api/customer/sendsms/${id}/`, {
            "headers": {
                "authorization": `Bearer ${access_token}`
            }
        })
            .then((resp) => {
                console.log(resp)
                setchange(!change)
            }
            )
            .catch((err) => {
                console.log(err)
            }
            )
    }
    const del = (id) => {
        validity()
        console.log(id)
        console.log(access_token)
        axios.delete(`http://127.0.0.1:8000/api/customer/waitlist/${id}/`, {
            "headers": {
                "authorization": `Bearer ${access_token}`
            }
        })
            .then((resp) => {
                console.log(resp)
                setchange(!change)
            }
            )
            .catch((err) => {
                console.log(err)
            }
            )
    }
    return (
        <>
            <Notifier />

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
                        <div className="px-2 py-3 w-[7%] text-teal-500 font-medium text-xs leading-tight rounded-xl  shadow-md bg-slate-100 mx-2 flex justify-around items-center space-x-1"> <BsFillPersonFill size='20' /><p className=''>{waitList.length + ``}</p></div>
                        <div className="px-2 py-3 w-[7%] text-teal-500 font-medium text-xs leading-tight uppercase rounded-xl shadow-md  bg-slate-100 mx-2 flex justify-around items-center space-x-1"><CiTimer size='20' /><p className='text-md'>5 min</p></div>
                    </div>
                    <div className='ml-[20vw] my-4'>
                        <div className='w-[74vw] flex flex-col  bg-slate-100 shadow-blue-100 shadow-md rounded-xl py-2 px-4 text-black'>
                            <h1 className='my-2 text-2xl font-bold text-center text-black'>Next in Queue</h1>
                            <div className='flex justify-between space-x-4 mt-2'>

                                <div >
                                    <p className='text-md font-bold text-start'>Rank</p>
                                    <p className='pt-1'>{waitList[0]?.rank || " "}</p>
                                </div>
                                <div>
                                    <p className='text-md font-bold text-start'>Name</p>
                                    <p className='pt-1'> {waitList[0]?.first_name || " "}{waitList[0]?.last_name || ""}</p>
                                </div>
                                <div>
                                    <p className='text-md font-bold'>Service</p>
                                    <p className='pt-1'>{waitList[0]?.service_name || " "}</p>
                                </div>
                                <div>
                                    <p className='text-md font-bold'>Phone Number</p>
                                    <p className='pt-1'>{waitList[0]?.phone_number || " "}</p>
                                </div>
                                <div>
                                    <p className='text-md font-bold'>Time Waited</p>
                                    <p className='pt-1'>{`${waitList[0]?.wait_time.split(/(\d)/)[1] || " "} days ${waitList[0]?.wait_time.split(/(\d)/)[3] || " "} min`}</p>
                                </div>
                                <div>
                                    <p className='text-md font-bold'>Actions</p>
                                    <div className='flex font-semibold text-gray-900 '>
                                        <div className='hover:bg-yellow-300 p-2 rounded-full'>
                                            <AiFillBell size='25' color='orange' style={{ cursor: 'pointer' }} onClick={() => { notify(waitList[0]?.id) }} />
                                        </div>
                                        <div className='hover:bg-green-300 p-2 rounded-full'>
                                            <BsFillCheckCircleFill size='25' color='green' style={{ cursor: 'pointer' }} onClick={() => { complete(waitList[0]?.id) }} />
                                        </div>
                                        <div className='hover:bg-blue-300 p-2 rounded-full'>
                                            <AiOutlineEdit size='25' color='blue' style={{ cursor: 'pointer' }} />
                                        </div>
                                        <div className='hover:bg-red-300 p-2 rounded-full'>
                                            <AiFillDelete size='25' color='red' style={{ cursor: 'pointer' }} onClick={() => { del(waitList[0]?.id) }} />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className='h-full mt-4 flex flex-col justify-start '>

                        <div className=' overflow-y-auto h-[90vh] ml-[20vw] mr-[5vw]'>
                            <table className="w-full">
                                <thead className="text-sm text-gray-500 font-thin  bg-white border-slate-400">
                                    <tr className='bg-slate-100'>
                                        <th scope="col" className="pl-4 py-4 text-left w-[6%]">
                                            Rank
                                        </th>
                                        <th scope="col" className="text-left w-[20%]">
                                            Name
                                        </th>

                                        <th scope="col" className="text-left  w-[20%]">
                                            Service
                                        </th>
                                        <th scope="col" className="text-left w-[19%]">
                                            Phone
                                        </th>
                                        <th scope="col" className="text-left  w-[15%]">
                                            Time waited
                                        </th>
                                        <th scope="col" className="text-left  w-[20%]">
                                            Actions
                                        </th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        waitList.length > 0 ? (
                                            waitList.map((person, index) => (
                                                <tr className="text-xs odd:bg-white even:bg-slate-100 " key={index} >
                                                    <td className="tracking-tight pl-4 py-4 text-left font-semibold text-gray-900">
                                                        {person.rank}
                                                    </td>
                                                    <td className={`tracking-tight flex   text-left font-semibold text-gray-900 ${person.validated ? "text-green-500 " : "text-red-500"}`}>
                                                        <div className='py-3 rounded-full'>
                                                            {
                                                                person.self_checkin ?
                                                                    <SlArrowRightCircle size='20' color='green' style={{ cursor: 'pointer' }} />
                                                                    :
                                                                    <FaRegDotCircle size='20' color='green' style={{ cursor: 'pointer' }} />
                                                            }
                                                        </div>
                                                        <div className='py-[1.75vh] pl-2'>
                                                            {`${person.first_name || "" + " " + person.last_name || ""}`}
                                                        </div>
                                                    </td>

                                                    <td className="tracking-tight text-left font-semibold text-gray-900">
                                                        {person.service_name || "-"}
                                                    </td>
                                                    <td className=" text-left font-semibold text-gray-900">
                                                        {person.phone_number || "-"}
                                                    </td>
                                                    <td className=" text-left font-semibold text-gray-900">
                                                        {person?.wait_time.split(/(\d)/)[1] + " " + "days " + person?.wait_time.split(/(\d)/)[3] + " " + "min"}
                                                    </td>

                                                    <td className="flex justify-start  font-semibold text-gray-900 ">
                                                        <div className=' py-3 rounded-full'>
                                                            <AiFillBell size='20' color='orange' style={{ cursor: 'pointer' }} onClick={() => { notify(person.id) }} />
                                                        </div>
                                                        <div className=' px-2 py-3 rounded-full'>
                                                            <BsFillCheckCircleFill size='18' color='green' style={{ cursor: 'pointer' }} onClick={() => { complete(person.id) }} />
                                                        </div>
                                                        <div className=' p-2  py-3 rounded-full'>
                                                            <AiOutlineEdit size='19' color='blue' style={{ cursor: 'pointer' }} />
                                                        </div>
                                                        <div className=' p-2 py-3 rounded-full'>
                                                            <AiFillDelete size='19' color='red' style={{ cursor: 'pointer' }} onClick={() => { del(person.id) }} />
                                                        </div>

                                                    </td>
                                                </tr>
                                            ))
                                        ) :
                                            <tr></tr>
                                    }

                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='absolute top-10 left-50 right-0'>
                        {
                            openForm && <MyModal passedFunction={toggleController} />
                        }
                    </div>

                    <div className='fixed bottom-10 left-50 right-10 '>
                        <BsFillPlusCircleFill
                            color='#4100FA'
                            size='45'
                            style={{ cursor: 'pointer' }}
                            onClick={toggleController}
                        />
                    </div>
                </section>

            </div>
        </>
    )
}

function MyModal({ passedFunction }) {
    const reDirect = useNavigate();
    const [selectedField, setSelectedField] = useState(
        { field_list: '', services: '' }
    );
    const [error, setError] = useState();
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



    const handleSubmit = (e) => {
        e.preventDefault();
        validity()
        const formdata = new FormData(e.target)
        axios.post('http://127.0.0.1:8000/api/customer/waitlist/', formdata, {
            "headers": {
                "authorization": `Bearer ${access_token}`
            }
        })
            .then((resp) => {
                console.log(resp)
                console.log(formdata)
            }
            )
            .catch((err) => {
                console.log(err.response.data.errors)
                setError(err.response.data.errors)
            }
            )
    }
    async function fetchData() {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/customer/getrequiredfields/', {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });
            setSelectedField(response.data)
            console.log(selectedField)

        } catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <Transition appear show={true} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={passedFunction}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 text-center mb-2"
                                    >
                                        Fill customer details
                                    </Dialog.Title>
                                    <div className="mt-1">
                                        <form onSubmit={handleSubmit}>
                                            {


                                                selectedField.field_list.length > 0 ? selectedField.field_list.map((field, index) => {

                                                    return (
                                                        <div className="mb-2" key={index}>
                                                            <label className="block mb-2 text-md font-medium text-gray-800 ">{field.required ? field.label + `${" *"}` : field.label}</label>
                                                            <input
                                                                type="text"
                                                                className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-1 w-full"
                                                                placeholder={`${field.label}`}
                                                                name={`${field.field_name}`}
                                                            />
                                                            <div className='text-red-600 text-sm'>

                                                            </div>
                                                        </div>
                                                    )
                                                }) : "loading..."

                                                // console.log(selectedField)
                                            }
                                            {
                                                <div>
                                                    <label htmlFor='services' className="block mb-2 text-md font-medium text-gray-800 ">Services</label>
                                                    <select name="service" id="service" className='bg-slate-200 text-gray-900 text-sm rounded-xl focus:outline-none  block w-full py-4 pl-2 '>
                                                        {
                                                            selectedField.services.length > 0 ? selectedField.services.map((field, index) => {
                                                                return (
                                                                    <option value={field.id} key={index}>{field.name}</option>
                                                                )
                                                            }) : "loading..."
                                                        }
                                                    </select>
                                                </div>
                                            }

                                            <div className='flex justify-between my-4 pt-4'>

                                                <button className="text-gray-700 font-bold bg-slate-200 text-md sm:w-auto px-8 py-3 text-center rounded-xl"
                                                    onClick={passedFunction}
                                                >Cancel</button>
                                                <button type="submit"
                                                    className="text-white bg-[#4100FA] hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-xl text-md  sm:w-auto px-10 py-3 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800"
                                                >Add</button>
                                            </div>
                                        </form>
                                    </div>


                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

// function SlideForm({ passedFunction }) {
//     const access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjc4NTQzNzAwLCJpYXQiOjE2NzgzNzA5MDAsImp0aSI6IjJmYzBmNzVmNjYwYTRjOWNiYmU2ZDhlNTNiYWY2ZGZlIiwidXNlcl9pZCI6MX0.uYHH9x4c1D659wfvXjRIH4ugADJhTIthDSUbqnGlYYQ';
//     const [selectedField, setSelectedField] = useState([]);
//     const [inputs, setInputs] = useState([]);
//     async function fetchData() {
//         try {
//             const response = await axios.get('http://127.0.0.1:8000/api/customer/allfields/', {
//                 headers: {
//                     'Authorization': `Bearer ${access_token}`
//                 }
//             });
//             setSelectedField(response.data.fields);

//         } catch (err) {
//             console.log(err);
//         }
//     }
//     useEffect(() => {
//         fetchData();
//     }, []);

//     return (
//         <div className='max-w-md  bg-white py-4 px-2 mt-8'>
//             <div className='flex flex-col h-auto mx-4 px-4'>
//                 <div className='text-center mb-3'>
//                     <h1 className='text-2xl font-medium text-gray-800 mb-2'>Enter Customer details</h1>
//                 </div>
//                 <form onSubmit className=''>
//                     {
//                         selectedField.length > 0 ? selectedField.filter((field) => field.selected === true).map((field, index) => {
//                             return (
//                                 <div className="mb-2">
//                                     <label className="block mb-2 text-md font-medium text-gray-800 ">{field.label}</label>
//                                     <input type="text" className="bg-transparent border border-gray-500 text-gray-900 text-sm rounded-lg  block w-full p-2.5" placeholder={`${field.label}`} name={`${field.field_name}`} required />
//                                 </div>
//                             )
//                         }):<p>Loading...</p>
//                    }

//                     <div className='flex justify-between my-4'>

//                         <button className="text-gray-700 font-bold text-md sm:w-auto px-5 py-1.5 text-center border-2 rounded-lg"
//                             onClick={passedFunction}
//                         >Cancel</button>
//                         <button type="submit" className="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-1.5 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800">Add</button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     )
// }
export default Waitlist;
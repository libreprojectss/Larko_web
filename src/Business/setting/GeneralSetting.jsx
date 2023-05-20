import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Side from '../components/Side'
import Nav from '../components/Nav'
import SettingSidebar from '../../components/SettingSidebar'
import { DataContext } from '../../context/DataContext'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { GetToken } from '../../context/Localstorage'

const { access } = GetToken();
const access_token = access;

function ShowProfile() {
    const [openForm, setStatus] = useState(false);
    const [isEnable, setEnable] = useState(false);
    const [businessProfile, setBusinessProfile] = useState();
    const [loading, setLoading] = useState(true);

    function updateBusinessOpen() {

    }
    function handleLink() {
        setStatus(!isEnable);
        updateBusinessOpen();
    }
    function handleSubmit() {

    }
    function handleChange() {

    }
    async function fetchData() {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/user/businessprofile/', {
                headers: {

                    'Authorization': `Bearer ${access_token}`
                }
            });
            setBusinessProfile(response.data);
            setLoading(false);
        } catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className=' w-3/4 absolute left-50 right-0 my-20 mr-8'>Loading...</div>;
    return (
        <>
            {

                <div className=' mx-2 w-[30vw] bg-slate-100 rounded-xl shadow-md p-4'>
                    <div className='my-2'>
                        <label class="relative inline-flex items-center justify-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isEnable}
                                readOnly
                            />

                            <div
                                onClick={
                                    handleLink
                                }
                                className="w-11 h-6 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"
                            ></div>
                            <span class="ml-3 text-md font-bold text-gray-900 dark:text-gray-300">Open Your Business</span>
                        </label>
                    </div>
                    <div className='my-3'>
                        <h1 className='text-lg font-semibold text-gray-900'>Business name</h1>
                        <p className='text-md font-medium text-gray-600'>{businessProfile.data.business_name}</p>
                    </div>
                    <div className='my-3'>
                        <h1 className='text-lg font-semibold text-gray-900'>Category</h1>
                        <p className='text-md font-medium text-gray-600'>{businessProfile.data.category}</p>
                    </div>
                    <div className='my-3'>
                        <h1 className='text-lg font-semibold text-gray-900'>Public link</h1>
                        <div className='flex w-full'>
                            <input className='w-[75%] text-md font-medium text-gray-600 outline-none rounded-tl-xl rounded-bl-xl px-2 py-3 focus:outline-none' value={`${'http://localhost:5173'}${businessProfile.data.public_link_to.public_join_link}`} />
                            <button type="button" className=" w-[25%] p-3 text-sm font-medium text-white bg-[#4100FA] rounded-r-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"><Link to={`http://localhost:5173${businessProfile.data.public_link_to.public_join_link}`} target="_blank" rel="noopener noreferrer" >Open</Link></button>
                        </div>
                    </div>
                    <div className='my-3'>
                        <button
                            onClick={() => { setStatus(!openForm) }}
                            type="button" className="py-3 bg-[#4100FA] rounded-xl text-white font-bold mt-2 w-full">
                            Edit Business profile
                        </button>
                    </div>
                    {
                        openForm && <Transition appear show={true} as={Fragment}>
                            <Dialog as="div" className="relative z-10" onClose={() => setStatus(false)}>
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
                                                    className="text-lg font-medium leading-6 text-gray-900"
                                                >
                                                    Fill customer details
                                                </Dialog.Title>
                                                <div className="mt-2">
                                                    <form onSubmit={handleSubmit}>
                                                        <div className="mb-2">
                                                            <label className="block mb-2 text-md font-medium text-gray-800 ">Business Name</label>
                                                            <input
                                                                type="text"
                                                                className="bg-transparent border border-gray-500 text-gray-900 text-sm rounded-lg  block w-full p-2.5"
                                                                placeholder="Business name"
                                                                name='business_name'
                                                                onChange={handleChange}
                                                            />
                                                        </div>

                                                        <div className='flex justify-between my-4'>

                                                            <button className="text-gray-700 font-bold text-md sm:w-auto px-5 py-1.5 text-center border-2 rounded-lg"
                                                                onClick={() => setStatus(false)}
                                                            >Cancel</button>
                                                            <button type="submit"
                                                                className="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-1.5 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800"
                                                            >Submit</button>
                                                        </div>
                                                    </form>
                                                </div>


                                            </Dialog.Panel>
                                        </Transition.Child>
                                    </div>
                                </div>
                            </Dialog>
                        </Transition>
                    }
                </div>
            }
        </>
    )
}

function Component() {

    return (
        <div className='w-[68vw] absolute left-50 right-0 mt-16 '>
            <div className="px-4 py-2.5 bg-white mx-2 mt-4 ">
                <div className='flex flex-col justify-center items-center'>
                    <div className=' w-1/2 h-[43vh] flex flex-col justify-start items-center'>
                        <h1 className="text-4xl font-bold text-gray-800 my-2">General Setting</h1>
                        <div className='flex space-x-4 mt-16 text-2xl'>
                            <div className='flex flex-col justify-start items-center'>
                                <h1 className='text-3xl font-semibold text-gray-800'>Business Profile</h1>
                                <p className='text-center mt-5 font-medium'>
                                    Your Business Information is Displayed on your Online Pages<br></br> and Messages to Customer
                                </p>
                            </div>
                        </div>
                    </div>
                    <ShowProfile />
                </div>


            </div>

        </div>
    )
}

function GeneralSetting() {
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

export default GeneralSetting
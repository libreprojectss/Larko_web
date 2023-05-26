import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Side from '../components/Side'
import Nav from '../components/Nav'
import SettingSidebar from '../../components/SettingSidebar'
import Editbusinessform from '../../Start/components/Editbusinessform'
import axios from 'axios'
import { Link,useNavigate } from 'react-router-dom'
import { GetToken } from '../../context/Localstorage'

const { access } = GetToken();
const access_token = access;

function ShowProfile() {
    const navigate = useNavigate();
    const [openForm, setStatus] = useState(false);
    const [businessProfile, setBusinessProfile] = useState();
    const [loading, setLoading] = useState(true);
    function updateBusiness() {
       businessProfile.data.open_now ? 

        axios.get(`http://127.0.0.1:8000/api/user/openclosebusiness/0`,
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }

            })
            .then((response) => {

                navigate(0);
            }).catch(err => console.log(err))
           :
           axios.get(`http://127.0.0.1:8000/api/user/openclosebusiness/1`,
               {
                   headers: {
                       'Authorization': `Bearer ${access_token}`
                   }

               })
               .then((response) => {

                   navigate(0);
               }).catch(err => console.log(err))
    }
 
    function handleLink() {
   
        updateBusiness();
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

    if (loading) return <div className='mt-8'>Loading...</div>;
   
    return (
        <>
  
            {

                <div className=' mx-2 w-[50vw] bg-slate-100 rounded-xl shadow-md p-4'>
                    <div className='my-2'>
                        <label class="relative inline-flex items-center justify-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={businessProfile.data.open_now}
                                readOnly
                            />

                            <div
                                onClick={
                                    handleLink
                                }
                                className="w-11 h-6 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                            ></div>
                            <span class="ml-3 text-md font-bold text-gray-900 dark:text-gray-300">Open Your Business</span>
                        </label>
                    </div>
                    <div className='flex justify-between'>
                        <div>
                            <div className='my-2'>
                                <h1 className='text-lg font-semibold text-gray-900'>Business name</h1>
                                <p className='text-md font-medium text-gray-600'>{businessProfile.data.business_name}</p>
                            </div>
                            <div className='my-2'>
                                <h1 className='text-lg font-semibold text-gray-900'>Category</h1>
                                <p className='text-md font-medium text-gray-600'>{businessProfile.data.category}</p>
                            </div>
                            <div className='my-2'>
                                <h1 className='text-lg font-semibold text-gray-900'>Business Title</h1>
                                <p className='text-md font-medium text-gray-600'>{businessProfile.data.business_title}</p>
                            </div>

                        </div>
                        <div>
                            {businessProfile.data.business_phone_number && <div className='my-2'>
                                <h1 className='text-lg font-semibold text-gray-900'>Contact Number</h1>
                                <p className='text-md font-medium text-gray-600'>{businessProfile.data.business_phone_number}</p>
                            </div>}
                            {businessProfile.data.business_website && <div className='my-2'>
                                <h1 className='text-lg font-semibold text-gray-900'>Our Website</h1>
                                <p className='text-md font-medium text-gray-600'>{businessProfile.data.business_website}</p>
                            </div>
                            }
                            {
                                businessProfile.data.business_address && <div className='my-2'>
                                    <h1 className='text-lg font-semibold text-gray-900'>Location</h1>
                                    <p className='text-md font-medium text-gray-600'>{businessProfile.data.business_address}</p>
                                </div>
                            }
                        </div>
                    </div>
                    <div className='my-3'>
                        <h1 className='text-lg font-semibold text-gray-900'>Public link</h1>
                        <div className='flex w-full'>
                            <input className='w-[75%] text-md font-medium text-gray-600 outline-none rounded-tl-xl rounded-bl-xl px-2 py-3 focus:outline-none' value={`${'http://localhost:5173'}${businessProfile.data.public_link_to.public_join_link}`} />
                            <button type="button" className=" w-[25%] p-3 text-sm font-medium text-white bg-[#4100FA] rounded-r-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"><Link to={`http://localhost:5173${businessProfile.data.public_link_to.public_join_link}`} target="_blank" >Open</Link></button>
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
                                            <Dialog.Panel className=" max-w-xl transform overflow-hidden rounded-2xl bg-slate-100 p-6 text-left align-middle shadow-xl transition-all">
                                             
                                                <div className='flex justify-center '>
                                                    <Editbusinessform onChangeFormStatus={(status)=>setStatus(status) } />
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
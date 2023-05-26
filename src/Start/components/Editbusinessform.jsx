import { useContext, useEffect, useState } from 'react'
import axios from 'axios';
import React from 'react'
import { GetToken } from '../../context/Localstorage';

export default function Editbusinessform({ onChangeFormStatus }) {
    const [business_name, set_business_name] = useState('');
    const [public_link, set_public_link] = useState('larko.com/');
    const [available, setavailable] = useState('');
    const [error, seterror] = useState(true);
    const [focus, setfocus] = useState(false);
    const [fetch, setfetch] = useState({});
    const [errorMsg, setErrorMsg] = useState([]);
    const category = ['Banking and Finance',
        'Beauty salon',
        'Cafe',
        'Doctor and Hospital',
        'Entertainment',
        'Events',
        'Government',
        'Hair and Barber',
        'Rentals',
        'Resturant',
        'Schools and University',
        'Travel and Tourism'
    ]
    const role = [
        'Developer',
        'Owner',
        'Consultant',
        'Manager',
        'Contractor',
        'Vp / Director'
    ]
    const { access } = GetToken();
    useEffect(() => {
        axios.get('http://localhost:8000/api/user/businessprofile/', {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((resp) => {
                console.log(resp.data.data)
                setfetch(resp.data.data)
            }
            )
            .catch((err) => {
                console.log(err)
            }
            )
    }, [])
    const handle_submit = (e) => {
        e.preventDefault()
        const formdata = new FormData(e.target)
        axios.put('http://localhost:8000/api/user/businessprofile/', formdata, {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((resp) => {
                console.log(resp)
                onChangeFormStatus(false)
            }
            )
            .catch((err) => {
                setErrorMsg(err.response.data)
                console.log(err)
                set_business_name('')
                set_public_link('larko.com/')
            }
            )
    }
console.log(errorMsg)
    const handle_change = (e) => {
        const newdata = { ...fetch };
        newdata[e.target.id] = e.target.value;
        setfetch(newdata);
    }

    const handle_focus = () => {
        setfocus(true)
        console.log("Hello")
    }

    useEffect(() => {
        axios.post('http://localhost:8000/api/user/checkbusinessname/', { business_name: fetch.business_name }).then((resp) => {
            setavailable(resp.data.msg)
            seterror(false);
        }
        )
            .catch((err) => {
                console.log(err.response.data.errors.business_name)
                setavailable(err.response.data.errors.business_name)
                seterror(true)
            }
            )

    }, [fetch.business_name])

    function moveString(array, string) {
        // Find the index of the string in the array
        let index = array.indexOf(string);
        // If the string is not found, return the original array
        if (index === -1) {
            return array;
        }
        // Otherwise, remove the string from the array
        let removed = array.splice(index, 1);
        // Add the string to the beginning of the array
        array.unshift(removed[0]);
        // Return the modified array
        return array;
    }

    return (
        <div className='w-screen mr-20'>
            <div className='w-full mx-auto flex flex-col items-center'>
                <h1 className='text-blaonChangeFormStatusck font-bold text-2xl text-center ml-20'>Edit Business Details</h1>
                <form className='flex flex-col justify-around w-9/12' onSubmit={handle_submit}>
                    <div className='flex space-x-2'>
                        <div className="flex flex-col">
                            <label htmlFor="business_title" className="font-bold mt-3">Business Title</label>
                            <input type="text" name="business_title" id="business_title" placeholder='Business Title' value={`${fetch.business_title}`} onChange={handle_change} className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2' />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="business_name" className="font-bold mt-3">Business Name</label>
                            <input type="text" name="business_name" id="business_name" placeholder='Business Name' value={fetch.business_name} onChange={handle_change} onFocus={handle_focus} className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2' />
                            {focus ? error ? <p className='text-red-500 text-sm'>{available}</p> : <p className='text-green-500 text-sm'>{available}</p> : ''}
                        </div>
                    </div>
                    <div className='flex space-x-2'>
                        <div className="flex flex-col">
                            <label htmlFor="category" className="font-bold mt-3">Business Category</label>
                            <select name="category" id="category" placeholder='Select Your Business Category' className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2'>
                                {
                                    moveString(category, `${fetch.category}`) &&
                                    category.map((data, index) => {
                                        return (<option value={`${data}`}>{data}</option>)
                                    })
                                }
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="public_link" className="font-bold mt-3">Public Link</label>
                            <input type="text" name="public_link" id="public_link" placeholder='Public Link' value={public_link + fetch.business_name} onChange={(e) => { set_public_link(e.target.value) }} readOnly className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2' />
                        </div>
                    </div>
                    <div className="flex flex-col ">
                        <label htmlFor="role" className="font-bold mt-3">Current Role</label>
                        <select name="role" id="role" placeholder='Select Your Current Role' className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2 w-[28vw]'>
                            {
                                moveString(role, `${fetch.role}`) &&
                                role.map((data) => {
                                    return <option value={`${data}`}>{data}</option>
                                })
                            }
                        </select>
                    </div>

                    <div className='flex space-x-2'>
                        <div className="flex flex-col">
                            <label htmlFor="business_address" className="font-bold mt-3">Business Address</label>
                            <input type="text" name="business_address" id="business_address" placeholder='Business Address' value={`${fetch.business_address}`} onChange={handle_change} className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2' />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="business_phone_number" className="font-bold mt-3">Business Phone</label>
                            <input type="text" name="business_phone_number" id="business_phone_number" placeholder='Business Phone' value={`${fetch.business_phone_number}`} onChange={handle_change} className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2' />
                           
                        </div>
                    </div>
                    <div className='flex space-x-2'>
                        <div className="flex flex-col">
                            <label htmlFor="business_email" className="font-bold mt-3">Business Email</label>
                            <input type="email" name="business_email" id="business_email" placeholder='Business Email' value={`${fetch.business_email}`} onChange={handle_change} className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2' />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="business_website" className="font-bold mt-3">Business Website</label>
                            <input type="text" name="business_website" id="business_website" placeholder='Business Website' value={`${fetch.business_website}`} onChange={handle_change} className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2' />
                        </div>
                    </div>

                    <div className="w-[28vw]">
                        <button type="submit" className='py-3 bg-[#4100FA] rounded-xl text-white font-bold  mt-5 w-[13em] mr-2'>Save</button>
                        <button className='py-3 bg-[#e23d20] rounded-xl text-white font-bold  mt-5  w-[13em]' onClick={() => onChangeFormStatus(false)}>Exit</button>
                    </div>
                </form>
            </div>
        </div>

    )
}

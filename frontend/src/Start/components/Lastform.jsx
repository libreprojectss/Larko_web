import { useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { DeleteTkn } from '../../context/Localstg';
import { useNavigate } from 'react-router-dom';
import { GetToken } from '../../context/Localstorage';

export default function Lastform() {
    const [business_name, set_business_name] = useState('');
    const [public_link, set_public_link] = useState('larko.com/');
    const [available, setavailable] = useState('');
    const [error, seterror] = useState(true);
    const [focus, setfocus] = useState(false);
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
    const role = ['Manager',
        'Developer',
        'Owner',
        'Consultant',
        'Contractor',
        'Vp / Director'
    ]
    const { access } = GetToken()
    const navigate=useNavigate();
    const handle_submit = (e) => {
        e.preventDefault()
        const formdata = new FormData(e.target)
        axios.post('http://localhost:8000/api/user/businessprofile/', formdata, {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((resp) => {
              
                console.log(resp)
                DeleteTkn()
                navigate('/login')
            }
            )
            .catch((err) => {
                console.log(access)
                console.log(err)
                // set_business_name('')
                // set_public_link('larko.com/')
            }
            )
    }

    const handle_business_name_change = (e) => {
        set_business_name(e.target.value)
    }

    const handle_focus = () => {
        setfocus(true)
        console.log("Hello")
    }
    useEffect(() => {
        axios.post('http://localhost:8000/api/user/checkbusinessname/', { business_name: business_name }).then((resp) => {
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

    }, [business_name])
    return (
        <div className='w-screen h-screen'>
            <div className='w-[28%] mx-auto flex flex-col items-center'>
                <p className="font-extrabold text-4xl mb-10 mt-4">Fill Your Business Details</p>
                <form className='flex flex-col justify-around w-9/12' onSubmit={handle_submit}>
                    <label htmlFor="business_title" className="font-bold mt-3">Business Title</label>
                    <input type="text" name="business_title" id="business_title" placeholder='Business Title' className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2' />
                    <label htmlFor="business_name" className="font-bold mt-3">Business Name</label>
                    <input type="text" name="business_name" id="business_name" placeholder='Business Name' value={business_name} onChange={handle_business_name_change} onFocus={handle_focus} className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2' />
                    {focus ? error ? <p className='text-red-500 text-sm'>{available}</p> : <p className='text-green-500 text-sm'>{available}</p> : ''}
                    <label htmlFor="category" className="font-bold mt-3">Business Category</label>
                    <select name="category" id="category" placeholder='Select Your Business Category' className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2'>
                        {
                            category.map((data, index) => {
                                return (<option value={`${data}`}>{data}</option>)
                            })
                        }
                    </select>
                    <label htmlFor="public_link" className="font-bold mt-3">Public Link</label>
                    <input type="text" name="public_link" id="public_link" placeholder='Public Link' value={public_link + business_name} onChange={(e) => { set_public_link(e.target.value) }} readOnly className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2' />
                    <label htmlFor="role" className="font-bold mt-3">Role</label>
                    <select name="role" id="role" placeholder='Select Your Current Role' className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2'>
                        {
                            role.map((data) => {
                                return <option value={`${data}`}>{data}</option>
                            })
                        }
                    </select>
                    <button type="submit" className='py-3 bg-[#4100FA] rounded-3xl text-white font-bold  mt-5'>Start Using Lakro</button>
                </form>
            </div>
        </div>
    )
}

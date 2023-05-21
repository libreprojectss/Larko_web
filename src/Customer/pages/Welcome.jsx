import axios from 'axios';
import React, {  useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Cookie from 'js-cookie';

function Welcome() {
    const { id } = useParams();
    const [joinList, setJoinList] = useState(null);
    const navigate = useNavigate();
    const queue_cookie = Cookie.get('queue_cookies');
    useEffect(() => {
       
        queue_cookie ? axios.post(`http://127.0.0.1:8000/api/joinwaitlist/${id}/`, { validation_token: queue_cookie }).then((res) => {
            console.log(res)
        }).catch(err => console.log(err)) :
        axios.get(`http://127.0.0.1:8000/api/joinwaitlist/${id}/`, { validation_token: queue_cookie }).then((res) => {
            setJoinList(res.data)
        }).catch(err => console.log(err))
    }, []);
  
    return (
        <>
            {
            
          
     
            <div className='max-w-xs m-auto'>
                <div className='flex flex-col justify-center items-center my-24'>
                    <div className='text-center mb-8'>
                        <h1 className='text-2xl font-bold text-gray-800 mb-2'>Welcome to {joinList?.business_name}</h1>
                            {

                            joinList?.waitlist_count > 0 ? <p className='text-xl font-semibold text-gray-700'>{joinList?.waitlist_count} <span className='font-bold text-blue-800'>waiting</span> </p> : <p className='font-bold text-xl text-gray-700'>You are first in queue</p>
                        }
                    </div>
                    <div className='w-full'>
                        <button
                            className='w-full bg-purple-700 px-5 py-3 text-white font-semibold rounded-full hover:bg-purple-600 active:from-purple-800 cursor-pointer shadow'
                            onClick={() => navigate(`/publicjoin/${id}/fill`)}
                        >Join Our Queue</button>
                    </div>
                    <div className='my-4'>
                        <p className='text-md text-gray-600 font-semibold'>We value your time.</p>
                    </div>
                </div>
            </div>
        }
        </>
    )
}

export default Welcome
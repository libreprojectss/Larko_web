import React, { useState } from 'react'
import axios from 'axios';
import Cookies from 'js-cookie';
import { GrOverview, FcCancel } from 'react-icons/all'
import { useNavigate } from 'react-router-dom'

function Action({ id }) {
    const navigate = useNavigate();
    const queue_cookie = Cookies.get(`queue_cookies`)
    const [msg, setMsg] = useState({});
    function removeFromQueue() {
        console.log(queue_cookie)
        axios.delete(`http://127.0.0.1:8000/api/joinwaitlist/${id}/`, { validation_token: queue_cookie }).then(res => {
            console.log('I left')
            Cookies.remove('queue_cookies')
            navigate(`/publicjoin/${id}/`);
            setMsg(res.message);
        }).catch((err) => console.log(err));
    }

    return (
        <>
            {
                queue_cookie ? (<div className='flex flex-col'>
                    <div className=' '>
                        <button className='flex justify-start items-center cursor-pointer '
                            onClick={() => navigate(`/publicjoin/${id}/viewqueue`)}
                        >
                            <GrOverview size='25' />
                            <span className='mx-2 text-md font-semibold text-gray-500'> View Queue</span>
                        </button>
                    </div>
                    <div className='my-3'>
                        <button className='flex justify-start items-center cursor-pointer '
                            onClick={removeFromQueue}
                        >
                            <FcCancel size='25' />
                            <span className='mx-2 text-md font-semibold text-gray-500'> Leave Queue</span>
                        </button>
                    </div>
                </div>) : navigate(`/publicjoin/${id}`)
            }

        </>
    )
}

export default Action
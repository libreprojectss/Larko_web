import axios from 'axios'
import Cookies from 'js-cookie';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Status({ id }) {
    const navigate = useNavigate();
    const [msg, setMsg] = useState({});
    const queue_cookie = Cookie.get('queue_cookies');
    function removeFromQueue() {
        axios.delete(`http://127.0.0.1:8000/api/joinwaitlist/${id}/`, { validation_token: queue_cookie })
            .then(res => {
            console.log('I left')
            Cookies.remove('queue_cookies')
            navigate(`/publicjoin/${id}/`);
            setMsg(res.message);
        }).catch((err) => console.log(err));
    }
    return (
        <>

            <div className='mt-6'>
                <button
                    onClick={removeFromQueue}
                    className='w-full bg-transparent px-5 py-3 text-gray-700 hover:text-white hover:bg-red-600 font-bold  rounded-full  cursor-pointer border border-red-700'
                >I am not coming</button>
            </div>
        </>
    )
}

export default Status
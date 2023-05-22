import axios from 'axios'
import Cookie from 'js-cookie';
import React, { useState } from 'react'
import Cookie from 'js-cookie'

function Status({id}) {
    const [msg, setMsg] = useState({});
    function removeFromQueue() {
        const queue_cookie=Cookie.get("queue_cookies")
        axios.post(`http://127.0.0.1:8000/api/publiclink/removedata/${id}/`,{"validation_token":queue_cookie}).then(res => {setMsg(res.message);console.log(res)}).catch((err) => console.log(err));
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
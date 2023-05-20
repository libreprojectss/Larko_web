import axios from 'axios'
import React, { useState } from 'react'

function Status({id}) {
    const [msg, setMsg] = useState({});
    function removeFromQueue() {
        axios.delete(`http://127.0.0.1:8000/api/joinwaitlist/${id}/`).then(res => setMsg(res.message)).catch((err) => console.log(err));
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
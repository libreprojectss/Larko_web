import React, { useCallback, useContext, useEffect, useState } from 'react'
import { AiOutlineSearch, AiFillCaretDown } from 'react-icons/all'
import './style.css';
import { GetToken } from '../../context/Localstorage';
import axios from 'axios';

function Nav() {
    const { access } = GetToken();
    const [sta, setStatus] = useState();
    useEffect(() => {
        axios.get(`http://localhost:8000/api/user/openclosebusiness/`, {
            headers: {
                'Authorization': `Bearer ${access}`
            }
        }).then(response => setStatus(response.data.status)).catch((err) => console.log(err))
    }, [access])
    return (
        <div className='relative px-8 py-8 flex flex-row justify-end items-center h-12 border-b-2 border-gray-500 bg-white'>

            <div className='  mx-4 flex justify-end bg-transparent space-x-4 '>

                {
                    sta ? (<div class="led-box">
                        <div class="led-green"></div>
                    </div>) : (<div class="led-box">
                        <div class="led-red"></div>
                    </div>)
                }
              
                

            </div>
        </div>
    )
}

export default Nav
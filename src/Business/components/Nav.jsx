import React from 'react'
import { AiOutlineSearch, AiFillCaretDown } from 'react-icons/all'
function Nav() {
    return (
        <div className=' px-8 py-8 flex flex-row justify-end items-center h-12 border-b-2 border-gray-500 bg-white'>

            <div className=' mx-10 flex justify-between items-center bg-transparent space-x-4 '>
                <div className="inline-block relative w-28 ">
                    
                </div>

                <div className='relative'>
                    <input type='text'
                        className='bg-slate-100 appearance-none block w-full  text-gray-700 rounded-xl py-3 px-4 leading-tight focus:outline-none outline-none'
                        placeholder='Search'
                    />
                    <div className=" absolute inset-y-0 right-0 flex items-center px-2 bg-slate-100 rounded-tr-xl rounded-br-xl ">
                        <AiOutlineSearch size='20' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Nav
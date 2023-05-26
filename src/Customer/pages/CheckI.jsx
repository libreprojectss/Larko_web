import React from 'react'
import { BiArrowBack, RxCross2 } from 'react-icons/all'
import { useNavigate } from 'react-router-dom'



function Header({ navigate }) {

    return (
        <div className='flex justify-between mt-4'>
            <BiArrowBack size='25' color='black' style={{ cursor: 'pointer', fontWeight: 'bolder' }} onClick={() => {
                navigate(-1)
            }} />
            <h1 className='font-bold text-gray-700 text-xl'>Brandname</h1>
            <RxCross2 size='25' color='black' style={{ cursor: 'pointer', fontWeight: 'bolder' }} onClick={() => {
                navigate('/welcome')
            }} />
        </div>
    )
}


function CheckI() {
    const navigate = useNavigate();
    return (
        <div className='max-w-md m-auto'>
            <Header navigate={navigate} />
            <div className='flex flex-col justify-center items-center my-16 mx-6'>
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-gray-800 mb-2'>Select Services</h1>
                </div>
                <div className='w-full border border-gray-600 rounded-lg cursor-pointer text-center mb-4'>
                    <button
                        className=' px-5 py-4 text-gray-900 font-semibold  '
                        onClick={() => navigate('/checkin/confirm/')}
                    >Service Name1</button>
                </div>
                <div className='w-full border border-gray-600 rounded-lg cursor-pointer text-center mb-4'>
                    <button
                        className=' px-5 py-4 text-gray-900 font-semibold  '
                        onClick={() => navigate('/checkin/confirm/')}
                    >Service Name2</button>
                </div>
                <div className='w-full border border-gray-600 rounded-lg cursor-pointer text-center mb-4'>
                    <button
                        className=' px-5 py-4 text-gray-900 font-semibold  '
                        onClick={() => navigate('/checkin/confirm/')}
                    >Service Name3</button>
                </div>
                <div className='w-full text-center ' >
                    <button

                        className='border  w-full px-5 py-3 text-gray-600  font-bold rounded-full hover:bg-gray-800 hover:text-white hover:border-none'
                        onClick={() => navigate('/checkin/confirm/')}
                    >Skip</button>
                </div>

            </div>
        </div>
    )
}

export default CheckI
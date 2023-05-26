import React, { useState } from 'react'
import { BsPersonCheckFill, GiCancel } from 'react-icons/all'
import Action from '../components/Action';
import Detail from '../components/Detail';
import Status from '../components/Status';
import Footer from '../components/Footer';

function Thanks() {
    return (
        <>
            <BsPersonCheckFill size='65' color='green' />
            <h1 className='my-2 text-xl font-bold text-gray-800'>Thanks for visiting</h1>
            <p className='my-1 text-sm font-semibold text-gray-400'>See you next time!</p>
        </>
    )
}


function QueueLeft() {
    return (
        <>
            <GiCancel size='65' color='red' />
            <h1 className='mt-8 text-2xl font-bold text-gray-800'>You left the waitlist</h1>
        </>
    )
}

function Visits() {
    const [visited, setVisited] = useState(false);
    const [left, setLeft] = useState(true);
    return (
        <>
            <div className='max-w-xs m-auto'>
                <div className='flex flex-col justify-center items-center my-24'>
                    <div className='w-full text-center mb-8 flex flex-col justify-center items-center'>
                        {/* <h1 className='text-2xl font-bold text-gray-800 mb-2'>Welcome To xyz</h1> */}
                        {
                            visited && <Thanks />
                        }
                        {
                            left && <QueueLeft />
                        }
                    </div>
                    <div className='w-full'>
                        <hr className='mb-2 ' />
                        <Detail />
                    </div>
                    {
                        visited ? null : <Action /> && left ? null : <Action />
                    }

                    <div className='my-4'>
                        <p className='text-md text-gray-600 font-semibold'>We value your time.</p>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    )
}

export default Visits
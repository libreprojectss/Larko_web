import React from 'react'

function Detail({ personalInfo }) {
    return (
        <div className='my-4 mx-2'>
            <div className="mb-6">
                <label for="name" className="block mb-2 text-md font-medium text-gray-800 ">Your name</label>
                <p className='text-md font-thin text-gray-600'>{personalInfo?.first_name}{personalInfo?.last_name ? ` ${personalInfo?.last_name}`:''}</p>
            </div>
            <div className="mb-6">
                <label for="email" className="block mb-2 text-md font-medium text-gray-800 ">Your email</label>
                <p className='text-md font-thin text-gray-600'>{personalInfo?.email}</p>
            </div>
            <div className="mb-6">
                <label for="phone" className="block mb-2 text-md font-medium text-gray-800 ">Your Phone</label>
                <p className='text-md font-thin text-gray-600'>{personalInfo?.phone_number}</p>
            </div>
            <div className="mb-6">
                <label for="phone" className="block mb-2 text-md font-medium text-gray-800 ">Service Name</label>
                <p className='text-md font-thin text-gray-600'>{personalInfo?.service_name}</p>
            </div>
            {
                personalInfo?.description && <div className="mb-6">
                    <label for="phone" className="block mb-2 text-md font-medium text-gray-800 ">Description</label>
                    <p className='text-md font-thin text-gray-500'>{personalInfo?.description}</p>
                </div>
            }
            <hr className='my-6' />
        </div>
    )
}

export default Detail
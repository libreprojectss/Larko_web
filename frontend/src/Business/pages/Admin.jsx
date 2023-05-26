import React from 'react'
import Nav from '../components/Nav'
import Side from '../components/Side'

function Admin() {
    return (
        <div className='flex'>
            <div className='w-1/8 h-[100vh] fixed z-10'>
                <Side />
            </div>
            <section className='w-full flex flex-col '>
                <div className='w-full  top-0 left-20 right-0'>
                    <Nav />
                </div>
                <div className='h-full mt-24 flex flex-col justify-start items-center mx-auto'>
                    <div className=' overflow-y-auto h-[90vh]' style={{ margin: "20px  0 0 200px", padding: "0 30px" }}>
                    </div>
                </div>
            </section>

        </div>
    )
}

export default Admin
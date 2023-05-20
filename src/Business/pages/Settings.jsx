import { useState } from "react";
import Nav from '../components/Nav'
import Side from '../components/Side'
import { AiFillBell, BsFillCheckCircleFill, BsThreeDots, BiMoveVertical, AiFillDelete, BsFillPersonFill, CiTimer } from 'react-icons/all'
import Inputfields from "../components/Inputfields";
import SettingSidebar from "../../components/SettingSidebar";

function Settings() {

    return (
        <div className='flex'>
            <div className='w-1/8 h-[100vh] fixed z-20'>
                <Side />
            </div>
           
            <section className='w-full flex flex-col '>
                <div className='w-full fixed top-0 left-50 right-0 z-10'>
                    <Nav />
                </div>
                <div className="flex">
                    <div className="fixed top-0 left-40 right-0 max-w-[180px] h-full">
                        <SettingSidebar />
                    </div>
                    <Inputfields />
                </div>
            </section>

        </div>
    )
}

export default Settings;
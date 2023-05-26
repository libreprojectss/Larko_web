import React from 'react'
import { NavLink } from 'react-router-dom';
import { AiFillClockCircle, AiFillCheckCircle, AiFillSetting, IoLogOut, AiFillCustomerService } from 'react-icons/all'
import { MdCountertops } from 'react-icons/md'
import { DiGoogleAnalytics } from 'react-icons/di'
import { SiGoogleanalytics } from 'react-icons/si'
import './style.css';
import { AiOutlineLogout } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';

function Side() {
    const navigate = useNavigate()
    const navLinks = [
        {
            path: "/",
            display: "Waitlist",
            icon: <AiFillClockCircle size='30' />
        },
        {
            path: "/serving",
            display: "Serving",
            icon: <AiFillCheckCircle size='30' />
        },
        {
            path: "/services",
            display: "Services",
            icon: <AiFillCustomerService size='30' />
        },
        {
            path: "/resources",
            display: "Resources",
            icon: <MdCountertops size='30' />
        },
        {
            path: "/analytic",
            display: "Analytic",
            icon: <DiGoogleAnalytics size='30' />
        },

        {
            path: "/settings/general",
            display: "Settings",
            icon: <AiFillSetting size='30' />
        },
    ];
    function logout() {
        localStorage.clear('access_token')
        navigate('/login')
    }

    return (
        <div className="sidebar p-4  shadow-sm border-r-2 border-gray-500 bg-white flex flex-col justify-around items-center w-[15vw]">

            <div className="mx-4 bg-transparent font-bold text-xl  h-1/6 w-full rounded-xl flex mt-4">
                <img src="/vite.svg" alt="Not available" className='h-1/3' />
                <span className="font-bold text-4xl ml-4" >Larko</span>
            </div>

            <div className="sidebar__content w-full  rounded-xl h-2/3 flex justify-center items-center">
                <div className=" w-full">
                    <ul className="nav__list w-full font-bold text-gray-600 bg-transparent">
                        {navLinks.map((item, index) => (
                            <li className="nav__item px-4 flex justify-start items-center bg-transparent text-lg " key={index}>
                                <NavLink
                                    to={`/user` + item.path}
                                    className={(navClass) =>
                                        navClass.isActive ? "nav__active nav__link bg-slate-200 rounded-xl p-2 pr-5 flex justify-start items-center w-[10vw]" : "nav__link flex justify-start items-center"
                                    }
                                >

                                    <span className='pr-1'>{item.icon}</span>
                                    <span>{item.display}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className='h-1/6 px-4 w-full rounded-xl flex justify-start items-center hover:cursor-pointer' onClick={logout}>
                <IoLogOut size={40} className='pr-2' color='grey' />
                <p className='text-lg font-bold'>Logout</p>
            </div>

        </div>
    )
}

export default Side
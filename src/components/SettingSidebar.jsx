import React from 'react'
import { NavLink, Link } from 'react-router-dom';
import { BsInputCursor, IoHandLeft, MdPublic, AiFillCustomerService, MdCountertops } from 'react-icons/all'
import '../Business/components/style.css';

function SettingSidebar() {
    const navLinks = [
        {
            path: "/settings/general",
            display: "General",
            icon: <MdPublic size={30} />
        },
        {
            path: "/settings/inputfields",
            display: "Fields",
            icon: <BsInputCursor size={30} />
        },
        {
            path: "/settings/waitlist",
            display: "Waitlist",
            icon: <IoHandLeft size={30} />
        },
        {
            path: "/settings/services",
            display: "Services",
            icon: <AiFillCustomerService size={30} />
        },
        {
            path: "/settings/resources",
            display: "Resources",
            icon: <MdCountertops size={30} />
        }

    ];
    return (
        <div className="sidebar px-2 shadow-sm border-r-2 border-gray-500 ml-16 w-[15vw] flex flex-col justify-evenly items-center">
            <div className="mt-20 mx-4 font-bold text-2xl text-center h-[5vh] ">
                Settings
            </div>

            <div className="sidebar__content w-full flex justify-center items-center mt-9 h-3/4 pb-24">
                <div className=" w-full overflow-y-auto scroll-smooth">
                    <ul className="nav__list w-full font-semibold text-gray-600 bg-transparent pl-5">
                        {navLinks.map((item, index) => (
                            <li className="nav__item px-4 flex justify-start items-center bg-transparent text-lg font-bold " key={index}>
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
            <div className='h-[5vh] bg-red-500'>

            </div>
        </div>
    )
}

export default SettingSidebar;
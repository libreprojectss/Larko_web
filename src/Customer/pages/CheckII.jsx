import axios from 'axios'
import Cookies from 'js-cookie';
import React, { useContext, useEffect, useState } from 'react'
import { BiArrowBack, RxCross2 } from 'react-icons/all'
import { useNavigate, useParams } from 'react-router-dom'
import Footer from '../components/Footer'

function Header({ navigate, id, name }) {

    return (
        <div className='flex justify-between mt-4'>
            <BiArrowBack size='25' color='black' style={{ cursor: 'pointer', fontWeight: 'bolder' }} onClick={() => {
                navigate(-1)
            }} />
            <h1 className='font-bold text-gray-700 text-xl'>{name}</h1>
            <RxCross2 size='25' color='black' style={{ cursor: 'pointer', fontWeight: 'bolder' }} onClick={() => {
                navigate(`/publicjoin/${id}`)
            }} />
        </div>
    )
}

function CheckII() {
    const queue_cookie = Cookies.get('queue_cookies');
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedField, setSelectedField] = useState(
        { field_list: '', services: '' }
    );

    const [errors, seterrors] = useState({});
    const [status, setStatus] = useState({});
    const [joinList, setjoinList] = useState({});

    function getPublicfields() {
        axios.get(`http://127.0.0.1:8000/api/publiclink/getrequiredfields/${id}/`).then((response) => setSelectedField(response.data)).catch((err) => console.log(err))
    }
    function getJoinlist() {
        axios.get(`http://127.0.0.1:8000/api/joinwaitlist/${id}/`).then((response) => setjoinList(response.data)).catch((err) => console.log(err))
    }
    useEffect(() => {
        getJoinlist();
        getPublicfields();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formdata = new FormData(e.currentTarget);

        axios.post(`http://127.0.0.1:8000/api/joinwaitlist/${id}/`, formdata, { withCredentials: 'include' }).then((res) => {
            if (res.data.errors) {
                console.log(res.response)
                seterrors(res.data.errors)
            }
            else {
                console.log(res);
                const serializedData = Cookies.set('queue_cookies', res.data.validation_token);
                if (serializedData) {
                    setStatus(res.data)
                    navigate(`/publicjoin/${id}/dash`)

                }


            }
        })

    }

    return (
        <>
            {queue_cookie ? navigate(`/publicjoin/${id}/dash`) :

                <div>
                    <div className='max-w-md m-auto'>
                        <Header navigate={navigate} id={id} name={joinList.business_name} />
                        <div className='flex flex-col my-16 mx-6'>
                            <div className='text-center mb-8'>
                                <h1 className='text-3xl font-bold text-gray-800 mb-2'>Enter your details</h1>
                            </div>
                            <form onSubmit={handleSubmit}>
                                {

                                    selectedField.field_list.length > 0 ? selectedField.field_list.map((field, index) => {
                                        const inputIndex = index + 1;
                                        return (
                                            <div className="mb-2" key={index}>
                                                <label className="block mb-2 text-md font-medium text-gray-800 ">{field.required ? field.label + `${" *"}` : field.label}</label>
                                                <input
                                                    type="text"
                                                    className="bg-transparent border border-gray-500 text-gray-900 text-sm rounded-lg  block w-full p-2.5"
                                                    placeholder={`${field.label}`}
                                                    name={`${field.field_name}`}

                                                />

                                            </div>
                                        )
                                    }) : "loading..."


                                }
                                {
                                    <div className='my-4'>
                                        <label htmlFor='services' className="block mb-2 text-md font-medium text-gray-800 ">Services</label>
                                        <select name="service" id="service" className='bg-transparent border border-gray-500 text-gray-900 text-sm rounded-lg  block w-full p-2.5 '>
                                            {
                                                selectedField.services.length > 0 ? selectedField.services.map((field, index) => {
                                                    return (
                                                        <option value={field.id} key={index}>{field.name}</option>
                                                    )
                                                }) : "loading..."
                                            }
                                        </select>
                                    </div>
                                }

                                <div className='flex justify-between my-8'>
                                    <button type="submit"
                                        className="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-1.5 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800"
                                    >Add</button>
                                </div>
                            </form>

                        </div>
                    </div>

                    <Footer />
                </div>
            }
        </>
    )
}

export default CheckII
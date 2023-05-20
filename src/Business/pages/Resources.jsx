import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Nav from '../components/Nav'
import Side from '../components/Side'
import axios from 'axios'
import { GetToken } from '../../context/Localstorage'
import Resizer from "react-image-file-resizer";
import { AiOutlineCamera } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom'
import { DeleteToken } from '../../context/Localstorage'
import jwt_decode from "jwt-decode";

function Resources() {
    const { access, refresh } = GetToken();
    const [data, setdata] = useState([]);
    const [adata, setadata] = useState([]);
    const [editon, setediton] = useState(false)
    const [delton, setdelton] = useState(false)
    const [id, setid] = useState(0);
    const [image, setImage] = useState(null);
    const [change, setchange] = useState(false);
    const [fetch, setfetch] = useState({});
    const navigate = useNavigate()

    console.log('Resources')

    function validity() {
        axios.post('http://localhost:8000/api/user/token/verify/', { token: access })
            .then((resp) => {
                if (resp) {
                    if (Object.keys(resp.data).length === 0) {
                        console.log('Verification Successful')
                    }
                    else {
                        console.log('Verification Failed')
                    }
                }
            })
            .catch((err) => {
                console.log(err.response.data.detail);
                console.log(err.response.data.code);
                console.log("Bye")
                DeleteToken();
                navigate('/login')
            }
            )
    }

    function refresh_token() {
        axios.post('http://localhost:8000/api/user/token/update/', { refresh: refresh })
            .then((resp) => {
                localStorage.setItem('access_token', resp.data.access)
            })
            .catch((err) => {
                console.log(err);
            }
            )

    }

    function refresh_regular() {
        let decoded = jwt_decode(access);
        let currenttime = ~~(new Date().getTime() / 1000)
        console.log(currenttime)
        if (currenttime + 300 > decoded.exp) {
            console.log('hello')
            validity()
            refresh_token()
        }
    }

    // setInterval(() => {
    //     refresh_regular()
    // }, 5000);



    useEffect(() => {
        axios.get('http://localhost:8000/api/customer/getservicename/', {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((resp) => {
                // console.log(resp.data)
                setdata(resp.data)
            }
            )
            .catch((err) => {
                console.log(err)
            }
            )
    }, [])

    useEffect(() => {
        axios.get('http://localhost:8000/api/customer/resources/', {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((resp) => {
                console.log(resp.data)
                setadata(resp.data)

            }
            )
            .catch((err) => {
                console.log(err)
            }
            )
    }, [change])

    let max_length = 0;

    for (let i = 0; i < data.length; i++) {
        if (data[i].id > max_length) {
            max_length = data[i].id
        }
    }
    // console.log(data.length)

    let a = [];
    for (let index = 0; index < adata.length; index++) {
        a.push(adata[index].services)
    }

    // console.log(a)
    function getDistinctElements(arr) {
        // Create a new Set to store distinct elements
        const distinctSet = new Set(arr);

        // Convert the Set back to an array
        const distinctArr = Array.from(distinctSet);

        return distinctArr;
    }
    let b = a
    let c = getDistinctElements(b.flat())
    c.sort();
    // console.log(c);

    // console.log(max_length)

    const d = a.map((value, index) => {
        let d = []
        for (let i = 0; i < 1; i++) {
            for (let i = 0; i < c.length; i++) {
                d.push(value.includes(c[i]))
            }
        }
        return (
            d
        )
    })

    // console.log(d)

    function editwow(e) {
        setid(e.target.parentNode.id)
        // console.log(e.target.parentNode.children[0].innerText,e.target.parentNode.children[1].innerText)
        fetch.name = e.target.parentNode.children[0].innerText
        fetch.description = e.target.parentNode.children[1].innerText
        setImage(e.target.parentNode.children[2].src)
        // console.log(id);
        setediton(true)
        setdelton(false)
        // console.log(editon);
    }
    function delwow(e) {
        setid(e.target.parentNode.id)
        // console.log(id)
        setdelton(true)
        setediton(false)
        // console.log(delton);
    }

    const handleChange = (event) => {
        const file = event.target.files[0];
        Resizer.imageFileResizer(
            file,
            500, // max width
            100, // max height
            "JPEG", // format
            100, // quality
            0, // rotation
            (uri) => {
                setImage(uri); // set the resized image uri to state
            },
            "base64" // output type
        );
    };
    function handlesubmit(e) {
        e.preventDefault();
        validity()
        const formdata = new FormData(e.target);
        for (const key of formdata.keys()) {
            console.log(key);
        }
        if (formdata.get('is_available') == null) {
            console.log('wow')
            formdata.set('is_available', false)
        }
        console.log(formdata.get('is_available'))
        axios.put(`http://localhost:8000/api/customer/resources/${id}/`, formdata, {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((resp) => {
                console.log(resp.data)
                setediton(false)
                setImage('')
                setchange(!change)
            }
            )
            .catch((err) => {
                console.log(err)
            }
            )

    }

    function handsdown(e) {
        e.preventDefault();
        validity()
        // for (const key of formdata.keys()) {
        //     console.log(key);
        // }
        axios.delete(`http://localhost:8000/api/customer/resources/${id}/`, {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((resp) => {
                console.log(resp.data)
                setdelton(false)
                setchange(!change)
            }
            )
            .catch((err) => {
                console.log(err)
            }
            )

    }

    const handle_change = (e) => {
        const newdata = { ...fetch };
        newdata[e.target.id] = e.target.value;
        setfetch(newdata);
    }

    const [isEmpty, setIsEmpty] = useState(false);

    const handleImageError = () => {
        setIsEmpty(true);
    };

    function editController(id) {
        setid(id);
        setediton((pre) => !pre);
    }
    function deleteController(id) {
        setid(id);
        setdelton((pre) => !pre);
    }
    return (
        <div className='h-full w-full'>
            <div className='flex'>
                <div className='w-1/8 h-[100vh] fixed z-10'>
                    <Side />
                </div>
                <section className='w-full flex flex-col '>
                    <div className='w-full fixed top-0 left-50 right-0'>
                        <Nav />
                    </div>
                    <div className='mt-20 flex w-[75vw] ml-[20vw] justify-center rounded-xl shadow-md'>
                        <div className="px-6 py-2.5 bg-transparent text-gray-500 font-medium text-xs leading-tight uppercase rounded-md  mx-2 flex  justify-center items-center space-x-1">
                            <h1 className='text-2xl font-bold'>Counters</h1>
                            <div className='flex justify-center items-center'>
                                <div className='w-5 h-5 bg-green-600 rounded-full mx-2 shadow-md'></div>
                                <p>Free</p>
                            </div>
                            <div className='flex justify-center items-center '>
                                <div className='w-5 h-5 bg-red-600 rounded-full mx-2 shadow-md'></div>
                                <p>Not Free</p>
                            </div>
                            <div className='flex justify-center items-center'>
                                <div className='w-5 h-5 bg-slate-100 rounded-full mx-2 shadow-md'></div>
                                <p>Not Available</p>
                            </div>
                        </div>

                    </div>
                    <div className='h-full mt-6 flex flex-col justify-start '>


                        <div className=' overflow-y-auto h-[90vh] ml-[20vw] mr-[4vw]'>
                            <div className="grid lg:grid-cols-3 gap-4 mx-auto">
                                {
                                    adata.map((value, index) => {
                                        return (
                                            <div key={index} className={`flex justify-between items-center border shadow-md rounded-xl pl-4 h-[25vh] ${value.is_available ? '' : 'bg-slate-100'}`}>
                                                <div className='flex flex-col justify-center h-full'>
                                                    {
                                                        isEmpty ?
                                                            <div className={`w-20 h-20 rounded-full bg-purple-700 mb-2`}></div> :
                                                            <img src={'http://127.0.0.1:8000' + value.image} className='w-20 h-20 rounded-full mb-2' />
                                                    }
                                                    <p className={`${value.is_free ? "bg-green-500" : "bg-red-500"} w-10 h-10 rounded-full pl-8 ml-1`}></p>
                                                </div>

                                                <div className={`flex flex-col pr-10`}>
                                                    <div className=' pl-3 flex justify-start items-center space-x-2 '>
                                                        {/* <div className='bg-black w-4 h-4 rounded-full'></div> */}
                                                        <h1 className='font-semibold text-3xl text-gray-700 mb-16 '>{value.name}</h1>
                                                    </div>
                                                    <div className='flex  space-x-2 text-gray-500'>

                                                    </div>
                                                </div>
                                                <div className='flex flex-col justify-between h-full relative' id={value.id}>
                                                    <div className='hidden'>{value.name}</div>
                                                    <div className='hidden'>{value.description}</div>
                                                    <img src={'http://127.0.0.1:8000' + value.image} alt="No Image" className='hidden' />
                                                    <button className='px-2 py-2 rounded-bl-xl rounded-tr-xl bg-blue-500 text-white ' onClick={() => editController(value.id)}>Edit</button>
                                                    <button className='px-2 py-2 rounded-tl-xl rounded-br-xl bg-red-500 text-white ' onClick={() => deleteController(value.id)}>Delete</button>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                <div className='w-[80vw] flex items-center pl-[15vw]'>
                                    {
                                        editon &&

                                        (
                                            <Transition appear show={true} as={Fragment}>
                                                <Dialog as="div" className="relative z-10" onClose={editController}>
                                                    <Transition.Child
                                                        as={Fragment}
                                                        enter="ease-out duration-300"
                                                        enterFrom="opacity-0"
                                                        enterTo="opacity-100"
                                                        leave="ease-in duration-200"
                                                        leaveFrom="opacity-100"
                                                        leaveTo="opacity-0"
                                                    >
                                                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                                                    </Transition.Child>

                                                    <div className="fixed inset-0 overflow-y-auto">
                                                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                                                            <Transition.Child
                                                                as={Fragment}
                                                                enter="ease-out duration-300"
                                                                enterFrom="opacity-0 scale-95"
                                                                enterTo="opacity-100 scale-100"
                                                                leave="ease-in duration-200"
                                                                leaveFrom="opacity-100 scale-100"
                                                                leaveTo="opacity-0 scale-95"
                                                            >
                                                                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                                                    <Dialog.Title
                                                                        as="h3"
                                                                        className="text-xl font-medium leading-6 text-gray-900 text-center mb-2"
                                                                    >
                                                                        Edite Business Services
                                                                    </Dialog.Title>
                                                                    <div className="mt-1 flex justify-center">
                                                                        <form className='w-[80%]' onSubmit={handlesubmit}>
                                                                            {
                                                                                adata.map((value, index) => {
                                                                                    if (value.id == id) {

                                                                                        return (
                                                                                            <div key={index} className='w-full'>
                                                                                                <div className='w-full flex justify-between'>
                                                                                                    <div className='flex flex-col w-[70%]'>

                                                                                                        <label htmlFor="name" className="font-bold mt-3 ">Name *</label>
                                                                                                        <input type="text" name="name" id="name" placeholder="Name" value={fetch.name} onChange={handle_change} className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />

                                                                                                        <label htmlFor="description" className="font-bold mt-3">Description *</label>
                                                                                                        <input type="text" name="description" id="description" placeholder="Description" value={fetch.description} onChange={handle_change} className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2" />

                                                                                                    </div>
                                                                                                    <div>
                                                                                                        {
                                                                                                            !image ?
                                                                                                                <div className='h-[75%]'>
                                                                                                                    <p className='mt-3 font-bold text-center'>
                                                                                                                        Click to Upload Image
                                                                                                                    </p>
                                                                                                                    <div className='h-full border-2 border-dashed border-slate-300 rounded-xl mt-2'>
                                                                                                                        <label htmlFor="image" className='h-full flex justify-center items-center hover:cursor-pointer'>
                                                                                                                            {/* <p className='font-bold'>Click Here</p> */}
                                                                                                                            <AiOutlineCamera size="6em" />
                                                                                                                        </label>
                                                                                                                        <input type="file" accept="image/*" name="image" id="image" onChange={handleChange} hidden />
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                :
                                                                                                                <div className='h-[75%]'>
                                                                                                                    <p className='mt-3 font-bold text-center'>
                                                                                                                        Click to Change Image
                                                                                                                    </p>
                                                                                                                    <div className='h-full border-2 border-dashed border-slate-300 rounded-xl mt-2'>
                                                                                                                        <label htmlFor="image" className='text-center h-full flex justify-center items-center hover:cursor-pointer p-5'>
                                                                                                                            <img src={image} className='rounded-xl object-cover' height={110} width={150} alt='Image Not Uploaded Yet' />
                                                                                                                        </label>
                                                                                                                        <input type="file" accept="image/*" name="image" id="image" onChange={handleChange} hidden />
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className='w-full'>
                                                                                                    {/* <input type="text" name="id" id="id" value={value.id} readonly className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md mb-2 w-full mt-5" /> */}

                                                                                                    <p className='font-bold my-4'>Services</p>
                                                                                                    {
                                                                                                        data.map((value, ind) => {
                                                                                                            return (
                                                                                                                <p key={ind} className='pl-5'>
                                                                                                                    <input type="checkbox" id={value.service_name} name='services' defaultChecked={d[index][ind]
                                                                                                                    } value={value
                                                                                                                        .id} className='scale-[150%]' />
                                                                                                                    <label htmlFor={value
                                                                                                                        .service_name} className='pl-3 font-bold'>{value.service_name}</label><br></br>
                                                                                                                </p>
                                                                                                            )
                                                                                                        })

                                                                                                    }
                                                                                                    <br />
                                                                                                    <input type="checkbox" name="is_available" id="is_available" defaultChecked={value.is_available} className='scale-[150%]' />
                                                                                                    <label htmlFor='is_available' className='pl-3 font-bold'>Available</label><br></br>
                                                                                                </div>
                                                                                                <div className='flex space-x-2'>
                                                                                                    <button type="submit" className='py-3 bg-[#4100FA] rounded-3xl text-white font-bold  mt-5 w-full'>Confirm</button>
                                                                                                    <button className='py-3 bg-[#e3282b] rounded-3xl text-white font-bold  mt-5 w-full' onClick={() => setediton(false)}>Cancel</button>
                                                                                                </div>
                                                                                            </div>

                                                                                        )
                                                                                    }
                                                                                })
                                                                            }
                                                                        </form>
                                                                    </div>


                                                                </Dialog.Panel>
                                                            </Transition.Child>
                                                        </div>
                                                    </div>
                                                </Dialog>
                                            </Transition>
                                        )


                                    }
                                    {
                                        delton && (
                                            <Transition appear show={true} as={Fragment}>
                                                <Dialog as="div" className="relative z-10" onClose={deleteController}>
                                                    <Transition.Child
                                                        as={Fragment}
                                                        enter="ease-out duration-300"
                                                        enterFrom="opacity-0"
                                                        enterTo="opacity-100"
                                                        leave="ease-in duration-200"
                                                        leaveFrom="opacity-100"
                                                        leaveTo="opacity-0"
                                                    >
                                                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                                                    </Transition.Child>

                                                    <div className="fixed inset-0 overflow-y-auto">
                                                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                                                            <Transition.Child
                                                                as={Fragment}
                                                                enter="ease-out duration-300"
                                                                enterFrom="opacity-0 scale-95"
                                                                enterTo="opacity-100 scale-100"
                                                                leave="ease-in duration-200"
                                                                leaveFrom="opacity-100 scale-100"
                                                                leaveTo="opacity-0 scale-95"
                                                            >
                                                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                                               
                                                                    <div className="mt-1 flex justify-center">
                                                                        <form className='w-[80%]' onSubmit={handsdown}>
                                                                            <p className='text-center font-bold text-red-500'>Are you Sure to Delete?</p>
                                                                            <input type="text" name="id" id="id" value={id} className="pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2 w-full" />
                                                                            <div className='flex space-x-2'>
                                                                                <button type="submit" className='py-3 bg-[#4100FA] rounded-3xl text-white font-bold  mt-5 w-full'>Confirm</button>
                                                                                <button className='py-3 bg-[#e3282b] rounded-3xl text-white font-bold  mt-5 w-full' onClick={() => setdelton(false)}>Cancel</button>
                                                                            </div>
                                                                        </form>
                                                                    </div>
                                                                </Dialog.Panel>
                                                            </Transition.Child>
                                                        </div>
                                                    </div>
                                                </Dialog>
                                            </Transition>
                                        )

                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Resources;
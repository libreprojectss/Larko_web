import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { Oval } from 'react-loader-spinner'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import { GetToken } from '../../context/Localstorage';

const { access } = GetToken();
const access_token = access;
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjc4NzI3NTYwLCJpYXQiOjE2Nzg1NTQ3NjAsImp0aSI6ImNlMzViOTA5YTFlNDQ5ZjJhZmIzYmNiMzljNzliZjNmIiwidXNlcl9pZCI6MX0.68tdMyOLR0IvLrKng1ff5r619GO7wd0zDT4RdvBCEVU"
function Inputfields() {
    const [inputFields, setInputFields] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEnable, setEnable] = useState(false);
    async function fetchData() {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/customer/allfields/', {
                headers: {

                    'Authorization': `Bearer ${access_token}`
                }
            });
            setInputFields(response.data.fields);
            setLoading(false);
        } catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        fetchData();
    }, []);
    if (loading) {
        return <div className=' w-3/4 absolute left-50 right-0 my-20'>
            <div className='flex justify-center items-center'>
                <Oval
                    height={50}
                    width={50}
                    color="	#BF40BF"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                    ariaLabel='oval-loading'
                    secondaryColor="#4fa94d"
                    strokeWidth={2}
                    strokeWidthSecondary={2}

                />
            </div>
        </div>;
    }

    return (
        <div className='my-20  w-[68vw] absolute right-0 ml-6 '>
            <div className="py-2.5">
                <div>
                    <h1 className="text-3xl font-bold text-gray-700 text-center my-4
                            ">Customize Input fields </h1>

                    <div className=''>
                        {

                            inputFields.length > 0 && inputFields.map((field, index) => {
                                return (
                                    <Toggle
                                        key={index}
                                        label={field.label}
                                        required={field.required}
                                        selected={field.selected}
                                        field_name={field.field_name}
                                        isEnable={isEnable}
                                        setEnable={setEnable}
                                    />
                                )
                            })
                        }
                    </div>

                </div>


            </div>

        </div>

    )

}

function Toggle({ isEnable, setEnable, label, required, selected, field_name }) {
    const reload = useNavigate();
    function updateToggle() {
        axios.put('http://127.0.0.1:8000/api/customer/allfields/',
            {
                label: label,
                required: required,
                selected: isEnable,
                field_name: field_name
            },
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }

            })
            .then((response) => reload(0)).catch(err => console.log(err));
    }
    function handleToggle() {
        setEnable(!isEnable);
        updateToggle();
        // console.log(label,required,isEnable,field_name)
    }
    return (
        <div className="relative flex  justify-between  overflow-hidden my-2 p-3 ">
            <div className="flex items-center justify-center">
                <label className="inline-flex flex-cols relative mr-5 cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={selected}
                        readOnly
                    />

                    <div
                        onClick={
                            handleToggle
                        }
                        className="w-11 h-6 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4100FA]"
                    ></div>
                    <div className="flex flex-col">

                        {
                            required ? <p className=" ml-4 text-lg font-bold text-gray-900">
                                {/* {label} */}
                                {`${label} *`}
                            </p> :
                                <p className=" ml-4 text-lg font-bold text-gray-900">
                                    {/* {label} */}
                                    {`${label}`}
                                </p>
                        }
                    </div>

                </label>

            </div>
            <div>

                <button className='mx-2 text-md font-semibold'

                >
                    <MyModal
                        label={label}
                        required={required}
                        selected={selected}
                        field_name={field_name}
                    />
                </button>


            </div>
        </div>
    );
}
function MyModal({ label, required, selected, field_name }) {
    const navigate = useNavigate();
    const [input, setInput] = useState(label);
    const [isRequire, setRequire] = useState(required);
    let [isOpen, setIsOpen] = useState(false);

    function closeModal() {
        setIsOpen(false)
    }

    function openModal() {
        setIsOpen(true)
    }
    function handleSubmit(e) {
        e.preventDefault();
        if (input) {
            axios.put('http://127.0.0.1:8000/api/customer/allfields/',

                {
                    label: input,
                    required: isRequire,
                    selected: selected,
                    field_name: field_name
                },
                {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }

                })
                .then((response) => navigate(0)).catch(err => console.log(err));
        }

        // console.log(input, selected, isRequire, field_name)
    }
    return (
        <>
            <div className="flex items-center justify-center">
                <button
                    type="button"
                    onClick={openModal}
                    className="bg-[#4100FA] rounded-xl py-2 px-8 shadow-sm cursor-pointer text-md font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                >
                    Edit
                </button>
            </div>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
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

                                    <div className="mt-2">
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-6">
                                                <label for="title" className="block mb-2 text-md font-medium text-gray-800 ">Enter Label Name</label>
                                                <input type="text"
                                                    className="bg-transparent border border-gray-500 text-gray-900 text-sm rounded-lg  block w-full p-2.5"
                                                    placeholder={`${label}`}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    required />
                                            </div>

                                            <div className="mb-6 flex items-center">
                                                <input type="checkbox"
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    checked={isRequire}
                                                    onChange={() => setRequire((pre) => !pre)}
                                                />
                                                <label for="checked-checkbox" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Required for customer</label>
                                            </div>

                                            <div className='flex justify-between'>
                                                <button
                                                    type='submit'
                                                    className=" text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-bold rounded-lg text-sm  sm:w-auto px-3 py-2 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800">
                                                    Add
                                                </button>

                                            </div>
                                        </form>
                                    </div>

                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

export default Inputfields
import React, { useState } from 'react'
import Nav from '../components/Nav'
import Side from '../components/Side'
import { useEffect } from 'react'
import axios from 'axios'
import { GetToken } from '../../context/Localstorage'
import Resizer from "react-image-file-resizer";
import { AiOutlineCamera } from 'react-icons/ai';
import { SlPeople, GiEntryDoor, MdOutlineCancel, GiSandsOfTime, FaHandsHelping, IoTimeOutline, IoPersonRemove, GiDropEarrings } from 'react-icons/all'
import { useNavigate } from 'react-router-dom'
import { DeleteToken } from '../../context/Localstorage'
import jwt_decode from "jwt-decode";
import { Cell, } from 'recharts';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, } from 'recharts';
import { exportToExcel } from "react-json-to-excel";



function Analytic() {

    console.log('Analytic')
    let { access, refresh } = GetToken()
    const [data, setdata] = useState({ "statistics": {}, "pie_chart": {}, "chart": [{ 'interval': "", 'total_served': '', 'total_entries': '' }] })

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
                console.log(resp.data.access)
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
        axios.get('http://localhost:8000/api/customer/analytics/today/', {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((resp) => {
                console.log(resp.data)
                setdata(resp.data)
            }
            )
            .catch((err) => {
                console.log(err)
            }
            )
    }, [])

    // console.log(data.statistics)
    // console.log(data.pie_chart)

    const test1 = data.statistics;
    const test2 = data.pie_chart;
    const test3 = data.chart
    const test4 = data.services
    const test5 = data.resources

    console.log(data)

    let timeString = test1.avg_wait_time;
    let [hour, minute] = [0, 0];
    if (timeString) {
        [hour, minute] = timeString.split(':');
    }


    let d = []

    const pattern1 = /^\d{2}:\d{2} - \d{2}:\d{2}$/;
    const pattern2 = /^\d{4}-\d{2}-\d{2}$/;
    const input1 = `${test3[0].interval}`;
    const isMatch1 = pattern1.test(input1); //hour
    const isMatch2 = pattern2.test(input1); //day

    if (isMatch1) {
        for (let i = 0; i < test3.length; i++) {
            d.push({ name: `${test3[i].interval}`, 'Total Served': test3[i].total_served, 'Total Entries': test3[i].total_entries })
        }

    }
    if (isMatch2) {
        for (let i = 0; i < test3.length; i++) {
            d.push({ name: `${test3[i].interval}`, 'Total served': `${test3[i].total_served}`, 'Total Entries': `${test3[i].total_entries}` })
        }
    }

    console.log(d)


    const box = [
        { name: 'Serve Rate', value: `${(test1.serve_rate)} %`, icon: <FaHandsHelping size={40} /> },
        { name: 'Arrival Rate', value: `${(test1.avg_arrival_rate * 100).toFixed(2)} %`, icon: <GiDropEarrings size={40} /> },
        { name: 'Wait Time', value: `${hour} hr ${minute} min`, icon: <GiSandsOfTime size={40} /> },
        { name: 'Serve Time', value: `${test1.avg_serve_time}`, icon: <GiSandsOfTime size={40} /> },
        { name: 'Total Cancelled', value: `${test1.total_cancelled}`, icon: <MdOutlineCancel size={40} /> },
        { name: 'Total Served', value: `${test1.total_served}`, icon: <SlPeople size={40} /> },
        { name: 'Total Entries', value: `${test1.total_entries}`, icon: <GiEntryDoor size={40} /> },
        { name: 'Auto Removed', value: `${test1.auto_removed}`, icon: <IoPersonRemove size={40} /> },
    ]
    const line = [
        {
            name: '10-11',
            uv: 4000,
            pv: 2400,
        },
        {
            name: '11-12',
            uv: 3000,
            pv: 1398,
        },
        {
            name: '12-13',
            uv: 2000,
            pv: 9800,
        },
        {
            name: '13-14',
            uv: 2780,
            pv: 3908,
        },
        {
            name: '14-15',
            uv: 1890,
            pv: 4800,
        },
        {
            name: '15-16',
            uv: 2390,
            pv: 3800,
        },
        {
            name: '16-17',
            uv: 3490,
            pv: 4300,
        },

    ];

    // const pie = [
    //     { name: 'Self_Check_IN', value: 400 },
    //     { name: 'Manualy_Added', value: 300 },
    // ];

    const pie = [
        { name: 'Self Added', value: test2.self_checked },
        { name: 'Manually Added', value: test2.manually_added }
    ]

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    function get_data_accordingly(e) {
        console.log(`Welcome to my house ${e.target.value}`)
        axios.get(`http://localhost:8000/api/customer/analytics/${e.target.value}/`, {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((resp) => {
                console.log(resp.data)
                setdata(resp.data)
            }
            )
            .catch((err) => {
                console.log(err)
            }
            )
    }
    const [down, setdown] = useState([])
    function download() {
        console.log("hello");
        axios.get('http://localhost:8000/api/customer/downloadrecords/', {
            headers: {
                authorization: `Bearer ${access}`,
            },
        })
            .then((response) => {
                // console.log(response.data)
                let ht = response.data
                console.log(ht)
                exportToExcel(ht, 'data')
            })
            .catch((error) => {
                console.log(error)
            });
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
                    <div className='mt-20 flex w-full justify-center'>
                        <div className="px-6 py-2.5 text-gray-500 font-medium text-xs leading-tight uppercase rounded-md  mx-2 flex  justify-center items-center space-x-1">
                        </div>

                    </div>
                    <div className='h-full mt-4 flex flex-col justify-start '>
                        <div className='ml-[20vw] flex justify-between items-center mr-[5vw]'>
                            <select name="service" id="service" className='bg-slate-200 text-gray-900 rounded-xl focus:outline-none  block w-[16vw] py-3 pl-2 font-bold text-md' onChange={(e) => { get_data_accordingly(e) }}>
                                <option value="today">Today</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                            </select>
                            <button className='bg-blue-500 rounded-xl py-3 px-6 text-white w-[16vw]' onClick={download}> Download Report</button>
                        </div>
                        <div className='ml-[20vw] mr-[5vw] flex flex-col justify-around mt-7'>
                            <div className="grid lg:grid-cols-4 gap-x-8 gap-y-6">
                                {
                                    box.map((value, index) => {
                                        return (
                                            <div className='bg-slate-100 h-[15vh] w-full rounded-xl shadow-md flex justify-start items-center px-4'>
                                                <div>
                                                    {value.icon}
                                                </div>
                                                <div className='ml-8'>
                                                    <p className='text-md font-bold text-center'>{value.name}</p>
                                                    <p className='text-md font-bold text-teal-400 flex items-center justify-center text-center'>{value.value}</p>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <div className=' flex justify-between items-center mt-7 '>
                                <div className='bg-slate-100  rounded-xl shadow-md'>
                                    <LineChart
                                        width={550}
                                        height={300}
                                        data={d}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="Total Served" stroke="#8884d8" activeDot={{ r: 8 }} />
                                        <Line type="monotone" dataKey="Total Entries" stroke="#82ca9d" />
                                    </LineChart>

                                </div>

                                <div className='bg-slate-100  rounded-xl shadow-md'>
                                    <PieChart width={550} height={300}>
                                        <Pie
                                            data={pie}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pie.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </div>

                            </div>

                            <div className='bg-slate-100  rounded-xl shadow-md mt-7'>
                                <BarChart
                                    width={1100}
                                    height={500}
                                    data={d}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Total Served" fill="#8884d8" />
                                    <Bar dataKey="Total Entries" fill="#82ca9d" />
                                </BarChart>
                            </div>
                        </div>
                        <div className='ml-[20vw] mt-7'>
                            <table className='w-[74vw]'>
                                <thead className="text-sm text-gray-500 font-thin  bg-white border-slate-400">
                                    <tr className='bg-slate-100'>
                                        <th scope="col" className="pl-2 py-4 text-left w-[25%]">Service Name</th>
                                        <th scope="col" className="py-4 text-left w-[25%]">Served</th>
                                        <th scope="col" className="py-4 text-left w-[25%]">System Time</th>
                                        <th scope="col" className="py-4 text-left w-[25%]">Service Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {test4 ? Object.entries(test4).map(([key, value]) => (
                                        <tr key={key} className="text-xs odd:bg-white even:bg-slate-100 ">
                                            <td className="tracking-tight pl-2 py-4 text-left font-semibold text-gray-900">{key}</td>
                                            <td cl>{value.served}</td>
                                            <td>{value.avg_system_time}</td>
                                            <td>{value.average_service_duration}</td>
                                        </tr>
                                    )) :
                                        ''
                                    }
                                </tbody>
                            </table>
                            <div className='mt-7'>
                                <table className='w-[74vw]'>
                                    <thead className="text-sm text-gray-500 font-thin  bg-white border-slate-400">
                                        <tr className='bg-slate-100'>
                                            <th scope="col" className="pl-2 py-4 text-left w-[50%]">Resource</th>
                                            <th scope="col" className="py-4 text-left w-[50%]">Clients</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {test5 ? Object.entries(test5).map(([key, value]) => (
                                            <tr key={key} className="text-xs odd:bg-white even:bg-slate-100 ">
                                                <td className="tracking-tight pl-2 py-4 text-left font-semibold text-gray-900">{key}</td>
                                                <td >{value}</td>
                                            </tr>
                                        )) :
                                            ''
                                        }
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                </section>

            </div >

        </div >
    )
}

export default Analytic;
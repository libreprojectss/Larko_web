import axios from 'axios';
import React, {  useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import Cookie from 'js-cookie'
import { BiArrowBack, SlControlStart, RxCross2 } from 'react-icons/all';

function ViewList() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [joinList, setJoinList] = useState({});
    const [detail, setDetail] = useState({});
    function getJoinlist() {
        axios.get(`http://127.0.0.1:8000/api/joinwaitlist/${id}/`).then((response) => console.log(response.data)).catch((err) => console.log(err))
    }
    useEffect(() => {
        getJoinlist();
        const queue_cookie = Cookie.get('queue_cookies');
        queue_cookie ? axios.post(`http://localhost:8000/api/publiclink/checkqueuestatus/${id}/`, { validation_token: queue_cookie }).then((res) => {
            setJoinList(res.data.Queue_data);
        }).catch(err => console.log(err)) : navigate(`/publicjoin/${id}`)
    }, []);

    return (

        <div className='max-w-lg m-auto'>
            <Header navigate={navigate} id={id} name={joinList.business_name} />
            <div className='text-center mt-8'>
                <h1 className='text-2xl font-bold text-purple-600'>You can see all people here</h1>
                <h2 className='text-lg font-bold mt-4'>{joinList?.length} waiting</h2>
                <h3 className='text-md font-bold mb-2'>Estimated wait: 5 min</h3>
            </div>
            <div className=' overflow-y-auto h-[100vh] table-fixed' >
                <table className="w-full ">
                    <thead className="text-md text-white bg-gray-400 ">
                        <tr >
                            <th scope='col' className='pl-4  py-4 text-start'>

                            </th>
                            <th scope="col" className="px-2 py-4 ">
                                Name
                            </th>
                            <th scope="col" className="p-4 text-end">
                                waited
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        
                        {
                            
                           (joinList.length > 0 ) ?  joinList.map((person, index) => {
                               return (
                                   <tr className="bg-white border-b border-r border-l text-sm " >
                                       <td className="tracking-tight py-4 pl-4 font-semibold text-gray-900">
                                           {person?.rank}
                                       </td>
                                       <td className="tracking-tight py-4  text-center font-semibold text-gray-900">
                                           {person?.first_name}
                                       </td>
                                       <td className="tracking-tight py-4 px-4 font-semibold text-gray-900 text-end">
                                           {`${person?.wait_time.days}days ${ person?.wait_time.minutes}mins  ${ person?.wait_time.seconds}sec`}
                                       </td>
                                   </tr>
                              )
                            }) : 'loading...'
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}


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

export default ViewList
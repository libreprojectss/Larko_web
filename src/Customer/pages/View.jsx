import React,{useState,useEffect} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BsFillBellFill, MdGroup } from 'react-icons/all'
import { redirect } from 'react-router-dom'
import Action from '../components/Action'
import Detail from '../components/Detail'
import Footer from '../components/Footer'
import Status from '../components/Status'
import axios from 'axios'
import Cookie from 'js-cookie'
import Qrcode from '../components/Qrcode'

function View() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [joinList, setJoinList] = useState(null);
  const queue_cookie = Cookie.get('queue_cookies');
  const [token, serToken] = useState(null);
  useEffect(() => {
   
    queue_cookie ? axios.post(`http://localhost:8000/api/joinwaitlist/${id}/`, { validation_token: queue_cookie }).then((res) => {
      serToken(res.data.queue_token);
      setJoinList(res.data);
    }).catch(err => console.log(err)) :  navigate(`/publicjoin/${id}`)
  },[id]);
      
  return (
    <>

      <div className='max-w-md m-auto'>

      <div className='flex flex-col justify-center items-center mt-16 mx-6'>
        <div className='w-20 h-20 rounded-full border-yellow-500 border-4 mb-2 p-4'>
          <BsFillBellFill
            color='orange'
            size='40'
          />
          </div>
      
          <div className='flex items-center my-4'>
            <h1 className='text-4xl font-bold mx-2'>{joinList?.rank} </h1>
            <MdGroup color='gray'
              size='50' />
          </div>
          <h1 className='text-3xl text-gray-500 font-bold mx-2'>{joinList?.status} </h1>

      </div>
      <div className='mx-6'>
          <Status id={id} />
          <Qrcode queue_token={token} />
          <Detail personalInfo={joinList?.personalInfo} />
        <Action id={id} />
      </div>
      </div>
      <Footer />
    </>
  )
}

export default View
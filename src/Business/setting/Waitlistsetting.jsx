import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Side from '../components/Side'
import Nav from '../components/Nav'
import SettingSidebar from '../../components/SettingSidebar'
import axios from 'axios'
import { GetToken } from '../../context/Localstorage'
import jwt_decode from "jwt-decode";

function Component() {
  const [enabled, setEnabled] = useState(false);
  const [venabled, setvenabled] = useState(false);
  const [fetch, setfetch] = useState([]);
  const [modal, setmodal] = useState(false)
  const [change, setchange] = useState(false);
  const [Arg, setArg] = useState({})
  const from = ['6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
  const to = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
  const day = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const { access, refresh } = GetToken();

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
    axios.get('http://localhost:8000/api/user/autoattributes/', {
      "headers": {
        "authorization": `Bearer ${access}`
      }
    })
      .then((resp) => {
        console.log(resp.data)
        setArg(resp.data)
        console.log(Arg)
      }
      )
      .catch((err) => {
        console.log(err)
      }
      )
  }, [change])

  useEffect(() => {
    axios.get('http://localhost:8000/api/user/openclosepubliclink/', {
      "headers": {
        "authorization": `Bearer ${access}`
      }
    })
      .then((resp) => {
        setEnabled(resp.data.status)
      }
      )
      .catch((err) => {
        console.log(err)
      }
      )
  }, [change])

  useEffect(() => {
    axios.get('http://localhost:8000/api/user/openclosevalidation/', {
      "headers": {
        "authorization": `Bearer ${access}`
      }
    })
      .then((resp) => {
        setvenabled(resp.data.status)
        localStorage.setItem('Validation', resp.data.status)
      }
      )
      .catch((err) => {
        console.log(err)
      }
      )
  }, [change])

  useEffect(() => {
    axios.get('http://localhost:8000/api/user/operationschedule/', {
      "headers": {
        "authorization": `Bearer ${access}`
      }
    })
      .then((resp) => {
        setfetch(resp.data)
        // console.log(fetch)
      }
      )
      .catch((err) => {
        console.log(err)
      }
      )
  }, [change])

  const call = () => {
    validity()
    setEnabled(!enabled);
    axios.get(`http://localhost:8000/api/user/openclosepubliclink/${!enabled == false ? 0 : 1}`, {
      "headers": {
        "authorization": `Bearer ${access}`
      }
    })
      .then((resp) => {
        console.log(resp.data.status)
        setchange(!change)
      }
      )
      .catch((err) => {
        console.log(err)
      }
      )
  }

  const mall = () => {
    validity()
    setvenabled(!venabled)
    axios.get(`http://localhost:8000/api/user/openclosevalidation/${!venabled == false ? 0 : 1}`, {
      "headers": {
        "authorization": `Bearer ${access}`
      }
    })
      .then((resp) => {
        console.log(resp.data.status)
        localStorage.setItem('Validation', resp.data.status)
        setchange(!change)
      }
      )
      .catch((err) => {
        console.log(err)
      }
      )
  }
  function moveString(array, string) {
    // Find the index of the string in the array
    let index = array.indexOf(string);
    // If the string is not found, return the original array
    if (index === -1) {
      return array;
    }
    // Otherwise, remove the string from the array
    let removed = array.splice(index, 1);
    // Add the string to the beginning of the array
    array.unshift(removed[0]);
    // Return the modified array
    return array;
  }
  function handlechange(e) {
    e.preventDefault()
    validity()
    setmodal(!modal)
    const formdata = new FormData(e.target)
    let c = Array.from(formdata)
    // console.log(c)
    let d = []
    for (let k = 0; k < c.length;) {
      if (c[k][0] == 'holiday') {
        c[k][1] = true
        console.log(c[k + 1][1], c[k][1], c[k + 3][1], c[k + 2][1])
        d.push({ day: c[k + 1][1], holiday: c[k][1], end_time: c[k + 3][1], start_time: c[k + 2][1] })
        k = k + 4;
      }
      else {
        console.log(c[k][1], 'false', c[k + 2][1], c[k + 1][1])
        d.push({ day: c[k][1], holiday: false, end_time: c[k + 2][1], start_time: c[k + 1][1] })
        k = k + 3;
      }
    }
    console.log(d);
    axios.post(`http://localhost:8000/api/user/operationschedule/`, d, {
      "headers": {
        "authorization": `Bearer ${access}`
      }
    })
      .then((resp) => {
        console.log(resp.data)
        setchange(!change)
      }
      )
      .catch((err) => {
        console.log(err)
      }
      )

  }
  function parametarize(e) {
    e.preventDefault()
    console.log(access)
    const formdata = new FormData(e.target)
    console.log(formdata.get("maximum_serve_per_day"))
    console.log(formdata.get("auto_remove_after"))
    axios.post('http://localhost:8000/api/user/autoattributes/', formdata, {
      "headers": {
        "authorization": `Bearer ${access}`
      }
    })
      .then((resp) => {
        console.log(resp.data)
        e.target.reset();
        setchange(!change)
      }
      )
      .catch((err) => {
        console.log(err)
      }
      )

  }

  const murder = (e) => {
    console.log("Hello")
    console.log(Arg)
    const newdata = { ...Arg };
    newdata[e.target.id] = e.target.value;
    setArg(newdata);
  }

  return (
    <div className='my-20  w-[68vw] absolute right-0 ml-6 mt-16'>
      <div className="px-4 py-2.5 bg-white mx-2 flex justify-center items-center">
        <div className=''>
          <h1 className="text-4xl font-bold text-gray-700  my-4  py-2 text-center">Waitlist</h1>

          <div className='flex flex-col justify-around'>

            <div className='py-5'>
              <div className='relative'>
              </div>
              <div>
                <label className="inline-flex relative items-center mr-5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={enabled}
                    readOnly
                  />
                  <div
                    onClick={call}
                    className="w-11 h-6 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4100FA]"
                  ></div>
                  <span className="ml-2 font-bold text-gray-900">
                    Allow Public Registration
                  </span>
                </label>
              </div>
            </div>

            <div>
              <div className='relative'>
              </div>
              <div>
                <label className="inline-flex relative items-center mr-5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={venabled}
                    readOnly
                  />
                  <div
                    onClick={mall}
                    className="w-11 h-6 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4100FA]"
                  ></div>
                  <span className="ml-2 font-bold text-gray-900">
                    Allow Token Validation
                  </span>
                </label>
              </div>

            </div>


            <div className='w-[32vw] py-5'>
              <div className='font-bold text-2xl pb-5'>Work Day and Hour</div>
              <div className='p-5 bg-slate-100 shadow-md rounded-xl'>
                {
                  fetch.map((value, index) => {
                    return (
                      <div key={index} className='flex w-[30vw]'>
                        <div className='w-[20vw] pt-3 '>
                          <input type="checkbox" name="holiday" id="holiday" checked={value.holiday} className='scale-150 mr-2' onClick={() => { return false }} />
                          <span className='font-bold'>{value.day}</span>
                        </div>
                        <div className='w-[10vw]'>
                          <select name="start_time" id="start_time" className='ml-2 pl-2 py-1 focus:outline-none bg-slate-200 rounded-md my-2' disabled>
                            {
                              moveString(from, `${value.start_time}`) &&
                              from.map((data, index) => {
                                return (<option key={index} value={`${data}`}>{data}</option>)
                              })
                            }
                          </select>
                          <select name="end_time" id="end_time" className='ml-2 pl-2 py-1 focus:outline-none bg-slate-200 rounded-md my-2' disabled>
                            {
                              moveString(to, `${value.end_time}`) &&
                              to.map((data, index) => {
                                return (<option key={index} value={`${data}`}>{data}</option>)
                              })
                            }
                          </select>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
              <div className=''>
                <button className='py-3 bg-[#4100FA] rounded-xl text-white font-bold  mt-5 w-full' onClick={() => { setmodal(!modal) }}>Click to Update Schedule</button>
              </div>
            </div>
            <div >
              <form onSubmit={parametarize} className='flex flex-col w-[32vw]'>
                <label htmlFor="maximum_serve_per_day" className="font-bold mt-3">Serve Capacity</label>
                <input type="number" name="maximum_serve_per_day" id="maximum_serve_per_day" value={Arg.maximum_serve_per_day} placeholder='Serve Capacity' className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2' onChange={murder} />
                <label htmlFor="auto_remove_after" className="font-bold mt-3">Auto Remove</label>
                <input type="number" name="auto_remove_after" id="auto_remove_after" value={Arg.auto_remove_after} placeholder='Auto Remove' className='pl-2 py-3 focus:outline-none bg-slate-200 rounded-md my-2' onChange={murder} />
                <button className='py-3 bg-[#4100FA] rounded-xl text-white font-bold  mt-5 w-full'>Change Parameter</button>
              </form>
            </div>
          </div>
          {
            modal && (
              <Transition appear show={true} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setmodal(false)}>
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
                        <Dialog.Panel className=" max-w-2xl transform overflow-hidden rounded-2xl bg-slate-100 p-6 text-left align-middle shadow-xl transition-all">

                          <div className="mt-1 flex justify-center">

                            <form onSubmit={handlechange} className=''>
                              {
                                fetch.map((value, index) => {
                                  return (
                                    <div key={index} className='flex'>

                                      <div className='w-full pt-3 '>
                                        <input type="checkbox" name="holiday" id="holiday" className='scale-150 mr-2' defaultChecked={value.holiday} />
                                        <input type="text" name="day" id="day" value={value.day} readonly className='focus:outline-none font-bold fill-transparent bg-slate-100' />
                                      </div>
                                      <div className='flex justify-between items-center'>
                                        <select name="start_time" id="start_time" className='ml-2 pl-2 py-1 focus:outline-none bg-slate-200 rounded-md my-2'>
                                          {
                                            moveString(from, `${value.start_time}`) &&
                                            from.map((data, index) => {
                                              return (<option key={index} value={`${data}`}>{data}</option>)
                                            })
                                          }
                                        </select>
                                        <select name="end_time" id="end_time" className='ml-2 pl-2 py-1 focus:outline-none bg-slate-200 rounded-md my-2'>
                                          {
                                            moveString(to, `${value.end_time}`) &&
                                            to.map((data, index) => {
                                              return (<option key={index} value={`${data}`}>{data}</option>)
                                            })
                                          }
                                        </select>
                                      </div>

                                    </div>
                                  )
                                })
                              }
                              <button type="submit" className='py-3 bg-[#4100FA] rounded-xl text-white font-bold  mt-5 w-full'>Confirm</button>
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

    </div >
  )
}
function Waitlistsetting() {
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
          <Component />
        </div>
      </section>

    </div>
  )
}

export default Waitlistsetting
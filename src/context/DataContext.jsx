import { createContext, useState, useEffect } from "react";
import Axios from 'axios';
import { GetToken } from "./Localstorage";
import { GetTkn, StoreBusinessProfile } from "./Localstg";

const { access } = GetToken();
const { count }= GetTkn();
const access_token = access;

export const DataContext = createContext();

export const ContextProvider = ({ children }) => {
    const [waitList, setWaitlist] = useState([]);
    const [message, setMessage] = useState(null);
    const [businessprofile, setBusinessProfile] = useState([]);
    const [services, setServices] = useState([]);
    const getWaitlist = () => {
        Axios.get('http://127.0.0.1:8000/api/customer/waitlist/',
            {
                headers: {

                    'Authorization': `Bearer ${access_token}`
                }
            }
        ).then((response) => {
         
            setWaitlist(response.data)
        }).catch((error) => console.log(error));

    }

    const addToWaitlist = (inputs) => {
        Axios.post('http://127.0.0.1:8000/api/customer/waitlist/',
            {
                headers: {

                    'Authorization': `Bearer ${access_token}`
                }
            }, inputs).then((response) => {
                setMessage(response.message)
            }).catch((error) => console.log(error));

    }
    const getBusinessProfile = () => {
        Axios.get('http://127.0.0.1:8000/api/user/businessprofile/',
            {
                headers: {

                    'Authorization': `Bearer ${access_token}`
                }
            }).then((response) => {
                setBusinessProfile(response.data)

            }).catch((error) => console.log(error));
    }
    const getServices = () => {
        Axios.get('http://127.0.0.1:8000/api/customer/services/', {
            "headers": {
                "authorization": `Bearer ${access}`
            }
        })
            .then((response) => {
                setServices(response.data)
            }
            )
            .catch((err) => {
                console.log(err)
            }
            )
}
    return (
        <DataContext.Provider value={{ waitList, message, businessprofile,services,getServices, getWaitlist, addToWaitlist, getBusinessProfile , access ,count}}>
            {children}
        </DataContext.Provider>
    );
}

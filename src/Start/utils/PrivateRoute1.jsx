import React, { useContext } from 'react'
import { Outlet, Navigate } from 'react-router-dom';
import { GetToken } from '../../context/Localstorage';
import { GetTkn } from '../../context/Localstg';

export default function PrivateRoute1() {

    const {access}=GetToken();
    const {count}=GetTkn();

    if (access) {
        // console.log('Hello from private route 11')
        return <Outlet />
    }
    else {
        // console.log('Hello from private route 12')
        return (
            
            <Navigate to='/signup' />
        )
    }
}

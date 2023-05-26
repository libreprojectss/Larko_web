import { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { GetToken } from '../../context/Localstorage';

import React from 'react'
import { GetTkn } from '../../context/Localstg';

export default function PrivateRoute2() {
    
    const {count}=GetTkn();
    const {access}=GetToken();
    if (access) {
        // console.log('Hello from private route 21')
        return (
            <Navigate to='/user' />
        )
    }
    else {
        // console.log('Hello from private route 22')
        return <Outlet />
    }
}

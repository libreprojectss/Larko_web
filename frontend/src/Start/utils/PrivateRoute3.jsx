
import { Outlet, Navigate } from 'react-router-dom';
import { GetToken } from '../../context/Localstorage';

import React from 'react'
import { GetTkn } from '../../context/Localstg';

export default function PrivateRoute3() {
    const { count } = GetTkn();
    const { access } = GetToken();
    if (access && count) {
        console.log('Hello from private route 31')
        return (
            <Outlet />
        )
    }
    else {
        console.log('Hello from private route 32')
        return <Navigate to='/signup' />
    }

}

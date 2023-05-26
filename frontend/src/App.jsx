import { useContext, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Admin from './Business/pages/Admin'
import Waitlist from './Business/pages/Waitlist'
import Serving from './Business/pages/Serving'
import Services from './Business/pages/Services'
import Settings from './Business/pages/Settings'
import Welcome from './Customer/pages/Welcome'
import CheckI from './Customer/pages/CheckI'
import CheckII from './Customer/pages/CheckII'
import View from './Customer/pages/View'
import Visits from './Customer/pages/Visits'
import GeneralSetting from './Business/setting/GeneralSetting'
import Waitlistsetting from './Business/setting/Waitlistsetting'
import Servicessetting from './Business/setting/Servicessetting'
import Login_Page from './Start/components/Login_Page'
import Registration_Page from './Start/components/Registration_Page'
import Lastform from './Start/components/Lastform'
import PrivateRoute1 from './Start/utils/PrivateRoute1'
import PrivateRoute2 from './Start/utils/PrivateRoute2'
import Editbusinessform from './Start/components/Editbusinessform'
import Registration_LandingPage from './Start/components/Registration_LandingPage'
import PrivateRoute3 from './Start/utils/PrivateRoute3'
import Resourcessetting from './Business/setting/Resourcessetting'
import ViewList from './Customer/pages/ViewList'
import Resources from './Business/pages/Resources'
import Analytic from './Business/pages/Analytic'
import Cookie from 'js-cookie'
function App() {
const queue_cookie = Cookie.get('queue_cookie')
  return (

    <BrowserRouter>

      <Routes>
        <Route path='/' element={<PrivateRoute2 />}>
          <Route path='' element={<Registration_LandingPage />} />
          <Route path='login' element={<Login_Page />} />
          <Route path='signup' element={<Registration_Page />} />
        </Route>
        <Route path='/user' element={<PrivateRoute1 />}>
          <Route path='' element={<Waitlist />} />
          <Route path='serving' element={<Serving />} />
          <Route path='services' element={<Services />} />
          <Route path='resources' element={<Resources />} />
          <Route path='analytic' element={<Analytic />} />
          <Route path='settings/general' element={<GeneralSetting />} />
          <Route path='settings/waitlist' element={<Waitlistsetting />} />
          <Route path='settings/services' element={<Servicessetting />} />
          <Route path='settings/resources' element={<Resourcessetting />} />
          <Route path='settings/inputfields' element={<Settings />} />
         
        </Route>
        <Route path='/lastform' element={<PrivateRoute3 />}>
          <Route path='' element={<Lastform />} />
        </Route>
   
        {/* <Route path='/visits' element={<Visits />} /> */}

        <Route path='/publicjoin/:id/dash' element={<View />} />
        <Route path='/publicjoin/:id' element={<Welcome />} />
        <Route path='/publicjoin/:id/fill' element={<CheckII />} />
        <Route path='/publicjoin/:id/viewqueue' element={<ViewList />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

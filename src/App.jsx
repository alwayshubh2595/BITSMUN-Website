import Header from './components/Header'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import AboutUs from './Pages/AboutUs'
import Committees from './Pages/Committees'
import Registrations from './Pages/Registrations'
import ContactUs from './Pages/ContactUs'
import EntryState from './Context/EntryState'
import Developer from './Pages/Developer'
import EBRegistrations from './Pages/EBRegistrations'
import ErrorPage from './Pages/ErrorPage'
import BG from './Pages/BG'
import IntReg from './Pages/IntReg'
import CampusAmbassador from './Pages/CampusAmbassador'
import Gallery from './Pages/Gallery'
function App() {

  return (
    <EntryState>
    <BrowserRouter>
      <Routes>
        <Route path='/' Component={Home} />
        <Route path='*' Component={ErrorPage} />
        <Route path='/AboutUs' Component={AboutUs} />
        <Route path='/Committees' Component={Committees} />
        <Route path='/Registrations' Component={Registrations} />
        <Route path='/EBRegistrations' Component={EBRegistrations} />
        <Route path='/ContactUs' Component={ContactUs} />
        <Route path='/Developer' Component={Developer} />
        <Route path='/BG' Component={BG} />
        <Route path='/InternationalRegistrations' Component={IntReg} />
        <Route path='/CampusAmbassador' Component={CampusAmbassador} />
        <Route path='/Gallery' Component={Gallery} />

      </Routes>
    </BrowserRouter>
    </EntryState>
  )
}

export default App

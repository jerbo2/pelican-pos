import { useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import Landing from './components/Landing'
import NewOrder from './components/Orders/NewOrder'
import ActiveOrders from './components/Orders/ActiveOrders'
import PastOrders from './components/Orders/PastOrders'
import ConfigLanding from './components/Configuration/ConfigLanding'
import { Configuration } from './components/Configuration/Configuration'
import Login from './components/Login'
import { UserContext } from './components/BaseComps/contexts/UserContext'
import Reports from './components/Reports'
import { WebSocketProvider } from './components/BaseComps/contexts/WebSocketContext'
import { WEBSOCKET_URL } from './components/Constants'

const AppRoutes = () => {
  const { token } = useContext(UserContext)
  let location = useLocation();

  const PrivateRoutes = () => {
    const location = useLocation();
    return (
      token ? <Outlet /> : <Navigate to='/login' state={{ from: location }} />
    )
  }

  const AdminRoutes = () => {
    const is_admin = localStorage.getItem('admin') === 'true';
    return (
      is_admin ? <Outlet /> : <Navigate to='/' />
    )
  }

  return (
    <Routes location={location}>
      <Route element={<PrivateRoutes />}>
        <Route path="/" element={<Landing />} />
        <Route path="/order" element={<NewOrder />} />
        <Route path="/order/:category" element={<NewOrder />} />
        <Route path="/active-orders" element={<ActiveOrders />} />
        <Route path="/active-orders/:category" element={<ActiveOrders />} />
        <Route path="/past-orders" element={<PastOrders />} />
      </Route>
      <Route element={<AdminRoutes />}>
        <Route path="/config" element={<ConfigLanding />} />
        <Route path="/config/:category" element={<Configuration />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}


export default function App() {
  return (
    <WebSocketProvider url={WEBSOCKET_URL}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </WebSocketProvider>
  )
}


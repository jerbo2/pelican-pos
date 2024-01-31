import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Landing from './components/Landing';
import NewOrderLanding from './components/NewOrders/NewOrderLanding';
import './index.scss'
import ActiveOrders from './components/ActiveOrders';
import PastOrders from './components/PastOrders';
import { Configuration } from './components/Configuration/Configuration';
import { createTheme, ThemeProvider } from '@mui/material';
import ConfigLanding from './components/Configuration/ConfigLanding';
import { LoadingProvider } from './components/Loading/LoadingContext';
import { AxiosInterceptorSetup } from './components/Loading/LoadingInterceptors';
import LoadingIndicator from './components/Loading/LoadingIndicator';
import NewOrder from './components/NewOrders/NewOrder';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'



const theme = createTheme({
  palette: {
    primary: {
      main: '#181c24',
    },
    secondary: {
      main: '#f0f4f4',
    },
  },
  spacing: 2,
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/new-order",
    element: <NewOrderLanding />,
  },
  {
    path: "/new-order/:category",
    element:
      <NewOrder />
  },
  {
    path: "/active-orders",
    element: <ActiveOrders />,
  },
  {
    path: "/past-orders",
    element: <PastOrders />,
  },
  {
    path: "/config",
    element: <ConfigLanding />,
  },
  {
    path: "/config/:category",
    element: <Configuration />
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <LoadingProvider>
        <AxiosInterceptorSetup />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <RouterProvider router={router} />
        </LocalizationProvider>
        <LoadingIndicator />
      </LoadingProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

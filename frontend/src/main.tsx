import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Landing from './components/Landing';
import './index.scss'
import ActiveOrders from './components/Orders/ActiveOrders';
import PastOrders from './components/Orders/PastOrders';
import { Configuration } from './components/Configuration/Configuration';
import { createTheme, ThemeProvider } from '@mui/material';
import ConfigLanding from './components/Configuration/ConfigLanding';
import { LoadingProvider } from './components/Loading/LoadingContext';
import { AxiosInterceptorSetup } from './components/Loading/LoadingInterceptors';
import LoadingIndicator from './components/Loading/LoadingIndicator';
import NewOrder from './components/Orders/NewOrder';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

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
    path: "/order",
    element: <NewOrder />,
  },
  {
    path: "/order/:category",
    element:
      <NewOrder />
  },
  {
    path: "/active-orders",
    element: <ActiveOrders />,
  },
  {
    path: "/active-orders/:category",
    element: <ActiveOrders />,
  },
  {
    path: "/active-orders/checkout",
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
  },
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

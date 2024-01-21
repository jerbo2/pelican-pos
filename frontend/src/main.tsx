import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Landing from './components/Landing';
import NewOrder from './components/NewOrder';
import './index.scss'
import ActiveOrders from './components/ActiveOrders';
import PastOrders from './components/PastOrders';
import { Configuration } from './components/Configuration/Configuration';
import { createTheme, ThemeProvider } from '@mui/material';
import ConfigLanding from './components/Configuration/ConfigLanding';

// declare module '@mui/material/styles' {
//   interface Theme {
//     status: {
//       danger: string;
//     };
//   }
//   // allow configuration using `createTheme`
//   interface ThemeOptions {
//     status?: {
//       danger?: string;
//     };
//   }
// }

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
    element: <NewOrder />,
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
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)

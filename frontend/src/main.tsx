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
import Configuration from './components/Configuration';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing/>,
  },
  {
    path: "/new-order",
    element: <NewOrder/>,
  },
  {
    path: "/active-orders",
    element: <ActiveOrders/>,
  },
  {
    path: "/past-orders",
    element: <PastOrders/>,
  },
  {
    path: "/config",
    element: <Configuration/>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Landing from './components/Landing';
import NewOrder from './components/NewOrder';
import './index.css'
import ActiveOrders from './components/ActiveOrders';
import PastOrders from './components/PastOrders';

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
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

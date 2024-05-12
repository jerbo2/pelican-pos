import React, { useState, createContext, useEffect, Dispatch, SetStateAction } from 'react';
import { Order } from '../NewOrderForm';
import axios from 'axios';

type Configuration = {
    label: string;
    value: string;
}

type OrderItems = {
    item_name: string;
    configurations: Configuration[];
    quantity: number;
    price: number;
}

const OrderContext = createContext<{
    activeOrder: Order,
    setActiveOrder: Dispatch<SetStateAction<Order>>,
    orderItems: OrderItems[],
    setOrderItems: Dispatch<SetStateAction<OrderItems[]>>
}>({
    activeOrder: { id: -1, status: '', created_at: '' },
    setActiveOrder: () => { },
    orderItems: [],
    setOrderItems: () => { },
});

const OrderProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [activeOrder, setActiveOrder] = useState<Order>({ id: -1, status: '', created_at: '' });
    const [orderItems, setOrderItems] = useState<OrderItems[]>([]);

    useEffect(() => {
        // retreive active order from session storage if available
        if (sessionStorage.getItem('activeOrder')) {
            const getOrder = async () => {
                const orderID = JSON.parse(sessionStorage.getItem('activeOrder') || '{}');
                const url = `/api/v1/orders/${orderID}/`
                const order = await axios.get(url)
                setActiveOrder(order.data)
                console.log(order.data)
            }
            getOrder();
        }
    }, [])

    return (
        <OrderContext.Provider value={{ activeOrder, setActiveOrder, orderItems, setOrderItems }}>
            {children}
        </OrderContext.Provider>
    );
};

export { OrderContext, OrderProvider };
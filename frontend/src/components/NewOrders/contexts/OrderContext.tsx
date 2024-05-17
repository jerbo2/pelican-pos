import React, { useState, createContext, useEffect, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import { Order, OrderItems } from '../../BaseComps/dbTypes';


export const defaultOrderItem: OrderItems = {
    id: -1,
    item_name: '',
    category_name: '',
    configurations: [],
    quantity: 0,
    price: 0
}

const OrderContext = createContext<{
    activeOrder: Order,
    setActiveOrder: Dispatch<SetStateAction<Order>>,
    orderItems: OrderItems[],
    setOrderItems: Dispatch<SetStateAction<OrderItems[]>>
    editItem: OrderItems,
    setEditItem: Dispatch<SetStateAction<OrderItems>>
}>({
    activeOrder: { id: -1, status: '', created_at: '' },
    setActiveOrder: () => { },
    orderItems: [],
    setOrderItems: () => { },
    editItem: defaultOrderItem,
    setEditItem: () => { }
});

const OrderProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [activeOrder, setActiveOrder] = useState<Order>({ id: -1, status: '', created_at: '' });
    const [orderItems, setOrderItems] = useState<OrderItems[]>([]);
    const [editItem, setEditItem] = useState<OrderItems>(defaultOrderItem);

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
        <OrderContext.Provider value={{ activeOrder, setActiveOrder, orderItems, setOrderItems, editItem, setEditItem }}>
            {children}
        </OrderContext.Provider>
    );
};

export { OrderContext, OrderProvider };
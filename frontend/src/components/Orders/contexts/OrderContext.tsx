import React, { useState, createContext, useEffect, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import { AdditionalOrderInfo, FormValue, Order, OrderItems } from '../../BaseComps/dbTypes';
import dayjs from 'dayjs';


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
    setEditItem: Dispatch<SetStateAction<OrderItems>>,
    additionalOrderInfo: AdditionalOrderInfo,
    setAdditionalOrderInfo: Dispatch<SetStateAction<AdditionalOrderInfo>>
    formValues: FormValue[],
    setFormValues: Dispatch<SetStateAction<FormValue[]>>
    orders: Order[],
    setOrders: Dispatch<SetStateAction<Order[]>>
}>({
    activeOrder: { id: -1, status: '', created_at: '' },
    setActiveOrder: () => { },
    orderItems: [],
    setOrderItems: () => { },
    editItem: defaultOrderItem,
    setEditItem: () => { },
    additionalOrderInfo: {},
    setAdditionalOrderInfo: () => { },
    formValues: [],
    setFormValues: () => { },
    orders: [],
    setOrders: () => { }

});

const OrderProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [activeOrder, setActiveOrder] = useState<Order>({ id: -1, status: '', created_at: '' });
    const [orderItems, setOrderItems] = useState<OrderItems[]>([]);
    const [editItem, setEditItem] = useState<OrderItems>(defaultOrderItem);
    const [additionalOrderInfo, setAdditionalOrderInfo] = useState<AdditionalOrderInfo>({customer_name: '', customer_phone_number: '', complete_at: dayjs()});
    const [formValues, setFormValues] = useState<FormValue[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        // retreive active order from session storage if available
        if (sessionStorage.getItem('activeOrder')) {
            const getOrder = async () => {
                const orderID = JSON.parse(sessionStorage.getItem('activeOrder') || '{}');
                const url = `/api/v1/orders/${orderID}/`
                const order = await axios.get(url)
                setActiveOrder(order.data)
                console.log(order.data)
                setAdditionalOrderInfo({ 
                    customer_name: order.data.customer_name || '', 
                    customer_phone_number: order.data.customer_phone_number || '',
                    complete_at: order.data.complete_at ? dayjs.utc(order.data.complete_at) : dayjs()
                })
            }
            getOrder();
        }
    }, [])

    return (
        <OrderContext.Provider value={{ activeOrder, setActiveOrder, orderItems, setOrderItems, editItem, setEditItem, additionalOrderInfo, setAdditionalOrderInfo, formValues, setFormValues, orders, setOrders }}>
            {children}
        </OrderContext.Provider>
    );
};

export { OrderContext, OrderProvider };
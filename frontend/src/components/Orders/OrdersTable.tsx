import { useEffect, useContext } from 'react';
import { DataGrid } from '../Styled';
import axios from 'axios';
import { Order } from '../BaseComps/dbTypes';
import dayjs, { Dayjs } from 'dayjs';
import { UIContext } from '../BaseComps/contexts/UIContext';
import { OrderContext } from './contexts/OrderContext';
import { Fade } from '@mui/material';
import { WebSocketContext } from '../BaseComps/contexts/WebSocketContext';

export const fetchOrders = async (status: string) => {
    try {
        const response = await axios.get(`/api/v1/orders?status=${status}`);
        let data = response.data;
        data = data.map((order: Order, _: number) => {
            return {
                id: order.id,
                status: order.status,
                customer_name: order.customer_name,
                customer_phone_number: order.customer_phone_number,
                complete_at: dayjs.utc(order.complete_at),
                transaction: order.transaction,
            };
        });
        return data;
    } catch (error) {
        console.error('Failed to fetch active orders:', error);
        return [];
    }
}

const formatDate = (date: Dayjs) => {
    const localDate = date.tz(dayjs.tz.guess());

    const formattedDate = localDate.format('ddd, MMMM DD');
    let formattedTime = localDate.format('hh:mm A');

    if (formattedTime.startsWith('0')) {
        formattedTime = formattedTime.substring(1);
    }


    // check if day is today
    if (localDate.isSame(dayjs(), 'day')) {
        return formattedTime;
    }
    return `${formattedDate} ${formattedTime}`;
}

const columns = [
    { field: 'id', headerName: 'ID', flex: 0.5 },
    { field: 'customer_name', headerName: 'Customer Name', flex: 1 },
    { field: 'customer_phone_number', headerName: 'Phone Number', flex: 1 },
    {
        field: 'complete_at',
        headerName: 'Complete At',
        flex: 1,
        valueFormatter: (date: Dayjs) => formatDate(date),
    },
];

export default function OrdersTable({ status }: { status: string }) {
    const { setOpenPopup, openPopup } = useContext(UIContext);
    const { orders, setOrders, setOrderItems, setAdditionalOrderInfo, setActiveOrder } = useContext(OrderContext);
    const { lastMessage } = useContext(WebSocketContext);

    useEffect(() => {
        const messageData = JSON.parse(lastMessage || '{}');
        console.log('received message:', messageData)
        switch (messageData.type) {
            case 'order-update':
                const orderToUpdate = orders.find(order => order.id === messageData.payload.id);
                if (!orderToUpdate) return;
                console.log(messageData.payload)
                const updatedOrder = {
                    ...orderToUpdate,
                    customer_name: messageData.payload.customer_name || orderToUpdate.customer_name,
                    customer_phone_number: messageData.payload.customer_phone_number || orderToUpdate.customer_phone_number,
                    complete_at: dayjs.utc(messageData.payload.complete_at || orderToUpdate.complete_at),
                    transaction: messageData.payload.transaction || orderToUpdate.transaction,
                } as Order;
                setOrders((prevOrders) => prevOrders.map(order => order.id === updatedOrder.id ? updatedOrder : order));
                break;
            case 'order-submit':
                console.log('order-submit');
                const orderToAdd = {
                    ...messageData.payload,
                    complete_at: dayjs.utc(messageData.payload.complete_at),
                }
                setOrders((prevOrders) => [...prevOrders, orderToAdd]);
                break;
            case 'order-delete':
                console.log('order-delete');
                setOrders((prevOrders) => prevOrders.filter(order => order.id !== messageData.payload.id));
                break;
            default:
                break;
        }
    }, [lastMessage]);

    useEffect(() => {
        if (openPopup && orders.length !== 0) return;
        fetchOrders(status).then((data) => setOrders(data));
    }, []); // could make new changed state but this is fine

    const handleRowClick = async (table_comp: any) => {
        const row = table_comp.row;
        setActiveOrder({ ...row, status: status });
        setAdditionalOrderInfo({
            customer_name: row.customer_name,
            customer_phone_number: row.customer_phone_number,
            complete_at: row.complete_at.tz(dayjs.tz.guess()),
        });

        const url = `/api/v1/orders-items/${table_comp.id}/`;
        const response = await axios.get(url);
        setOpenPopup(true);
        console.log(response.data)
        setOrderItems(response.data);
    }

    return (
        <Fade in={orders.length > 0}>
            <div style={{ height: '100vh', width: '100%', margin: '8px' }}>
                <DataGrid rows={orders} columns={columns} autoHeight disableRowSelectionOnClick initialState={{
                    sorting: {
                        sortModel: [{ field: 'complete_at', sort: 'asc' }],
                    },
                }} onRowClick={(table_comp) => handleRowClick(table_comp)} />
            </div>
        </Fade>
    );
};

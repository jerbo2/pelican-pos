import { useContext, useEffect, useState, useMemo } from 'react';
import { List, Typography } from '@mui/material';
import { CenterGrid, IconButton, Divider } from '../Styled';
import { OrderContext } from './contexts/OrderContext';
import { UIContext } from '../BaseComps/contexts/UIContext';
import { WebSocketContext } from '../BaseComps/contexts/WebSocketContext';
import dayjs, { Dayjs } from 'dayjs';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { useLocation, useNavigate } from 'react-router';
import CloseButton from '../BaseComps/CloseButton';
import { OrderItems } from '../BaseComps/dbTypes';
import axios from 'axios';
import _ from 'lodash';
import { POPUP_FADE_DURATION } from '../Constants';

import Checkout from './Checkout';

import { getPriceInfo, validatePhoneNumber, validateAdditionalOrderInfo } from './utils/orderUtils';
import OrderItemDetails from './OrderItemDetails';
import OrderInfoInput from './OrderInfoInput';
import OrderActionButtons from './OrderActionButtons';
import PrintDialog, { showPrintDialog } from './PrintDialog';
import { OriginalOrderInfoContext } from './contexts/OriginalOrderInfoContext';

interface OrderModalContentProps {
    submitButtonText: string;
    overrideSubmit?: boolean;
}

export default function OrderModalContent({ submitButtonText, overrideSubmit }: OrderModalContentProps) {
    const { orderItems, activeOrder, additionalOrderInfo, setOrderItems, setActiveOrder, setAdditionalOrderInfo, setOrders } = useContext(OrderContext);
    const { originalOrderItems, setOriginalOrderItems, originalAdditionalOrderInfo, setOriginalAdditionalOrderInfo } = useContext(OriginalOrderInfoContext);
    const { openPopup, setOpenSnackbar, setSnackbarMessage, setOpenPopup, setOpenDialog } = useContext(UIContext);
    const { sendMessage } = useContext(WebSocketContext);
    const navigate = useNavigate();
    const [shouldCloseOrder, setShouldCloseOrder] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const pathname = useLocation().pathname;

    console.log(orderItems)

    const disableCondition = useMemo(() => {
        return activeOrder.status === 'completed' || Boolean(activeOrder.transaction.payment_method);
    }, [activeOrder]);

    const handleClosePopup = () => {
        setOpenPopup(false);
        setOriginalAdditionalOrderInfo({})
        setOriginalOrderItems([])
    }

    useEffect(() => {
        if (!openPopup && shouldCloseOrder) {
            console.log('closed, resetting order states')
            setTimeout(() => {
                setActiveOrder({ id: -1, status: '', created_at: '', transaction: {} });
                sessionStorage.removeItem('activeOrder');
                setOrderItems([]);
                setAdditionalOrderInfo({ 'customer_name': '', 'customer_phone_number': '', 'complete_at': dayjs() });
                setShouldCloseOrder(false); // Reset the flag
                setOriginalAdditionalOrderInfo({});
                setOriginalOrderItems([]);
            }, POPUP_FADE_DURATION); // buffer for fade out animation
        }
    }, [shouldCloseOrder]);

    useEffect(() => {
        if (!openPopup) return;
        if (originalOrderItems.length === 0 || Object.keys(originalAdditionalOrderInfo).length === 0) {
            setOriginalOrderItems(_.cloneDeep(orderItems));
            setOriginalAdditionalOrderInfo(_.cloneDeep(additionalOrderInfo));
        }
    }, [openPopup]);

    const checkForUnsavedChanges = () => {
        if (activeOrder.status === 'completed') return false;
        if (!_.isEqual(orderItems, originalOrderItems) || !_.isEqual(additionalOrderInfo, originalAdditionalOrderInfo)) {
            return true;
        } else {
            return false;
        }
    }

    const resetContent = () => {
        if (!checkForUnsavedChanges()) return;
        console.log('resetting')
        setOrderItems(originalOrderItems);
        setAdditionalOrderInfo(originalAdditionalOrderInfo);
    }

    const handleChangeQuantity = (index: number, mode: string) => {
        const newOrderItems = [...orderItems];
        const orderItem = newOrderItems[index];

        mode === 'inc' ? orderItem.quantity++ : orderItem.quantity--;

        if (newOrderItems[index].quantity < 1) {
            saveQuantityChange(orderItem);
            newOrderItems.splice(index, 1);
            setOriginalOrderItems(newOrderItems);
        }

        if (newOrderItems.length === 0) {
            if (!overrideSubmit) {
                handleClosePopup();
            }
        }

        setOrderItems(newOrderItems);

    }

    const handleEdit = (index: number) => {
        const orderItem = orderItems[index];
        console.log('orderItem', orderItem);
        if (orderItem.configurations.every(config => config.label === '' && config.value === '')) {
            setOpenSnackbar(true);
            setSnackbarMessage('Item has no configurations to edit.');
            return;
        }
        navigate(orderItem.category_name, { state: { editItem: orderItem } })
    }

    const saveQuantityChange = async (orderItem: OrderItems) => {
        if (orderItem.quantity === originalOrderItems.find(item => item.id === orderItem.id)?.quantity) return;
        const baseURL = `/api/v1/orders-items/${orderItem.id}`;
        const isDelete = orderItem.quantity === 0;

        try {
            const url = `${baseURL}/${isDelete ? 'delete' : 'update'}`;
            const method = isDelete ? axios.delete : axios.patch;
            const payload = isDelete ? undefined : { quantity: orderItem.quantity };
            await method(url, payload);
        } catch (error) {
            console.error('Failed to save quantity change:', error);
        }
    };

    const handleChangeAdditionalOrderInfo = (key: string, value: string | Dayjs | unknown) => {
        let formattedPhone: string | undefined;
        if (key === 'customer_phone_number' && typeof value === 'string') {
            if (validatePhoneNumber(value) && !['(', ')', '-'].some(char => value.includes(char))) {
                formattedPhone = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }
        setAdditionalOrderInfo(prevInfo => ({ ...prevInfo, [key]: formattedPhone || value }));
    };

    const handleAddNewItem = () => {
        sessionStorage.setItem('activeOrder', JSON.stringify(activeOrder.id));
        setOpenPopup(false);
        if (pathname !== '/order') navigate(`/order`);
    }

    const noSave = () => {
        resetContent();
        setActiveOrder({ ...activeOrder, ...additionalOrderInfo });
        handleClosePopup();
    }


    const save = async (newStatus: string, action?: string) => {
        console.log(activeOrder.status, newStatus)
        if (activeOrder.status === 'completed') {
            handleClosePopup();
            return;
        }
        if (!checkForUnsavedChanges() && !(activeOrder.status === 'pending' && newStatus === 'submitted') && !(newStatus === 'completed')) {
            console.log('no changes')
            action === 'close' ? hardCloseOrder() : handleClosePopup();
            return;
        }

        const validationError = validateAdditionalOrderInfo(additionalOrderInfo, activeOrder.status);
        if (validationError && (!overrideSubmit || validationError === 'Invalid date.') && newStatus !== 'pending') {
            setSnackbarMessage(validationError);
            setOpenSnackbar(true);
            return;
        }

        try {
            // save quantity changes in parallel
            await Promise.all(orderItems.map(orderItem => saveQuantityChange(orderItem)));

            const url = `/api/v1/orders/${activeOrder.id}/update`;
            const payload = {
                status: newStatus,
                ...additionalOrderInfo,
            };

            const order_res = await axios.patch(url, payload);

            if (newStatus !== 'pending') {
                if (activeOrder.status !== 'submitted') {
                    sendMessage(JSON.stringify({ type: 'order-submit', payload: order_res.data }));
                }
                else {
                    sendMessage(JSON.stringify({ type: 'order-update', payload: { ...additionalOrderInfo, id: activeOrder.id, type: 'info' } }));
                }
            }

            if (activeOrder.status === 'pending' && newStatus === 'submitted') {
                setOpenDialog(true);
                await showPrintDialog();
            }

            if (newStatus === 'completed') {
                setOrders((prevOrders) => prevOrders.filter(order => order.id !== activeOrder.id));
            }
            else {
                setOrders((prevOrders) => prevOrders.map(order => order.id === activeOrder.id ? { ...order, ...additionalOrderInfo } : order));
                setSnackbarMessage('Order saved.');
                setOpenSnackbar(true);
            }

            if (activeOrder.status === 'pending' && action === 'close') {
                hardCloseOrder();
            }
            else {
                handleClosePopup();
            }

        } catch (error) {
            console.error('Failed to save order:', error);
            setSnackbarMessage('Failed to save order.');
            setOpenSnackbar(true);
        }
    };

    const hardCloseOrder = () => {
        handleClosePopup();
        setShouldCloseOrder(true);
    }

    const deleteOrder = async () => {
        const delUrl = `/api/v1/orders/${activeOrder.id}/delete`;
        try {
            await axios.delete(delUrl);
            setOrders((prevOrders) => prevOrders.filter(order => order.id !== activeOrder.id));
            sendMessage(JSON.stringify({ type: 'order-delete', payload: { id: activeOrder.id } }));
            hardCloseOrder();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <CenterGrid container>
            <PrintDialog />
            <CloseButton override={!checkForUnsavedChanges()} dialogContent='Keep changes?' handleOnConfirmed={() => save(activeOrder.status)} handleOnUnConfirmed={noSave} />
            <CenterGrid item xs={12}>
                <Typography variant='h3' fontWeight='bold' mt={'8px'}>Order Summary</Typography>
            </CenterGrid>

            <CenterGrid item xs={12}><Divider /></CenterGrid>
            <CenterGrid item xs={12}>
                <List sx={{ width: '100%' }}>
                    {orderItems.map((item, index) => (
                        <OrderItemDetails
                            key={index}
                            item={item}
                            index={index}
                            disableCondition={disableCondition}
                            handleEdit={handleEdit}
                            handleChangeQuantity={handleChangeQuantity}
                        />
                    ))}
                </List>
            </CenterGrid>
            {!disableCondition && (
                <>
                    <CenterGrid item xs={3}>
                        <IconButton aria-label='inc' size='small' onClick={handleAddNewItem} sx={{ m: 0, p: 0 }}>
                            <AddOutlinedIcon fontSize='inherit' color='primary' />
                        </IconButton>
                    </CenterGrid>
                    {[...Array(3)].map((_, index) => (
                        <CenterGrid item xs={3} key={index}>
                            . . .
                        </CenterGrid>
                    ))}
                </>
            )}
            <CenterGrid item xs={12}><Divider /></CenterGrid>
            <OrderInfoInput
                additionalOrderInfo={additionalOrderInfo}
                handleChangeAdditionalOrderInfo={handleChangeAdditionalOrderInfo}
                status={activeOrder.status}
                overrideSubmit={overrideSubmit}
                disableCondition={disableCondition}
            />
            <OrderActionButtons
                deleteOrder={deleteOrder}
                save={save}
                setCheckoutOpen={setCheckoutOpen}
                setOpenDialog={setOpenDialog}
                orderItems={orderItems}
                overrideSubmit={overrideSubmit}
                submitButtonText={submitButtonText}
                activeOrder={activeOrder}
            />
            <Checkout open={checkoutOpen} onClose={() => setCheckoutOpen(false)} pricingTotals={getPriceInfo(orderItems)} />
        </CenterGrid>
    );
}
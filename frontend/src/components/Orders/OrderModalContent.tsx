import { useContext, useEffect, useState } from 'react';
import { AccordionDetails, AccordionSummary, Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import { CenterGrid, IconButton, Divider, TextFieldSmaller, DateTimePicker, Accordion, ButtonWidest } from '../Styled';
import { OrderContext } from './contexts/OrderContext';
import { UIContext } from '../BaseComps/contexts/UIContext';
import { WebSocketContext } from '../BaseComps/contexts/WebSocketContext';
import dayjs, { Dayjs } from 'dayjs';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveOutlineIcon from '@mui/icons-material/RemoveOutlined';
import EditIcon from '@mui/icons-material/Edit';
import ConfirmationButton from '../BaseComps/ConfirmationButton';
import { useNavigate } from 'react-router';
import CloseButton from '../BaseComps/CloseButton';
import { AdditionalOrderInfo, OrderItems } from '../BaseComps/dbTypes';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import _ from 'lodash';
import { POPUP_FADE_DURATION } from '../Constants';

const formattedPhoneNumberRegex = /^\(\d{3}\) \d{3}-\d{4}$/
const phoneNumberRegex = /^\d{10}$/

const validatePhoneNumber = (phoneNumber: string) => {
    return (phoneNumber.match(formattedPhoneNumberRegex) || phoneNumber.match(phoneNumberRegex)) ? true : false;
};

const validateDate = (date: Dayjs, status: string) => {
    if (status === 'submitted') return true;
    return date.isAfter(dayjs());
}

const validateAdditionalOrderInfo = (info: AdditionalOrderInfo, status: string) => {
    if (Object.values(info).some(value => value === '')) {
        return 'Missing information.';
    }
    if (!validatePhoneNumber(info.customer_phone_number || '')) {
        return 'Invalid phone number.';
    }
    if (!validateDate(info.complete_at || dayjs(), status)) {
        return 'Invalid date.';
    }
    return null;
};


const cancelOrder = "Cancel this order?"
const submitConfirmDialog = "Submit this order? "

interface OrderModalContentProps {
    pageName: string;
    submitButtonText: string;
    overrideSubmit?: boolean;
}

export default function OrderModalContent({ pageName, submitButtonText, overrideSubmit }: OrderModalContentProps) {
    const { orderItems, activeOrder, additionalOrderInfo, setOrderItems, setEditItem, setActiveOrder, setAdditionalOrderInfo, setOrders } = useContext(OrderContext);
    const { openPopup, setOpenSnackbar, setSnackbarMessage, setOpenPopup } = useContext(UIContext);
    const { sendMessage } = useContext(WebSocketContext);
    const navigate = useNavigate();
    const [originalOrderItems, setOriginalOrderItems] = useState<OrderItems[]>([]);
    const [originalAdditionalOrderInfo, setOriginalAdditionalOrderInfo] = useState<AdditionalOrderInfo>({});
    const [shouldCloseOrder, setShouldCloseOrder] = useState(false);

    const handleClosePopup = () => {
        setOpenPopup(false);
    }

    useEffect(() => {
        if (!openPopup && shouldCloseOrder) {
            setTimeout(() => {
                setActiveOrder({ id: -1, status: '', created_at: '' });
                sessionStorage.removeItem('activeOrder');
                setOrderItems([]);
                setAdditionalOrderInfo({ 'customer_name': '', 'customer_phone_number': '', 'complete_at': dayjs() });
                setShouldCloseOrder(false); // Reset the flag
            }, POPUP_FADE_DURATION); // buffer for fade out animation
        }
    }, [shouldCloseOrder]);

    useEffect(() => {
        if (originalOrderItems.length === 0 || Object.keys(originalAdditionalOrderInfo).length === 0) {
            console.log(activeOrder)
            setOriginalOrderItems(_.cloneDeep(orderItems));
            setOriginalAdditionalOrderInfo(_.cloneDeep(additionalOrderInfo));
            console.log(orderItems)
        }
    }, [orderItems, additionalOrderInfo]);

    const checkForUnsavedChanges = () => {
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

    const saveQuantityChange = async (orderItem: OrderItems) => {
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

    const saveAdditionalInfo = async () => {
        try {
            const url = `/api/v1/orders/${activeOrder.id}/update`;
            const payload = {
                status: 'submitted',
                ...additionalOrderInfo,
            };
            await axios.patch(url, payload);
            if (activeOrder.status !== 'submitted') {
                sendMessage(JSON.stringify({ type: 'order-submit', payload: { ...payload, id: activeOrder.id } }));
            }
            else {
                sendMessage(JSON.stringify({ type: 'order-update', payload: { ...additionalOrderInfo, id: activeOrder.id } }));
            }
        } catch (error) {
            console.error('Failed to save additional order info:', error);
        }
    };


    const handleEdit = (index: number) => {
        const orderItem = orderItems[index];
        console.log(orderItem);
        setEditItem(orderItem);
        navigate(`/${pageName}/${orderItem.category_name}`)
    }

    const handleChangeAdditionalOrderInfo = (key: string, value: string | Dayjs | unknown) => {
        let formattedPhone: string | undefined;
        if (key === 'customer_phone_number' && typeof value === 'string') {
            if (validatePhoneNumber(value) && !['(', ')', '-'].some(char => value.includes(char))) {
                formattedPhone = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }
        setAdditionalOrderInfo(prevInfo => ({ ...prevInfo, [key]: formattedPhone || value }));
    };


    const saveNoSubmit = () => {
        resetContent();
        setActiveOrder({ ...activeOrder, ...additionalOrderInfo });
        closeOrder();
    }

    const saveSubmit = async () => {
        if (!checkForUnsavedChanges()) {
            setSnackbarMessage('No changes.');
            setOpenSnackbar(true);
            closeOrder();
            return;
        }

        const validationError = validateAdditionalOrderInfo(additionalOrderInfo, activeOrder.status);
        if (validationError && (!overrideSubmit || validationError === 'Invalid date.')) {
            setSnackbarMessage(validationError);
            setOpenSnackbar(true);
            return;
        }

        try {
            // save quantity changes in parallel
            await Promise.all(orderItems.map(orderItem => saveQuantityChange(orderItem)));

            // save additional order info
            await saveAdditionalInfo();

            setOrders((prevOrders) => prevOrders.map(order => order.id === activeOrder.id ? { ...order, ...additionalOrderInfo } : order));
            setSnackbarMessage('Order saved.');
            setOpenSnackbar(true);
            closeOrder();
        } catch (error) {
            console.error('Failed to save order:', error);
            setSnackbarMessage('Failed to save order.');
            setOpenSnackbar(true);
        }
    };

    const handleAddNewItem = () => {
        sessionStorage.setItem('activeOrder', JSON.stringify(activeOrder.id));
        setOpenPopup(false);
        navigate(`/order`);
    }

    const closeOrder = () => {
        handleClosePopup();
        setShouldCloseOrder(true);
    }

    const deleteOrder = async () => {
        const delUrl = `/api/v1/orders/${activeOrder.id}/delete`;
        try {
            await axios.delete(delUrl);
            setOrders((prevOrders) => prevOrders.filter(order => order.id !== activeOrder.id));
            sendMessage(JSON.stringify({ type: 'order-delete', payload: { id: activeOrder.id } }));
            closeOrder();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <CenterGrid container>
            <CloseButton override={!checkForUnsavedChanges()} dialogContent='Close without saving?' handleOnConfirmed={saveNoSubmit} />
            <CenterGrid item xs={12}>
                <Typography variant='h3' fontWeight='bold'>Order Summary</Typography>
            </CenterGrid>

            <CenterGrid item xs={12}><Divider /></CenterGrid>
            <CenterGrid item xs={12}>
                <List sx={{ width: '100%' }}>
                    {orderItems.map((item, index) => (
                        <ListItem key={index}>
                            {/* Item Details */}
                            <CenterGrid item xs={3}>
                                <Box sx={{ width: '100%' }}>
                                    <Accordion disableGutters>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                                            <Typography variant='h5'>{`${index + 1}. ${item.item_name}`}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <List sx={{ m: 0, p: 0 }}>
                                                {item.configurations.map((config, idx) => (
                                                    <ListItem key={idx} sx={{ m: 0, p: 0 }}>
                                                        <ListItemText
                                                            primary={`${config.label}: ${config.value}`}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </AccordionDetails>
                                    </Accordion>
                                </Box>
                            </CenterGrid>

                            {/* Edit */}
                            <CenterGrid item xs={3}>
                                <IconButton aria-label="edit" color="primary" onClick={() => handleEdit(index)}>
                                    <EditIcon fontSize="large" />
                                </IconButton>
                            </CenterGrid>

                            {/* Quantity Controls */}
                            <CenterGrid item xs={3}>
                                <ConfirmationButton
                                    aria-label='dec'
                                    buttonType={IconButton}
                                    override={item.quantity > 1}
                                    onConfirmed={() => handleChangeQuantity(index, 'dec')}>
                                    <RemoveOutlineIcon color="primary" fontSize='inherit' />
                                </ConfirmationButton>
                                <Typography variant='h5'>{item.quantity}</Typography>
                                <IconButton color="primary" aria-label='inc' size='large' onClick={() => handleChangeQuantity(index, 'inc')}>
                                    <AddOutlinedIcon fontSize='inherit' />
                                </IconButton>
                            </CenterGrid>

                            {/* Price */}
                            <CenterGrid item xs={3}>
                                <Typography variant='h5'>${item.price * item.quantity}</Typography>
                            </CenterGrid>
                        </ListItem>
                    ))}
                </List>
            </CenterGrid>
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
            <CenterGrid item xs={12}><Divider /></CenterGrid>
            <CenterGrid item xs={3.5}>
                <TextFieldSmaller
                    label='Name'
                    value={additionalOrderInfo.customer_name}
                    variant='filled'
                    fullWidth
                    onChange={(e) => handleChangeAdditionalOrderInfo('customer_name', e.target.value)}
                    error={additionalOrderInfo.customer_name === ''}
                />
            </CenterGrid>
            <CenterGrid item xs={3.5}>
                <TextFieldSmaller
                    label='Phone Number'
                    value={additionalOrderInfo.customer_phone_number}
                    variant='filled'
                    type='tel'
                    fullWidth
                    onChange={(e) => handleChangeAdditionalOrderInfo('customer_phone_number', e.target.value)}
                    error={!validatePhoneNumber(additionalOrderInfo.customer_phone_number || '')}
                />
            </CenterGrid>
            <CenterGrid item xs={5}>
                <DateTimePicker
                    label='Complete at'
                    value={additionalOrderInfo.complete_at}
                    minutesStep={5}
                    slotProps={{ textField: { variant: "filled", error: !overrideSubmit && !validateDate(additionalOrderInfo.complete_at || dayjs(), activeOrder.status) } }}
                    views={['month', 'day', 'hours', 'minutes']}
                    onChange={(date) => handleChangeAdditionalOrderInfo('complete_at', date)}
                    timezone={dayjs.tz.guess()}
                />
            </CenterGrid>

            <CenterGrid item xs={6}>
                <ConfirmationButton onConfirmed={() => { closeOrder(); deleteOrder() }} dialogContent={cancelOrder}>CANCEL</ConfirmationButton>
            </CenterGrid>
            <CenterGrid item xs={6}>
                <ConfirmationButton onConfirmed={saveSubmit} override={overrideSubmit} dialogContent={submitConfirmDialog + `The total is $${orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0)}.`}>{submitButtonText}</ConfirmationButton>
            </CenterGrid>
            {activeOrder.status === 'submitted' &&
                <CenterGrid item xs={12}>
                    <ButtonWidest variant='contained' onClick={() => null}>Checkout</ButtonWidest>
                </CenterGrid>
            }
        </CenterGrid>
    );
}
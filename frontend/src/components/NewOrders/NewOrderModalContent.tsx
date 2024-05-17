import React, { useContext, useState } from 'react';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import { CenterGrid, IconButton, Divider, TextFieldSmaller, DateTimePicker } from '../Styled';
import { OrderContext } from './contexts/OrderContext';
import dayjs, { Dayjs } from 'dayjs';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveOutlineIcon from '@mui/icons-material/RemoveOutlined';
import EditIcon from '@mui/icons-material/Edit';
import ConfirmationButton from '../BaseComps/ConfirmationButton';
import { useNavigate } from 'react-router';

const formattedPhoneNumberRegex = /^\(\d{3}\)\d{3}-\d{4}$/
const phoneNumberRegex = /^\d{10}$/

const validatePhoneNumber = (phoneNumber: string) => {
    return (phoneNumber.match(formattedPhoneNumberRegex) || phoneNumber.match(phoneNumberRegex)) ? true : false;
};

interface AdditionalOrderInfo {
    name: string;
    phone: string;
    pickupTime: Dayjs | null;
}

export default function NewOrderModalContent({ handleClosePopup }: { handleClosePopup: () => void }) {
    const { orderItems, setOrderItems, setEditItem } = useContext(OrderContext);
    const [additionalOrderInfo, setAdditionalOrderInfo] = useState<AdditionalOrderInfo>({ name: '', phone: '', pickupTime: dayjs() });
    const navigate = useNavigate();

    const handleChangeQuantity = (index: number, mode: string) => {
        const newOrderItems = [...orderItems];
        const orderItem = newOrderItems[index];

        mode === 'inc' ? orderItem.quantity++ : orderItem.quantity--;

        if (newOrderItems[index].quantity < 1) {
            newOrderItems.splice(index, 1);
        }

        if (newOrderItems.length === 0) {
            handleClosePopup();
        }

        setOrderItems(newOrderItems);

    }

    const handleEdit = (index: number) => {
        const orderItem = orderItems[index];
        console.log(orderItem);
        setEditItem(orderItem);
        navigate(`/new-order/${orderItem.category_name}`)
    }

    const handleChangeAdditionalOrderInfo = (key: string, value: string | Dayjs | unknown) => {
        let formattedPhone: string | undefined;
        if (key === 'phone' && typeof value === 'string') {
            if (validatePhoneNumber(value)) {
                formattedPhone = `(${value.slice(0, 3)})${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }
        setAdditionalOrderInfo({ ...additionalOrderInfo, [key]: formattedPhone || value });
    }

    return (
        <CenterGrid container>
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
                                <Box>
                                    <ListItemText
                                        primary={<Typography variant='h5'>{`${index + 1}. ${item.item_name}`}</Typography>}
                                        secondary={
                                            <React.Fragment>
                                                {item.configurations.map((config, idx) => (
                                                    <Typography key={idx} component="span" variant="body1" >
                                                        {config.label}: {config.value}
                                                        <br />
                                                    </Typography>
                                                ))}
                                            </React.Fragment>
                                        }
                                    />
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
                                    <RemoveOutlineIcon fontSize='inherit' />
                                </ConfirmationButton>
                                <Typography variant='h5'>{item.quantity}</Typography>
                                <IconButton aria-label='inc' size='large' onClick={() => handleChangeQuantity(index, 'inc')}>
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
            <CenterGrid item xs={12}><Divider /></CenterGrid>
            <CenterGrid item xs={3.5}>
                <TextFieldSmaller
                    label='Name'
                    value={additionalOrderInfo.name}
                    variant='filled'
                    fullWidth
                    onChange={(e) => handleChangeAdditionalOrderInfo('name', e.target.value)}
                />
            </CenterGrid>
            <CenterGrid item xs={3.5}>
                <TextFieldSmaller
                    label='Phone #'
                    value={additionalOrderInfo.phone}
                    variant='filled'
                    type='tel'
                    fullWidth
                    error={!validatePhoneNumber(additionalOrderInfo.phone)}
                    onChange={(e) => handleChangeAdditionalOrderInfo('phone', e.target.value)}
                />
            </CenterGrid>
            <CenterGrid item xs={5}>
                <DateTimePicker
                    label='Pickup Time'
                    value={additionalOrderInfo.pickupTime}
                    minutesStep={5}
                    slotProps={{ textField: { variant: "filled" } }}
                    views={['month', 'day', 'hours', 'minutes']}
                    onChange={(date) => handleChangeAdditionalOrderInfo('pickupTime', date)}
                />
            </CenterGrid>
        </CenterGrid>
    );
}
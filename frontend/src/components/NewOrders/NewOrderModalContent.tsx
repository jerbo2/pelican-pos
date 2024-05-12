import React, { useContext, useEffect, useState } from 'react';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import { CenterGrid, TextField, IconButton, Divider, MenuItem, ButtonWidest } from '../Styled';
import { UIContext } from '../BaseComps/contexts/UIContext';
import { OrderContext } from './contexts/OrderContext';
import axios from 'axios';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveOutlineIcon from '@mui/icons-material/RemoveOutlined';

const formCompDelConfirm = 'Are you sure you want to delete this form option?'

export default function NewOrderModalContent({ handleClosePopup }: { handleClosePopup: () => void }) {
    const { orderItems } = useContext(OrderContext);



    return (
        <CenterGrid container>
            <CenterGrid item xs={12}>
                <Typography variant='h3' fontWeight='bold'>Order Summary</Typography>
            </CenterGrid>

            <CenterGrid item xs={12}><Divider /></CenterGrid>
            <CenterGrid xs={12}>
                <List sx={{ width: '100%' }}>
                    {orderItems.map((item, index) => (
                        <ListItem key={index}>
                            {/* Item Details */}
                            <CenterGrid item xs={4}>
                                <Box>
                                    <ListItemText
                                        primary={<Typography variant='h5' >{`${index + 1}. ${item.item_name}`}</Typography>}
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

                            {/* Quantity Controls */}
                            <CenterGrid item xs={4}>
                                <IconButton aria-label='remove' size='large' onClick={() => null}>
                                    <RemoveOutlineIcon fontSize='inherit' />
                                </IconButton>
                                <Typography variant='h5'>{item.quantity}</Typography>
                                <IconButton aria-label='add' size='large' onClick={() => null}>
                                    <AddOutlinedIcon fontSize='inherit' />
                                </IconButton>
                            </CenterGrid>

                            {/* Price */}
                            <CenterGrid item xs={4}>
                                <Typography variant='h5'>${item.price}</Typography>
                            </CenterGrid>
                        </ListItem>
                    ))}
                </List>
            </CenterGrid>
        </CenterGrid>
    );
}
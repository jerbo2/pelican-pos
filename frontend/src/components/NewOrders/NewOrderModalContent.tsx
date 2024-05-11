import React, { useContext, useEffect, useState } from 'react';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import { CenterGrid, TextField, IconButton, Divider, MenuItem, ButtonWidest } from '../Styled';
import { UIContext } from '../BaseComps/contexts/UIContext';
import { OrderContext } from './contexts/OrderContext';
import axios from 'axios';

const formCompDelConfirm = 'Are you sure you want to delete this form option?'

export default function NewOrderModalContent({ handleClosePopup }: { handleClosePopup: () => void }) {
    const { orderItems } = useContext(OrderContext);



    return (
        <CenterGrid container>
            <CenterGrid item xs={12}>
                <Typography variant='h3' fontWeight='bold'>Order Summary</Typography>
            </CenterGrid>

            <CenterGrid item xs={12}><Divider /></CenterGrid>


            <CenterGrid item xs={4}>
                <List>
                    {orderItems.map((item, index) => (
                        <>
                        <ListItem key={index}>
                            <ListItemText
                                primary={<Typography variant='h5'>{`${index+1}. ${item.item_name}`}</Typography>}
                                secondary={
                                    <React.Fragment>
                                        {item.configurations.map((config, idx) => (
                                            <Typography key={idx} component="span" variant="body2">
                                                {config.label}: {config.value}
                                                <br />
                                            </Typography>
                                        ))}
                                    </React.Fragment>
                                }
                            />
                        </ListItem>
                        </>
                    ))}
                </List>
            </CenterGrid>
            <CenterGrid item xs={4} />
            <CenterGrid item xs={4} />
        </CenterGrid>
    );
}
import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import { CenterGrid, IconButton } from '../Styled';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveOutlineIcon from '@mui/icons-material/RemoveOutlined';
import ConfirmationButton from '../BaseComps/ConfirmationButton';
import { OrderItems } from '../BaseComps/dbTypes';

interface OrderItemDetailsProps {
    item: OrderItems;
    index: number;
    status: string;
    handleEdit: (index: number) => void;
    handleChangeQuantity: (index: number, mode: string) => void;
}

const OrderInfoAccordion = ({ item }: {item: OrderItems}) => {
    return (
        <Accordion disableGutters sx={{width: '100%'}}>
            <AccordionSummary expandIcon={<ExpandMoreIcon color='primary' />} >
                <Typography variant='h5'>{item.item_name}<sub style={{'fontSize': '12px'}}>{item.id}</sub></Typography>
            </AccordionSummary>
            <AccordionDetails>
                <List sx={{ m: 0, p: 0 }}>
                    {item.configurations.map((config, idx) => (
                        <ListItem key={idx} sx={{ m: 0, p: 0 }}>
                            <ListItemText primary={`${config.label}: ${config.value}`} />
                        </ListItem>
                    ))}
                </List>
            </AccordionDetails>
        </Accordion>
    );
}

const OrderItemDetails: React.FC<OrderItemDetailsProps> = ({ item, index, status, handleEdit, handleChangeQuantity }) => {
    return (
        <ListItem key={index}>
            <CenterGrid item xs={3}>
                <Box sx={{ width: '100%' }}>
                    <OrderInfoAccordion item={item} />
                </Box>
            </CenterGrid>
            <CenterGrid item xs={3}>
                <IconButton aria-label="edit" color="primary" onClick={() => handleEdit(index)} disabled={status === 'completed'}>
                    <EditIcon fontSize="large" />
                </IconButton>
            </CenterGrid>
            <CenterGrid item xs={3}>
                <ConfirmationButton
                    color='primary'
                    disabled={status === 'completed'}
                    aria-label='dec'
                    buttonType={IconButton}
                    override={item.quantity > 1}
                    onConfirmed={() => handleChangeQuantity(index, 'dec')}
                >
                    <RemoveOutlineIcon fontSize='inherit' />
                </ConfirmationButton>
                <Typography variant='h5'>{item.quantity}</Typography>
                <IconButton color="primary" aria-label='inc' size='large' onClick={() => handleChangeQuantity(index, 'inc')} disabled={status === 'completed'}>
                    <AddOutlinedIcon fontSize='inherit' />
                </IconButton>
            </CenterGrid>
            <CenterGrid item xs={3}>
                <Typography variant='h5'>${(item.price * item.quantity).toFixed(2)}</Typography>
            </CenterGrid>
        </ListItem>
    );
};

export default OrderItemDetails;
export { OrderInfoAccordion };

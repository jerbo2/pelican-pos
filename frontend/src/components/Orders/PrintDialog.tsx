import React, { useState, useContext, useCallback, Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import FormDialog from '../BaseComps/FormDialog';
import { Button, CenterGrid, Checkbox, Divider, FormControl, TextFieldSmaller, MenuItemSmaller, ToggleButton, ToggleButtonGroup, ButtonWidest } from '../Styled';
import { UIContext } from '../BaseComps/contexts/UIContext';
import { OrderContext } from './contexts/OrderContext';
import { FormGroup, List, ListItem, Typography, TextField, ButtonGroup, Stack } from '@mui/material';
import { OrderItems } from '../BaseComps/dbTypes';
import axios from 'axios';
import { OrderInfoAccordion } from './OrderItemDetails';

let resolveDialog: (() => void) | null = null;

export const showPrintDialog = () => {
    return new Promise<void>((resolve) => {
        resolveDialog = resolve;
    });
};

interface RowVal {
    ticket: number;
    eatIn: boolean;
}

const getUniqueCategories = (orderItems: OrderItems[]) => {
    return orderItems.reduce((acc, item) => {
        const categoryName = item.category_name.charAt(0).toUpperCase() + item.category_name.slice(1);
        acc.set(categoryName, (acc.get(categoryName) || 0) + 1);
        return acc;
    }, new Map<string, number>());
};

const getCategoryIndices = (orderItems: OrderItems[], category: string) => {
    const normalizedCategory = category.toLowerCase();
    return orderItems.reduce((indices, item) => {
        if (item.category_name === normalizedCategory) {
            indices.push(item.id);
        }
        return indices;
    }, [] as number[]);
};

const getCategoryTicketMap = (categories: Map<string, number>) => {
    const categoryTicketMap = new Map<string, number>();
    let ticketCounter = 1;

    // Initialize category ticket numbers
    categories.forEach((value, key) => {
        categoryTicketMap.set(key, ticketCounter++);
    });
    return categoryTicketMap;
}

const inSelectedTickets = (ticket: number, rowVals: RowVal[]) => {
    return rowVals.some(row => row.ticket === ticket)
}

// Fisher-Yates (Knuth) Shuffle algorithm
function shuffle(array: Array<any>) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}


export default function PrintDialog() {
    const { openDialog, setOpenDialog } = useContext(UIContext);
    const { orderItems, activeOrder, setOrderItems } = useContext(OrderContext);
    const categories = useMemo(() => getUniqueCategories(orderItems), [orderItems]);
    const [tickets, setTickets] = useState<number[]>([]);
    const [printTickets, setPrintTickets] = useState<number[]>([]);
    const ticketsPrinted = useMemo(() => orderItems.filter(item => item.printed), [orderItems]);

    const pastelColors = useMemo(() => shuffle([
        "#AEC6CF", // pastel blue
        "#77DD77", // pastel green
        "#FFB347", // pastel orange
        "#FF6961", // pastel red
        "#F49AC2", // pastel pink
        "#CFCFC4", // pastel grey
        "#FDFD96", // pastel yellow
        "#B39EB5", // pastel purple
        "#FFB3BA", // light pastel red
        "#FFDFBA", // light pastel orange
        "#FFFFBA", // light pastel yellow
        "#BAFFC9", // light pastel green
        "#BAE1FF", // light pastel blue
        "#FFCCE5", // light pastel pink
        "#D4A5A5", // light pastel brown
        "#E2F0CB", // light pastel lime
        "#C5E1A5", // light pastel olive
        "#FFECB3", // light pastel cream
        "#D1C4E9", // light pastel lavender
        "#CE93D8"  // light pastel mauve
    ]), []);

    const [rowVals, setRowVals] = useState<RowVal[]>([]);

    const [colors, setColors] = useState<Record<string, string>>({});

    useEffect(() => {
        const categoryTicketMap = getCategoryTicketMap(categories);
        const newRows: RowVal[] = []
        categories.forEach((value, key) => {
            const ticketNumber = categoryTicketMap.get(key);
            for (let i = 0; i < value; i++) {
                newRows.push({ ticket: ticketNumber!, eatIn: false });
            }
        });
        setRowVals(newRows);

        const newTickets = Array.from({ length: categories.size }, (_, index) => index + 1);
        setTickets(newTickets);
        setPrintTickets(newTickets);

        const newColors: Record<string, string> = {};
        newTickets.forEach((ticket) => {
            newColors[ticket] = pastelColors.pop();
        });
        console.log('newColors:', newColors);
        setColors(newColors);

    }, [categories]);

    useEffect(() => {
        if (rowVals.length === 0) return;
        const updatedPrintTickets = printTickets.filter(ticket =>
            rowVals.some(row => row.ticket === ticket)
        );
        setPrintTickets(updatedPrintTickets);
    }, [rowVals]);

    const doResolveDialog = () => {
        if (resolveDialog) {
            resolveDialog();
            resolveDialog = null;
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        handleCloseDialog();
        if (printTickets.length === 0) return;

        const payloadMap = rowVals.reduce((acc, row, index) => {
            if (printTickets.includes(row.ticket)) {
                if (!acc.has(row.ticket)) {
                    acc.set(row.ticket, []);
                }
                acc.get(row.ticket).push({
                    order_item_id: orderItems[index].id,
                    eat_in: row.eatIn
                });
            }
            return acc;
        }, new Map());

        const payload = Array.from(payloadMap.values());

        const printUrl = `/api/v1/orders/${activeOrder.id}/print_tickets`;

        try {
            await axios.post(printUrl, payload);
            await updateAllOrderItems();
        }
        catch (error) {
            console.error(error);
        }
    }

    const orderItemUpdatePrinted = async (orderItem: OrderItems, index: number) => {
        console.log('orderItem:', orderItem);
        if (orderItem.printed) return;
        const wasPrinted = printTickets.includes(rowVals[index].ticket);
        const updateUrl = `/api/v1/orders-items/${orderItem.id}/update`;

        try {
            await axios.patch(updateUrl, { printed: wasPrinted })
            if (activeOrder.status === 'pending') return;
            setOrderItems((prevOrderItems) => {
                const newOrderItems = [...prevOrderItems];
                newOrderItems[index].printed = wasPrinted;
                return newOrderItems;
            });
        }
        catch (error) {
            console.error(error);
        }
    }

    const updateAllOrderItems = async () => {
        const updatePromises = orderItems.map((orderItem, index) =>
            orderItemUpdatePrinted(orderItem, index)
        );

        try {
            await Promise.all(updatePromises);
            console.log('All order items updated successfully');
        } catch (error) {
            console.error('Error updating one or more order items:', error);
        }
    };


    const handleCloseDialog = () => {
        doResolveDialog();
        setOpenDialog(false);
    };

    // Function to add a new ticket
    const addTicket = () => {
        const newTicket = tickets.length > 0 ? Math.max(...tickets) + 1 : 1;
        const newColors = { ...colors };
        newColors[newTicket] = pastelColors.pop();
        setTickets([...tickets, newTicket]);
        setColors(newColors);
    };


    const handleTicketChange = (index: number, ticket: number) => {
        if (ticket < 0) {
            addTicket();
            ticket = tickets.length + 1;
        }
        const newRows = [...rowVals];
        newRows[index].ticket = ticket;
        setRowVals(newRows);
    }

    const handleEatInChange = (index: number) => {
        const newRows = [...rowVals];
        newRows[index].eatIn = !newRows[index].eatIn;
        setRowVals(newRows);
    }

    return (
        <FormDialog
            openDialog={openDialog}
            handleCloseDialog={handleCloseDialog}
            handleSubmit={handleSubmit}
            dialogTitle={`Ticket Printing`}
            dialogContent=""
            dialogActions={
                <>
                    <Button variant='contained' onClick={handleCloseDialog}>Close</Button>
                    <Button variant='contained' type="submit" >Print</Button>
                </>
            }
            dialogExtras={
                <CenterGrid container>
                    <CenterGrid item xs={12}>
                        <Divider sx={{ m: '0.6rem' }} />
                    </CenterGrid>
                    <CenterGrid item xs={12}>
                        <Stack alignItems='center'>
                            <Typography variant="h5" align='center'>
                                {`Derived ${categories.size} ticket${categories.size > 1 ? 's' : ''} from order. `}
                            </Typography>
                            {ticketsPrinted.length > 0 && (
                                <Typography component="h6" fontWeight={'bold'}>
                                    *Printed previously: {ticketsPrinted.map((item, index) => (
                                        <React.Fragment key={item.id}>
                                            {item.item_name}
                                            <sub>{item.id}</sub>
                                            {index < ticketsPrinted.length - 1 && ', '}
                                        </React.Fragment>
                                    ))}*
                                </Typography>
                            )}
                        </Stack>

                    </CenterGrid>
                    <CenterGrid item xs={12}>
                        <Divider sx={{ m: '0.6rem' }} />
                    </CenterGrid>
                    <CenterGrid item xs={12}>
                        <List sx={{ width: '100%' }}>
                            <ListItem>
                                <CenterGrid item xs={4}>
                                    <Typography variant="h5">Ticket</Typography>
                                </CenterGrid>
                                <CenterGrid item xs={4}>
                                    <Typography variant="h5">Item</Typography>
                                </CenterGrid>
                                <CenterGrid item xs={4}>
                                    <Typography variant="h5">Eat-in</Typography>
                                </CenterGrid>
                            </ListItem>
                            {orderItems.map((orderItem, index) => {
                                return <ListItem key={index} sx={{
                                    backgroundColor: colors[rowVals[index]?.ticket],
                                    borderTopRightRadius: index === 0 ? '1rem' : 0,
                                    borderTopLeftRadius: index === 0 ? '1rem' : 0,
                                    borderBottomRightRadius: index === orderItems.length - 1 ? '1rem' : 0,
                                    borderBottomLeftRadius: index === orderItems.length - 1 ? '1rem' : 0,
                                }}>
                                    <CenterGrid item xs={4}>
                                        <TextFieldSmaller
                                            sx={{ m: '8px' }}
                                            select
                                            value={rowVals[index]?.ticket ?? ''}
                                            onChange={(e) => handleTicketChange(index, parseInt(e.target.value))}
                                        >
                                            {tickets.map((ticket, idx) => (
                                                <MenuItemSmaller key={idx} value={ticket}>{ticket}</MenuItemSmaller>
                                            ))}
                                            {tickets.length < orderItems.length && (<MenuItemSmaller value={-1}>+</MenuItemSmaller>)}
                                        </TextFieldSmaller>
                                    </CenterGrid>
                                    <CenterGrid item xs={4}>
                                        <OrderInfoAccordion item={orderItem} />
                                    </CenterGrid>
                                    <CenterGrid item xs={4}>
                                        <Checkbox value={rowVals[index]?.eatIn ?? ''} onChange={() => handleEatInChange(index)} />
                                    </CenterGrid>
                                </ListItem>
                            })}
                        </List>
                    </CenterGrid>
                    <CenterGrid item xs={12}>
                        <Divider sx={{ m: '0.6rem' }} />
                    </CenterGrid>
                    <CenterGrid item xs={12}>
                        <Typography variant='h5' mr='8px'> Print Tickets: </Typography>
                        <ToggleButtonGroup value={printTickets} onChange={(e, newTickets) => setPrintTickets(newTickets)}>
                            {tickets.map((ticket) => (
                                <ToggleButton key={ticket} value={ticket} disabled={!inSelectedTickets(ticket, rowVals)} selectedcolor={colors[ticket]}>
                                    <Typography variant='h5' fontStyle={!inSelectedTickets(ticket, rowVals) ? 'italic' : 'normal'}>{ticket}</Typography>
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </CenterGrid>
                    <CenterGrid item xs={12}>
                        <Divider sx={{ m: '0.6rem' }} />
                    </CenterGrid>
                </ CenterGrid>
            }
        />
    );
}

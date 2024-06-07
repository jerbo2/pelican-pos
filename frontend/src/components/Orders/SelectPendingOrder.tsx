import React, { useContext, useEffect, useState } from "react";
import FormDialog from "../BaseComps/FormDialog";
import { ButtonWidest, CenterGrid, IconButton, MenuItem, TextField } from "../Styled";
import { OrderContext } from "./contexts/OrderContext";
import { fetchOrders } from "./OrdersTable";
import { Order } from "../BaseComps/dbTypes";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { UIContext } from "../BaseComps/contexts/UIContext";


export default function SelectPendingOrder() {
    const [ openSelect, setOpenSelect ] = useState<boolean>(false)
    const { setActiveOrder, setOrders, orders, setAdditionalOrderInfo } = useContext(OrderContext)
    const [selectedOrderId, setSelectedOrderId] = useState<number>(-1)

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (selectedOrderId === -1) return
        const selectedOrder = orders.find((order: Order) => order.id === selectedOrderId)
        if (!selectedOrder) return
        setActiveOrder(selectedOrder)
        setAdditionalOrderInfo({ 
            customer_name: selectedOrder.customer_name ?? '', 
            customer_phone_number: selectedOrder.customer_phone_number ?? '', 
            complete_at: selectedOrder.complete_at 
        })
        setOpenSelect(false)
    }

    useEffect(() => {
        fetchOrders('pending').then((data) => { setOrders(data) })
    }, [])

    return (
        <CenterGrid container>
            <CenterGrid item xs={12}>
                {orders.length > 0 && (
                <IconButton color="secondary" onClick={() => setOpenSelect(true)}>
                    <SearchOutlinedIcon fontSize="large" />
                </IconButton>
                )}
                <FormDialog
                    openDialog={openSelect}
                    handleCloseDialog={() => setOpenSelect(false)}
                    handleSubmit={handleSubmit}
                    dialogTitle='Select Pending Order'
                    dialogContent=""
                    dialogActions={
                        <>
                            <CenterGrid item xs={6}>
                                <ButtonWidest onClick={()=>setOpenSelect(false)} variant='contained'>cancel</ButtonWidest>
                            </CenterGrid>
                            <CenterGrid item xs={6}>
                                <ButtonWidest type='submit' variant='contained'>ok</ButtonWidest>
                            </CenterGrid>
                        </>}
                    dialogExtras={
                        <CenterGrid item xs={12}>
                            <TextField
                                select
                                label="Orders"
                                variant="filled"
                                fullWidth
                                value={selectedOrderId || ''}
                                onChange={(e) => setSelectedOrderId(parseInt(e.target.value))}
                            >
                                <MenuItem value={-1}>—</MenuItem>
                                {orders.map((order: Order, index: number) => (
                                    <MenuItem key={index} value={order.id}>
                                        {`Order #${order.id} - ${order.customer_name ?? 'No Name'}`}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </CenterGrid>
                    }
                />
            </CenterGrid>
        </CenterGrid>
    )
}
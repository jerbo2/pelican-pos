import React from "react"
import { Box } from "@mui/material"
import BaseNav from "../BaseComps/BaseNav"
import OrdersTable from "./OrdersTable"
import { CenterGrid } from "../Styled"
import { UIProvider } from "../BaseComps/contexts/UIContext"
import { OrderProvider } from "./contexts/OrderContext"
import OrdersModal from "./OrdersModal"
import { FormConfigProvider } from "../Configuration/contexts/FormConfigContext"
import { ItemProvider } from "../Configuration/contexts/ItemContext"
import NewOrderFormEdit from "./OrderFormEdit"
import { useParams } from "react-router"
import Snackbar from "../BaseComps/Snackbar"
import Checkout from "./Checkout"
import { WebSocketProvider } from "../BaseComps/contexts/WebSocketContext"
import { WEBSOCKET_URL } from "../Constants"

export default function ActiveOrders() {
    const params = useParams()
    const checkout = window.location.href.includes('checkout')
    return (
        <Box sx={{ width: '100vw', height: '100vh', overflowX: 'hidden' }}>
            <UIProvider>
                <OrderProvider>
                    <WebSocketProvider url={WEBSOCKET_URL}>
                        {params.category ? (
                            <FormConfigProvider>
                                <ItemProvider>
                                    <NewOrderFormEdit rootPage="active-orders" />
                                </ItemProvider>
                            </FormConfigProvider>
                        ) : checkout ? (
                            <Checkout />
                        ) :
                            <React.Fragment>
                                <BaseNav pageRoot="active-orders" pageName="ACTIVE ORDERS" renderItems={false} />
                                <CenterGrid item xs={12}>
                                    <OrdersTable status='submitted' />
                                    <OrdersModal />
                                </CenterGrid>
                            </React.Fragment>
                        }
                        <Snackbar />
                    </WebSocketProvider>
                </OrderProvider>
            </UIProvider>
        </Box>
    )
}
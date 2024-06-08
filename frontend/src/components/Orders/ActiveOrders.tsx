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
import { useParams } from "react-router"
import Snackbar from "../BaseComps/Snackbar"
import { OriginalOrderInfoProvider } from "./contexts/OriginalOrderInfoContext"
import OrderFormEdit from "./OrderFormEdit"

export default function ActiveOrders() {
    const params = useParams()
    //const checkout = window.location.href.includes('checkout')
    return (
        <Box sx={{ width: '100vw', height: '100vh', overflowX: 'hidden' }}>
            <UIProvider>
                <OrderProvider>
                    <OriginalOrderInfoProvider>
                            {params.category ? (
                                <FormConfigProvider>
                                    <ItemProvider>
                                        <OrderFormEdit rootPage="active-orders" />
                                    </ItemProvider>
                                </FormConfigProvider>
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
                    </OriginalOrderInfoProvider>
                </OrderProvider>
            </UIProvider>
        </Box>
    )
}
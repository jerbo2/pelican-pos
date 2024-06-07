import { Box } from "@mui/material"
import BaseNav from "../BaseComps/BaseNav"
import OrdersTable from "./OrdersTable"
import { CenterGrid } from "../Styled"
import { OrderProvider } from "./contexts/OrderContext"
import OrdersModal from "./OrdersModal"
import { UIProvider } from "../BaseComps/contexts/UIContext"

export default function PastOrders() {
    return (
        <Box sx={{ width: '100vw', height: '100vh', overflowX: 'hidden' }}>
            <BaseNav pageRoot="past-orders" pageName="PAST ORDERS" renderItems={false} />
            <OrderProvider>
                <UIProvider>
                    <CenterGrid item xs={12}>
                        <OrdersTable status='completed' />
                        <OrdersModal />
                    </CenterGrid>
                </UIProvider>
            </OrderProvider>
        </Box>
    )
}
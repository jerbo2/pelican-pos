import { Box } from "@mui/material"
import BaseNav from "../BaseComps/BaseNav"
import OrdersTable from "./OrdersTable"
import { CenterGrid } from "../Styled"

export default function PastOrders() {
    return (
        <Box sx={{ width: '100vw', height: '100vh', overflowX: 'hidden' }}>
            <BaseNav pageRoot="past-orders" pageName="PAST ORDERS" renderItems={false} />
            <CenterGrid item xs={12}>
                <OrdersTable status='completed' />
            </CenterGrid>
        </Box>
    )
}
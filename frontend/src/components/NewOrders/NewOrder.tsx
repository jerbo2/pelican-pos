import NewOrderCurrentItems from "./NewOrderCurrentItems"
import NewOrderForm from "./NewOrderForm"
import { ItemProvider } from "../Configuration/contexts/ItemContext"
import { FormConfigProvider } from "../Configuration/contexts/FormConfigContext"
import Snackbar from "../BaseComps/Snackbar"
import { Box } from "@mui/material"
import { useState } from "react"
import { UIProvider } from "../BaseComps/contexts/UIContext"
import { OrderProvider } from "./contexts/OrderContext"

export default function NewOrder() {
    const [notShowCards, setNotShowCards] = useState(false)
    return (
        <Box sx={{ width: '100vw', height: '100vh', overflowX: 'hidden' }}>
            <ItemProvider>
                <FormConfigProvider>
                    <UIProvider>
                        <OrderProvider>
                            <NewOrderForm notShowCards={notShowCards} setNotShowCards={setNotShowCards} />
                            <Snackbar />
                            <NewOrderCurrentItems notShowCards={notShowCards} setNotShowCards={setNotShowCards} />
                        </OrderProvider>
                    </UIProvider>
                </FormConfigProvider>
            </ItemProvider>
        </Box>
    )
}
import NewOrderCurrentItems from "./NewOrderCurrentItems"
import NewOrderForm from "./NewOrderForm"
import { ItemProvider } from "../Configuration/contexts/ItemContext"
import { FormConfigProvider } from "../Configuration/contexts/FormConfigContext"
import { Box } from "@mui/material"

export default function NewOrder() {

    return (
        <Box sx={{ width: '100vw', height: '100vh' }}>
            <ItemProvider>
                <FormConfigProvider>
                    <NewOrderCurrentItems />
                    <Box sx={{ p:10 }}>
                    <NewOrderForm />
                    </Box>
                </FormConfigProvider>
            </ItemProvider>
        </Box>
    )
}
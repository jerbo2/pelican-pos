import NewOrderCurrentItems from "./NewOrderCurrentItems"
import NewOrderForm from "./NewOrderForm"
import { ItemProvider } from "../Configuration/contexts/ItemContext"
import { FormConfigProvider } from "../Configuration/contexts/FormConfigContext"
import { Box } from "@mui/material"
import { useState } from "react"

export default function NewOrder() {
    const [notShowCards, setNotShowCards] = useState(false)
    return (
        <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden'}}>
            <ItemProvider>
                <FormConfigProvider>
                    <NewOrderForm notShowCards={notShowCards} setNotShowCards={setNotShowCards} />
                    <NewOrderCurrentItems notShowCards={notShowCards} setNotShowCards={setNotShowCards} />
                </FormConfigProvider>
            </ItemProvider>
        </Box>
    )
}
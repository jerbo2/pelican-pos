import NewOrderCurrentItems from "./NewOrderCurrentItems"
import NewOrderForm from "./NewOrderForm"
import NewOrderFormEdit from "./OrderFormEdit"
import { Box } from "@mui/material"
import { useState, useEffect } from "react"
import { useLocation } from "react-router"

export default function NewOrderCreation() {
    const [showCards, setShowCards] = useState(true)
    const editItem = useLocation().state?.editItem

    useEffect(() => {
        if (editItem) {
            setShowCards(false)
        }
    }, [editItem])

    return (
        <Box sx={{ width: '100vw', height: '100vh', overflowX: 'hidden' }}>
            {!editItem ? (
                <NewOrderForm showCards={showCards} setShowCards={setShowCards} />) :
                (<NewOrderFormEdit rootPage="order"/>)
            }
            <NewOrderCurrentItems showCards={showCards} setShowCards={setShowCards} />
        </Box>
    )
}
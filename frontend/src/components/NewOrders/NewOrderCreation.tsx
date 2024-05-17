import NewOrderCurrentItems from "./NewOrderCurrentItems"
import NewOrderForm from "./NewOrderForm"
import NewOrderFormEdit from "./NewOrderFormEdit"
import { Box } from "@mui/material"
import { useState, useContext, useEffect } from "react"
import { OrderContext } from "./contexts/OrderContext"

export default function NewOrderCreation() {
    const [showCards, setShowCards] = useState(true)
    const { editItem } = useContext(OrderContext)

    const editItemExists = editItem.item_name !== ''

    useEffect(() => {
        console.log(editItem)
        if (editItemExists) {
            setShowCards(false)
        }
    }, [editItem])

    return (
        <Box sx={{ width: '100vw', height: '100vh', overflowX: 'hidden' }}>
            {!editItemExists ? (
                <NewOrderForm showCards={showCards} setShowCards={setShowCards} />) :
                (<NewOrderFormEdit />)
            }
            <NewOrderCurrentItems showCards={showCards} setShowCards={setShowCards} />
        </Box>
    )
}
import NewOrderCreation from "./NewOrderCreation"
import NewOrderLanding from "./NewOrderLanding"

import { ItemProvider } from "../Configuration/contexts/ItemContext"
import { FormConfigProvider } from "../Configuration/contexts/FormConfigContext"
import { UIProvider } from "../BaseComps/contexts/UIContext"
import { OrderProvider } from "./contexts/OrderContext"
import { useParams } from "react-router"
import Snackbar from "../BaseComps/Snackbar"
import { Box } from "@mui/material"


export default function NewOrder() {
    const params = useParams()
    return (
        <Box sx={{ width: '100vw', height: '100vh' }}>
            <UIProvider>
                <OrderProvider>
                    {params.category ?
                        <FormConfigProvider>
                            <ItemProvider>
                                <NewOrderCreation />
                            </ItemProvider>
                        </FormConfigProvider> :
                        <NewOrderLanding />
                    }
                    <Snackbar />
                </OrderProvider>
            </UIProvider >
        </Box>
    )
}

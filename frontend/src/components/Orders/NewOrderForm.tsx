import { useContext, Dispatch, SetStateAction } from "react";
import { ItemContext } from "../Configuration/contexts/ItemContext";
import axios from "axios";
import { UIContext } from "../BaseComps/contexts/UIContext";
import { useNavigate } from "react-router";
import { OrderContext } from "./contexts/OrderContext";
import { Order } from "../BaseComps/dbTypes";
import BackIcon from "../BaseComps/BackIcon";
import NewOrderFormBase from "./OrderFormBase";

interface NewOrderFormProps {
    showCards: boolean;
    setShowCards: Dispatch<SetStateAction<boolean>>;

}

export default function NewOrderForm({ showCards, setShowCards }: NewOrderFormProps) {
    const { itemName, storedItems } = useContext(ItemContext);
    const { setSnackbarMessage, setOpenSnackbar } = useContext(UIContext);
    const { activeOrder, setActiveOrder, formValues } = useContext(OrderContext);

    const navigate = useNavigate();
    const pageName = !showCards ? `CREATING NEW ${itemName.toLocaleUpperCase()} ORDER` : 'SELECT AN ITEM'

    const createOrder = async () => {
        // GET request to create a new order
        const postUrl = '/api/v1/orders/create/'
        const order = await axios.post(postUrl, {})
        sessionStorage.setItem('activeOrder', JSON.stringify(order.data.id))
        return order.data.id
    }

    const addToOrder = async () => {
        // PUT request to add item to order
        const item_to_add = storedItems.find(item => item.name === itemName);

        if (!item_to_add) {
            console.error(`Couldn't find ${itemName} in storedItems.`);
            return;
        }

        let orderID = activeOrder.id

        if (orderID === -1) {
            // client is not currently working on an order, create one
            orderID = await createOrder()
        }

        const putUrl = `/api/v1/orders/${orderID}/add/${item_to_add.id}`

        const configurations = formValues.map((formValue, _) => {
            return {
                label: formValue.label,
                value: formValue.value,
            }
        });

        console.log(configurations)

        try {
            const order = await axios.put(putUrl, configurations)
            setActiveOrder(order.data)
            setSnackbarMessage('Item added to order.')
            setOpenSnackbar(true)
            navigate('/order')
        } catch (err) {
            console.error('Failed to add item to order:', err)
            setSnackbarMessage('Failed to add item to order.')
            setOpenSnackbar(true)
        }
    }

    return (
        <NewOrderFormBase
            pageName={pageName}
            handleSubmit={addToOrder}
            handleCancel={()=>setShowCards(true)}
            showCards={showCards}
            toolbarLeftIcon={<BackIcon />}
        />
    )
}

export type { Order }
import { useContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { FormConfigContext } from "../Configuration/contexts/FormConfigContext";
import { ItemContext } from "../Configuration/contexts/ItemContext";
import axios from "axios";
import { UIContext } from "../BaseComps/contexts/UIContext";
import { useNavigate } from "react-router";
import { OrderContext } from "./contexts/OrderContext";
import { Order } from "../BaseComps/dbTypes";
import BackIcon from "../BaseComps/BackIcon";
import NewOrderFormBase from "./NewOrderFormBase";
import { FormValue } from "./NewOrderFormBase";

interface NewOrderFormProps {
    showCards: boolean;
    setShowCards: Dispatch<SetStateAction<boolean>>;

}

export default function NewOrderForm({ showCards, setShowCards }: NewOrderFormProps) {
    const { formConfig } = useContext(FormConfigContext);
    const { itemName, storedItems } = useContext(ItemContext);
    const { setSnackbarMessage, setOpenSnackbar } = useContext(UIContext);
    const { activeOrder, setActiveOrder } = useContext(OrderContext);

    const [formValues, setFormValues] = useState<FormValue[]>([]);
    
    const navigate = useNavigate();
    const pageName = !showCards ? `CREATING NEW ${itemName.toLocaleUpperCase()} ORDER` : 'SELECT AN ITEM'

    useEffect(() => {
        // create initial form values from formConfig (label with empty val)
        const initialFormValues = formConfig.map(config => ({
            label: config.label,
            value: ''
        }));
        setFormValues(initialFormValues);
    }, [formConfig]);

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
            navigate('/new-order')
        } catch (err) {
            console.error('Failed to add item to order:', err)
            setSnackbarMessage('Failed to add item to order.')
            setOpenSnackbar(true)
        }
    }

    return (
        <NewOrderFormBase
            pageName={pageName}
            initialValues={formValues}
            handleSubmit={addToOrder}
            handleCancel={()=>setShowCards(true)}
            showCards={showCards}
            toolbarLeftIcon={<BackIcon />}
        />
    )
}

export type { Order }
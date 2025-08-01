import { useContext, useState, Dispatch, SetStateAction, useEffect } from "react";
import { ItemContext } from "../Configuration/contexts/ItemContext";
import axios from "axios";
import { UIContext } from "../BaseComps/contexts/UIContext";
import { useNavigate } from "react-router";
import { OrderContext } from "./contexts/OrderContext";
import { Item, Order } from "../BaseComps/dbTypes";
import BackIcon from "../BaseComps/BackIcon";
import OrderFormBase from "./OrderFormBase";
import { updateItemWithFormConfig } from "../Configuration/ConfigBuildList";
import { FormConfigContext } from "../Configuration/contexts/FormConfigContext";

interface NewOrderFormProps {
    showCards: boolean;
    setShowCards: Dispatch<SetStateAction<boolean>>;

}

export default function NewOrderForm({ showCards, setShowCards }: NewOrderFormProps) {
    const { itemName, storedItems } = useContext(ItemContext);
    const { formConfig, setFormConfig } = useContext(FormConfigContext)
    const { setSnackbarMessage, setOpenSnackbar } = useContext(UIContext);
    const { activeOrder, setActiveOrder, formValues } = useContext(OrderContext);
    const [item, setItem] = useState<Item>();

    const navigate = useNavigate();
    const pageName = !showCards ? `CREATING NEW ${itemName.toLocaleUpperCase()} ORDER` : 'SELECT AN ITEM'

    const createOrder = async () => {
        // GET request to create a new order
        const postUrl = '/orders/create/'
        const order = await axios.post(postUrl, {})
        sessionStorage.setItem('activeOrder', JSON.stringify(order.data.id))
        return order.data.id
    }

    useEffect(() => {
        if (formConfig.length === 0) return;
        if (formConfig.every(config => config.type === 'price')) {
            addToOrder();
        }
        setItem(storedItems.find(item => item.name === itemName));
    }, [formConfig])

    const addToOrder = async () => {
        // PUT request to add item to order

        if (!item) {
            console.error(`Couldn't find ${itemName} in storedItems.`);
            return;
        }

        await updateItemWithFormConfig(item.id, formConfig, formValues)

        let orderID = activeOrder.id

        if (orderID === -1) {
            // client is not currently working on an order, create one
            console.log('Creating new order')
            orderID = await createOrder()
        }

        const putUrl = `/orders/${orderID}/add/${item.id}`

        let configurations = formValues.map((formValue) => {
            return {
                label: formValue.label,
                value: formValue.value,
            }
        });

        if (configurations.length === 0) {
            console.log('No configurations found, filling with empty values')
            configurations = Array(formConfig.length).fill({ label: '', value: '' });
        }

        console.log(configurations)

        try {
            const order = await axios.put(putUrl, configurations)
            setActiveOrder(order.data)
            setSnackbarMessage('Item added to order.')
            console.log('Item added to order:', order.data)
            setOpenSnackbar(true)
            setFormConfig([]);
            navigate('/order')
        } catch (err) {
            console.error('Failed to add item to order:', err)
            setSnackbarMessage('Failed to add item to order.')
            setOpenSnackbar(true)
        }
    }

    return (
        <OrderFormBase
            pageName={pageName}
            handleSubmit={addToOrder}
            handleCancel={() => setShowCards(true)}
            showCards={showCards}
            toolbarLeftIcon={<BackIcon />}
            itemId={item?.id}
        />
    )
}

export type { Order }
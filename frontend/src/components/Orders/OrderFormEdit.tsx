import { useContext, useEffect } from "react";
import { FormConfigContext } from "../Configuration/contexts/FormConfigContext";
import { ItemContext } from "../Configuration/contexts/ItemContext";
import { UIContext } from "../BaseComps/contexts/UIContext";
import { useNavigate } from "react-router";
import { OrderContext, defaultOrderItem } from "./contexts/OrderContext";
import { OrderItems, Order } from "../BaseComps/dbTypes";
import NewOrderFormBase from "./OrderFormBase";
import axios from "axios";


export default function OrderFormEdit({rootPage}: {rootPage: string}) {
    const { setFormConfig } = useContext(FormConfigContext);
    const { editItem, formValues, setEditItem, setOrderItems } = useContext(OrderContext);
    const { storedItems } = useContext(ItemContext);
    const { setOpenPopup, setOpenSnackbar, setSnackbarMessage } = useContext(UIContext);

    const navigate = useNavigate();
    const pageName = `EDITING ${editItem.item_name.toLocaleUpperCase()}`

    useEffect(() => {
        const item = storedItems.find(item => item.name === editItem.item_name);
        setFormConfig(item?.form_cfg || []);
    }, [storedItems])

    const handleCancel = () => {
        setOpenPopup(true)
        setEditItem(defaultOrderItem)
        navigate(`/${rootPage}`)
    }

    const handleSubmit = async () => {
        try {
            // PATCH request to update config & price in order item
            const url = `/api/v1/orders-items/${editItem.id}/update/`;
            const configurations = formValues.map(formValue => ({
                label: formValue.label,
                value: formValue.value
            }));

            const payload = {
                configurations: configurations,
            }

            console.log('edit payload', payload)

            const response = await axios.patch(url, payload);
            console.log(response.data)

            setOrderItems((prevState: OrderItems[]) => {
                const newItems = prevState.map(item =>
                    item.id === editItem.id
                        ? {
                            ...item,
                            configurations: response.data.configurations,
                            price: response.data.price
                        }
                        : item
                );
                return newItems;
            });
            setSnackbarMessage('Item edit saved.');
            setOpenSnackbar(true);
            handleCancel();
        } catch (error) {
            console.error("Error updating item:", error);
        }
    };


    return (

        <NewOrderFormBase
            pageName={pageName}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
            showCards={false}
        />
    )
}

export type { Order }
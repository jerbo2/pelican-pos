import { useContext, useEffect } from "react";
import { FormConfigContext } from "../Configuration/contexts/FormConfigContext";
import { ItemContext } from "../Configuration/contexts/ItemContext";
import { UIContext } from "../BaseComps/contexts/UIContext";
import { useNavigate, useLocation } from "react-router";
import { OrderContext } from "./contexts/OrderContext";
import { OrderItems, Order } from "../BaseComps/dbTypes";
import OrderFormBase from "./OrderFormBase";
import axios from "axios";
import { updateItemWithFormConfig } from "../Configuration/ConfigBuildList";


export default function OrderFormEdit({rootPage}: {rootPage: string}) {
    const { setFormConfig, formConfig } = useContext(FormConfigContext);
    const { formValues, setOrderItems } = useContext(OrderContext);
    const { storedItems, setInventory } = useContext(ItemContext);
    const { setOpenPopup, setOpenSnackbar, setSnackbarMessage } = useContext(UIContext);

    const navigate = useNavigate();
    const editItem = useLocation().state?.editItem;
    const pageName = editItem && (`EDITING ${editItem.item_name.toLocaleUpperCase()}`)

    useEffect(() => {
        if (!editItem) {
            console.error('No item to edit');
            navigate(`/${rootPage}`);
        }
    }, [editItem])

    useEffect(() => {
        if (!editItem || !storedItems.length) return;
        const item = storedItems.find(item => item.name === editItem.item_name);
        console.log('storedItems', storedItems, 'editItem', editItem)
        if (!item) return navigate(`/${rootPage}`);
        setFormConfig(item.form_cfg);
        setInventory(item.inventory_config);
    }, [storedItems])

    const handleCancel = () => {
        console.log('cancelling edit')
        setOpenPopup(true);
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
            
            await updateItemWithFormConfig(editItem.item_id, formConfig, formValues)

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
        <OrderFormBase
            pageName={pageName}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
            showCards={false}
            editItem={editItem}
            itemId={editItem.item_id}
        />
    )
}

export type { Order }
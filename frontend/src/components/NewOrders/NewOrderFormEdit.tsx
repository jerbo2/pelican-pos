import { useContext, useState, useEffect } from "react";
import { FormConfigContext } from "../Configuration/contexts/FormConfigContext";
import { ItemContext } from "../Configuration/contexts/ItemContext";
import { UIContext } from "../BaseComps/contexts/UIContext";
import { useNavigate } from "react-router";
import { OrderContext, defaultOrderItem } from "./contexts/OrderContext";
import { OrderItems, Order } from "../BaseComps/dbTypes";
import NewOrderFormBase from "./NewOrderFormBase";
import { FormValue } from "./NewOrderFormBase";
import axios from "axios";


export default function NewOrderFormEdit() {
    const { setFormConfig } = useContext(FormConfigContext);
    const { editItem, setEditItem, setOrderItems } = useContext(OrderContext);
    const { storedItems } = useContext(ItemContext);
    const { setOpenPopup } = useContext(UIContext);

    const [formValues, setFormValues] = useState<FormValue[]>([]);

    const navigate = useNavigate();
    const pageName = `EDITING ${editItem.item_name.toLocaleUpperCase()}`


    useEffect(() => {
        console.log(editItem)
        // create initial form values from formConfig (label with empty val)
        const initialFormValues = editItem.configurations.map(config => ({
            label: config.label,
            value: config.value
        }))
        console.log(initialFormValues)
        setFormValues(initialFormValues);

    }, [editItem]);

    useEffect(() => {
        const item = storedItems.find(item => item.name === editItem.item_name);
        setFormConfig(item?.form_cfg || []);
    }, [storedItems])

    const handleCancel = () => {
        setOpenPopup(true)
        setEditItem(defaultOrderItem)
        navigate('/new-order')
    }

    const handleSubmit = async () => {
        try {
            // PATCH request to update config & price in order item
            const url = `/api/v1/orders-items/${editItem.id}/update/`;
            const configurations = formValues.map(formValue => ({
                label: formValue.label,
                value: formValue.value
            }));

            const response = await axios.patch(url, configurations);

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

            handleCancel();
        } catch (error) {
            console.error("Error updating item:", error);
        }
    };


    return (

        <NewOrderFormBase
            pageName={pageName}
            initialValues={formValues}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
            showCards={false}
        />
    )
}

export type { Order }
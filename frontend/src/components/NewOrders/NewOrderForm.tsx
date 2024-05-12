import React, { useContext, useState, useEffect } from "react";
import { FormConfigContext } from "../Configuration/contexts/FormConfigContext";
import { ItemContext } from "../Configuration/contexts/ItemContext";
import { CenterGrid, Circle, Divider } from "../Styled";
import BasePreviewComponents from "../BaseComps/BasePreviewComponents";
import BaseToolBar from "../BaseComps/BaseToolBar";
import ConfirmationButton from "../BaseComps/ConfirmationButton";
import axios from "axios";
import { UIContext } from "../BaseComps/contexts/UIContext";
import { useNavigate } from "react-router";
import { OrderContext } from "./contexts/OrderContext";
import BackIcon from "../BaseComps/BackIcon";

const confirmCancelOrderText = 'Are you sure you want to cancel?'
const confirmSubmitWithoutAllFieldsText = 'Some fields are not filled out, is that okay?'

type Order = {
    id: number;
    status: string;
    created_at: string;
}

type FormValue = {
    label: string,
    value: string
}

export default function NewOrderForm({ notShowCards, setNotShowCards }: { notShowCards: boolean, setNotShowCards: (arg0: boolean) => void }) {
    const { formConfig } = useContext(FormConfigContext);
    const { itemName, storedItems } = useContext(ItemContext);
    const { setSnackbarMessage, setOpenSnackbar } = useContext(UIContext);
    const { activeOrder, setActiveOrder } = useContext(OrderContext);

    const [formValues, setFormValues] = useState<FormValue[]>([]);
    
    const navigate = useNavigate();
    const [emptyFormConfirm, setEmptyFormConfirm] = useState(true);
    const pageName = notShowCards ? `CREATING NEW ${itemName.toLocaleUpperCase()} ORDER` : 'SELECT AN ITEM'

    useEffect(() => {
        // check if all formValues are filled out
        if (formValues.every(formValue => formValue.value !== '')) {
            setEmptyFormConfirm(true);
        } else {
            setEmptyFormConfirm(false);
        }
    }, [formValues])


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

    const handleOnValueChange = (index: number, value: string) => {
        // Passed to BasePreviewComponents to update formValues
        const updatedFormValues = [...formValues];
        updatedFormValues[index].value = value;
        setFormValues(updatedFormValues);
    }

    return (

        <CenterGrid container>
            <CenterGrid item xs={12}>
                <BaseToolBar pageName={pageName} leftIcon={!notShowCards ? <BackIcon/> : null}/>
            </CenterGrid>
            {notShowCards && (
                <>
                    {formConfig.map((_, index) => {
                        return (
                            <React.Fragment key={index}>

                                <CenterGrid item xs={12}>
                                    {/* <Circle>{index + 1}</Circle> */}
                                    <BasePreviewComponents component={formConfig[index]} handleOnValueChange={handleOnValueChange} index={index} />
                                </CenterGrid>
                                <CenterGrid item key={`${index}_divider`} xs={12}>
                                    <Divider />
                                </CenterGrid>

                            </React.Fragment>
                        )
                    })}
                    <CenterGrid item xs={6}>
                        <ConfirmationButton onConfirmed={() => setNotShowCards(false)} dialogContent={confirmCancelOrderText} shiftAmount={0}>CANCEL</ConfirmationButton>
                    </CenterGrid>
                    <CenterGrid item xs={6}>
                        <ConfirmationButton onConfirmed={addToOrder} override={emptyFormConfirm} dialogContent={confirmSubmitWithoutAllFieldsText} shiftAmount={0}>SUBMIT</ConfirmationButton>
                    </CenterGrid>
                </>
            )}
        </CenterGrid>
    )
}

export type { Order }
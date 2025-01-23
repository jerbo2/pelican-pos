import React, { useContext, useState, useEffect, useRef } from "react";
import { FormConfigContext } from "../Configuration/contexts/FormConfigContext";
import { CenterGrid, Divider, Paper } from "../Styled";
import BasePreviewComponent from "../BaseComps/BasePreviewComponent";
import BaseToolBar from "../BaseComps/BaseToolBar";
import ConfirmationButton from "../BaseComps/ConfirmationButton";
import { FormComponentConfig, FormValue, OrderItems } from "../BaseComps/dbTypes";
import { OrderContext } from "./contexts/OrderContext";
import { ItemContext } from "../Configuration/contexts/ItemContext";
import { Typography } from "@mui/material";
import axios from "axios";
import _ from 'lodash';

const confirmCancelOrderText = 'Are you sure you want to cancel?'

interface OrderBaseProps {
    pageName: string;
    handleSubmit: () => void;
    handleCancel: () => void;
    // optionals for base form
    toolbarLeftIcon?: React.ReactNode;
    showCards?: boolean;
    editItem?: OrderItems;
    itemId?: number;
}

// populate map with initial value where they exist, otherwise empty string
const createInitialFormValues = (config: FormComponentConfig[], values: FormValue[]) => {
    const valuesMap = values.reduce((map, obj) => {
        map[obj.label] = obj.value;
        return map;
    }, {} as Record<string, string>);

    return config.map(configItem => ({
        label: configItem.label,
        value: valuesMap[configItem.label] || ''
    }));
};

const checkOrderFormEmpty = (formValues: FormValue[]) => {
    return formValues.some(formValue => formValue.value === '');
}

export default function OrderFormBase({ pageName, handleSubmit, handleCancel, toolbarLeftIcon, showCards, editItem, itemId }: OrderBaseProps) {
    const { formConfig } = useContext(FormConfigContext);
    const { inventory } = useContext(ItemContext);
    const { formValues, setFormValues } = useContext(OrderContext);
    const [prevSentFormValues, setPrevSentFormValues] = useState<FormValue[]>([]);
    const [emptyFormConfirm, setEmptyFormConfirm] = useState(true);
    const [inventoryValuePreview, setInventoryValuePreview] = useState<string>('');
    const [decrementFieldsToFill, setdecrementFieldsToFill] = useState<string[]>([]);
    const [currentOrderAmount, setCurrentOrderAmount] = useState<number>(0);
    const bottomRef = useRef<HTMLDivElement>(null);

    const initialdecrementFieldsToFill = inventory.decrementDependsOn.names.concat(inventory.decrementer);

    useEffect(() => {
        let initialFormValues: FormValue[] = [];
        if (editItem) {
            console.log(editItem)
            initialFormValues = editItem.configurations.map(config => ({
                label: config.label,
                value: config.value
            }));
        } else {
            initialFormValues = formConfig.map(config => ({
                label: config.label,
                value: ''
            }));
        }

        if (initialFormValues.length !== formConfig.length) {
            // formConfig was changed after an order had been submitted, synchronize form values
            const synchronizedFormValues = createInitialFormValues(formConfig, initialFormValues);
            setFormValues(synchronizedFormValues);
        } else {
            setFormValues(initialFormValues);
        }

        setdecrementFieldsToFill(initialdecrementFieldsToFill);
    }, [formConfig, editItem]);

    const findValue = (label: string) => formValues.find(({ label: formLabel }) => formLabel === label)?.value || '';

    const verifyRequiredInventoryFieldValues = () => {
        // return false if any required inventory field is different than the basic case and is not filled in
        return !(
            (inventory.dependsOn.name !== 'none' && !findValue(inventory.dependsOn.name)) ||
            (inventory.decrementer !== '1_per_order' && !findValue(inventory.decrementer)) ||
            inventory.decrementDependsOn.names.some(name => !findValue(name))
        );
    };

    const verifyIventoryFieldValuesChanged = () => {
        // return false if all current formValues in decrementFieldsToFill are the same as the previous ones
        console.log('prevSentFormValues', prevSentFormValues)
        console.log('formValues', formValues)
        console.log(initialdecrementFieldsToFill.some(field => prevSentFormValues.find(({ label }) => label === field)?.value !== findValue(field)))
        return initialdecrementFieldsToFill.some(field => prevSentFormValues.find(({ label }) => label === field)?.value !== findValue(field));
    }

    useEffect(() => {
        // check if some formValues aren't filled out
        if (checkOrderFormEmpty(formValues)) {
            console.log('empty form')
            setEmptyFormConfirm(true);
        } else {
            setEmptyFormConfirm(false);
        }

        // check if inventory is managed & an impact on inventory is requested
        if (!inventory.manageItemInventory || !formValues.length || !verifyIventoryFieldValuesChanged()) return;
        const allFilled = verifyRequiredInventoryFieldValues();
        if (!allFilled) {
            setdecrementFieldsToFill(initialdecrementFieldsToFill.filter(field => !findValue(field)));
        }
        else {
            // ask backend for inventory impact without actually updating it
            checkInventoryImpact();
        }

    }, [formValues])

    useEffect(() => {
        if (editItem && inventory.manageItemInventory) {
            const foundConfig = editItem.configurations.find(config => config.label === inventory.decrementer);
            setCurrentOrderAmount(Number(foundConfig?.value) || 1);
        }
    }, [editItem, inventory]);

    const checkInventoryImpact = async () => {
        const url = `/api/v1/orders-items/inventory/check-impact`;
        try {
            const res = await axios.post(url, { configurations: formValues, item_id: itemId });
            console.log(res.data);
            console.log(editItem);
            setInventoryValuePreview(res.data[findValue(inventory.dependsOn.name)]);
            setPrevSentFormValues(structuredClone(formValues));
        } catch (err) {
            console.error(err);
        }
    }

    const getDialogContent = () => {
        return (
            <>
                <ul style={{ marginTop: 0 }}>
                    {emptyFormConfirm && (
                        <li>
                            Some fields are not filled out.
                        </li>
                    )}
                    {(Number(inventoryValuePreview) + currentOrderAmount < 0) && (
                        <li>
                            This order is for more than the system thinks we have.
                        </li>
                    )}
                </ul>
                <p style={{ marginBottom: 0, textAlign: 'center' }}>
                    Proceed anyway?
                </p>
            </>
        )
    }

    return (
        <CenterGrid container>
            <CenterGrid item xs={12}>
                <BaseToolBar pageName={pageName} leftIcon={showCards ? toolbarLeftIcon : null} />
            </CenterGrid>
            {!showCards && (
                <React.Fragment>
                    {formConfig.map((config, index) => {
                        if (config.type === 'price') return null;
                        const isInventoryDependent = inventory.manageItemInventory && config.label === inventory.dependsOn.name;
                        return (
                            <React.Fragment key={index}>
                                <CenterGrid item xs={12}>
                                    <BasePreviewComponent component={formConfig[index]} formValues={formValues} setFormValues={setFormValues} index={index} initialValue={formValues[index]?.value} />
                                </CenterGrid>
                                {isInventoryDependent && (formValues.length > 0) ? (
                                    <>
                                        <CenterGrid item xs={12}>
                                            <Paper sx={{ m: '2px', p: '8px' }}>
                                                <Typography fontSize="1.25rem" align="center">
                                                    {/* Available inventory logic */}
                                                    Amount available:{' '}
                                                    {formValues[index].value
                                                        ? Number(inventory.dependsOn.amounts[formValues[index].value]) + currentOrderAmount
                                                        : `awaiting ${formValues[index].label.toLowerCase()} choice`}
                                                    {' → '}
                                                    {/* After this order logic */}
                                                    Amount after this order:{' '}
                                                    {verifyRequiredInventoryFieldValues() && inventoryValuePreview
                                                        ? Number(inventoryValuePreview) + currentOrderAmount
                                                        : `awaiting ${decrementFieldsToFill.join(', ').toLowerCase()} choice${decrementFieldsToFill.length > 1 ? 's' : ''}`}
                                                </Typography>
                                            </Paper>
                                        </CenterGrid>
                                    </>
                                )
                                    :
                                    <CenterGrid item key={`${index}_divider`} xs={12}>
                                        <Divider />
                                    </CenterGrid>
                                }
                            </React.Fragment>
                        )
                    })}
                    <CenterGrid item xs={6}>
                        <ConfirmationButton onConfirmed={handleCancel} dialogContent={confirmCancelOrderText} override={Boolean(editItem) || checkOrderFormEmpty(formValues)}>CANCEL</ConfirmationButton>
                    </CenterGrid>
                    <CenterGrid item xs={6}>
                        <ConfirmationButton onConfirmed={handleSubmit} override={!emptyFormConfirm && !(Number(inventoryValuePreview + currentOrderAmount) < 0)} dialogContent={getDialogContent()}>SUBMIT</ConfirmationButton>
                    </CenterGrid>
                </React.Fragment>
            )}
            <div ref={bottomRef} />
        </CenterGrid>
    );
}
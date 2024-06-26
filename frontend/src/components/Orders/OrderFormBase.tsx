import React, { useContext, useState, useEffect, useRef } from "react";
import { FormConfigContext } from "../Configuration/contexts/FormConfigContext";
import { CenterGrid, Divider } from "../Styled";
import BasePreviewComponent from "../BaseComps/BasePreviewComponent";
import BaseToolBar from "../BaseComps/BaseToolBar";
import ConfirmationButton from "../BaseComps/ConfirmationButton";
import { FormComponentConfig, FormValue, OrderItems } from "../BaseComps/dbTypes";
import { OrderContext } from "./contexts/OrderContext";

const confirmCancelOrderText = 'Are you sure you want to cancel?'
const confirmSubmitWithoutAllFieldsText = 'Some fields are not filled out, is that okay?'

interface OrderBaseProps {
    pageName: string;
    handleSubmit: () => void;
    handleCancel: () => void;
    // optionals for base form
    toolbarLeftIcon?: React.ReactNode;
    showCards?: boolean;
    editItem?: OrderItems;
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
    return formValues.every(formValue => formValue.value === '');
}

export default function OrderFormBase({ pageName, handleSubmit, handleCancel, toolbarLeftIcon, showCards, editItem }: OrderBaseProps) {
    const { formConfig } = useContext(FormConfigContext);
    const { formValues, setFormValues } = useContext(OrderContext);
    const [emptyFormConfirm, setEmptyFormConfirm] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);

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
    }, [formConfig, editItem]);

    useEffect(() => {
        // check if all formValues are filled out
        if (checkOrderFormEmpty(formValues)) {
            console.log('empty form')
            setEmptyFormConfirm(true);
        } else {
            setEmptyFormConfirm(false);
        }
        console.log(formValues)
    }, [formValues])

    return (
        <CenterGrid container>
            <CenterGrid item xs={12}>
                <BaseToolBar pageName={pageName} leftIcon={showCards ? toolbarLeftIcon : null} />
            </CenterGrid>
            {!showCards && (
                <React.Fragment>
                    {formConfig.map((config, index) => {
                        if (config.type === 'price') return null;
                        return (
                            <React.Fragment key={index}>
                                <CenterGrid item xs={12}>
                                    <BasePreviewComponent component={formConfig[index]} formValues={formValues} setFormValues={setFormValues} index={index} initialValue={formValues[index]?.value} />
                                </CenterGrid>
                                <CenterGrid item key={`${index}_divider`} xs={12}>
                                    <Divider />
                                </CenterGrid>
                            </React.Fragment>
                        )
                    })}
                    <CenterGrid item xs={6}>
                        <ConfirmationButton onConfirmed={handleCancel} dialogContent={confirmCancelOrderText} override={Boolean(editItem) || checkOrderFormEmpty(formValues)}>CANCEL</ConfirmationButton>
                    </CenterGrid>
                    <CenterGrid item xs={6}>
                        <ConfirmationButton onConfirmed={handleSubmit} override={!emptyFormConfirm} dialogContent={confirmSubmitWithoutAllFieldsText}>SUBMIT</ConfirmationButton>
                    </CenterGrid>
                </React.Fragment>
            )}
            <div ref={bottomRef} />
        </CenterGrid>
    );
}

export type { FormValue }